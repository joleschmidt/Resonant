/**
 * UserSuggestionCard
 * Compact card for displaying suggested users in feed
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { VerificationBadge } from './VerificationBadge';
import { useUser } from '@/hooks/auth/useUser';
import { UserPlus, Package, Users } from 'lucide-react';

interface SuggestedUser {
    id: string;
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
    verification_status?: string;
    followers_count?: number;
    listings_count?: number;
}

interface UserSuggestionCardProps {
    user: SuggestedUser;
    onFollowChange?: () => void;
}

export function UserSuggestionCard({ user, onFollowChange }: UserSuggestionCardProps) {
    const { isAuthenticated } = useUser();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isTogglingFollow, setIsTogglingFollow] = useState(false);
    const initials = user.username?.substring(0, 2).toUpperCase() || 'U';

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchFollowStatus = async () => {
            try {
                const res = await fetch(`/api/profile/${user.username}/follow`);
                if (!res.ok) return;
                const json = await res.json();
                setIsFollowing(json.is_following);
            } catch (error) {
                console.error('Failed to fetch follow status:', error);
            }
        };

        fetchFollowStatus();
    }, [user.username, isAuthenticated]);

    const handleToggleFollow = async () => {
        if (!isAuthenticated) {
            alert('Bitte melde dich an, um Nutzern zu folgen');
            return;
        }

        setIsTogglingFollow(true);
        const prevState = isFollowing;
        setIsFollowing(!prevState);

        try {
            const res = await fetch(`/api/profile/${user.username}/follow`, {
                method: prevState ? 'DELETE' : 'POST',
            });

            if (!res.ok) {
                throw new Error('Failed to toggle follow');
            }

            const json = await res.json();
            setIsFollowing(json.is_following);
            onFollowChange?.();
        } catch (error) {
            console.error('Failed to toggle follow:', error);
            setIsFollowing(prevState);
            alert('Aktion fehlgeschlagen. Bitte später erneut versuchen.');
        } finally {
            setIsTogglingFollow(false);
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Link href={`/users/${user.username}`} className="flex-shrink-0">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </Link>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Link href={`/users/${user.username}`} className="hover:underline">
                                <span className="font-medium truncate">
                                    {user.display_name || user.username}
                                </span>
                            </Link>
                            <VerificationBadge status={user.verification_status} />
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            {user.listings_count !== undefined && (
                                <div className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    <span>{user.listings_count} Anzeigen</span>
                                </div>
                            )}
                            {user.followers_count !== undefined && (
                                <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{user.followers_count} Follower</span>
                                </div>
                            )}
                        </div>

                        {isAuthenticated && (
                            <Button
                                variant={isFollowing ? 'outline' : 'default'}
                                size="sm"
                                onClick={handleToggleFollow}
                                disabled={isTogglingFollow}
                                className="w-full"
                            >
                                <UserPlus className="h-3 w-3 mr-1" />
                                {isFollowing ? 'Gefolgt' : 'Folgen'}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

