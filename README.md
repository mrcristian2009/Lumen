# Lumen 3.0 — MRCRISTIAN Edition

App premium per il controllo delle strisce LED BLE compatibili ELK-BLEDOM / Lotus Lantern.

## Funzioni
- Controllo BLE RGB, luminosità, effetti e scene.
- Lumen Studio: scene colore personalizzate salvate localmente.
- Lumen AI: comandi vocali locali tramite Web Speech API, se supportata dal dispositivo/browser.
- Timer: programmazione locale; il sistema operativo può sospendere il timer quando l'app è chiusa.
- Music Reactive: analisi del microfono locale tramite Web Audio API; richiede HTTPS o app nativa e consenso.
- Home Assistant: webhook HTTPS configurabile. Google Assistant può attivare le scene esposte da Home Assistant; non è un collegamento BLE diretto.
- Multi-device: più centraline memorizzate e selezionabili. Molte centraline economiche supportano una sola connessione per volta.
- Widget Android nativo con ON/OFF e apertura app.
- PWA installabile su browser compatibili.

## Build APK via GitHub Actions
1. Carica il contenuto di questa cartella in un repository GitHub (branch `main`).
2. Apri Actions e avvia `Build Lumen APK`.
3. Scarica l'artefatto `lumen-3-apk`.

## Build locale
Richiede Node 22, JDK 21 e Android SDK.
```sh
npm install
npx cap add android
npm run build
npx cap sync android
node scripts/install-widget.mjs
cd android && ./gradlew assembleDebug
```
APK: `android/app/build/outputs/apk/debug/app-debug.apk`.

## Home Assistant / Google Assistant
Configura un webhook HTTPS in Lumen. Crea in Home Assistant un'automazione con trigger webhook e azioni che richiamano le scene o gli script desiderati. Per Google Assistant, esponi gli script/scenari tramite l'integrazione Google Assistant di Home Assistant. Non incollare token amministrativi nel campo webhook.

## Limiti e privacy
Audio elaborato sul dispositivo; non viene registrato né inviato a server. Scene, dispositivi, timer e URL webhook sono conservati in localStorage sul dispositivo. Il timer web non è un allarme Android garantito a app terminata: per affidabilità assoluta occorre integrare AlarmManager/WorkManager nativo. Il widget apre l'app tramite deep link; le azioni BLE vengono eseguite dopo l'avvio dell'app e la connessione al controller.

Protocollo BLE originale mantenuto. I codici effetto possono variare tra centraline.

MRCRISTIAN COPYRIGHT — Lumen 3.0
