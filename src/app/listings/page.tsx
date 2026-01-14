/**
 * Listings Browse Page
 * Displays all listings with filters, search, and pagination
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Grid3X3,
    List,
    Loader2,
    SlidersHorizontal
} from 'lucide-react';
import { ListingCard } from '@/components/features/listings/ListingCard';
import CategorySidebar from '@/components/features/listings/CategorySidebar';
import FilterSidebar from '@/components/features/listings/FilterSidebar';
import { applyClientFilters } from '@/stores/listingsStore';
import { LISTING_CATEGORIES, CONDITIONS, GUITAR_TYPES, AMP_TYPES, EFFECT_TYPES, PARENT_CATEGORIES, getCategoriesByParent, THOMANN_CATEGORY_TREE, type ParentCategory } from '@/utils/constants';
import type { ListingWithDetails } from '@/types/listings';
import { useListings } from '@/hooks/listings/useListings';
import Link from 'next/link';

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
    const router = useRouter();
    const parentCategory = searchParams.get('parent_category');

    // Get categories for parent category if specified
    const parentCategoryIds = parentCategory
        ? getCategoriesByParent(parentCategory).map(cat => cat.id)
        : [];

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
    const [appliedFilters, setAppliedFilters] = useState(filters);
    const [showParentCategory, setShowParentCategory] = useState<ParentCategory | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Ensure client-only rendering to prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Use React Query to fetch listings
    const { data: listingsData, isLoading, error } = useListings({
        page: 1,
        limit: 500, // Large limit for client-side filtering
        ...appliedFilters,
    });

    const allListings = listingsData?.data || [];
    const pagination = listingsData?.pagination || null;

    // Apply client-side filters
    let filteredListings = applyClientFilters(allListings, appliedFilters);

    // Filter by parent category if specified
    if (parentCategory && parentCategoryIds.length > 0) {
        filteredListings = filteredListings.filter(listing =>
            parentCategoryIds.includes(listing.category)
        );
    }


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
        setAppliedFilters(emptyFilters);
    };

    const [showMobileFilters, setShowMobileFilters] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Main Content Area - Thomann/Kleinanzeigen Style Layout */}
            <div className="w-full py-8">
                <div className="flex gap-6 lg:gap-8 relative">
                    {/* Left Sidebar - Categories */}
                    <aside className="hidden lg:block w-64 flex-shrink-0 pl-4">
                        <CategorySidebar
                            currentCategory={filters.category}
                            currentSubcategory={searchParams.get('subcategory') || undefined}
                        />
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 px-4 lg:px-0">
                        {/* Mobile Category Selector - Two Level Navigation */}
                        {isMounted && (
                            <div className="lg:hidden mb-6 -mx-4 px-4">
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {!showParentCategory ? (
                                        // Show parent categories
                                        <>
                                            <Link
                                                href="/listings"
                                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${!filters.category && !parentCategory
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'bg-secondary hover:bg-secondary/80 text-foreground'
                                                    }`}
                                            >
                                                Alle
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setShowParentCategory(PARENT_CATEGORIES.INSTRUMENTS);
                                                }}
                                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${parentCategory === PARENT_CATEGORIES.INSTRUMENTS
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'bg-secondary hover:bg-secondary/80 text-foreground'
                                                    }`}
                                            >
                                                Instrumente
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setShowParentCategory(PARENT_CATEGORIES.AMPLIFIERS);
                                                }}
                                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${parentCategory === PARENT_CATEGORIES.AMPLIFIERS
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'bg-secondary hover:bg-secondary/80 text-foreground'
                                                    }`}
                                            >
                                                Verstärker
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setShowParentCategory(PARENT_CATEGORIES.EFFECTS_ACCESSORIES);
                                                }}
                                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${parentCategory === PARENT_CATEGORIES.EFFECTS_ACCESSORIES
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'bg-secondary hover:bg-secondary/80 text-foreground'
                                                    }`}
                                            >
                                                Effekte & Zubehör
                                            </button>
                                        </>
                                    ) : (
                                        // Show child categories with back button
                                        <>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setShowParentCategory(null);
                                                }}
                                                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap bg-secondary hover:bg-secondary/80 text-foreground flex items-center gap-1"
                                            >
                                                ← Zurück
                                            </button>
                                            {getCategoriesByParent(showParentCategory).map((category) => (
                                                <Link
                                                    key={category.id}
                                                    href={`/listings?category=${category.id}`}
                                                    onClick={() => setShowParentCategory(null)}
                                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filters.category === category.id
                                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                                        : 'bg-secondary hover:bg-secondary/80 text-foreground'
                                                        }`}
                                                >
                                                    {category.nameDE}
                                                </Link>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
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
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {filteredListings.length} {filteredListings.length === 1 ? 'Anzeige' : 'Anzeigen'} gefunden
                                        </p>
                                        {/* Mobile Filter Button */}
                                        <Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="lg:hidden gap-2"
                                                >
                                                    <SlidersHorizontal className="h-4 w-4" />
                                                    Filter
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                                                <DialogHeader className="flex flex-row items-center justify-between">
                                                    <DialogTitle>Filter</DialogTitle>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={clearFilters}
                                                        className="h-8 text-xs"
                                                    >
                                                        Zurücksetzen
                                                    </Button>
                                                </DialogHeader>
                                                <div className="mt-4">
                                                    <FilterSidebar
                                                        currentCategory={filters.category}
                                                        onFilterChange={(filterState) => {
                                                            const updatedFilters = {
                                                                ...filters,
                                                                price_min: filterState.priceMin > 0 ? filterState.priceMin : undefined,
                                                                price_max: filterState.priceMax < 10000 ? filterState.priceMax : undefined,
                                                                location_city: filterState.location || undefined,
                                                                condition: filterState.condition.length > 0 ? filterState.condition : undefined,
                                                            };
                                                            setFilters(updatedFilters);
                                                            setAppliedFilters(updatedFilters);
                                                        }}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    {/* View Mode Toggle */}
                                    <div className="flex gap-1 border rounded-lg p-1">
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
                                </div>

                                {/* Listings Grid */}
                                <div className={`
                            ${viewMode === 'grid'
                                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
                                        : 'space-y-4 sm:space-y-6'
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

                    {/* Right Sidebar - Filters (Always visible, responsive) */}
                    <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0 pr-4">
                        <FilterSidebar
                            currentCategory={filters.category}
                            onFilterChange={(filterState) => {
                                // Sync FilterSidebar state with page filters
                                const updatedFilters = {
                                    ...filters,
                                    price_min: filterState.priceMin > 0 ? filterState.priceMin : undefined,
                                    price_max: filterState.priceMax < 10000 ? filterState.priceMax : undefined,
                                    location_city: filterState.location || undefined,
                                    condition: filterState.condition.length > 0 ? filterState.condition : undefined,
                                };
                                setFilters(updatedFilters);
                                setAppliedFilters(updatedFilters);
                            }}
                        />
                    </aside>
                </div>
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
