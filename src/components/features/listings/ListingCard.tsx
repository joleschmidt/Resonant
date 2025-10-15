/**
 * Listing Card Component
 * Displays listing information in grid/list view
 */

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
    Star
} from 'lucide-react';
// Removed ImageKit import - using direct Supabase Storage URLs
import type { ListingWithDetails } from '@/types/listings';
import { CONDITIONS, LISTING_CATEGORIES } from '@/utils/constants';
import Link from 'next/link';

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
    const mainImage = listing.images?.[0];
    const conditionLabel = getConditionLabel(listing.condition);
    const categoryLabel = getCategoryLabel(listing.category);
    const priceFormatted = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(listing.price);

    const isGrid = viewMode === 'grid';

    return (
        <Card className={`group hover:shadow-lg transition-shadow ${className}`}>
            <Link href={`/listings/${listing.id}`}>
                <CardContent className={isGrid ? 'p-0' : 'p-4'}>
                    <div className={isGrid ? 'flex flex-col' : 'flex space-x-4'}>
                        {/* Image */}
                        <div className={isGrid ? 'relative' : 'w-32 h-32 flex-shrink-0'}>
                            <img
                                src={mainImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                                alt={listing.title}
                                className={`
                  object-cover bg-muted
                  ${isGrid ? 'w-full h-48 rounded-t-lg' : 'w-full h-full rounded'}
                `}
                            />

                            {/* Overlay badges */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                <Badge
                                    variant={getConditionVariant(listing.condition)}
                                    className="text-xs"
                                >
                                    {conditionLabel}
                                </Badge>
                            </div>

                            {/* Favorite button */}
                            <Button
                                size="sm"
                                variant="ghost"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.preventDefault();
                                    // TODO: Implement favorite functionality
                                }}
                            >
                                <Heart className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className={isGrid ? 'p-4 space-y-3' : 'flex-1 space-y-2'}>
                            {/* Title and Price */}
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors overflow-hidden" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                    {listing.title}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-primary">
                                        {priceFormatted}
                                    </span>
                                    {listing.price_negotiable && (
                                        <Badge variant="outline" className="text-xs">
                                            Verhandlungsbasis
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Location and Shipping */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{listing.location_city}</span>
                                </div>
                                {listing.shipping_available && (
                                    <div className="flex items-center gap-1">
                                        <Truck className="h-4 w-4" />
                                        <span>Versand</span>
                                    </div>
                                )}
                                {listing.pickup_available && (
                                    <div className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        <span>Abholung</span>
                                    </div>
                                )}
                            </div>

                            {/* Seller Info */}
                            {showSeller && 'seller' in listing && listing.seller && (
                                <div className="flex items-center gap-2 pt-2 border-t">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={listing.seller.avatar_url || undefined} />
                                        <AvatarFallback className="text-xs">
                                            {listing.seller.username.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {listing.seller.username}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            <span>{listing.seller.seller_rating.toFixed(1)}</span>
                                            <span>•</span>
                                            <span>{listing.seller.total_sales} Verkäufe</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    <span>{listing.views} Aufrufe</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    <span>{listing.favorites_count} Favoriten</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(listing.created_at)}</span>
                                </div>
                            </div>

                            {/* Tags */}
                            {listing.tags && listing.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {listing.tags.slice(0, 3).map((tag, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                    {listing.tags.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{listing.tags.length - 3}
                                        </Badge>
                                    )}
                                </div>
                            )}
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
    const labels: Record<string, string> = {
        [LISTING_CATEGORIES.GUITARS]: 'Gitarre',
        [LISTING_CATEGORIES.AMPS]: 'Verstärker',
        [LISTING_CATEGORIES.EFFECTS]: 'Effekt'
    };
    return labels[category] || category;
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
