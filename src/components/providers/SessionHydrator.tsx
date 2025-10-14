/**
 * SessionHydrator
 * Ensures client store reflects current Supabase session on mount
 */

'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export function SessionHydrator() {
    const setUser = useAuthStore((state) => state.setUser);
    const setIsLoading = useAuthStore((state) => state.setIsLoading);

    useEffect(() => {
        console.log('🔵 SessionHydrator useEffect RUNNING');

        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const hydrate = async () => {
            try {
                console.log('🔵 SessionHydrator - fetching session...');

                // First try via server API (cookie-backed, SSR-trustworthy)
                const resp = await fetch('/api/me', { credentials: 'include' });
                const data = await resp.json().catch(() => ({} as any));
                const userFromApi = data?.user ?? null;

                // Fallback to client getSession
                let finalUser = userFromApi;
                if (!finalUser) {
                    const supabase = createClient();
                    const { data: { session } } = await supabase.auth.getSession();
                    finalUser = session?.user ?? null;
                }

                console.log('🔵 SessionHydrator - session:', finalUser?.id ? `FOUND (${finalUser.email})` : 'NONE');

                if (cancelled) {
                    console.log('🔵 SessionHydrator - cancelled, not updating store');
                    return;
                }

                setUser(finalUser);
                console.log('🔵 SessionHydrator - store updated, user:', finalUser ? 'SET' : 'NULL');
            } catch (error) {
                console.error('🔴 SessionHydrator - ERROR:', error);
                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                    console.log('🔵 SessionHydrator - loading finished');
                }
            }
        };

        // Safety timeout to avoid stuck loading state
        timeoutId = setTimeout(() => {
            if (!cancelled) {
                setIsLoading(false);
                console.log('🔵 SessionHydrator - timeout fallback setIsLoading(false)');
            }
        }, 3000);

        hydrate();

        // Listen for auth changes
        const supabase = createClient();
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('🔵 SessionHydrator - auth state changed:', session?.user?.id ? 'LOGGED IN' : 'LOGGED OUT');
            if (!cancelled) {
                setUser(session?.user ?? null);
            }
        });

        return () => {
            cancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
            subscription.unsubscribe();
            console.log('🔵 SessionHydrator - CLEANUP');
        };
    }, [setUser, setIsLoading]);

    return null;
}
