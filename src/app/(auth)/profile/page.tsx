/**
 * Profile Page
 * User's own profile view
 */

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import type { Profile } from '@/types';
import { Suspense } from 'react';
import { InlineUsernameSetter } from '@/components/features/profile/InlineUsernameSetter';
import { UserProfileHeader } from '@/components/features/profile/UserProfileHeader';
import { UserStatsStrip } from '@/components/features/profile/UserStatsStrip';
import { ListingCard } from '@/components/features/listings/ListingCard';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        // SSR guard: redirect to home if unauthenticated
        // We avoid next/navigation redirect in server component here to keep it simple.
        return (
            <div className="container py-12">
                <Link href="/" className="underline">Zur Startseite</Link>
            </div>
        );
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<Profile>();

    if (!profile) {
        return (
            <div className="container py-12">
                <p>Profil nicht gefunden</p>
            </div>
        );
    }

    // Fetch user's listings
    const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12);

    return (
        <div className="container py-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Mein Profil</h1>
                </div>

                <div className="space-y-0">
                    <UserProfileHeader user={profile as Profile} isSelf editHref="/profile/edit" />
                    <UserStatsStrip
                        rating={profile.seller_rating}
                        sales={profile.total_sales}
                        purchases={profile.total_purchases}
                    />
                </div>

                {!profile.username_finalized && (
                    <div className="rounded-lg border p-6">
                        <h2 className="mb-4 text-lg font-semibold">Benutzername festlegen</h2>
                        <Suspense>
                            <InlineUsernameSetter />
                        </Suspense>
                    </div>
                )}

                {/* User's Listings */}
                {Array.isArray(listings) && listings.length > 0 && (
                    <div>
                        <h2 className="mb-4 text-xl font-semibold">Meine Anzeigen</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {listings.map((listing: any) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

