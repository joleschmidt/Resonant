/**
 * Home Feed Page
 * Displays mixed content feed with recent listings, trending, and user suggestions
 */

'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListingCard } from '@/components/features/listings/ListingCard';
import { UserSuggestionCard } from '@/components/features/profile/UserSuggestionCard';
import { LISTING_CATEGORIES } from '@/utils/constants';
import { Loader2, TrendingUp, Clock, Users, Search } from 'lucide-react';
import { useListings } from '@/hooks/listings/useListings';
import { useTrendingListings } from '@/hooks/listings/useTrendingListings';
import { useQuery } from '@tanstack/react-query';

interface SuggestedUser {
    id: string;
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
    verification_status?: string;
    followers_count?: number;
    listings_count?: number;
}

export default function HomeFeed() {
    const [category, setCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Use React Query hooks for listings
    const { data: recentData, isLoading: loadingRecent } = useListings({
        page: 1,
        limit: 12,
        category: category !== 'all' ? category : undefined,
    });

    const { data: trendingData, isLoading: loadingTrending } = useTrendingListings({
        category: category !== 'all' ? category : undefined,
        limit: 8,
    });

    // Fetch suggested users with React Query
    const { data: usersData, isLoading: loadingUsers } = useQuery<{ data: SuggestedUser[] }>({
        queryKey: ['users', 'suggested'],
        queryFn: async () => {
            const res = await fetch('/api/users/suggested?limit=5');
            if (!res.ok) throw new Error('Failed to fetch suggested users');
            return res.json();
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });

    const recentListings = recentData?.data || [];
    const trendingListings = trendingData?.data || [];
    const suggestedUsers = usersData?.data || [];

    const handleSearch = () => {
        if (searchQuery.trim()) {
            window.location.href = `/listings?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Search Section */}
            <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Dein Musikequipment Marktplatz
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Gitarren, Amps, Effekte & mehr von verifizierten Verkäufern
                        </p>
                        
                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <input
                                type="text"
                                placeholder="Marke, Modell, Typ..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full h-14 px-6 pr-32 text-lg rounded-full border-2 border-border bg-card shadow-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            <button
                                onClick={handleSearch}
                                className="absolute right-2 top-2 h-10 px-6 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
                            >
                                Suchen
                            </button>
                        </div>

                        {/* Quick Category Pills */}
                        <div className="flex flex-wrap gap-2 justify-center pt-2">
                            <button
                                onClick={() => setCategory('all')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    category === 'all'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-secondary hover:bg-secondary/80'
                                }`}
                            >
                                Alle
                            </button>
                            <button
                                onClick={() => setCategory(LISTING_CATEGORIES.GUITARS)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    category === LISTING_CATEGORIES.GUITARS
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-secondary hover:bg-secondary/80'
                                }`}
                            >
                                Gitarren
                            </button>
                            <button
                                onClick={() => setCategory(LISTING_CATEGORIES.AMPS)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    category === LISTING_CATEGORIES.AMPS
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-secondary hover:bg-secondary/80'
                                }`}
                            >
                                Amps
                            </button>
                            <button
                                onClick={() => setCategory(LISTING_CATEGORIES.EFFECTS)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    category === LISTING_CATEGORIES.EFFECTS
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-secondary hover:bg-secondary/80'
                                }`}
                            >
                                Effekte
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Sections */}
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="space-y-12 md:space-y-16">
                {/* Suggested Users Section (only on "Alle" tab) */}
                {category === 'all' && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl md:text-3xl font-bold">Empfohlene Nutzer</h2>
                        </div>
                        {loadingUsers ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : suggestedUsers.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {suggestedUsers.map((user) => (
                                    <UserSuggestionCard
                                        key={user.id}
                                        user={user}
                                        onFollowChange={() => {
                                            // Optionally refresh suggestions after follow
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    Keine Nutzer-Vorschläge verfügbar
                                </CardContent>
                            </Card>
                        )}
                    </section>
                )}

                {/* Trending Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl md:text-3xl font-bold">Trending</h2>
                    </div>
                    {loadingTrending ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : trendingListings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {trendingListings.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    viewMode="grid"
                                    showSeller={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                Keine Trending-Anzeigen verfügbar
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Recent Listings Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Clock className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl md:text-3xl font-bold">Neueste Anzeigen</h2>
                    </div>
                    {loadingRecent ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : recentListings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {recentListings.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    viewMode="grid"
                                    showSeller={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                Keine Anzeigen verfügbar
                            </CardContent>
                        </Card>
                    )}
                </section>
                </div>
            </div>
        </div>
    );
}
