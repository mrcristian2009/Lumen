# Lumen 2.0 — MRCRISTIAN Edition

App per il controllo delle strisce LED Bluetooth ELK-BLEDOM/Lotus Lantern. Interfaccia responsive ispirata al linguaggio visivo Apple, tema scuro, ruota colore, luminosità, bianchi, scene, effetti, preferiti e controllo vocale del browser.

## Avvio web

Richiede Node.js 22 o superiore.

```bash
npm install
npm run dev
```

Per creare la build web: `npm run build` (output in `dist/`). Per installazione PWA, pubblicare la build su un hosting HTTPS; il browser mostrerà l'opzione Installa quando supportata. Il controllo Bluetooth web dipende dal supporto Web Bluetooth del browser: per l'accesso BLE più affidabile usare la build Android Capacitor.

## APK Android

```bash
npm install
npx cap add android
npm run apk
```

Se la cartella `android/` esiste già, non eseguire nuovamente `npx cap add android`; basta `npm run apk`. APK debug: `android/app/build/outputs/apk/debug/app-debug.apk`.

In alternativa caricare il progetto su GitHub nel branch `main`, aprire Actions e scaricare l'artefatto `lumen-2-apk` al termine del workflow.

## Compatibilità e limiti

- Android: Capacitor + Bluetooth LE nativo; concedere i permessi richiesti dal sistema e mantenere la striscia non collegata a Lotus Lantern.
- PWA: installabile su browser compatibili; BLE web è soggetto alle limitazioni del browser e richiede HTTPS.
- iOS: l'interfaccia è adattiva e installabile come web app, ma il controllo BLE non è garantito dalla versione web. Per BLE nativo serve un'integrazione/plugin iOS e i relativi permessi/test.
- Controllo vocale: usa Web Speech API quando disponibile, per comandi locali come accendi, spegni, rosso, blu, verde e viola. Non è una connessione diretta a Google Assistant.
- Google Assistant/Google Home: per comandare la centralina BLE con Assistant occorre un bridge, ad esempio Home Assistant con un host Bluetooth compatibile e un'integrazione esposta a Google Assistant. Non è possibile garantire questa funzione con la sola app mobile.
- I codici effetti e il protocollo sono mantenuti dal progetto di partenza; possono variare tra centraline ELK-BLEDOM.

## Privacy

Le preferenze sono memorizzate localmente nel browser/app. Il progetto non include analytics o account. Il font remoto DM Sans/Manrope richiede connessione; sono previsti font di sistema come fallback.

<!-- MRCRISTIAN COPYRIGHT — Lumen 2.0 source markers -->
