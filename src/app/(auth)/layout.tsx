/**
 * Auth Layout
 * Layout for authenticated pages requiring login
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If not logged in, redirect to home page
    if (!user) {
        redirect('/');
    }

    // Just pass the children through - the root layout handles the UI structure
    return children;
}