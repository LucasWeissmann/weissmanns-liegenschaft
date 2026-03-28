# Weißmanns Liegenschaft - Setup Anleitung

## 1. Firebase Projekt erstellen (kostenlos)

1. Gehe zu [console.firebase.google.com](https://console.firebase.google.com)
2. Klicke auf **Projekt hinzufügen**
3. Gib dem Projekt einen Namen (z.B. "pool-liegen")
4. Google Analytics kannst du abwählen (wird nicht gebraucht)
5. Klicke auf **Projekt erstellen**

## 2. Firestore Datenbank aktivieren

1. Im Firebase Dashboard, klicke links auf **Build > Firestore Database**
2. Klicke auf **Datenbank erstellen**
3. Wähle den Standort **europe-west1** (Belgien, am nächsten zu Deutschland)
4. Wähle **Im Testmodus starten** (erlaubt Lesen und Schreiben ohne Login)
5. Klicke auf **Erstellen**

> **Hinweis**: Der Testmodus erlaubt jedem Zugriff. Das ist für eine Familien-App okay, da nur Leute mit der URL die App benutzen. Wenn gewünscht, können die Regeln später angepasst werden.

## 3. Firebase Config kopieren

1. Im Firebase Dashboard, klicke auf das Zahnrad oben links > **Projekteinstellungen**
2. Scrolle runter zu **Deine Apps** und klicke auf das Web-Symbol (`</>`)
3. Gib einen App-Namen ein (z.B. "pool-liegen-web")
4. **Firebase Hosting** muss NICHT aktiviert werden (wir nutzen GitHub Pages)
5. Klicke auf **App registrieren**
6. Du siehst jetzt den Firebase Config Block mit `apiKey`, `authDomain`, etc.
7. Kopiere `.env.example` zu `.env` und trage die Werte ein:

```bash
cp .env.example .env
```

Dann bearbeite `.env`:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=pool-liegen-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pool-liegen-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=pool-liegen-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

## 4. Lokal testen

```bash
npm install
npm run dev
```

Die App läuft dann auf `http://localhost:5173`.

## 5. GitHub Repository erstellen und deployen

1. Erstelle ein neues Repository auf [github.com](https://github.com/new) (z.B. `pool-liegen`)
2. Pushe den Code:

```bash
git init
git add .
git commit -m "Initial commit: Pool Liegen Booking App"
git remote add origin https://github.com/DEIN-USERNAME/pool-liegen.git
git branch -M main
git push -u origin main
```

3. Gehe in den Repository Settings > **Pages**
4. Unter **Source** wähle **GitHub Actions**
5. Der nächste Push deployed die App automatisch

## 6. Firebase Config für Production

Damit die App auf GitHub Pages funktioniert, musst du die Firebase-Werte direkt in `src/lib/firebase.js` eintragen (oder als GitHub Secrets + Build-Env-Vars konfigurieren).

**Einfachste Variante**: Trage die Werte direkt in `firebase.js` ein. Firebase API Keys sind nicht geheim (sie identifizieren nur das Projekt, Firestore Security Rules regeln den Zugriff).

## 7. Auf dem iPhone installieren

1. Öffne die GitHub Pages URL in Safari auf dem iPhone
2. Tippe auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben)
3. Scrolle runter und tippe auf **Zum Home-Bildschirm**
4. Bestätige mit **Hinzufügen**

Die App erscheint als eigenständige App auf dem Home-Bildschirm.
