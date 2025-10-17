/**
 * Supabase Client for Server Components
 * Used in Server Components and Server Actions
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Admin client that bypasses RLS
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Service role key is not available");
    throw new Error("Service role key is required");
  }

  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Public helpers
export async function getUserByUsername(username: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `id, username, username_finalized, full_name, email, avatar_url, bio, location, verification_status, account_type, seller_rating, buyer_rating, total_sales, total_purchases, created_at, updated_at, last_active_at`
    )
    .eq('username', username)
    .single();
  if (error) return { user: null, error } as const;
  return { user: data, error: null } as const;
}