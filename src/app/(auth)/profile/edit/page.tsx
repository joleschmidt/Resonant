import { createClient } from '@/lib/supabase/server';
import { profileUpdateSchema } from '@/lib/validations/profile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/types';
import { AvatarUploader } from '@/components/features/profile/AvatarUploader';

export const dynamic = 'force-dynamic';

export default async function ProfileEditPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return (
            <div className="container py-12">
                <a href="/" className="underline">Zur Startseite</a>
            </div>
        );
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<Profile>();

    async function save(formData: FormData) {
        'use server';
        const payload = {
            full_name: (formData.get('full_name') as string) || null,
            bio: (formData.get('bio') as string) || null,
            location: (formData.get('location') as string) || null,
        };
        const parsed = profileUpdateSchema.safeParse(payload);
        if (!parsed.success) return;
        const supa = await createClient();
        const {
            data: { user: u },
        } = await supa.auth.getUser();
        if (!u) return;
        await supa.from('profiles').update(parsed.data as any).eq('id', u.id);
    }

    return (
        <div className="container py-12">
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-6 text-3xl font-bold">Profil bearbeiten</h1>
                <form action={save} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Avatar</Label>
                        <AvatarUploader currentUrl={profile?.avatar_url} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Name</Label>
                        <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Standort</Label>
                        <Input id="location" name="location" defaultValue={profile?.location ?? ''} />
                    </div>
                    {/* Avatar URL field removed; handled by uploader */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea id="bio" name="bio" defaultValue={profile?.bio ?? ''} className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">Speichern</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}


