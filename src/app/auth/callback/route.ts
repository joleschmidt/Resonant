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
        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

        // If user is verified and has username in metadata, update profile
        if (user && !error) {
            const usernameFromMetadata = (user.user_metadata?.username as string) || null;
            
            if (usernameFromMetadata) {
                // Check if profile exists and username is not finalized
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username, username_finalized')
                    .eq('id', user.id)
                    .single();

                // Update username if not finalized and different from metadata
                if (profile && !profile.username_finalized && profile.username !== usernameFromMetadata) {
                    // Check if username is available
                    const { data: existing } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('username', usernameFromMetadata.toLowerCase())
                        .neq('id', user.id)
                        .maybeSingle();

                    // Only update if username is available
                    if (!existing) {
                        await supabase
                            .from('profiles')
                            .update({ 
                                username: usernameFromMetadata.toLowerCase(),
                                username_finalized: true 
                            })
                            .eq('id', user.id);
                    }
                }
            }
        }
    }

    // Redirect to profile after successful verification
    return NextResponse.redirect(`${origin}/profile`);
}

