/**
 * Auth Callback Route
 * Handles email verification and OAuth callbacks
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;

    if (code) {
        const supabase = await createClient();

        // Exchange the code for a session
        await supabase.auth.exchangeCodeForSession(code);
    }

    // Redirect to profile after successful verification
    return NextResponse.redirect(`${origin}/profile`);
}

