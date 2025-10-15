'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    MapPin,
    Truck,
    Package,
    Heart,
    Share2,
    MessageCircle,
    Star,
    Shield,
    Calendar,
    Euro
} from 'lucide-react';

interface ListingDetails {
    id: string;
    seller_id: string;
    category: string;
    title: string;
    description: string;
    slug: string;
    price: number;
    original_price?: number;
    price_negotiable: boolean;
    condition: string;
    condition_notes?: string;
    location_city: string;
    location_state: string;
    location_postal_code: string;
    shipping_available: boolean;
    shipping_cost?: number;
    shipping_methods: string[];
    pickup_available: boolean;
    images: string[];
    videos: string[];
    case_included: boolean;
    accessories: string[];
    tags: string[];
    status: string;
    views: number;
    created_at: string;
    updated_at: string;
    profiles?: {
        id: string;
        username: string;
        avatar_url?: string;
        verification_status: string;
        seller_rating?: number;
        total_sales?: number;
        location?: string;
        created_at: string;
    };
    details?: any;
}

const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
        'mint': 'Neuwertig',
        'excellent': 'Sehr gut',
        'good': 'Gut',
        'fair': 'Befriedigend',
        'poor': 'Ausreichend',
        'parts': 'Mangelhaft',
        'for_parts': 'Ersatzteile'
    };
    return labels[condition] || condition;
};

const getConditionVariant = (condition: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        'mint': 'default',
        'excellent': 'default',
        'good': 'secondary',
        'fair': 'secondary',
        'poor': 'destructive',
        'parts': 'destructive',
        'for_parts': 'destructive'
    };
    return variants[condition] || 'outline';
};

const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
        'guitars': 'Gitarren',
        'amps': 'Amps',
        'effects': 'Effekte'
    };
    return labels[category] || category;
};

export default function ListingDetailPage() {
    const params = useParams();
    const [listing, setListing] = useState<ListingDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await fetch(`/api/listings/${params.id}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Anzeige nicht gefunden');
                    }
                    throw new Error('Fehler beim Laden der Anzeige');
                }

                const data = await response.json();
                setListing(data.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchListing();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="h-96 bg-muted rounded"></div>
                            <div className="space-y-4">
                                <div className="h-6 bg-muted rounded w-1/2"></div>
                                <div className="h-4 bg-muted rounded w-1/4"></div>
                                <div className="h-32 bg-muted rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive mb-2">
                        {error || 'Anzeige nicht gefunden'}
                    </h1>
                    <p className="text-muted-foreground mb-4">
                        Diese Anzeige existiert nicht oder wurde entfernt.
                    </p>
                    <Button asChild>
                        <a href="/listings">Zurück zu den Anzeigen</a>
                    </Button>
                </div>
            </div>
        );
    }

    const mainImage = listing.images?.[0];
    const conditionLabel = getConditionLabel(listing.condition);
    const categoryLabel = getCategoryLabel(listing.category);

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                    <a href="/listings" className="hover:text-foreground">Anzeigen</a>
                    <span>/</span>
                    <span>{categoryLabel}</span>
                    <span>/</span>
                    <span className="text-foreground">{listing.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                            <img
                                src={listing.images?.[currentImageIndex] || mainImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Thumbnail Images */}
                        {listing.images && listing.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {listing.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${currentImageIndex === index
                                                ? 'border-primary'
                                                : 'border-transparent hover:border-muted-foreground'
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${listing.title} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{categoryLabel}</Badge>
                                <Badge variant={getConditionVariant(listing.condition)}>
                                    {conditionLabel}
                                </Badge>
                            </div>

                            <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>

                            <div className="flex items-center gap-4 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{listing.location_city}, {listing.location_state}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(listing.created_at).toLocaleDateString('de-DE')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="w-4 h-4">👁</span>
                                    <span>{listing.views} Aufrufe</span>
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-3xl font-bold">{listing.price.toLocaleString('de-DE')} €</span>
                                    {listing.original_price && (
                                        <span className="text-lg text-muted-foreground line-through">
                                            {listing.original_price.toLocaleString('de-DE')} €
                                        </span>
                                    )}
                                </div>

                                {listing.price_negotiable && (
                                    <p className="text-sm text-muted-foreground mb-4">Verhandlungsbasis</p>
                                )}

                                <div className="flex gap-2">
                                    <Button size="lg" className="flex-1">
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Nachricht senden
                                    </Button>
                                    <Button variant="outline" size="lg">
                                        <Heart className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="lg">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Seller Info */}
                        {listing.profiles && (
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                            {listing.profiles.avatar_url ? (
                                                <img
                                                    src={listing.profiles.avatar_url}
                                                    alt={listing.profiles.username}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-lg font-semibold">
                                                    {listing.profiles.username.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{listing.profiles.username}</h3>
                                                {listing.profiles.verification_status === 'verified' && (
                                                    <Shield className="w-4 h-4 text-primary" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                {listing.profiles.seller_rating && (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                        <span>{listing.profiles.seller_rating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                                {listing.profiles.total_sales && (
                                                    <span>{listing.profiles.total_sales} Verkäufe</span>
                                                )}
                                                <span>Mitglied seit {new Date(listing.profiles.created_at).getFullYear()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button variant="outline" className="w-full">
                                        Alle Anzeigen von {listing.profiles.username}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Shipping & Pickup */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-4">Versand & Abholung</h3>
                                <div className="space-y-3">
                                    {listing.shipping_available && (
                                        <div className="flex items-center gap-3">
                                            <Truck className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="font-medium">Versand möglich</p>
                                                {listing.shipping_cost ? (
                                                    <p className="text-sm text-muted-foreground">
                                                        Versandkosten: {listing.shipping_cost} €
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">Versandkosten auf Anfrage</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {listing.pickup_available && (
                                        <div className="flex items-center gap-3">
                                            <Package className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="font-medium">Abholung möglich</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {listing.location_city}, {listing.location_state}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-8">
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Beschreibung</h2>
                            <div className="prose max-w-none">
                                <p className="whitespace-pre-wrap">{listing.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Technical Details */}
                {listing.details && (
                    <div className="mt-8">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Technische Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(listing.details).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="font-medium capitalize">
                                                {key.replace(/_/g, ' ')}:
                                            </span>
                                            <span className="text-muted-foreground">
                                                {typeof value === 'boolean' ? (value ? 'Ja' : 'Nein') : String(value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
