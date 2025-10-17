/**
 * UserSummaryCard
 * Compact user card for embeds
 */

import type { Profile } from '@/types';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerificationBadge } from './VerificationBadge';

export function UserSummaryCard({ user }: { user: Profile }) {
    const initials = user.username?.substring(0, 2).toUpperCase() || 'U';
    return (
        <Card className="flex items-center gap-3 p-3">
            <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{user.username}</span>
                    <VerificationBadge status={user.verification_status} />
                </div>
                {user.full_name && (
                    <div className="truncate text-xs text-muted-foreground">{user.full_name}</div>
                )}
            </div>
        </Card>
    );
}


