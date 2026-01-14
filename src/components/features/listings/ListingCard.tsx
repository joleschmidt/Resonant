/**
 * Listing Card Component
 * Displays listing information in grid/list view
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Heart,
    Eye,
    MapPin,
    Truck,
    User,
    Calendar,
    Euro,
    Star,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
// Removed ImageKit import - using direct Supabase Storage URLs
import type { ListingWithDetails } from '@/types/listings';
import { CONDITIONS, LISTING_CATEGORIES } from '@/utils/constants';
import Link from 'next/link';
import { useUser } from '@/hooks/auth/useUser';

interface ListingCardProps {
    listing: ListingWithDetails;
    viewMode?: 'grid' | 'list';
    showSeller?: boolean;
    className?: string;
}

export function ListingCard({
    listing,
    viewMode = 'grid',
    showSeller = true,
    className = ''
}: ListingCardProps) {
    const { user } = useUser();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
    const images = listing.images || [];
    const hasMultipleImages = images.length > 1;
    const mainImage = images[currentImageIndex] || images[0];
    const conditionLabel = getConditionLabel(listing.condition);
    const categoryLabel = getCategoryLabel(listing.category);
    const priceFormatted = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(listing.price);

    const isGrid = viewMode === 'grid';

    // Check favorite status on mount
    useEffect(() => {
        if (!user) {
            setIsFavorite(false);
            return;
        }

        const checkFavorite = async () => {
            try {
                const res = await fetch(`/api/listings/${listing.id}/favorite`);
                if (res.ok) {
                    const json = await res.json();
                    setIsFavorite(json.is_favorite || false);
                }
            } catch (error) {
                // Silently fail - favorite status is optional
            }
        };

        checkFavorite();
    }, [listing.id, user]);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            // Could redirect to login or show a message
            return;
        }

        if (isTogglingFavorite) return;

        setIsTogglingFavorite(true);
        const prev = isFavorite;
        setIsFavorite(!prev);

        try {
            const res = await fetch(`/api/listings/${listing.id}/favorite`, {
                method: prev ? 'DELETE' : 'POST',
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json?.error || 'Favorite failed');
            setIsFavorite(json.is_favorite ?? !prev);
        } catch (error) {
            // Rollback on error
            setIsFavorite(prev);
            console.error('Failed to toggle favorite:', error);
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    return (
        <Card className={`group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-md transition-colors ${className}`}>
            <Link href={`/listings/${listing.id}`}>
                <CardContent className={isGrid ? 'p-0' : 'p-4'}>
                    <div className={isGrid ? 'flex flex-col' : 'flex space-x-4'}>
                        {/* Image */}
                        <div className={isGrid ? 'relative group/image bg-muted' : 'w-32 h-32 flex-shrink-0 relative bg-muted'}>
                            <div className="relative w-full h-full overflow-hidden">
                                <img
                                    src={mainImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                                    alt={listing.title}
                                    className={`
                                      object-cover bg-muted
                                      ${isGrid ? 'w-full h-56' : 'w-full h-full rounded-lg'}
                                    `}
                                />

                                {/* Image carousel navigation - only show if multiple images */}
                                {hasMultipleImages && (
                                    <>
                                        {/* Previous button */}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                                            onClick={handlePrevImage}
                                            aria-label="Vorheriges Bild"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        {/* Next button */}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                                            onClick={handleNextImage}
                                            aria-label="Nächstes Bild"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>

                                        {/* Image indicator dots */}
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover/image:opacity-100 transition-opacity">
                                            {images.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setCurrentImageIndex(index);
                                                    }}
                                                    className={`h-1.5 rounded-full transition-all ${
                                                        index === currentImageIndex
                                                            ? 'w-6 bg-white'
                                                            : 'w-1.5 bg-white/50 hover:bg-white/75'
                                                    }`}
                                                    aria-label={`Bild ${index + 1}`}
                                                />
                                            ))}
                                        </div>

                                        {/* Image counter */}
                                        <div className="absolute top-2 right-12 opacity-0 group-hover/image:opacity-100 transition-opacity z-10">
                                            <Badge variant="secondary" className="text-xs bg-black/70 text-white border-0">
                                                {currentImageIndex + 1} / {images.length}
                                            </Badge>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Overlay badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                                <Badge
                                    variant={getConditionVariant(listing.condition)}
                                    className="text-xs font-medium shadow-sm bg-background text-foreground"
                                >
                                    {conditionLabel}
                                </Badge>
                            </div>

                            {/* Favorite button */}
                            {user && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8 rounded-full bg-background hover:bg-background shadow-sm ${
                                        isFavorite ? 'opacity-100' : ''
                                    }`}
                                    onClick={handleToggleFavorite}
                                    disabled={isTogglingFavorite}
                                >
                                    <Heart
                                        className={`h-4 w-4 transition-colors ${
                                            isFavorite
                                                ? 'fill-red-500 text-red-500'
                                                : 'text-foreground'
                                        }`}
                                    />
                                </Button>
                            )}
                        </div>

                        {/* Content */}
                        <div className={isGrid ? 'p-5 space-y-3' : 'flex-1 space-y-2'}>
                            {/* Title and Price */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors overflow-hidden" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                    {listing.title}
                                </h3>
                                <div className="flex items-baseline justify-between gap-2">
                                    <span className="text-2xl font-bold text-foreground">
                                        {priceFormatted}
                                    </span>
                                    {listing.price_negotiable && (
                                        <Badge variant="secondary" className="text-xs">
                                            VB
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Location and Shipping */}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span className="text-xs">{listing.location_city}</span>
                                </div>
                                {listing.shipping_available && (
                                    <Badge variant="outline" className="text-xs gap-1">
                                        <Truck className="h-3 w-3" />
                                        Versand
                                    </Badge>
                                )}
                            </div>

                            {/* Seller Info */}
                            {showSeller && 'seller' in listing && listing.seller && (
                                <Link href={`/users/${listing.seller.username}`} className="flex items-center gap-2.5 pt-3 border-t border-border/50 hover:opacity-80 transition-opacity">
                                    <Avatar className="h-8 w-8 ring-2 ring-background">
                                        <AvatarImage src={listing.seller.avatar_url || undefined} />
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                                            {listing.seller.username.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {listing.seller.username}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                            <span className="font-medium">{listing.seller.seller_rating.toFixed(1)}</span>
                                            <span className="text-muted-foreground/50">•</span>
                                            <span>{listing.seller.total_sales} Verkäufe</span>
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {/* Stats - More subtle */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(listing.created_at)}</span>
                                </div>
                                <span className="text-muted-foreground/30">•</span>
                                <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    <span>{listing.views}</span>
                                </div>
                                {listing.favorites_count > 0 && (
                                    <>
                                        <span className="text-muted-foreground/30">•</span>
                                        <div className="flex items-center gap-1">
                                            <Heart className="h-3 w-3" />
                                            <span>{listing.favorites_count}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Link>
        </Card>
    );
}

// Helper functions
function getConditionLabel(condition: string): string {
    const labels: Record<string, string> = {
        [CONDITIONS.MINT]: 'Neuwertig',
        [CONDITIONS.EXCELLENT]: 'Sehr gut',
        [CONDITIONS.VERY_GOOD]: 'Gut',
        [CONDITIONS.GOOD]: 'Befriedigend',
        [CONDITIONS.FAIR]: 'Ausreichend',
        [CONDITIONS.POOR]: 'Mangelhaft',
        [CONDITIONS.FOR_PARTS]: 'Ersatzteile'
    };
    return labels[condition] || condition;
}

function getConditionVariant(condition: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        [CONDITIONS.MINT]: 'default',
        [CONDITIONS.EXCELLENT]: 'default',
        [CONDITIONS.VERY_GOOD]: 'secondary',
        [CONDITIONS.GOOD]: 'secondary',
        [CONDITIONS.FAIR]: 'outline',
        [CONDITIONS.POOR]: 'destructive',
        [CONDITIONS.FOR_PARTS]: 'destructive'
    };
    return variants[condition] || 'outline';
}

function getCategoryLabel(category: string): string {
    // Comprehensive category label mapping
    const labels: Record<string, string> = {
        // Main categories (legacy)
        [LISTING_CATEGORIES.GUITARS]: 'Gitarren',
        [LISTING_CATEGORIES.AMPS]: 'Amps',
        [LISTING_CATEGORIES.EFFECTS]: 'Effekte',
        
        // Thomann instrument categories
        'e_gitarren': 'E-Gitarren',
        'konzertgitarren': 'Konzertgitarren',
        'westerngitarren': 'Westerngitarren',
        'e_baesse': 'E-Bässe',
        'akustikbaesse': 'Akustikbässe',
        'ukulelen': 'Ukulelen',
        'bluegrass': 'Bluegrass',
        'travelgitarren': 'Travel-Gitarren',
        'sonstige_saiteninstrumente': 'Sonstige Saiteninstrumente',
        
        // Amplifier categories
        'e_gitarren_verstaerker': 'E-Gitarren Verstärker',
        'bass_verstaerker': 'Bass Verstärker',
        'akustik_verstaerker': 'Akustik Verstärker',
        'combo_verstaerker': 'Combo Verstärker',
        'amp_heads': 'Amp Heads',
        'cabinets': 'Cabinets',
        
        // Effects categories
        'gitarreneffekte': 'Gitarreneffekte',
        'bass_effekte': 'Bass Effekte',
        'multi_effekte': 'Multi-Effekte',
        'rack_effekte': 'Rack-Effekte',
        
        // Accessories
        'gitarrenzubehoer': 'Gitarrenzubehör',
        'basszubehoer': 'Basszubehör',
    };
    
    // If we have a direct mapping, return it
    if (labels[category]) {
        return labels[category];
    }
    
    // Fallback: convert snake_case to readable German
    return category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
        return 'Heute';
    } else if (diffInDays === 1) {
        return 'Gestern';
    } else if (diffInDays < 7) {
        return `vor ${diffInDays} Tagen`;
    } else {
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    }
}
