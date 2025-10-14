/**
 * Auth Provider Component
 * Initializes authentication state
 */

'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { ProfileCompletionModal } from '@/components/features/profile/ProfileCompletionModal';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Initialize auth state
    useAuth();
    const profile = useAuthStore((s) => s.profile);
    const isLoading = useAuthStore((s) => s.isLoading);

    // Handle magic-link / verification code on any route
    useEffect(() => {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        if (!code) return;

        const run = async () => {
            const supabase = createClient();
            try {
                await supabase.auth.exchangeCodeForSession(code);
                // after exchange, ensure store reflects session
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                if (session?.user) {
                    // best-effort: write into store via auth hook on next tick
                    // (useAuth listens to onAuthStateChange as well)
                }
            } catch (_e) {
                // no-op; Supabase returns useful errors to console if relevant
            } finally {
                url.searchParams.delete('code');
                const clean = url.pathname + (url.search ? '?' + url.searchParams.toString() : '');
                window.history.replaceState({}, '', clean || '/');
            }
        };

        run();
    }, []);

    const mustComplete = !!profile && !profile.username_finalized;
    return (
        <>
            {children}
            <ProfileCompletionModal open={!!profile && !isLoading && mustComplete} onOpenChange={() => { }} />
        </>
    );
}

