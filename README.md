# RESONANT

Deutsche Gitarren Marketplace - Eine vertrauenswürdige Plattform für Gitarren, Amps und Zubehör in Deutschland.

## 🎸 Über das Projekt

RESONANT ist eine moderne Kleinanzeigen-Plattform für die deutsche Gitarren-Community. Funktional orientiert sie sich eng an Kleinanzeigen (ehemals eBay Kleinanzeigen), bietet aber:

- Eine **klare Beschränkung auf Musiker-Equipment** (Gitarren, Amps, Pedale, Recording-Zubehör)
- Einen starken Fokus auf **Trust & Safety**
- **Moderne Authentifizierung** mit Passkeys & MFA

**Ziel:** Musiker*innen in Deutschland sollen Gebraucht-Equipment kaufen und verkaufen können, ohne sich permanent Gedanken um Betrug, Phishing oder Fake-Profile machen zu müssen.

## 🧩 Kernfunktionen

- ✅ **Kleinanzeigen-UX 1:1**  
  Kategorie-Browsing, Standortsuche, Filter, Favoriten, Merkliste, Nachrichten – wie bei Kleinanzeigen, aber auf Gitarren fokussiert.

- ✅ **Gitarren-spezifische Listings**  
  Strukturierte Felder für:
  - Marken (Fender, Gibson, Ibanez, PRS, …)
  - Gitarrentypen (E-Gitarre, Akustik, Bass, etc.)
  - Zustand (mint → poor)
  - Baujahr, Seriennummer, Modifikationen, Originalteile

- ✅ **Trust & Safety first**  
  - Passkey-Login (WebAuthn) als Primär-Methode
  - Supabase MFA (TOTP) für kritische Aktionen
  - Fallback: SMS-Code oder Magiclink
  - Verdächtig niedrige / hohe Preise werden markiert
  - Seller-Profil mit Bewertungen, Historie & Account-Alter

- ✅ **Messaging & Deal Flow**  
  - Direktnachrichten zwischen Käufer & Verkäufer
  - Klarer "Deal-Status" (Anfrage, Reserviert, Verkauft)
  - Hinweise & UX-Copy gegen typische Scam-Muster

- ✅ **Community-Feeling**  
  - Follows, Favoriten, gespeicherte Suchen (geplant)
  - Öffentliche Profile mit Gear-Historie (geplant)

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict Mode, ohne `any`)
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend & DB:** Supabase (PostgreSQL + RLS)
- **State Management:** Zustand + React Query
- **Forms & Validation:** React Hook Form + Zod
- **Auth:** Supabase Auth (Passkeys, TOTP MFA, SMS, Magiclink)

## 🚀 Quick Start

### Voraussetzungen

- Node.js 18+
- npm oder pnpm
- Supabase Account
- Zugriff auf einen Supabase-Project in EU (Frankfurt empfohlen)

### Installation

1. **Repository klonen**
   \`\`\`bash
   git clone <repository-url>
   cd Resonant
   \`\`\`

2. **Dependencies installieren**
   \`\`\`bash
   npm install
   \`\`\`

3. **Umgebungsvariablen einrichten**
   
   Kopiere `.env.example` zu `.env.local` und füge deine Supabase Credentials ein:
   
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Bearbeite `.env.local`:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=deine_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_anon_key
   SUPABASE_SERVICE_ROLE_KEY=dein_service_role_key
   \`\`\`

4. **Supabase Setup**
   
   Projekt im [Supabase Dashboard](https://supabase.com/dashboard) anlegen:
   - Erstelle ein neues Projekt
   - Region: **Europe (Frankfurt)** (wichtig für DSGVO & Latenz)
   - Kopiere die API Keys aus Settings > API in `.env.local`
   
   Führe die Migrationen aus (in Reihenfolge):
   - Öffne SQL Editor im Supabase Dashboard
   - Kopiere und führe aus:
     1. `001_initial_schema.sql`
     2. `002_listings_schema.sql`
     3. `002_username_enforcement.sql`
     4. `003_storage_setup.sql`
     5. `004_favorites_offers.sql`
     6. `005_messaging.sql`
     7. `006_followers.sql`
     8. `007_stats_and_ratings.sql`
     9. `008_audit_logging.sql`

5. **Development Server starten**
   \`\`\`bash
   npm run dev
   \`\`\`
   
   Öffne [http://localhost:3000](http://localhost:3000)

6. **Dummy Data erstellen (Optional)**
   
   Um die Website mit Beispiel-Daten zu füllen:
   \`\`\`bash
   npm run seed
   \`\`\`
   
   Oder manuell: `POST http://localhost:3000/api/seed?confirm=true`
   
   Siehe [Seeding Guide](docs/SEEDING.md) für Details.

## 📁 Projektstruktur

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Protected routes
│   ├── actions/           # Server Actions
│   └── layout.tsx         # Root Layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── features/          # Feature components (Auth, Profile)
│   ├── layout/            # Layout components
│   └── providers/         # React Providers
├── lib/
│   ├── supabase/          # Supabase clients
│   └── validations/       # Zod schemas
├── hooks/                 # Custom React hooks
├── stores/                # Zustand stores
├── types/                 # TypeScript types
├── utils/                 # Utility functions
└── styles/                # Global styles
\`\`\`

## 🔐 Auth & Sicherheit

- **Primäre Login-Methode:** Passkeys (WebAuthn)  
  Nutzer sollen idealerweise komplett passwortlos unterwegs sein.

- **MFA mit Supabase TOTP:**  
  - Aktiv für sensible Aktionen (z.B. Bankdaten ändern, hochpreisige Transaktionen, Payouts)
  - Optional bei Login, je nach User-Level und Risk Score

- **Fallback-Methoden:**  
  - SMS One-Time-Code
  - E-Mail Magiclink

- **RLS & Datenklassen:**  
  - Alle Tabellen mit Row Level Security abgesichert
  - Öffentliche Daten: Listings, öffentliches Profil
  - Geschützte Daten: Email, Telefonnummer, Nachrichten, Transaktionsdetails
  - Restriktive Daten: Zahlungsdaten, Identitätsnachweise, Admin Logs

- **DSGVO Compliance:** EU (Frankfurt) Hosting, minimale Datenerhebung

## ⚙️ Entwicklungsrichtlinien

- **TypeScript Strict** – kein `any`, saubere Typen für Props, Hooks und API-Responses.
- **shadcn/ui only** für neue UI-Bausteine; kein wildes Mischen von UI-Libraries.
- **State-Management**:
  - Client-UI-State: Zustand
  - Server-Daten: React Query Hooks mit klaren `queryKey`s
- **Validierung**:
  - Alle Formulare mit Zod validieren.
  - API-Endpoints validieren Input immer serverseitig.
- **Fehlerbehandlung**:
  - Userfreundliche Fehlermeldungen im UI.
  - Logging (serverseitig) für unerwartete Fehler.
- **Zugänglichkeit (A11y)**:
  - WCAG 2.1 AA
  - ARIA-Attribute, Fokus-Management bei Dialogen/Modals

## 📚 Dokumentation

- [System Prompt](SYSTEM_PROMPT.md) – Kompletter Kontext für AI-Assistenten
- [Cursor Rules](.cursorrules) – Entwicklungsregeln
- [Setup Guide](docs/setup.md)
- [Database Schema](supabase/migrations/)

## 🎯 Roadmap

### Phase 1: Auth & Profiles ✅
- [x] Passkey-basiertes Login (WebAuthn)
- [x] MFA mit TOTP (Supabase)
- [x] Fallback: SMS & Magiclink
- [x] Profilverwaltung & Verifizierungslevel

### Phase 2: Listings ✅
- [x] Gitarren-spezifische Felder & Validierung
- [x] Standortbasierte Suche & Filter
- [x] Bild-Upload & Optimierung
- [x] Preis-Checks (zu niedrig / zu hoch markiert)
- [x] Favoriten-System

### Phase 3: Kommunikation ✅
- [x] Messaging System
- [x] Deal-Status (Anfrage, Reserviert, Verkauft)
- [ ] Push-/Email-Notifications
- [ ] Erweiterte Anti-Scam-Mechaniken

### Phase 4: Transaktionen & Safety
- [x] Transaktionsobjekte & Bewertungslogik
- [ ] Payment-Integration (z.B. Stripe)
- [ ] Escrow / Treuhand-Mechaniken
- [ ] Erweiterte Fraud-Detection
- [ ] Reporting-Dashboard für Admins

## 🤝 Contributing

Das Projekt ist aktiv im Aufbau. Contributions sind willkommen – insbesondere zu:

- Security & Anti-Fraud
- shadcn/ui Komponenten & UX
- Performance & SEO

## 📄 Lizenz

MIT License

## 👨‍💻 Entwickelt mit

- Cursor AI
- Claude Sonnet 4.5
- Viel ☕ und 🎸

