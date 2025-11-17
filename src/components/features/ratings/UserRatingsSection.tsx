/**
 * UserRatingsSection
 * Client component that fetches and displays ratings for a user
 */

'use client';

import { useState, useEffect } from 'react';
import { RatingsList } from './RatingsList';
import { Loader2 } from 'lucide-react';
import type { Rating } from '@/types';

interface UserRatingsSectionProps {
    userId: string;
    limit?: number;
}

export function UserRatingsSection({ userId, limit = 10 }: UserRatingsSectionProps) {
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRatings = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/ratings?userId=${userId}&limit=${limit}`);
                if (!res.ok) throw new Error('Failed to fetch ratings');
                const json = await res.json();
                setRatings(json.data || []);
            } catch (error) {
                console.error('Failed to fetch ratings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRatings();
    }, [userId, limit]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return <RatingsList ratings={ratings} userId={userId} />;
}


