# Lumen 3.0 — MRCRISTIAN Edition

**Importante:** questa cartella è la radice del progetto. Quando carichi su GitHub, carica direttamente `index.html`, `package.json`, `src/`, `public/`, `.github/` ecc. nella radice del repository. Non creare una cartella `lumen3/` dentro il repository: in quel caso GitHub Actions non troverà il workflow.

## Cosa è effettivamente incluso
- UI ridisegnata dark/glass, adattiva per mobile e desktop.
- Controllo Bluetooth LE RGB/luminosità/effetti per centraline compatibili con il protocollo originale.
- Lumen Studio: scene colore personalizzate salvate sul dispositivo.
- Comandi vocali in italiano via Web Speech API, se supportata dal browser/dispositivo. È un set di comandi locali, non un modello AI cloud.
- Timer locale: funziona mentre l'app è attiva; Android può sospendere l'esecuzione quando l'app viene chiusa o terminata.
- Music Reactive: analisi del microfono sul dispositivo e invio colore alla striscia mentre Lumen è aperta.
- Home Assistant: webhook HTTPS per test e richiamo di scene. Richiede un'automazione webhook configurata in Home Assistant; Google Assistant passa dall'integrazione Home Assistant, non parla direttamente con il controller BLE.
- Multi-device: salva più ID BLE e permette di passare da una centralina all'altra. Le centraline possono consentire una sola connessione alla volta.
- Sorgenti del widget Android incluse; il widget apre Lumen tramite deep link e quindi dipende dalla riapertura/connessione dell'app. Non mantiene una connessione BLE autonoma in background.
- PWA installabile su browser compatibili.

## Build APK con GitHub Actions
1. Crea/apri un repository GitHub.
2. Estrai questo ZIP.
3. Carica **il contenuto di questa cartella direttamente nella radice** del repository (non la cartella contenitore).
4. Vai in Actions → `Build Lumen APK` → Run workflow.
5. Scarica l'artefatto `lumen-3-apk`.

## Build locale
Richiede Node 22, JDK 21 e Android SDK:
```sh
npm install
npm run build
npx cap add android
npx cap sync android
node scripts/install-widget.mjs
cd android && ./gradlew assembleDebug
```
APK: `android/app/build/outputs/apk/debug/app-debug.apk`.

## Home Assistant / Google Assistant
Configura in Lumen un URL webhook HTTPS di Home Assistant. In Home Assistant crea un'automazione con trigger webhook e gestisci le azioni `ping` e `scene` (payload JSON con `source`, `action`, `name` e `color`). Per usare Google Assistant, esponi gli script/scenari di Home Assistant tramite la relativa integrazione. Non inserire token amministrativi nel campo webhook.

## Limiti da conoscere
- Lumen non può garantire timer/automazioni quando Android ha terminato l'app: per quello serve ancora un servizio nativo AlarmManager/WorkManager.
- Il widget non controlla il Bluetooth da solo: apre l'app e le passa l'azione.
- La compatibilità dei comandi dipende dal firmware della centralina ELK-BLEDOM.
- Il riconoscimento vocale dipende dal supporto Web Speech API del dispositivo.

MRCRISTIAN COPYRIGHT — Lumen 3.0
