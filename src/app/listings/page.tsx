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
import { LISTING_CATEGORIES, CONDITIONS, GUITAR_TYPES, AMP_TYPES, EFFECT_TYPES } from '@/utils/constants';
import type { ListingWithDetails, ListingFiltersData } from '@/types/listings';

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
    const [listings, setListings] = useState<ListingWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<ListingsResponse['pagination'] | null>(null);

    // Filters state
    const [filters, setFilters] = useState<ListingFiltersData>({
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

    // Fetch listings
    const fetchListings = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();

            // Add filters to params
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (Array.isArray(value)) {
                        params.append(key, value.join(','));
                    } else {
                        params.append(key, value.toString());
                    }
                }
            });

            params.append('page', page.toString());
            params.append('limit', '20');

            const response = await fetch(`/api/listings?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch listings');
            }

            const data: ListingsResponse = await response.json();
            setListings(data.data);
            setPagination(data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Handle search
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setFilters(prev => ({ ...prev, search: query || undefined }));
    };

    // Handle filter changes
    const handleFilterChange = (key: keyof ListingFiltersData, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Apply filters
    const applyFilters = () => {
        fetchListings(1);
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({});
        setSearchQuery('');
        fetchListings(1);
    };

    // Load listings on mount and when filters change
    useEffect(() => {
        fetchListings(1);
    }, [fetchListings]);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Gitarren, Amps & Effekte</h1>
                <p className="text-muted-foreground">
                    Entdecke {pagination?.total_count || 0} Anzeigen von Musikern für Musiker
                </p>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Suche nach Marke, Modell, Typ..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Filter Toggle */}
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>

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

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Category */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Kategorie</label>
                                    <Tabs value={filters.category || 'all'} onValueChange={(value) =>
                                        handleFilterChange('category', value === 'all' ? undefined : value)
                                    }>
                                        <TabsList className="grid w-full grid-cols-4">
                                            <TabsTrigger value="all">Alle</TabsTrigger>
                                            <TabsTrigger value={LISTING_CATEGORIES.GUITARS}>Gitarren</TabsTrigger>
                                            <TabsTrigger value={LISTING_CATEGORIES.AMPS}>Amps</TabsTrigger>
                                            <TabsTrigger value={LISTING_CATEGORIES.EFFECTS}>Effekte</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>

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
                                                        ? currentConditions.filter(c => c !== condition)
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
                            <div className="flex gap-2 mt-4">
                                <Button onClick={applyFilters}>
                                    Filter anwenden
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Filter zurücksetzen
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

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
                        <Button onClick={() => fetchListings(1)} className="mt-4">
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
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-muted-foreground">
                            {pagination?.total_count} Anzeigen gefunden
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="hidden lg:flex"
                            >
                                <SlidersHorizontal className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                        </div>
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
                                onClick={() => fetchListings(pagination.page - 1)}
                                disabled={!pagination.has_previous}
                            >
                                Zurück
                            </Button>

                            <span className="text-sm text-muted-foreground">
                                Seite {pagination.page} von {pagination.total_pages}
                            </span>

                            <Button
                                variant="outline"
                                onClick={() => fetchListings(pagination.page + 1)}
                                disabled={!pagination.has_next}
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
