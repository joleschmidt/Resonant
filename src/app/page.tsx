/**
 * Home Feed Page
 * Displays mixed content feed with recent listings and trending items
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ListingCard } from '@/components/features/listings/ListingCard';
import { LISTING_CATEGORIES } from '@/utils/constants';
import { Loader2, Sparkles, Clock } from 'lucide-react';
import { useListings } from '@/hooks/listings/useListings';
import { useTrendingListings } from '@/hooks/listings/useTrendingListings';
import {
    INSTRUMENT_CATEGORIES,
    AMPLIFIER_CATEGORIES,
    EFFECTS_ACCESSORIES_CATEGORIES,
    getCategoryName,
} from '@/utils/thomann-categories';
import { cn } from '@/lib/utils';

export default function HomeFeed() {
    const [category, setCategory] = useState<string>('all');

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

    const recentListings = recentData?.data || [];
    const trendingListings = trendingData?.data || [];

    // Main categories to display in the navigation
    const mainCategories = [
        // Instruments
        INSTRUMENT_CATEGORIES.E_GITARREN,
        INSTRUMENT_CATEGORIES.KONZERTGITARREN,
        INSTRUMENT_CATEGORIES.WESTERNGITARREN,
        INSTRUMENT_CATEGORIES.E_BAESSE,
        // Amplifiers
        AMPLIFIER_CATEGORIES.E_GITARREN_VERSTAERKER,
        AMPLIFIER_CATEGORIES.BASSVERSTAERKER,
        // Effects
        EFFECTS_ACCESSORIES_CATEGORIES.GITARREN_BASS_EFFEKTE,
        EFFECTS_ACCESSORIES_CATEGORIES.PICKUPS,
    ];

    return (
        <div className="min-h-screen">
            {/* Category Navigation Section */}
            <div className="border-b bg-background sticky top-0 z-40">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
                        <Link
                            href="/listings"
                            className={cn(
                                'px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
                                category === 'all'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                            onClick={() => setCategory('all')}
                        >
                            Alle
                        </Link>
                        {mainCategories.map((catId) => {
                            const isActive = category === catId;
                            return (
                                <Link
                                    key={catId}
                                    href={`/listings?category=${catId}`}
                                    className={cn(
                                        'px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    )}
                                    onClick={() => setCategory(catId)}
                                >
                                    {getCategoryName(catId)}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="space-y-12 md:space-y-16">
                {/* Recommended Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl md:text-3xl font-bold">Für dich empfohlen</h2>
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
                                Keine Empfehlungen verfügbar
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
