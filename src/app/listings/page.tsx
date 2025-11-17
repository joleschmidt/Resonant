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
import { applyClientFilters } from '@/stores/listingsStore';
import { LISTING_CATEGORIES, CONDITIONS, GUITAR_TYPES, AMP_TYPES, EFFECT_TYPES } from '@/utils/constants';
import type { ListingWithDetails } from '@/types/listings';
import { useListings } from '@/hooks/listings/useListings';

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
    const [appliedFilters, setAppliedFilters] = useState(filters);

    // Use React Query to fetch listings
    const { data: listingsData, isLoading, error } = useListings({
        page: 1,
        limit: 500, // Large limit for client-side filtering
        ...appliedFilters,
    });

    const allListings = listingsData?.data || [];
    const pagination = listingsData?.pagination || null;

    // Apply client-side filters
    const filteredListings = applyClientFilters(allListings, appliedFilters);

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
        setAppliedFilters(filters);
    };

    // Clear filters
    const clearFilters = () => {
        const emptyFilters = {};
        setFilters(emptyFilters);
        setSearchQuery('');
        setAppliedFilters(emptyFilters);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Search Header */}
            <div className="border-b bg-card/50 backdrop-blur-sm sticky top-16 z-40">
                <div className="container mx-auto px-4 py-4">
                    {/* Category Selection */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex-1 max-w-2xl">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => {
                                        handleFilterChange('category', undefined);
                                        setAppliedFilters({ ...filters, category: undefined } as any);
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!filters.category
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-secondary hover:bg-secondary/80'
                                        }`}
                                >
                                    Alle
                                </button>
                                <button
                                    onClick={() => {
                                        handleFilterChange('category', LISTING_CATEGORIES.GUITARS);
                                        setAppliedFilters({ ...filters, category: LISTING_CATEGORIES.GUITARS } as any);
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.category === LISTING_CATEGORIES.GUITARS
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-secondary hover:bg-secondary/80'
                                        }`}
                                >
                                    Gitarren
                                </button>
                                <button
                                    onClick={() => {
                                        handleFilterChange('category', LISTING_CATEGORIES.AMPS);
                                        setAppliedFilters({ ...filters, category: LISTING_CATEGORIES.AMPS } as any);
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.category === LISTING_CATEGORIES.AMPS
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-secondary hover:bg-secondary/80'
                                        }`}
                                >
                                    Amps
                                </button>
                                <button
                                    onClick={() => {
                                        handleFilterChange('category', LISTING_CATEGORIES.EFFECTS);
                                        setAppliedFilters({ ...filters, category: LISTING_CATEGORIES.EFFECTS } as any);
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.category === LISTING_CATEGORIES.EFFECTS
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-secondary hover:bg-secondary/80'
                                        }`}
                                >
                                    Effekte
                                </button>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowMobileControls((v) => !v)}
                            aria-expanded={showMobileControls}
                            aria-controls="mobile-controls"
                            className="lg:hidden"
                            aria-label="Suche und Filter umschalten"
                        >
                            <SlidersHorizontal className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Mobile Toggle for Search & Filters moved into category header */}

                    {/* Search and Controls */}
                    <div className={`${showMobileControls ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-3 lg:items-center`}>
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Suche nach Marke, Modell, Typ..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') applyFilters();
                                    }}
                                    className="pl-11 h-11 rounded-full border-2 focus-visible:border-primary"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="gap-2"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filter
                            </Button>

                            {/* View Mode Toggle */}
                            <div className="hidden lg:flex gap-1 border rounded-lg p-1">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>

                            <Button size="sm" onClick={applyFilters} className="hidden lg:flex">
                                Suchen
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 py-6">
                {/* Filters Panel */}
                {showFilters && (
                    <Card className="mb-6 border-border/50">
                        <CardContent className="p-6">
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
                            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                                <Button onClick={applyFilters} size="sm">Filter anwenden</Button>
                                <Button variant="outline" size="sm" onClick={clearFilters}>Zurücksetzen</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Results */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-3 text-muted-foreground">Lade Anzeigen...</span>
                    </div>
                ) : error ? (
                    <Card className="border-destructive/50">
                        <CardContent className="p-12 text-center">
                            <p className="text-destructive mb-4">{error instanceof Error ? error.message : 'Fehler beim Laden der Anzeigen'}</p>
                            <Button onClick={() => window.location.reload()} size="sm">
                                Erneut versuchen
                            </Button>
                        </CardContent>
                    </Card>
                ) : filteredListings.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-lg text-muted-foreground mb-4">Keine Anzeigen gefunden</p>
                            <p className="text-sm text-muted-foreground mb-6">Versuche es mit anderen Suchkriterien</p>
                            <Button variant="outline" onClick={clearFilters} size="sm">
                                Filter zurücksetzen
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm font-medium text-muted-foreground">
                                {filteredListings.length} {filteredListings.length === 1 ? 'Anzeige' : 'Anzeigen'} gefunden
                            </p>
                        </div>

                        {/* Listings Grid */}
                        <div className={`
                            ${viewMode === 'grid'
                                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                                : 'space-y-4'
                            }
                        `}>
                            {filteredListings.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    viewMode={viewMode}
                                    showSeller={true}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {filteredListings.length > 20 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <span className="text-sm text-muted-foreground">
                                    {filteredListings.length} Anzeigen angezeigt
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
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
