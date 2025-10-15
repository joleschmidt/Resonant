/**
 * Listings Browse Page
 * Displays all listings with filters, search, and pagination
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Search,
    Filter,
    Grid3X3,
    List,
    SlidersHorizontal,
    Loader2
} from 'lucide-react';
import { ListingCard } from '@/components/features/listings/ListingCard';
import { useListingsStore, applyClientFilters } from '@/stores/listingsStore';
import { LISTING_CATEGORIES, CONDITIONS, GUITAR_TYPES, AMP_TYPES, EFFECT_TYPES } from '@/utils/constants';
import type { ListingWithDetails } from '@/types/listings';

interface ListingsResponse {
    data: ListingWithDetails[];
    pagination: {
        page: number;
        limit: number;
        total_pages: number;
        total_count: number;
        has_next: boolean;
        has_previous: boolean;
    };
}

export default function ListingsPage() {
    const searchParams = useSearchParams();
    const { allListings, isLoading, error, fetchOnce } = useListingsStore();
    const [listings, setListings] = useState<ListingWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<ListingsResponse['pagination'] | null>(null);

    // Filters state
    const [filters, setFilters] = useState<{
        category?: string;
        search?: string;
        price_min?: number;
        price_max?: number;
        condition?: string[];
        location_city?: string;
    }>({
        category: searchParams.get('category') as any || undefined,
        search: searchParams.get('search') || undefined,
        price_min: searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : undefined,
        price_max: searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : undefined,
        condition: searchParams.get('condition')?.split(',').filter(Boolean) || undefined,
        location_city: searchParams.get('location_city') || undefined,
    });

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [showMobileControls, setShowMobileControls] = useState(false);

    // Fetch listings
    const fetchListings = useCallback(async () => {
        setLoading(true);
        await fetchOnce();
        setLoading(false);
    }, [fetchOnce]);

    // Handle search (no auto-fetch; fetch on Enter or apply)
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setFilters((prev: any) => ({ ...prev, search: query || undefined }));
    };

    // Handle filter changes
    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
    };

    // Apply filters
    const applyFilters = () => {
        const filtered = applyClientFilters(allListings, filters);
        setListings(filtered);
        // simple client-side pagination placeholder
        setPagination({ page: 1, limit: 20, total_pages: 1, total_count: filtered.length, has_next: false, has_previous: false });
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({});
        setSearchQuery('');
        setListings(allListings);
        setPagination({ page: 1, limit: 20, total_pages: 1, total_count: allListings.length, has_next: false, has_previous: false });
    };

    // Load listings on mount and when filters change
    useEffect(() => {
        fetchListings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Recompute when store data available or filters change after explicit apply
    useEffect(() => {
        if (allListings.length && listings.length === 0) {
            // initial view before any apply → show unfiltered
            setListings(allListings);
            setPagination({ page: 1, limit: 20, total_pages: 1, total_count: allListings.length, has_next: false, has_previous: false });
        }
    }, [allListings]);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Category Selection */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <Tabs value={filters.category || 'all'} onValueChange={(value) => {
                        const next = value === 'all' ? undefined : value;
                        handleFilterChange('category', next);
                        // Apply client-side filter instantly
                        const nextFilters = { ...filters, category: next } as any;
                        const filtered = applyClientFilters(allListings, nextFilters);
                        setListings(filtered);
                        setPagination({ page: 1, limit: 20, total_pages: 1, total_count: filtered.length, has_next: false, has_previous: false });
                    }}>
                        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                            <TabsTrigger value="all">Alle</TabsTrigger>
                            <TabsTrigger value={LISTING_CATEGORIES.GUITARS}>Gitarren</TabsTrigger>
                            <TabsTrigger value={LISTING_CATEGORIES.AMPS}>Amps</TabsTrigger>
                            <TabsTrigger value={LISTING_CATEGORIES.EFFECTS}>Effekte</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="flex items-center gap-2">
                        {/* Desktop Filter toggle aligned with tabs */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters((v) => !v)}
                            className="hidden lg:flex text-muted-foreground hover:text-foreground"
                            aria-expanded={showFilters}
                            aria-controls="desktop-filters"
                        >
                            <SlidersHorizontal className="h-4 w-4 mr-1" />
                            Filter
                        </Button>
                        {/* Mobile combined controls toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowMobileControls((v) => !v)}
                            aria-expanded={showMobileControls}
                            aria-controls="mobile-controls"
                            className="lg:hidden ml-2"
                            aria-label="Suche und Filter umschalten"
                        >
                            <SlidersHorizontal className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Toggle for Search & Filters moved into category header */}

            {/* Compact Search and Controls */}
            <div className="mb-4" id="mobile-controls">
                <div className={`${showMobileControls ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-3 lg:items-center`}>
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Suche nach Marke, Modell, Typ..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') applyFilters();
                                    }}
                                    className="pl-10 h-9 text-sm"
                                />
                            </div>
                            <Button size="sm" onClick={applyFilters} aria-label="Suche ausführen">
                                Suchen
                            </Button>
                        </div>
                    </div>

                    {/* Filter Toggle (mobile inline button removed; use global mobile toggle) */}
                    <div className="hidden" />

                    {/* View Mode Toggle */}
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters Panel (mobile only, stays at top) */}
            {showMobileControls && (
                <Card className="mb-6 lg:hidden">
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Price Range */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Preis</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.price_min || ''}
                                        onChange={(e) => handleFilterChange('price_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.price_max || ''}
                                        onChange={(e) => handleFilterChange('price_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                </div>
                            </div>

                            {/* Condition */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Zustand</label>
                                <div className="flex flex-wrap gap-1">
                                    {Object.values(CONDITIONS).map((condition) => (
                                        <Badge
                                            key={condition}
                                            variant={filters.condition?.includes(condition) ? 'default' : 'outline'}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                const currentConditions = filters.condition || [];
                                                const newConditions = currentConditions.includes(condition)
                                                    ? currentConditions.filter((c: string) => c !== condition)
                                                    : [...currentConditions, condition];
                                                handleFilterChange('condition', newConditions.length > 0 ? newConditions : undefined);
                                            }}
                                        >
                                            {getConditionLabel(condition)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Ort</label>
                                <Input
                                    placeholder="Stadt"
                                    value={filters.location_city || ''}
                                    onChange={(e) => handleFilterChange('location_city', e.target.value || undefined)}
                                />
                            </div>
                        </div>

                        {/* Filter Actions */}
                        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                            <Button onClick={applyFilters}>Filter anwenden</Button>
                            <Button variant="outline" onClick={clearFilters}>Filter zurücksetzen</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Desktop Filters Panel directly under categories */}
            {showFilters && (
                <Card id="desktop-filters" className="mb-6 hidden lg:block">
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Price Range */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Preis</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.price_min || ''}
                                        onChange={(e) => handleFilterChange('price_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.price_max || ''}
                                        onChange={(e) => handleFilterChange('price_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                </div>
                            </div>

                            {/* Condition */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Zustand</label>
                                <div className="flex flex-wrap gap-1">
                                    {Object.values(CONDITIONS).map((condition) => (
                                        <Badge
                                            key={condition}
                                            variant={filters.condition?.includes(condition) ? 'default' : 'outline'}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                const currentConditions = filters.condition || [];
                                                const newConditions = currentConditions.includes(condition)
                                                    ? currentConditions.filter((c: string) => c !== condition)
                                                    : [...currentConditions, condition];
                                                handleFilterChange('condition', newConditions.length > 0 ? newConditions : undefined);
                                            }}
                                        >
                                            {getConditionLabel(condition)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Ort</label>
                                <Input
                                    placeholder="Stadt"
                                    value={filters.location_city || ''}
                                    onChange={(e) => handleFilterChange('location_city', e.target.value || undefined)}
                                />
                            </div>
                        </div>

                        {/* Filter Actions */}
                        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                            <Button onClick={applyFilters}>Filter anwenden</Button>
                            <Button variant="outline" onClick={clearFilters}>Filter zurücksetzen</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Lade Anzeigen...</span>
                </div>
            ) : error ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-destructive">{error}</p>
                        <Button onClick={() => fetchListings()} className="mt-4">
                            Erneut versuchen
                        </Button>
                    </CardContent>
                </Card>
            ) : listings.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">Keine Anzeigen gefunden</p>
                        <Button variant="outline" onClick={clearFilters} className="mt-4">
                            Filter zurücksetzen
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Results Header (counts + view toggle only) */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-muted-foreground">
                            {pagination?.total_count} Anzeigen gefunden
                        </p>
                        <div className="flex items-center gap-2" />
                    </div>

                    {/* Listings Grid */}
                    <div className={`
            ${viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                            : 'space-y-4'
                        }
          `}>
                        {listings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                viewMode={viewMode}
                                showSeller={true}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <Button
                                variant="outline"
                                onClick={() => { /* TODO: client pagination */ }}
                                disabled
                            >
                                Zurück
                            </Button>

                            <span className="text-sm text-muted-foreground">
                                Seite {pagination.page} von {pagination.total_pages}
                            </span>

                            <Button
                                variant="outline"
                                onClick={() => { /* TODO: client pagination */ }}
                                disabled
                            >
                                Weiter
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Helper function
function getConditionLabel(condition: string): string {
    const labels: Record<string, string> = {
        mint: 'Neuwertig',
        excellent: 'Sehr gut',
        very_good: 'Gut',
        good: 'Befriedigend',
        fair: 'Ausreichend',
        poor: 'Mangelhaft',
        for_parts: 'Ersatzteile'
    };
    return labels[condition] || condition;
}
