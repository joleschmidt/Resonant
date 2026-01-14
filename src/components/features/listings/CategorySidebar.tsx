/**
 * Category Sidebar Component
 * Thomann-style category navigation
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
    PARENT_CATEGORIES,
    INSTRUMENT_CATEGORIES,
    AMPLIFIER_CATEGORIES,
    EFFECTS_ACCESSORIES_CATEGORIES,
    THOMANN_CATEGORY_TREE,
    getCategoryName,
    getSubcategories,
    getCategoriesByParent,
    type ParentCategory,
} from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategorySidebarProps {
    currentCategory?: string;
    currentSubcategory?: string;
    className?: string;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
    currentCategory,
    currentSubcategory,
    className = '',
}) => {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(currentCategory ? [currentCategory] : [])
    );

    const toggleCategory = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const renderParentSection = (parentId: ParentCategory, title: string) => {
        const categories = getCategoriesByParent(parentId);

        return (
            <div key={parentId} className="mb-6">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 px-3">
                    {title}
                </h3>
                <div className="space-y-1">
                    {categories.map((cat) => {
                        const isExpanded = expandedCategories.has(cat.id);
                        const isCurrent = currentCategory === cat.id;
                        const subcategories = getSubcategories(cat.id);
                        const hasSubcategories = subcategories.length > 0;

                        return (
                            <div key={cat.id}>
                                {/* Main Category */}
                                <div
                                    className={cn(
                                        'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                                        isCurrent
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'hover:bg-muted text-foreground'
                                    )}
                                >
                                    {hasSubcategories && (
                                        <button
                                            onClick={() => toggleCategory(cat.id)}
                                            className="p-0 h-4 w-4 flex items-center justify-center hover:bg-primary/20 rounded transition-colors"
                                            aria-label={isExpanded ? 'Einklappen' : 'Ausklappen'}
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="h-3 w-3" />
                                            ) : (
                                                <ChevronRight className="h-3 w-3" />
                                            )}
                                        </button>
                                    )}
                                    {!hasSubcategories && <div className="w-4" />}
                                    <Link
                                        href={`/listings?category=${cat.id}`}
                                        className="flex-1"
                                    >
                                        {cat.nameDE}
                                    </Link>
                                </div>

                                {/* Subcategories */}
                                {hasSubcategories && isExpanded && (
                                    <div className="ml-6 mt-1 space-y-1">
                                        {subcategories.map((subcat) => {
                                            const isSubcatCurrent = currentSubcategory === subcat;
                                            return (
                                                <Link
                                                    key={subcat}
                                                    href={`/listings?category=${cat.id}&subcategory=${subcat}`}
                                                    className={cn(
                                                        'block px-3 py-1.5 rounded-md text-sm transition-colors',
                                                        isSubcatCurrent
                                                            ? 'bg-primary/10 text-primary font-medium'
                                                            : 'hover:bg-muted text-muted-foreground'
                                                    )}
                                                >
                                                    {formatSubcategoryName(subcat)}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <aside className={cn('w-64 flex-shrink-0', className)}>
            <div className="sticky top-4">
                <div className="bg-card rounded-lg border p-4 shadow-sm">
                    <h2 className="font-bold text-lg mb-4">Kategorien</h2>

                    {/* All Categories Link */}
                    <Link
                        href="/listings"
                        className={cn(
                            'block px-3 py-2 rounded-md text-sm mb-4 transition-colors',
                            !currentCategory
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'hover:bg-muted text-foreground'
                        )}
                    >
                        Alle Anzeigen
                    </Link>

                    {/* Instruments */}
                    {renderParentSection(PARENT_CATEGORIES.INSTRUMENTS, 'Instrumente')}

                    {/* Amplifiers */}
                    {renderParentSection(PARENT_CATEGORIES.AMPLIFIERS, 'Verstärker')}

                    {/* Effects & Accessories */}
                    {renderParentSection(
                        PARENT_CATEGORIES.EFFECTS_ACCESSORIES,
                        'Effekte & Zubehör'
                    )}
                </div>
            </div>
        </aside>
    );
};

CategorySidebar.displayName = 'CategorySidebar';

export default CategorySidebar;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatSubcategoryName(subcategoryId: string): string {
    // Convert snake_case to Title Case with proper German formatting
    const formatted = subcategoryId
        .split('_')
        .map((word) => {
            // Special cases for German terms
            const specialCases: Record<string, string> = {
                e: 'E',
                st: 'ST',
                t: 'T',
                eq: 'EQ',
                midi: 'MIDI',
                wah: 'Wah',
                bass: 'Bass',
                saiter: 'Saiter',
                zwoelf: '12',
                sieben: '7',
                acht: '8',
                vier: '4',
                fuenf: '5',
                sechs: '6',
            };

            if (specialCases[word]) {
                return specialCases[word];
            }

            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');

    return formatted
        .replace(/Linkshaender/g, 'Linkshänder')
        .replace(/Verstaerker/g, 'Verstärker')
        .replace(/Baesse/g, 'Bässe')
        .replace(/Bruecken/g, 'Brücken')
        .replace(/Saetteln/g, 'Sätteln')
        .replace(/Daempfer/g, 'Dämpfer');
}

