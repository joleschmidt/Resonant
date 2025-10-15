/**
 * UserProfileHeader
 * Polished header with cover, avatar, name, badges and actions
 */

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Pencil } from 'lucide-react';
import { VerificationBadge } from './VerificationBadge';
import Link from 'next/link';

type Props = {
    user: Profile;
    isSelf?: boolean;
    editHref?: string;
    className?: string;
    coverUrl?: string | null;
};

const fallbackCovers = [
    '/src/assets/img/banner-background/pexels-yusronell-20721465.jpg',
    '/src/assets/img/banner-background/pexels-alexey-278505875-30888312.jpg',
    '/src/assets/img/banner-background/pexels-mikebirdy-114820.jpg',
];

export function UserProfileHeader({ user, isSelf, editHref, className, coverUrl }: Props) {
    const initials = user.username?.substring(0, 2).toUpperCase() || 'U';
    const memberSince = new Date(user.created_at).toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric',
    });

    const banner = coverUrl || fallbackCovers[0];
    const hasCover = !!coverUrl;

    return (
        <div className={cn('rounded-xl border overflow-hidden', className)}>
            <div className="relative h-40 w-full bg-muted sm:h-56">
                {hasCover ? (
                    <>
                        <Image
                            src={banner}
                            alt="Profil-Cover"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />
                    </>
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100" />
                )}
            </div>

            <div className="px-4 pb-4 sm:px-6">
                <div className="flex items-end gap-4">
                    <Avatar className="-mt-10 h-20 w-20 ring-4 ring-background sm:-mt-12 sm:h-24 sm:w-24">
                        <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold sm:text-3xl">{user.username}</h1>
                            <VerificationBadge status={user.verification_status} />
                            {user.account_type && (
                                <Badge variant="secondary" className="ml-1">
                                    {user.account_type.charAt(0).toUpperCase() + user.account_type.slice(1)}
                                </Badge>
                            )}
                        </div>
                        {user.full_name && (
                            <p className="text-sm text-muted-foreground">{user.full_name}</p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            {user.location && (
                                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{user.location}</span>
                            )}
                            <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />Dabei seit {memberSince}</span>
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        {!isSelf && (
                            <>
                                <Button size="sm">Nachricht</Button>
                                <Button size="sm" variant="outline" disabled>
                                    Folgen
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {user.bio && (
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        {user.bio}
                    </p>
                )}
            </div>
        </div>
    );
}


