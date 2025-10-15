'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@/hooks/auth/useUser';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    Euro,
    ArrowLeft,
    ChevronRight,
    Pencil
} from 'lucide-react';
import { useRouter } from 'next/navigation';


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
    const { user } = useUser();
    const [listing, setListing] = useState<ListingDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [showPriceOffer, setShowPriceOffer] = useState(false);
    const [showBuyNow, setShowBuyNow] = useState(false);
    const [offerAmount, setOfferAmount] = useState('');
    const [offerMessage, setOfferMessage] = useState('');
    const router = useRouter();


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
    const isOwner = user && listing.seller_id === user.id;

    const handlePriceOffer = async () => {
        if (!user) {
            alert('Bitte melde dich an, um ein Angebot zu machen.');
            return;
        }

        if (!offerAmount || parseFloat(offerAmount) <= 0) {
            alert('Bitte gib einen gültigen Betrag ein.');
            return;
        }

        // TODO: Implement price offer API call
        alert(`Preisvorschlag von ${offerAmount}€ wurde gesendet!`);
        setShowPriceOffer(false);
        setOfferAmount('');
        setOfferMessage('');
    };

    const handleBuyNow = async () => {
        if (!user) {
            alert('Bitte melde dich an, um zu kaufen.');
            return;
        }

        // TODO: Implement buy now API call
        alert('Kaufprozess gestartet! Du wirst zur Zahlungsseite weitergeleitet.');
        setShowBuyNow(false);
    };

    return (
        <div className="min-h-screen bg-background pb-28 lg:pb-12 xl:pb-16">
            <div className="container mx-auto px-4 py-4">

                {/* Breadcrumb + right-aligned Edit (hidden on mobile) */}
                <div className="mb-3 lg:mb-4 xl:mb-4 flex items-center justify-between hidden sm:flex">
                    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/listings')}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Zurück
                        </Button>
                        <a
                            href="/listings"
                            className="hover:text-foreground transition-colors hidden sm:inline"
                        >
                            Anzeigen
                        </a>
                        <ChevronRight className="w-4 h-4 hidden sm:inline" />
                        <a
                            href={`/listings?category=${listing.category}`}
                            className="hover:text-foreground transition-colors hidden sm:inline"
                        >
                            {categoryLabel}
                        </a>
                        <ChevronRight className="w-4 h-4 hidden sm:inline" />
                        <span className="text-foreground truncate max-w-md hidden sm:inline">
                            {listing.title}
                        </span>
                    </nav>
                    {isOwner && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/listings/${listing.id}/edit`}
                        >
                            Bearbeiten
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 min-h-[90vh] pb-2">
                    {/* Images */}
                    <div className="h-full flex flex-col gap-3 pb-2 max-h-[60vh] sm:max-h-[70vh] lg:max-h-[84.65vh]">
                        {/* Main Image with mobile overlay controls */}
                        <div className="relative">
                            <button className="flex-1 min-h-0 w-full rounded-lg overflow-hidden bg-muted aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto" onClick={() => setLightboxOpen(true)}>
                                <img
                                    src={listing.images?.[currentImageIndex] || mainImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                                    alt={listing.title}
                                    className="w-full h-full object-contain"
                                />
                            </button>
                            {/* Mobile-only top overlay icons */}
                            <div className="absolute inset-0 pointer-events-none sm:hidden">
                                <div className="flex items-start justify-between p-3">
                                    <Button variant="secondary" size="icon" className="pointer-events-auto bg-white/90 text-foreground shadow hover:bg-white" aria-label="Zurück" onClick={() => router.back()}>
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                    {isOwner && (
                                        <Button variant="secondary" size="icon" className="pointer-events-auto bg-white/90 text-foreground shadow hover:bg-white" aria-label="Bearbeiten" onClick={() => window.location.href = `/listings/${listing.id}/edit`}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Thumbnail Images */}
                        {listing.images && listing.images.length > 1 && (
                            <div className="flex gap-2 h-20 overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-2 lg:h-24 lg:overflow-visible">
                                {listing.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`rounded-lg overflow-hidden border-2 transition-colors ${currentImageIndex === index
                                            ? 'border-primary'
                                            : 'border-transparent hover:border-muted-foreground'
                                            } w-28 h-20 flex-shrink-0 lg:w-auto lg:h-auto`}
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
                    <div className="h-full flex flex-col space-y-4 pb-2">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{categoryLabel}</Badge>
                                <Badge variant={getConditionVariant(listing.condition)}>
                                    {conditionLabel}
                                </Badge>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{listing.title}</h1>

                            <div className="flex items-center gap-4 text-muted-foreground flex-wrap gap-y-1">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{listing.location_city}, {listing.location_state}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(listing.created_at).toLocaleDateString('de-DE')}</span>
                                </div>
                                <div className="flex items-center gap-1">

                                    <span>{listing.views} Aufrufe</span>
                                </div>
                            </div>

                            {/* Mobile quick actions moved into price container */}
                        </div>

                        {/* Price */}
                        <Card>
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-3xl font-bold">{listing.price.toLocaleString('de-DE')} €</span>
                                    {listing.original_price && (
                                        <span className="text-lg text-muted-foreground line-through">
                                            {listing.original_price.toLocaleString('de-DE')} €
                                        </span>
                                    )}
                                </div>

                                {listing.price_negotiable && (
                                    <p className="text-sm text-muted-foreground mb-2 sm:mb-4">Verhandlungsbasis</p>
                                )}

                                <div className="space-y-0 lg:space-y-3">
                                    {/* Mobile actions in price container: like, share, buy now */}
                                    <div className="flex items-center justify-between gap-2 lg:hidden mb-2">
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="icon" aria-label="Merken">
                                                <Heart className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" aria-label="Teilen">
                                                <Share2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <Dialog open={showBuyNow} onOpenChange={setShowBuyNow}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                    <Package className="w-4 h-4 mr-2" />
                                                    Sofort kaufen
                                                </Button>
                                            </DialogTrigger>
                                        </Dialog>
                                    </div>
                                    <div className="hidden lg:flex gap-2">
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

                                    {/* Price offer and buy now buttons */}
                                    <div className="hidden lg:flex gap-2">
                                        <Dialog open={showPriceOffer} onOpenChange={setShowPriceOffer}>
                                            <DialogTrigger asChild>
                                                <Button variant="secondary" size="lg" className="flex-1">
                                                    <Euro className="w-4 h-4 mr-2" />
                                                    Preisvorschlag
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Preisvorschlag machen</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="offer-amount">Dein Angebot (€)</Label>
                                                        <Input
                                                            id="offer-amount"
                                                            type="number"
                                                            value={offerAmount}
                                                            onChange={(e) => setOfferAmount(e.target.value)}
                                                            placeholder={`Aktueller Preis: ${listing.price.toLocaleString('de-DE')}€`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="offer-message">Nachricht (optional)</Label>
                                                        <textarea
                                                            id="offer-message"
                                                            value={offerMessage}
                                                            onChange={(e) => setOfferMessage(e.target.value)}
                                                            placeholder="Füge eine Nachricht zu deinem Angebot hinzu..."
                                                            className="w-full mt-1 p-3 border rounded-lg"
                                                            rows={3}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button onClick={handlePriceOffer} className="flex-1">
                                                            Angebot senden
                                                        </Button>
                                                        <Button variant="outline" onClick={() => setShowPriceOffer(false)} className="flex-1">
                                                            Abbrechen
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog open={showBuyNow} onOpenChange={setShowBuyNow}>
                                            <DialogTrigger asChild>
                                                <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700">
                                                    <Package className="w-4 h-4 mr-2" />
                                                    Sofort kaufen
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Sofort kaufen</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div className="text-center">
                                                        <p className="text-lg font-semibold mb-2">
                                                            {listing.title}
                                                        </p>
                                                        <p className="text-2xl font-bold text-green-600">
                                                            {listing.price.toLocaleString('de-DE')} €
                                                        </p>
                                                        {listing.original_price && (
                                                            <p className="text-sm text-muted-foreground line-through">
                                                                Ursprünglich: {listing.original_price.toLocaleString('de-DE')} €
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="bg-muted p-4 rounded-lg">
                                                        <h4 className="font-semibold mb-2">Kaufoptionen:</h4>
                                                        <ul className="space-y-1 text-sm">
                                                            {listing.shipping_available && (
                                                                <li>✓ Versand möglich</li>
                                                            )}
                                                            {listing.pickup_available && (
                                                                <li>✓ Abholung möglich in {listing.location_city}</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button onClick={handleBuyNow} className="flex-1 bg-green-600 hover:bg-green-700">
                                                            Jetzt kaufen
                                                        </Button>
                                                        <Button variant="outline" onClick={() => setShowBuyNow(false)} className="flex-1">
                                                            Abbrechen
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
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
                                                {listing.profiles.seller_rating && listing.profiles.seller_rating !== 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                        <span>{listing.profiles.seller_rating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                                {listing.profiles.total_sales && listing.profiles.total_sales !== 0 && (
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
                        <Card className="mt-auto">
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

                {/* Mobile sticky action bar */}
                <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] lg:hidden">
                    <div className="container mx-auto px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] flex gap-2">
                        <Button className="flex-1">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Nachricht
                        </Button>
                        <Dialog open={showPriceOffer} onOpenChange={setShowPriceOffer}>
                            <DialogTrigger asChild>
                                <Button variant="secondary" className="flex-1">
                                    <Euro className="w-4 h-4 mr-2" />
                                    Preisvorschlag
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>
                </div>

                {/* Lightbox */}
                {lightboxOpen && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
                        <div className="flex items-center justify-between p-4 text-white">
                            <button onClick={() => setLightboxOpen(false)} className="text-white/80 hover:text-white">Schließen</button>
                            <div className="text-sm">{currentImageIndex + 1} / {listing.images?.length || 1}</div>
                        </div>
                        <div className="relative flex-1 flex items-center justify-center select-none overflow-hidden">
                            <img
                                src={listing.images?.[currentImageIndex] || mainImage!}
                                alt={listing.title}
                                className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain"
                            />
                            <button
                                className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                                onClick={() => setCurrentImageIndex(i => (i > 0 ? i - 1 : (listing.images?.length || 1) - 1))}
                                aria-label="Vorheriges Bild"
                            >
                                ‹
                            </button>
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                                onClick={() => setCurrentImageIndex(i => (i < (listing.images?.length || 1) - 1 ? i + 1 : 0))}
                                aria-label="Nächstes Bild"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                )}

                {/* Description */}
                <div className="mt-2 lg:mt-0 xl:mt-0">
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
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Technische Details</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    {Object.entries(listing.details)
                                        .filter(([key, value]) => {
                                            // Only show relevant fields with actual values
                                            const relevantFields = [
                                                'brand', 'model', 'series', 'year', 'country_of_origin', 'guitar_type',
                                                'body_wood', 'neck_wood', 'fretboard_wood', 'pickups', 'electronics', 'hardware', 'finish'
                                            ];
                                            return relevantFields.includes(key) &&
                                                value !== null &&
                                                value !== undefined &&
                                                value !== '' &&
                                                value !== 'null' &&
                                                !(typeof value === 'object' && Object.keys(value).length === 0);
                                        })
                                        .map(([key, value]) => {
                                            const fieldLabels: Record<string, string> = {
                                                'brand': 'Marke',
                                                'model': 'Modell',
                                                'series': 'Serie',
                                                'year': 'Baujahr',
                                                'country_of_origin': 'Herkunftsland',
                                                'guitar_type': 'Typ',
                                                'body_wood': 'Korpus-Holz',
                                                'neck_wood': 'Hals-Holz',
                                                'fretboard_wood': 'Griffbrett-Holz',
                                                'pickups': 'Pickups',
                                                'electronics': 'Elektronik',
                                                'hardware': 'Hardware',
                                                'finish': 'Finish'
                                            };

                                            const displayValue = typeof value === 'boolean'
                                                ? (value ? 'Ja' : 'Nein')
                                                : String(value);

                                            return (
                                                <div key={key} className="flex justify-between">
                                                    <span className="font-medium">
                                                        {fieldLabels[key] || key.replace(/_/g, ' ')}:
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {displayValue}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    {Array.isArray(listing.details.custom_fields) && listing.details.custom_fields.length > 0 && (
                                        <>
                                            <div className="space-y-2">
                                                {listing.details.custom_fields.map((field: { key: string; value: string }, index: number) => (
                                                    <div key={index} className="flex justify-between">
                                                        <span className="font-medium">{field.key}:</span>
                                                        <span className="text-muted-foreground">{field.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
