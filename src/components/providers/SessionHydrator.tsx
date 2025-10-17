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
    const setProfile = useAuthStore((state) => state.setProfile);
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
                const profileFromApi = data?.profile ?? null;

                // Fallback to client getSession
                let finalUser = userFromApi;
                let finalProfile = profileFromApi;

                if (!finalUser) {
                    const supabase = createClient();
                    const { data: { session } } = await supabase.auth.getSession();
                    finalUser = session?.user ?? null;

                    // Fetch profile if we have a user
                    if (finalUser) {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', finalUser.id)
                            .single();
                        finalProfile = profile ?? null;
                    }
                }

                console.log('🔵 SessionHydrator - session:', finalUser?.id ? `FOUND (${finalUser.email})` : 'NONE');
                console.log('🔵 SessionHydrator - profile:', finalProfile?.username ? `FOUND (${finalProfile.username})` : 'NONE');

                if (cancelled) {
                    console.log('🔵 SessionHydrator - cancelled, not updating store');
                    return;
                }

                setUser(finalUser);
                setProfile(finalProfile);
                console.log('🔵 SessionHydrator - store updated, user:', finalUser ? 'SET' : 'NULL', 'profile:', finalProfile ? 'SET' : 'NULL');
            } catch (error) {
                console.error('🔴 SessionHydrator - ERROR:', error);
                if (!cancelled) {
                    setUser(null);
                    setProfile(null);
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
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('🔵 SessionHydrator - auth state changed:', session?.user?.id ? 'LOGGED IN' : 'LOGGED OUT');
            if (!cancelled) {
                setUser(session?.user ?? null);

                // Fetch profile when auth state changes
                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    setProfile(profile ?? null);
                } else {
                    setProfile(null);
                }
            }
        });

        return () => {
            cancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
            subscription.unsubscribe();
            console.log('🔵 SessionHydrator - CLEANUP');
        };
    }, [setUser, setProfile, setIsLoading]);

    return null;
}
