/**
 * RatingsList
 * Displays a list of ratings for a user
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import type { Rating } from '@/types';

interface RatingsListProps {
    ratings: Rating[];
    userId: string;
}

export function RatingsList({ ratings, userId }: RatingsListProps) {
    if (!ratings || ratings.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    Noch keine Bewertungen vorhanden
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {ratings.map((rating) => {
                const rater = rating.rater;
                const initials = rater?.username
                    ? rater.username.charAt(0).toUpperCase()
                    : '?';

                return (
                    <Card key={rating.id}>
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                {/* Rater Avatar */}
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={rater?.avatar_url || undefined} />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>

                                {/* Rating Content */}
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">
                                                {rater?.username || 'Unbekannter Nutzer'}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${
                                                            i < rating.score
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(rating.created_at).toLocaleDateString(
                                                'de-DE',
                                                {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                }
                                            )}
                                        </span>
                                    </div>

                                    {rating.comment && (
                                        <p className="mt-2 text-sm text-foreground">
                                            {rating.comment}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}


