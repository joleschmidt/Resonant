/**
 * Filter Sidebar Component
 * Thomann-style filters for listings
 */

'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, SlidersHorizontal } from 'lucide-react';
import { CONDITIONS, GUITAR_BRANDS, AMP_BRANDS, EFFECT_BRANDS } from '@/utils/constants';
import { cn } from '@/lib/utils';

interface FilterState {
    priceMin: number;
    priceMax: number;
    location: string;
    radius: number;
    condition: string[];
    brands: string[];
    shippingAvailable: boolean;
    sortBy: 'newest' | 'price_asc' | 'price_desc' | 'distance';
}

interface FilterSidebarProps {
    onFilterChange: (filters: FilterState) => void;
    currentCategory?: string;
    className?: string;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
    onFilterChange,
    currentCategory,
    className = '',
}) => {
    const [filters, setFilters] = useState<FilterState>({
        priceMin: 0,
        priceMax: 10000,
        location: '',
        radius: 50,
        condition: [],
        brands: [],
        shippingAvailable: false,
        sortBy: 'newest',
    });

    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(['price', 'condition', 'sort'])
    );

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const updateFilters = (updates: Partial<FilterState>) => {
        const newFilters = { ...filters, ...updates };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const toggleCondition = (condition: string) => {
        const newConditions = filters.condition.includes(condition)
            ? filters.condition.filter((c) => c !== condition)
            : [...filters.condition, condition];
        updateFilters({ condition: newConditions });
    };

    const toggleBrand = (brand: string) => {
        const newBrands = filters.brands.includes(brand)
            ? filters.brands.filter((b) => b !== brand)
            : [...filters.brands, brand];
        updateFilters({ brands: newBrands });
    };

    const clearAllFilters = () => {
        const defaultFilters: FilterState = {
            priceMin: 0,
            priceMax: 10000,
            location: '',
            radius: 50,
            condition: [],
            brands: [],
            shippingAvailable: false,
            sortBy: 'newest',
        };
        setFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    const hasActiveFilters =
        filters.priceMin > 0 ||
        filters.priceMax < 10000 ||
        filters.location !== '' ||
        filters.condition.length > 0 ||
        filters.brands.length > 0 ||
        filters.shippingAvailable;

    // Get relevant brands based on category
    const getBrandsForCategory = (): string[] => {
        if (currentCategory?.includes('gitarr')) {
            return [...GUITAR_BRANDS.TIER_1, ...GUITAR_BRANDS.TIER_2, ...GUITAR_BRANDS.TIER_3];
        }
        if (currentCategory?.includes('verstaerker') || currentCategory?.includes('amp')) {
            return [...AMP_BRANDS.TIER_1, ...AMP_BRANDS.TIER_2, ...AMP_BRANDS.TIER_3];
        }
        if (currentCategory?.includes('effekte')) {
            return [...EFFECT_BRANDS.TIER_1, ...EFFECT_BRANDS.TIER_2, ...EFFECT_BRANDS.TIER_3];
        }
        return [];
    };

    const relevantBrands = getBrandsForCategory();

    const isInDialog = className.includes('w-full');

    return (
        <aside className={cn('w-full lg:w-64 flex-shrink-0', className)}>
            <div className={cn(isInDialog ? '' : 'sticky top-4')}>
                <div className={cn('bg-card rounded-lg border p-4', isInDialog ? '' : 'shadow-sm')}>
                    {/* Header - hide in dialog since DialogTitle is shown */}
                    {!isInDialog && (
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                <h2 className="font-bold text-lg">Filter</h2>
                            </div>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="h-8 text-xs"
                                >
                                    Zurücksetzen
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Sort */}
                    <div className="mb-6">
                        <Label className="text-sm font-semibold mb-2 block">Sortierung</Label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) =>
                                updateFilters({ sortBy: e.target.value as FilterState['sortBy'] })
                            }
                            className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                        >
                            <option value="newest">Neueste zuerst</option>
                            <option value="price_asc">Preis aufsteigend</option>
                            <option value="price_desc">Preis absteigend</option>
                            <option value="distance">Entfernung</option>
                        </select>
                    </div>

                    <Separator className="my-4" />

                    {/* Price Range */}
                    <div className="mb-6">
                        <Label className="text-sm font-semibold mb-3 block">
                            Preis (€{filters.priceMin} - €{filters.priceMax})
                        </Label>
                        <Slider
                            min={0}
                            max={10000}
                            step={50}
                            value={[filters.priceMin, filters.priceMax]}
                            onValueChange={([min, max]) =>
                                updateFilters({ priceMin: min, priceMax: max })
                            }
                            className="mb-3"
                        />
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={filters.priceMin}
                                onChange={(e) =>
                                    updateFilters({ priceMin: parseInt(e.target.value) || 0 })
                                }
                                className="w-full text-sm"
                                placeholder="Min"
                            />
                            <Input
                                type="number"
                                value={filters.priceMax}
                                onChange={(e) =>
                                    updateFilters({ priceMax: parseInt(e.target.value) || 10000 })
                                }
                                className="w-full text-sm"
                                placeholder="Max"
                            />
                        </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Location */}
                    <div className="mb-6">
                        <Label className="text-sm font-semibold mb-2 block">Standort (PLZ)</Label>
                        <Input
                            type="text"
                            value={filters.location}
                            onChange={(e) => updateFilters({ location: e.target.value })}
                            placeholder="z.B. 10115"
                            className="mb-3"
                        />
                        <Label className="text-sm mb-2 block">
                            Umkreis ({filters.radius} km)
                        </Label>
                        <Slider
                            min={0}
                            max={500}
                            step={10}
                            value={[filters.radius]}
                            onValueChange={([radius]) => updateFilters({ radius })}
                        />
                    </div>

                    <Separator className="my-4" />

                    {/* Condition */}
                    <div className="mb-6">
                        <Label className="text-sm font-semibold mb-2 block">Zustand</Label>
                        <div className="space-y-2">
                            {Object.entries(CONDITIONS).map(([key, value]) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.condition.includes(value)}
                                        onChange={() => toggleCondition(value)}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">{getConditionLabel(value)}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Brands (if relevant for category) */}
                    {relevantBrands.length > 0 && (
                        <>
                            <Separator className="my-4" />
                            <div className="mb-6">
                                <Label className="text-sm font-semibold mb-2 block">Marke</Label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {relevantBrands.slice(0, 10).map((brand) => (
                                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.brands.includes(brand)}
                                                onChange={() => toggleBrand(brand)}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm">{brand}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <Separator className="my-4" />

                    {/* Shipping */}
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.shippingAvailable}
                                onChange={(e) => updateFilters({ shippingAvailable: e.target.checked })}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm font-medium">Nur Versand möglich</span>
                        </label>
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <>
                            <Separator className="my-4" />
                            <div>
                                <Label className="text-sm font-semibold mb-2 block">
                                    Aktive Filter
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {filters.condition.map((cond) => (
                                        <Badge
                                            key={cond}
                                            variant="secondary"
                                            className="text-xs gap-1"
                                        >
                                            {getConditionLabel(cond)}
                                            <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={() => toggleCondition(cond)}
                                            />
                                        </Badge>
                                    ))}
                                    {filters.brands.map((brand) => (
                                        <Badge
                                            key={brand}
                                            variant="secondary"
                                            className="text-xs gap-1"
                                        >
                                            {brand}
                                            <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={() => toggleBrand(brand)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
};

FilterSidebar.displayName = 'FilterSidebar';

export default FilterSidebar;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getConditionLabel(condition: string): string {
    const labels: Record<string, string> = {
        mint: 'Neuwertig',
        excellent: 'Sehr gut',
        very_good: 'Gut',
        good: 'Befriedigend',
        fair: 'Ausreichend',
        poor: 'Mangelhaft',
        for_parts: 'Ersatzteile',
    };
    return labels[condition] || condition;
}

