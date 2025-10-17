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

    const banner = coverUrl || null;
    const hasCover = false; // banner disabled on all viewports

    return (
        <div className={cn('rounded-t-xl border-b-0 border overflow-hidden', className)}>
            <div className="relative px-4 pb-3 pt-4 sm:px-6 sm:pt-6 sm:pb-4">
                {/* Edit button top-right */}
                {isSelf && editHref && (
                    <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
                        <Button asChild size="sm" className="sm:inline-flex hidden">
                            <Link href={editHref}>Bearbeiten</Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost" className="sm:hidden">
                            <Link href={editHref}>
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                )}

                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-4">
                    {/* Avatar - centered and above username on mobile; left on desktop */}
                    <Avatar className="h-24 w-24 ring-4 ring-background sm:h-20 sm:w-20">
                        <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 pt-2 text-center sm:text-left">
                        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                            <h1 className="text-2xl font-bold sm:text-3xl">{user.username}</h1>
                            <div className="flex flex-wrap items-center gap-2">
                                <VerificationBadge status={user.verification_status} />
                                {user.account_type && (
                                    <Badge variant="secondary">
                                        {user.account_type.charAt(0).toUpperCase() + user.account_type.slice(1)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        {user.full_name && (
                            <p className="text-sm text-muted-foreground">{user.full_name}</p>
                        )}

                        <div className="mt-1 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {user.location && (
                                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{user.location}</span>
                            )}
                            <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />Dabei seit {memberSince}</span>
                        </div>
                    </div>

                    <div className="mt-2 w-full sm:mt-0 sm:w-auto sm:ml-auto flex flex-wrap gap-2 justify-center sm:justify-end">
                        {isSelf ? null : (
                            <>
                                <Button size="sm" className="flex-1 sm:flex-none">Nachricht</Button>
                                <Button size="sm" variant="outline" disabled className="flex-1 sm:flex-none">
                                    Folgen
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {user.bio && (
                    <p className="mt-1 sm:mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground text-center sm:text-left">
                        {user.bio}
                    </p>
                )}

            </div>
        </div>
    );
}


