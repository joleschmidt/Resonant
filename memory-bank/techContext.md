# Technical Context: Resonant

## Technology Stack

### Core Framework

- **Next.js:** 15.0.3 (App Router)
- **React:** 18.x
- **TypeScript:** 5.x (strict mode)
- **Node.js:** 18+ required

### Backend & Database

- **Supabase:** PostgreSQL + Auth + Storage
- **Region:** Europe (Frankfurt) - DSGVO compliance
- **Auth Methods:** Passkeys (WebAuthn), TOTP MFA, SMS OTP, Email Magic Links
- **Storage:** ImageKit for image hosting

### State Management

- **Client State:** Zustand 5.0.8
- **Server State:** React Query (TanStack Query) 5.90.3
- **Form State:** React Hook Form 7.65.0

### UI & Styling

- **Component Library:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS 3.4.1
- **Icons:** Lucide React 0.545.0
- **Animations:** tailwindcss-animate

### Validation & Security

- **Validation:** Zod 4.1.12
- **Form Validation:** @hookform/resolvers 5.2.2
- **HTML Sanitization:** sanitize-html 2.17.0
- **Rate Limiting:** @upstash/ratelimit 2.0.7 + @upstash/redis 1.35.6
- **File Validation:** file-type 21.1.0

### Image Handling

- **Upload:** react-dropzone 14.3.8
- **Cropping:** react-easy-crop 5.5.3
- **Storage:** ImageKit (external service)

## Development Setup

### Prerequisites

```bash
- Node.js 18+
- npm or pnpm
- Supabase account
- Upstash Redis account (for rate limiting)
- ImageKit account (for image hosting)
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# ImageKit (optional)
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/xxx
IMAGEKIT_PUBLIC_KEY=xxx
IMAGEKIT_PRIVATE_KEY=xxx
```

### Installation

```bash
npm install
npm run dev
```

### Database Setup

1. Create Supabase project in Frankfurt region
2. Run migrations in order (001-011)
3. Configure RLS policies
4. Set up storage buckets

## Key Dependencies

### Core

- `@supabase/ssr` - Server-side rendering support
- `@supabase/supabase-js` - Supabase client
- `next` - React framework
- `react`, `react-dom` - UI library

### UI Components

- `@radix-ui/*` - Headless UI primitives (via shadcn/ui)
- `class-variance-authority` - Component variants
- `clsx`, `tailwind-merge` - Class name utilities

### Utilities

- `zod` - Schema validation
- `zustand` - State management
- `@tanstack/react-query` - Server state
- `react-hook-form` - Form handling

## Build & Deployment

### Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest",
  "seed": "curl -X POST http://localhost:3000/api/seed?confirm=true"
}
```

### Build Configuration

- **Output:** Standalone (for Docker/containers)
- **Type Checking:** TypeScript strict mode
- **Linting:** ESLint with Next.js config
- **Testing:** Vitest (unit tests)

## Database Schema

### Key Tables

- `profiles` - User profiles with verification
- `listings` - Guitar equipment listings
- `messages` - Direct messages between users
- `conversations` - Message threads
- `transactions` - Purchase/sale records
- `ratings` - User ratings
- `favorites` - Saved listings
- `fraud_reports` - Scam reports
- `audit_logs` - Security audit trail

### Migrations

11 migrations total:
1. Initial schema (profiles, auth)
2. Listings schema
3. Username enforcement
4. Storage setup
5. Favorites & offers
6. Messaging
7. Followers
8. Stats & ratings
9. Passkey & MFA
10. Thomann categories
11. Fraud detection

## Security Infrastructure

### Authentication

- **Primary:** Passkeys (WebAuthn) - backend ready, UI pending
- **MFA:** TOTP via Supabase - tracking ready, UI pending
- **Fallback:** SMS OTP, Email Magic Links

### Rate Limiting

- **Public:** 100 req/min
- **Authenticated:** 200 req/min
- **Sensitive:** 20 req/min
- **Uploads:** 10 req/min

### Security Headers

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

### File Validation

- File signature checking (not just extension)
- Size limits (10MB images, 5MB documents)
- Type restrictions (images, PDFs only)
- Virus scanning (future)

## Performance Considerations

### Caching

- **Static:** Long-term (1 year)
- **Dynamic:** Short-term (1-10 minutes)
- **React Query:** 5-minute stale time

### Optimization

- **Images:** ImageKit CDN with optimization
- **Code Splitting:** Next.js automatic
- **Bundle Size:** Tree-shaking, dynamic imports

### Core Web Vitals Targets

- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **TTI:** < 3.5s

## Development Tools

### Code Quality

- **TypeScript:** Strict mode, no `any`
- **ESLint:** Next.js config
- **Prettier:** Code formatting
- **Vitest:** Unit testing

### Debugging

- **Browser:** Chrome DevTools
- **Server:** Next.js built-in logging
- **Database:** Supabase Dashboard SQL Editor

## External Services

### Supabase

- **Database:** PostgreSQL
- **Auth:** Multi-factor authentication
- **Storage:** File storage (avatars, listing images)
- **Region:** Frankfurt (EU)

### Upstash Redis

- **Purpose:** Distributed rate limiting
- **Fallback:** In-memory for development

### ImageKit

- **Purpose:** Image hosting and optimization
- **Features:** CDN, resizing, format conversion

## Constraints & Limitations

### Technical

- **TypeScript:** Strict mode enforced (no `any`)
- **UI Library:** shadcn/ui only (no mixing)
- **Database:** Supabase PostgreSQL (vendor lock-in)
- **Hosting:** EU region required (DSGVO)

### Business

- **Language:** German only (UI and content)
- **Market:** Germany only (initially)
- **Category:** Guitar equipment only (strict)

## Future Technical Considerations

1. **Image Storage:** Consider migrating to Supabase Storage
2. **Search:** Full-text search with PostgreSQL or Algolia
3. **Notifications:** Push notifications with service workers
4. **Payments:** Stripe integration for escrow
5. **Analytics:** Privacy-compliant analytics (Plausible?)
6. **Monitoring:** Error tracking (Sentry?)
