import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types';
import { ProfileEditForm } from '@/components/features/profile/ProfileEditForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProfileEditPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
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
        <div className="container py-12">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Profil bearbeiten</h1>
                </div>
                <ProfileEditForm profile={profile} />
            </div>
        </div>
    );
}


