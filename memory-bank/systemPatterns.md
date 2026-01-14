# System Patterns: Resonant

## Architecture Overview

**Pattern:** Next.js 15 App Router with Supabase backend  
**State Management:** Zustand (client) + React Query (server)  
**UI Framework:** shadcn/ui components  
**Language:** TypeScript (strict mode, no `any`)

## Component Architecture

### File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Protected routes
│   ├── actions/           # Server Actions
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── features/          # Feature-specific components
│   └── layout/            # Layout components
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── security/           # Security utilities
│   └── validations/       # Zod schemas
├── hooks/                 # Custom React hooks
├── stores/                # Zustand stores
└── types/                 # TypeScript definitions
```

### Component Pattern (Required)

```typescript
interface ComponentProps {
  // Explicit props interface
}

const Component: React.FC<ComponentProps> = ({ 
  // Destructured props
}) => {
  // 1. Hooks at top
  // 2. Event handlers
  // 3. Early returns (loading/error)
  // 4. Main render
};

Component.displayName = 'Component';
export default Component;
```

### API Route Pattern

```typescript
// app/api/[resource]/route.ts
export async function GET(request: Request) {
  try {
    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 2. Input validation with Zod
    const params = schema.parse(await request.json());
    
    // 3. Database query (RLS enforced)
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    // 4. Return typed response
    return NextResponse.json(data);
  } catch (error) {
    // 5. Error handling
    console.error('[API Error]', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
```

## State Management Patterns

### Client State (Zustand)

```typescript
// stores/exampleStore.ts
import { create } from 'zustand';

interface ExampleState {
  value: string;
  setValue: (value: string) => void;
}

export const useExampleStore = create<ExampleState>((set) => ({
  value: '',
  setValue: (value) => set({ value }),
}));
```

### Server State (React Query)

```typescript
// hooks/example/useExample.ts
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export const useExample = (id: string) => {
  return useQuery({
    queryKey: ['example', id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('table')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

## Security Patterns

### Authentication

- **Client:** `createClient()` from `src/lib/supabase/client.ts`
- **Server:** `createServerClient()` from `src/lib/supabase/server.ts`
- **Never:** Use service role key in client code

### Row Level Security (RLS)

Every table MUST have RLS policies:
- Public data: Listings, public profiles
- Protected data: Email, phone, messages
- Restricted data: Payment info, identity docs

### Validation

- **Forms:** React Hook Form + Zod
- **API:** Zod schemas for all inputs
- **Files:** Signature validation, size limits, type checking

## Database Patterns

### Schema Organization

- **Migrations:** Sequential numbering in `supabase/migrations/`
- **Naming:** Descriptive names (e.g., `011_fraud_detection.sql`)
- **RLS:** Policies defined in migrations
- **Indexes:** Created for common query patterns

### Type Safety

- **Generated Types:** `src/types/database.ts` from Supabase
- **Usage:** Always use typed Supabase client
- **No `any`:** Strict TypeScript enforcement

## UI/UX Patterns

### Design System

- **Colors:** Kleinanzeigen green (#00A650) as primary
- **Components:** shadcn/ui only (no mixing libraries)
- **Responsive:** Mobile-first, Tailwind breakpoints
- **Accessibility:** WCAG 2.1 AA compliance

### Category Navigation

- **Structure:** 3-level hierarchy (Parent → Category → Subcategory)
- **Source:** `src/utils/thomann-categories.ts`
- **Display:** Sidebar navigation with expandable sections
- **Filtering:** Advanced filters in sidebar

### Trust Indicators

- **Calculation:** `src/lib/utils/trustScore.ts`
- **Display:** `src/components/features/profile/TrustBadges.tsx`
- **Variants:** Full, Compact, Inline
- **Factors:** Verification, account age, ratings, history

## Error Handling Patterns

### Client-Side

```typescript
try {
  // Operation
} catch (error) {
  // User-friendly German message
  toast.error('Ein Fehler ist aufgetreten');
  // Log for debugging
  console.error('[Component Error]', error);
}
```

### Server-Side

```typescript
try {
  // Operation
} catch (error) {
  // Log with context
  console.error('[API Error]', { endpoint, error, userId });
  // Return generic message (never expose internals)
  return NextResponse.json(
    { error: 'Ein Fehler ist aufgetreten' },
    { status: 500 }
  );
}
```

## Fraud Detection Patterns

### Scoring Flow

1. **Input:** Listing data, seller profile, account age
2. **Analysis:** Multiple detection modules (price, contact, urgency, etc.)
3. **Scoring:** Weighted risk score (0-100)
4. **Classification:** Risk level (low, medium, high, critical)
5. **Action:** Flag for review, show warnings, block if critical

### Message Filtering

1. **Input:** Message content, sender trust, message number
2. **Filtering:** Contact info redaction, link blocking, scam phrase detection
3. **Progressive Disclosure:** Stricter early, relaxes with trust
4. **User Feedback:** Clear warnings about filtered content

## Performance Patterns

### Caching Strategy

- **Static Assets:** 1 year
- **Listings List:** 2 minutes
- **Listing Detail:** 5 minutes
- **User Profile:** 10 minutes
- **Search Results:** 1 minute

### React Query Configuration

- **staleTime:** 5 minutes for most queries
- **cacheTime:** 10 minutes
- **refetchOnWindowFocus:** false (for better UX)
- **refetchOnReconnect:** true

## Testing Patterns

- **Unit Tests:** Vitest for utilities and hooks
- **Integration Tests:** API routes and database operations
- **E2E Tests:** Critical user flows (auth, listing creation, messaging)
