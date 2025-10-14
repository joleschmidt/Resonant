import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export async function POST() {
    const res = NextResponse.json({ ok: true });
    const cookieStore = await cookies();

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        res.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Revoke refresh token across all devices and ensure auth cookies are cleared
    await supabase.auth.signOut({ scope: 'global' });

    // Hard-delete known cookie names as belt-and-suspenders in case adapters miss
    try {
        const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
        const projectRef = (url.hostname || '').split('.')[0];
        if (projectRef) {
            const authCookie = `sb-${projectRef}-auth-token`;
            const refreshCookie = `sb-${projectRef}-refresh-token`;
            res.cookies.set(authCookie, '', { path: '/', maxAge: 0 });
            res.cookies.set(refreshCookie, '', { path: '/', maxAge: 0 });
        }
    } catch { }

    return res;
}


