# RESONANT Setup Guide

## Schritt-für-Schritt Anleitung

### 1. Supabase Projekt erstellen

1. Gehe zu [https://supabase.com](https://supabase.com)
2. Klicke auf "New Project"
3. Wähle deine Organisation (oder erstelle eine neue)
4. Projekt-Einstellungen:
   - **Name:** `resonant-production` (oder gewünscht)
   - **Database Password:** Generiere ein sicheres Passwort (speichere es!)
   - **Region:** `Europe (Frankfurt)` - **WICHTIG für DSGVO!**
   - **Pricing Plan:** Free (für Development)

5. Warte ca. 2 Minuten bis das Projekt bereit ist

### 2. API Keys kopieren

1. Gehe zu **Settings > API** in deinem Supabase Dashboard
2. Kopiere folgende Werte:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Geheim halten!)

### 3. Environment Variables einrichten

1. Kopiere `.env.example` zu `.env.local`:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. Füge deine Keys ein:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   \`\`\`

### 4. Database Migration ausführen

1. Öffne dein Supabase Dashboard
2. Gehe zu **SQL Editor**
3. Klicke auf **New Query**
4. Öffne die Datei `supabase/migrations/001_initial_schema.sql` in deinem Editor
5. Kopiere den gesamten Inhalt
6. Füge ihn in den SQL Editor ein
7. Klicke auf **Run**

Die Migration erstellt:
- `profiles` Tabelle mit allen Feldern
- RLS Policies für Sicherheit
- Trigger für automatische Profile-Erstellung
- Indexes für Performance

### 5. Verifizierung

1. Gehe zu **Table Editor** im Supabase Dashboard
2. Du solltest die Tabelle `profiles` sehen
3. Klicke auf **Authentication > Policies**
4. Verifiziere dass RLS Policies aktiv sind

### 6. Development Server starten

\`\`\`bash
npm run dev
\`\`\`

### 7. Ersten Account erstellen

1. Öffne [http://localhost:3000](http://localhost:3000)
2. Klicke auf "Registrieren"
3. Fülle das Formular aus
4. Checke deine E-Mail für die Bestätigung
5. Klicke auf den Bestätigungslink

**Hinweis:** Im Development-Modus kannst du E-Mails im Supabase Dashboard unter **Authentication > Logs** sehen, falls keine E-Mails ankommen.

### 8. Email Templates konfigurieren (Optional)

Für eine bessere UX kannst du die Email-Templates anpassen:

1. Gehe zu **Authentication > Email Templates** im Supabase Dashboard
2. Passe die Templates an (auf Deutsch)
3. Füge dein Logo hinzu

## Troubleshooting

### "Invalid API key" Error
- Überprüfe ob `.env.local` existiert
- Stelle sicher dass die Keys korrekt kopiert wurden
- Restarte den Dev Server (`npm run dev`)

### "Failed to create profile" Error
- Überprüfe ob die Migration erfolgreich war
- Checke die Supabase Logs: **Logs > Postgres**
- Stelle sicher dass der Trigger `on_auth_user_created` aktiv ist

### E-Mails kommen nicht an
- Im Development: Checke **Authentication > Logs** im Supabase Dashboard
- Für Production: Konfiguriere einen SMTP Provider unter **Settings > Auth > SMTP Settings**

### RLS Policy Errors
- Stelle sicher dass du angemeldet bist
- Überprüfe die Policies unter **Authentication > Policies**
- Im Zweifelsfall: Re-run der Migration

## Nächste Schritte

Jetzt bist du bereit! Schaue dir die weiteren Docs an:

- [Database Schema Übersicht](../supabase/migrations/001_initial_schema.sql)
- [API Spezifikation](../api-specification)
- [Component Patterns](../cursor-rules)

Viel Spaß beim Entwickeln! 🎸

