'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/auth/useUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, X } from 'lucide-react';

interface ListingDetails {
    id: string;
    seller_id: string;
    category: string;
    title: string;
    description: string;
    price: number;
    original_price?: number;
    condition: string;
    location_city: string;
    location_state: string;
    location_postal_code: string;
    shipping_available: boolean;
    shipping_cost?: number;
    pickup_available: boolean;
    images: string[];
    details?: any;
}

export default function EditListingPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const [listing, setListing] = useState<ListingDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form data for technical details
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        series: '',
        year: '',
        country_of_origin: '',
        guitar_type: '',
        amp_type: '',
        effect_type: ''
    });

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await fetch(`/api/listings/${params.id}`);

                if (!response.ok) {
                    throw new Error('Anzeige nicht gefunden');
                }

                const data = await response.json();
                setListing(data.data);

                // Pre-fill form with existing details
                if (data.data.details) {
                    setFormData({
                        brand: data.data.details.brand || '',
                        model: data.data.details.model || '',
                        series: data.data.details.series || '',
                        year: data.data.details.year || '',
                        country_of_origin: data.data.details.country_of_origin || '',
                        guitar_type: data.data.details.guitar_type || '',
                        amp_type: data.data.details.amp_type || '',
                        effect_type: data.data.details.effect_type || ''
                    });
                }
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

    const handleSave = async () => {
        if (!listing) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/listings/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    details: formData
                }),
            });

            if (!response.ok) {
                throw new Error('Fehler beim Speichern');
            }

            router.push(`/listings/${params.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-center">
                    <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
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
                    <Button onClick={() => router.back()}>
                        Zurück
                    </Button>
                </div>
            </div>
        );
    }

    // Check if user owns the listing
    if (!user || listing.seller_id !== user.id) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive mb-2">
                        Keine Berechtigung
                    </h1>
                    <p className="text-muted-foreground mb-4">
                        Du kannst nur deine eigenen Anzeigen bearbeiten.
                    </p>
                    <Button onClick={() => router.back()}>
                        Zurück
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Zurück
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Anzeige bearbeiten</h1>
                        <p className="text-muted-foreground">{listing.title}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Technical Details Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Technische Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Brand */}
                            <div>
                                <Label htmlFor="brand">Marke *</Label>
                                <Input
                                    id="brand"
                                    value={formData.brand}
                                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                                    placeholder="z.B. Fender, Gibson, Ibanez"
                                />
                            </div>

                            {/* Model */}
                            <div>
                                <Label htmlFor="model">Modell *</Label>
                                <Input
                                    id="model"
                                    value={formData.model}
                                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                                    placeholder="z.B. Stratocaster, Les Paul, RG"
                                />
                            </div>

                            {/* Series */}
                            <div>
                                <Label htmlFor="series">Serie</Label>
                                <Input
                                    id="series"
                                    value={formData.series}
                                    onChange={(e) => setFormData(prev => ({ ...prev, series: e.target.value }))}
                                    placeholder="z.B. American Professional, Standard"
                                />
                            </div>

                            {/* Year */}
                            <div>
                                <Label htmlFor="year">Baujahr</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    value={formData.year}
                                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                                    placeholder="z.B. 2021"
                                />
                            </div>

                            {/* Country of Origin */}
                            <div>
                                <Label htmlFor="country_of_origin">Herkunftsland</Label>
                                <Input
                                    id="country_of_origin"
                                    value={formData.country_of_origin}
                                    onChange={(e) => setFormData(prev => ({ ...prev, country_of_origin: e.target.value }))}
                                    placeholder="z.B. USA, Japan, Korea"
                                />
                            </div>

                            {/* Category-specific fields */}
                            {listing.category === 'guitars' && (
                                <div>
                                    <Label htmlFor="guitar_type">Typ</Label>
                                    <select
                                        id="guitar_type"
                                        value={formData.guitar_type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, guitar_type: e.target.value }))}
                                        className="w-full mt-1 p-3 border rounded-lg"
                                    >
                                        <option value="">Wähle einen Typ</option>
                                        <option value="electric">E-Gitarre</option>
                                        <option value="acoustic">Akustikgitarre</option>
                                        <option value="classical">Klassische Gitarre</option>
                                        <option value="bass">Bass</option>
                                    </select>
                                </div>
                            )}

                            {listing.category === 'amps' && (
                                <div>
                                    <Label htmlFor="amp_type">Typ</Label>
                                    <select
                                        id="amp_type"
                                        value={formData.amp_type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amp_type: e.target.value }))}
                                        className="w-full mt-1 p-3 border rounded-lg"
                                    >
                                        <option value="">Wähle einen Typ</option>
                                        <option value="combo">Combo</option>
                                        <option value="head">Head</option>
                                        <option value="cabinet">Cabinet</option>
                                        <option value="pedal">Pedal</option>
                                    </select>
                                </div>
                            )}

                            {listing.category === 'effects' && (
                                <div>
                                    <Label htmlFor="effect_type">Typ</Label>
                                    <select
                                        id="effect_type"
                                        value={formData.effect_type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, effect_type: e.target.value }))}
                                        className="w-full mt-1 p-3 border rounded-lg"
                                    >
                                        <option value="">Wähle einen Typ</option>
                                        <option value="distortion">Distortion</option>
                                        <option value="overdrive">Overdrive</option>
                                        <option value="fuzz">Fuzz</option>
                                        <option value="delay">Delay</option>
                                        <option value="reverb">Reverb</option>
                                        <option value="chorus">Chorus</option>
                                        <option value="flanger">Flanger</option>
                                        <option value="phaser">Phaser</option>
                                        <option value="wah">Wah</option>
                                        <option value="compressor">Compressor</option>
                                        <option value="eq">EQ</option>
                                        <option value="other">Sonstiges</option>
                                    </select>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vorschau</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Aktuelle Details:</h3>
                                    <div className="space-y-2 text-sm">
                                        {formData.brand && (
                                            <div className="flex justify-between">
                                                <span className="font-medium">Marke:</span>
                                                <span className="text-muted-foreground">{formData.brand}</span>
                                            </div>
                                        )}
                                        {formData.model && (
                                            <div className="flex justify-between">
                                                <span className="font-medium">Modell:</span>
                                                <span className="text-muted-foreground">{formData.model}</span>
                                            </div>
                                        )}
                                        {formData.series && (
                                            <div className="flex justify-between">
                                                <span className="font-medium">Serie:</span>
                                                <span className="text-muted-foreground">{formData.series}</span>
                                            </div>
                                        )}
                                        {formData.year && (
                                            <div className="flex justify-between">
                                                <span className="font-medium">Baujahr:</span>
                                                <span className="text-muted-foreground">{formData.year}</span>
                                            </div>
                                        )}
                                        {formData.country_of_origin && (
                                            <div className="flex justify-between">
                                                <span className="font-medium">Herkunftsland:</span>
                                                <span className="text-muted-foreground">{formData.country_of_origin}</span>
                                            </div>
                                        )}
                                        {(formData.guitar_type || formData.amp_type || formData.effect_type) && (
                                            <div className="flex justify-between">
                                                <span className="font-medium">Typ:</span>
                                                <span className="text-muted-foreground">
                                                    {formData.guitar_type || formData.amp_type || formData.effect_type}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Save/Cancel Buttons */}
                <div className="flex gap-4 mt-8">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Speichern...' : 'Speichern'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex-1"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Abbrechen
                    </Button>
                </div>
            </div>
        </div>
    );
}
