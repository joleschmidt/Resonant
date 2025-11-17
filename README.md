# RESONANT

Deutsche Gitarren Marketplace - Eine vertrauenswürdige Plattform für Gitarren, Amps und Zubehör in Deutschland.

## 🎸 Über das Projekt

RESONANT ist eine moderne Marketplace-Plattform, speziell entwickelt für die deutsche Gitarren-Community. Wir bieten eine sichere, benutzerfreundliche Alternative zu eBay Kleinanzeigen und Reverb.

### Kernfunktionen

- ✅ **Authentifizierung & Verifizierung** - Sicheres Auth-System mit Email-Verifikation
- ✅ **User Profile** - Detaillierte Profile mit Bewertungen und Statistiken
- ✅ **Multi-Kategorie Listings** - Gitarren, Amps & Effekte mit spezifischen Feldern
- ✅ **Image Upload & Compression** - Optimierte Bildverarbeitung mit ImageKit
- ✅ **Search & Filters** - Erweiterte Suchfunktionen mit Kategorie-Filtern
- ✅ **Messaging** - Direktnachrichten zwischen Käufern und Verkäufern
- ✅ **Follow System** - Folge anderen Nutzern und baue dein Netzwerk auf
- ✅ **Transactions & Ratings** - Sichere Transaktionen mit Bewertungssystem

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL + RLS)
- **State Management:** Zustand + React Query
- **Forms:** React Hook Form + Zod
- **Auth:** Supabase Auth

## 🚀 Quick Start

### Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Supabase Account

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
   
   Gehe zu [Supabase Dashboard](https://supabase.com/dashboard) und:
   - Erstelle ein neues Projekt
   - Region: **Europe (Frankfurt)** (wichtig für DSGVO)
   - Kopiere die API Keys aus Settings > API
   
   Führe die Migrationen aus (in Reihenfolge):
   - Öffne SQL Editor im Supabase Dashboard
   - Kopiere und führe aus: `001_initial_schema.sql`
   - Kopiere und führe aus: `002_listings_schema.sql`
   - Kopiere und führe aus: `002_username_enforcement.sql`
   - Kopiere und führe aus: `003_storage_setup.sql`
   - Kopiere und führe aus: `004_favorites_offers.sql`
   - Kopiere und führe aus: `005_messaging.sql`
   - Kopiere und führe aus: `006_followers.sql`
   - Kopiere und führe aus: `007_stats_and_ratings.sql`

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

## 🔐 Sicherheit

- **RLS Policies:** Alle Datenbank-Tabellen sind mit Row Level Security geschützt
- **DSGVO Compliance:** Deutsche Datenschutz-Standards
- **Email Verification:** Required für Account-Aktivierung
- **Type Safety:** Strikte TypeScript-Konfiguration

## 📚 Dokumentation

- [Setup Guide](docs/setup.md)
- [Architecture](cursor-rules)
- [API Specification](api-specification)
- [Database Schema](supabase/migrations/001_initial_schema.sql)

## 🎯 Roadmap

### Phase 1: Auth & Profile ✅
- [x] User Authentication
- [x] Profile Management
- [x] Verification System

### Phase 2: Listings ✅
- [x] Multi-Category Listings (Gitarren, Amps, Effekte)
- [x] Create Listings with Category-Specific Fields
- [x] Browse Listings with Advanced Filters
- [x] Image Upload & Compression
- [x] Search & Filters
- [x] Favorites System

### Phase 3: Communication ✅
- [x] Messaging System
- [x] Follow System
- [x] Offer Management
- [ ] Notifications (Email/Push)

### Phase 4: Transactions ✅
- [x] Transaction Creation (Buy Now)
- [x] Transaction Completion
- [x] Rating System
- [ ] Payment Integration (Stripe)
- [ ] Escrow Service

## 🤝 Contributing

Dieses Projekt befindet sich in aktiver Entwicklung. Contributions sind willkommen!

## 📄 Lizenz

MIT License

## 👨‍💻 Entwickelt mit

- Cursor AI
- Claude Sonnet 4.5
- Viel ☕ und 🎸

