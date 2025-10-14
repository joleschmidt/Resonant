'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AvatarEditSection } from './AvatarEditSection';
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Profile } from '@/types';

type Props = {
    profile: Profile;
};

export function ProfileEditForm({ profile }: Props) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        setMessage(null);

        startTransition(async () => {
            try {
                const payload = {
                    full_name: (formData.get('full_name') as string) || null,
                    bio: (formData.get('bio') as string) || null,
                    location: (formData.get('location') as string) || null,
                };

                const response = await fetch('/api/profile/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (response.ok) {
                    setMessage({ type: 'success', text: 'Profil erfolgreich gespeichert!' });
                    // Clear message after 3 seconds
                    setTimeout(() => setMessage(null), 3000);
                    // Refresh the page to show updated data
                    router.refresh();
                } else {
                    setMessage({
                        type: 'error',
                        text: data.error || 'Fehler beim Speichern des Profils'
                    });
                }
            } catch (error) {
                setMessage({
                    type: 'error',
                    text: 'Netzwerkfehler. Bitte versuchen Sie es erneut.'
                });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Avatar</Label>
                <AvatarEditSection initialAvatarUrl={profile.avatar_url} />
            </div>

            <form action={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="full_name">Name</Label>
                    <Input
                        id="full_name"
                        name="full_name"
                        defaultValue={profile.full_name ?? ''}
                        disabled={isPending}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">Standort</Label>
                    <Input
                        id="location"
                        name="location"
                        defaultValue={profile.location ?? ''}
                        disabled={isPending}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                        id="bio"
                        name="bio"
                        defaultValue={profile.bio ?? ''}
                        disabled={isPending}
                        className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <div className="flex justify-between items-center">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/profile">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Zurück
                        </Link>
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Speichern...
                            </>
                        ) : (
                            'Speichern'
                        )}
                    </Button>
                </div>
            </form>

            {message && (
                <div className={`flex items-center gap-2 p-3 rounded-md ${message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        <XCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}
        </div>
    );
}
