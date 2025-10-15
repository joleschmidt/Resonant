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
import { UserAbout } from '@/components/features/profile/UserAbout';

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

    return (
        <div className="container py-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Mein Profil</h1>
                    <Button asChild>
                        <Link href="/profile/edit">
                            <Edit className="mr-2 h-4 w-4" />Bearbeiten
                        </Link>
                    </Button>
                </div>

                <UserProfileHeader user={profile as Profile} isSelf editHref="/profile/edit" />

                <UserStatsStrip
                    rating={profile.seller_rating}
                    sales={profile.total_sales}
                    purchases={profile.total_purchases}
                />

                <UserAbout bio={profile.bio} />

                {!profile.username_finalized && (
                    <div className="rounded-lg border p-6">
                        <h2 className="mb-4 text-lg font-semibold">Benutzername festlegen</h2>
                        <Suspense>
                            <InlineUsernameSetter />
                        </Suspense>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border p-6">
                        <h2 className="mb-4 text-lg font-semibold">Account-Typ</h2>
                        <p className="text-2xl font-bold capitalize">{profile.account_type}</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {profile.account_type === 'basic' && 'Upgrade für mehr Funktionen'}
                            {profile.account_type === 'verified' && 'Bis zu 5 aktive Anzeigen'}
                            {profile.account_type === 'premium' && 'Bis zu 20 aktive Anzeigen + Analytics'}
                            {profile.account_type === 'store' && 'Bis zu 100 Anzeigen + Custom Branding'}
                        </p>
                    </div>

                    <div className="rounded-lg border p-6">
                        <h2 className="mb-4 text-lg font-semibold">Verifizierung</h2>
                        <p className="text-sm text-muted-foreground">
                            {profile.verification_status === 'unverified' &&
                                'Verifiziere deine E-Mail, um alle Funktionen freizuschalten.'}
                            {profile.verification_status === 'email_verified' &&
                                'E-Mail verifiziert. Verifiziere deine Telefonnummer für mehr Vertrauen.'}
                            {profile.verification_status === 'phone_verified' &&
                                'E-Mail und Telefon verifiziert.'}
                            {profile.verification_status === 'fully_verified' &&
                                'Vollständig verifiziert! Du genießt maximales Vertrauen.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

