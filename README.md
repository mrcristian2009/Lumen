# Lumen: controllo per strisce LED ELK-BLEDOM (Lotus Lantern)

App Android (Capacitor + BLE nativo) con interfaccia minimal scura:
ruota colore, luminosità, bianchi, effetti con velocità, preferiti, riconnessione automatica.

## Ottenere l'APK senza installare nulla (GitHub Actions)
1. Crea un repo su GitHub e carica il contenuto di questa cartella (branch `main`).
2. Apri la scheda **Actions**, esegui **Build APK** (parte anche da sola a ogni push).
3. A fine build scarica l'artefatto **lumen-apk**: dentro c'è `app-debug.apk`.
4. Copialo sul telefono e installalo (consenti "origini sconosciute" se richiesto).

## Compilare in locale (Node 22, JDK 21, Android Studio/SDK)
```
npm install
npm run build
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```
APK in `android/app/build/outputs/apk/debug/app-debug.apk`.

## Uso
- Chiudi l'app Lotus Lantern (la centralina accetta una sola connessione).
- Tocca "Non connesso" e poi "Cerca ELK-BLEDOM". Se non compare, usa "Mostra tutti i dispositivi".
- Concedi i permessi Bluetooth/posizione quando richiesti.

## Se qualcosa non risponde
I comandi sono in `src/main.js` (oggetto `CMD`). Alcune centraline usano la variante
`7E 07 05 03 RR GG BB 10 EF`: basta cambiare i byte lì. I nomi degli effetti sono indicativi.
