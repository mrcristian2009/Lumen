import { BleClient, numbersToDataView } from '@capacitor-community/bluetooth-le';

const $ = id => document.getElementById(id);
const root = document.documentElement;

// ---------- protocollo ELK-BLEDOM (Lotus Lantern) ----------
const uuid = s => `0000${s}-0000-1000-8000-00805f9b34fb`;
const PAIRS = [
  { svc: uuid('fff0'), chr: uuid('fff3') },
  { svc: uuid('ffe5'), chr: uuid('ffe9') },
];
const CMD = {
  on:    () => [0x7e, 0x00, 0x04, 0xf0, 0x00, 0x01, 0xff, 0x00, 0xef],
  off:   () => [0x7e, 0x00, 0x04, 0x00, 0x00, 0x00, 0xff, 0x00, 0xef],
  rgb:   (r, g, b) => [0x7e, 0x00, 0x05, 0x03, r, g, b, 0x00, 0xef],
  bri:   v => [0x7e, 0x00, 0x01, v, 0x00, 0x00, 0x00, 0x00, 0xef],
  fx:    e => [0x7e, 0x00, 0x03, e, 0x03, 0x00, 0x00, 0x00, 0xef],
  speed: v => [0x7e, 0x00, 0x02, v, 0x00, 0x00, 0x00, 0x00, 0xef],
};
// Codici tipici della famiglia; i nomi sono indicativi e vanno verificati sul tuo modello
const EFFECTS = [
  [0x80, 'Fade RGB'], [0x81, 'Fade 3 colori'], [0x82, 'Fade 7 colori'],
  [0x8a, 'Blink 7 colori'], [0x92, 'Cambio 7 colori'], [0x96, 'Arcobaleno'],
  [0x83, 'Blink rosso'], [0x84, 'Blink verde'], [0x85, 'Blink blu'],
  [0x8b, 'Pulse rosso'], [0x8c, 'Pulse verde'], [0x8d, 'Pulse blu'],
];

// ---------- stato ----------
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
let deviceId = store.get('deviceId', null);
let chr = null;
let hue = store.get('hue', 0);
let sat = store.get('sat', 1);
let powered = store.get('powered', true);
let busy = false;

// ---------- invio con coda "ultimo vince" (evita di inondare il BLE mentre trascini) ----------
let pending = null, sending = false;
async function send(bytes) {
  pending = bytes;
  if (sending || !chr) return;
  sending = true;
  while (pending) {
    const b = pending; pending = null;
    try { await BleClient.writeWithoutResponse(deviceId, chr.svc, chr.chr, numbersToDataView(b)); }
    catch { /* connessione persa: gestita da onDisconnect */ }
    await new Promise(r => setTimeout(r, 25));
  }
  sending = false;
}
// comandi "una tantum" (accensione, effetti...) non devono sovrascriversi a vicenda
const queue = [];
let draining = false;
async function sendNow(bytes) {
  queue.push(bytes);
  if (draining || !chr) return;
  draining = true;
  while (queue.length) {
    try { await BleClient.writeWithoutResponse(deviceId, chr.svc, chr.chr, numbersToDataView(queue.shift())); }
    catch {}
    await new Promise(r => setTimeout(r, 40));
  }
  draining = false;
}

// ---------- colore ----------
function hsv2rgb(h, s, v = 1) {
  const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return [f(5), f(3), f(1)].map(x => Math.round(x * 255));
}
const toHex = ([r, g, b]) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
function fromHex(h) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let H = 0;
  if (d) H = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (H * 60 + 360) % 360, s: max ? d / max : 0 };
}

const wheel = $('wheel'), knob = $('knob');
function paint() {
  const hex = toHex(hsv2rgb(hue, sat));
  root.style.setProperty('--c', hex);
  const R = wheel.clientWidth / 2, r = R * 0.815;
  const a = (hue - 90) * Math.PI / 180;
  knob.style.left = `${R + r * Math.cos(a) - 15}px`;
  knob.style.top = `${R + r * Math.sin(a) - 15}px`;
  document.body.classList.toggle('off', !powered);
}
function applyColor(immediate = false) {
  paint();
  const rgb = hsv2rgb(hue, sat);
  powered = true; document.body.classList.remove('off');
  immediate ? sendNow(CMD.rgb(...rgb)) : send(CMD.rgb(...rgb));
}

function pointerHue(e) {
  const b = wheel.getBoundingClientRect();
  const x = e.clientX - (b.left + b.width / 2), y = e.clientY - (b.top + b.height / 2);
  hue = (Math.atan2(y, x) * 180 / Math.PI + 90 + 360) % 360;
  sat = 1; selectWhite(null);
  applyColor();
}
let dragging = false;
wheel.addEventListener('pointerdown', e => {
  if (e.target.closest('.power')) return;
  dragging = true; wheel.setPointerCapture(e.pointerId); pointerHue(e);
});
wheel.addEventListener('pointermove', e => { if (dragging) pointerHue(e); });
const endDrag = () => { if (dragging) { dragging = false; store.set('hue', hue); store.set('sat', sat); } };
wheel.addEventListener('pointerup', endDrag);
wheel.addEventListener('pointercancel', endDrag);

// ---------- accensione ----------
$('power').onclick = () => {
  powered = !powered; store.set('powered', powered);
  paint(); sendNow(powered ? CMD.on() : CMD.off());
};

// ---------- luminosità / velocità ----------
$('br').value = store.get('bri', 100); $('bv').textContent = $('br').value;
$('br').oninput = e => { $('bv').textContent = e.target.value; store.set('bri', +e.target.value); send(CMD.bri(+e.target.value)); };
$('sp').oninput = e => { $('sv').textContent = e.target.value; send(CMD.speed(+e.target.value)); };

// ---------- bianchi ----------
const WHITES = [['Caldo', '#ffb46b'], ['Neutro', '#ffe6c7'], ['Freddo', '#cfe3ff']];
function selectWhite(name) {
  [...$('whites').children].forEach(c => c.classList.toggle('sel', c.dataset.n === name));
}
WHITES.forEach(([n, hex]) => {
  const b = document.createElement('button');
  b.className = 'chip'; b.textContent = n; b.dataset.n = n;
  b.onclick = () => {
    const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    ({ h: hue, s: sat } = fromHex(hex)); paint(); selectWhite(n);
    powered = true; sendNow(CMD.rgb(...rgb));
  };
  $('whites').appendChild(b);
});

// ---------- effetti ----------
let fxSel = null;
EFFECTS.forEach(([code, name]) => {
  const b = document.createElement('button');
  b.className = 'chip'; b.textContent = name;
  b.onclick = () => {
    fxSel = fxSel === code ? null : code;
    [...$('fx').children].forEach(c => c.classList.toggle('sel', c === b && fxSel !== null));
    $('fxname').textContent = fxSel ? name : '—';
    $('speedbox').classList.toggle('hidden', !fxSel);
    if (fxSel) sendNow(CMD.fx(code)); else applyColor(true);
  };
  $('fx').appendChild(b);
});

// ---------- preferiti ----------
function renderPresets() {
  const box = $('presets'); box.innerHTML = '';
  const list = store.get('presets', ['#ff2a2a', '#7c3aed', '#06b6d4']);
  list.forEach((hex, i) => {
    const b = document.createElement('button');
    b.className = 'sw'; b.style.background = hex;
    let t;
    b.onpointerdown = () => { t = setTimeout(() => { t = null; list.splice(i, 1); store.set('presets', list); renderPresets(); }, 650); };
    b.onpointerup = b.onpointerleave = () => { if (t) { clearTimeout(t); t = null; ({ h: hue, s: sat } = fromHex(hex)); selectWhite(null); applyColor(true); } };
    box.appendChild(b);
  });
  const add = document.createElement('button');
  add.className = 'sw add'; add.textContent = '+'; add.setAttribute('aria-label', 'Salva colore');
  add.onclick = () => { list.push(toHex(hsv2rgb(hue, sat))); store.set('presets', list); renderPresets(); };
  box.appendChild(add);
}
renderPresets();

// ---------- connessione ----------
const setStatus = (txt, cls = '') => {
  $('stxt').textContent = txt;
  $('status').className = 'status ' + cls;
};

async function findChar(id) {
  const services = await BleClient.getServices(id);
  for (const p of PAIRS) {
    const s = services.find(s => s.uuid.toLowerCase() === p.svc);
    if (s && s.characteristics.some(c => c.uuid.toLowerCase() === p.chr)) return p;
  }
  throw new Error('Caratteristica di scrittura non trovata');
}

async function open(id) {
  setStatus('Connessione…', 'busy');
  await BleClient.connect(id, () => { chr = null; setStatus('Disconnesso'); });
  chr = await findChar(id);
  deviceId = id; store.set('deviceId', id);
  setStatus('Connesso', 'on');
  // riallinea le strisce allo stato mostrato nell'app
  sendNow(powered ? CMD.on() : CMD.off());
  if (powered) sendNow(CMD.rgb(...hsv2rgb(hue, sat)));
  sendNow(CMD.bri(+$('br').value));
}

async function pick(all) {
  if (busy) return; busy = true;
  try {
    await BleClient.initialize();
    const opts = all ? {} : { namePrefix: 'ELK' };
    const dev = await BleClient.requestDevice({ ...opts, optionalServices: PAIRS.map(p => p.svc) });
    $('sheet').classList.add('hidden');
    await open(dev.deviceId);
  } catch (e) {
    setStatus(String(e?.message || e).slice(0, 38) || 'Errore');
  } finally { busy = false; }
}

$('status').onclick = async () => {
  if (chr) { await BleClient.disconnect(deviceId).catch(() => {}); chr = null; setStatus('Disconnesso'); return; }
  $('sheet').classList.remove('hidden');
};
$('scan').onclick = () => pick(false);
$('scanall').onclick = () => pick(true);
$('close').onclick = () => $('sheet').classList.add('hidden');

// ---------- avvio ----------
paint();
(async () => {
  if (!deviceId) return;
  try { await BleClient.initialize(); await open(deviceId); }
  catch { setStatus('Non connesso'); }
})();
window.addEventListener('resize', paint);
