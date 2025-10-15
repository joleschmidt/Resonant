'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/auth/useUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, X, Plus, GripVertical, Trash2 } from 'lucide-react';

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
    const [localImages, setLocalImages] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);

    // Base listing form
    const [base, setBase] = useState({
        title: '',
        description: '',
        price: '',
        original_price: '',
        price_negotiable: false,
        condition: 'excellent',
        condition_notes: '',
        location_city: '',
        location_state: '',
        location_postal_code: '',
        shipping_available: false,
        shipping_cost: '',
        pickup_available: true
    });

    // Form data for technical details
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        series: '',
        year: '',
        country_of_origin: '',
        guitar_type: '',
        amp_type: '',
        effect_type: '',
        // Guitar-specific details
        body_wood: '',
        neck_wood: '',
        fretboard_wood: '',
        pickups: '',
        electronics: '',
        hardware: '',
        finish: '',
        // Custom fields
        custom_fields: [] as Array<{ key: string, value: string }>
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
                setLocalImages(data.data.images || []);
                // fill base
                setBase({
                    title: data.data.title || '',
                    description: data.data.description || '',
                    price: String(data.data.price || ''),
                    original_price: String(data.data.original_price || ''),
                    price_negotiable: !!data.data.price_negotiable,
                    condition: data.data.condition || 'excellent',
                    condition_notes: data.data.condition_notes || '',
                    location_city: data.data.location_city || '',
                    location_state: data.data.location_state || '',
                    location_postal_code: data.data.location_postal_code || '',
                    shipping_available: !!data.data.shipping_available,
                    shipping_cost: String(data.data.shipping_cost || ''),
                    pickup_available: !!data.data.pickup_available
                });

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
                        effect_type: data.data.details.effect_type || '',
                        // Guitar-specific details
                        body_wood: data.data.details.body_wood || '',
                        neck_wood: data.data.details.neck_wood || '',
                        fretboard_wood: data.data.details.fretboard_wood || '',
                        pickups: data.data.details.pickups || '',
                        electronics: data.data.details.electronics || '',
                        hardware: data.data.details.hardware || '',
                        finish: data.data.details.finish || '',
                        // Custom fields
                        custom_fields: data.data.details.custom_fields || []
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
            console.log('Sending data:', { base, details: formData });

            // 1) Upload new files to storage and collect URLs
            const uploadedUrls: string[] = [];
            for (const file of newFiles) {
                const fd = new FormData();
                fd.append('file', file);
                const res = await fetch('/api/upload/listing-images', { method: 'POST', body: fd });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Bild-Upload fehlgeschlagen');
                uploadedUrls.push(json.url);
            }

            const finalImages = [...localImages, ...uploadedUrls];

            const response = await fetch(`/api/listings/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    base: {
                        ...base,
                        price: base.price ? Number(base.price) : null,
                        original_price: base.original_price ? Number(base.original_price) : null,
                        shipping_cost: base.shipping_cost ? Number(base.shipping_cost) : null
                    },
                    details: formData,
                    images: finalImages
                }),
            });

            const responseData = await response.json();
            console.log('Response:', responseData);

            if (!response.ok) {
                throw new Error(`Fehler beim Speichern: ${responseData.error || response.statusText}`);
            }

            router.push(`/listings/${params.id}`);
        } catch (err) {
            console.error('Save error:', err);
            setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
        } finally {
            setSaving(false);
        }
    };

    // Image management
    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        setNewFiles(prev => [...prev, ...files]);
    };

    const moveImage = (from: number, to: number) => {
        setLocalImages(prev => {
            const copy = [...prev];
            const [moved] = copy.splice(from, 1);
            copy.splice(to, 0, moved);
            return copy;
        });
    };

    const removeExistingImage = (index: number) => {
        setLocalImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
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
                    <div className="flex-1 flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="max-w-32"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Speichern...' : 'Speichern'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Base Listing Fields */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Grunddaten</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title">Titel</Label>
                                <Input id="title" value={base.title} onChange={e => setBase(prev => ({ ...prev, title: e.target.value }))} />
                            </div>
                            <div>
                                <Label htmlFor="description">Beschreibung</Label>
                                <textarea id="description" value={base.description} onChange={e => setBase(prev => ({ ...prev, description: e.target.value }))} className="w-full mt-1 p-3 border rounded-lg" rows={6} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <Label htmlFor="price">Preis (€)</Label>
                                    <Input id="price" type="number" value={base.price} onChange={e => setBase(prev => ({ ...prev, price: e.target.value }))} />
                                </div>
                                <div>
                                    <Label htmlFor="original_price">Urspr. Preis (€)</Label>
                                    <Input id="original_price" type="number" value={base.original_price} onChange={e => setBase(prev => ({ ...prev, original_price: e.target.value }))} />
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                    <input id="price_negotiable" type="checkbox" checked={base.price_negotiable} onChange={e => setBase(prev => ({ ...prev, price_negotiable: e.target.checked }))} />
                                    <Label htmlFor="price_negotiable">VB</Label>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <Label>Zustand</Label>
                                    <select className="w-full mt-1 p-3 border rounded-lg" value={base.condition} onChange={e => setBase(prev => ({ ...prev, condition: e.target.value }))}>
                                        <option value="mint">Neuwertig</option>
                                        <option value="excellent">Sehr gut</option>
                                        <option value="good">Gut</option>
                                        <option value="fair">Befriedigend</option>
                                        <option value="poor">Ausreichend</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="condition_notes">Zustandsnotizen</Label>
                                    <Input id="condition_notes" value={base.condition_notes} onChange={e => setBase(prev => ({ ...prev, condition_notes: e.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <Label htmlFor="city">Stadt</Label>
                                    <Input id="city" value={base.location_city} onChange={e => setBase(prev => ({ ...prev, location_city: e.target.value }))} />
                                </div>
                                <div>
                                    <Label htmlFor="state">Bundesland</Label>
                                    <Input id="state" value={base.location_state} onChange={e => setBase(prev => ({ ...prev, location_state: e.target.value }))} />
                                </div>
                                <div>
                                    <Label htmlFor="zip">PLZ</Label>
                                    <Input id="zip" value={base.location_postal_code} onChange={e => setBase(prev => ({ ...prev, location_postal_code: e.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2">
                                    <input id="shipping_available" type="checkbox" checked={base.shipping_available} onChange={e => setBase(prev => ({ ...prev, shipping_available: e.target.checked }))} />
                                    <Label htmlFor="shipping_available">Versand möglich</Label>
                                </div>
                                <div>
                                    <Label htmlFor="shipping_cost">Versandkosten (€)</Label>
                                    <Input id="shipping_cost" type="number" value={base.shipping_cost} onChange={e => setBase(prev => ({ ...prev, shipping_cost: e.target.value }))} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input id="pickup_available" type="checkbox" checked={base.pickup_available} onChange={e => setBase(prev => ({ ...prev, pickup_available: e.target.checked }))} />
                                    <Label htmlFor="pickup_available">Abholung möglich</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Images Manager */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Bilder</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Vorhandene Bilder (Ziehen zum Sortieren)</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {localImages.map((url, index) => (
                                        <div key={index} className="relative group border rounded overflow-hidden">
                                            <img src={url} alt={`Bild ${index + 1}`} className="w-full h-28 object-cover" />
                                            <div className="absolute top-1 left-1 flex items-center gap-1 text-xs bg-background/80 px-1 rounded">
                                                <GripVertical className="w-3 h-3" />
                                                <span>{index + 1}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
                                                className="absolute top-1 right-1 p-1 rounded bg-background/70 hover:bg-background"
                                                aria-label="Entfernen"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            {/* Simple reorder controls */}
                                            <div className="absolute bottom-1 left-1 right-1 flex justify-between gap-1 opacity-0 group-hover:opacity-100 transition">
                                                <Button type="button" variant="outline" size="sm" disabled={index === 0} onClick={() => moveImage(index, index - 1)}>←</Button>
                                                <Button type="button" variant="outline" size="sm" disabled={index === localImages.length - 1} onClick={() => moveImage(index, index + 1)}>→</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Neue Bilder hinzufügen</Label>
                                <Input type="file" multiple accept="image/*" onChange={onFileSelect} />
                                {newFiles.length > 0 && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {newFiles.map((file, index) => (
                                            <div key={index} className="relative border rounded overflow-hidden">
                                                <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-28 object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewFile(index)}
                                                    className="absolute top-1 right-1 p-1 rounded bg-background/70 hover:bg-background"
                                                    aria-label="Entfernen"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
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
                                <>
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

                                    {/* Guitar-specific details */}
                                    <div className="border-t pt-4 mt-4">
                                        <h3 className="font-semibold mb-4 text-lg">Gitarren-Spezifikationen</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="body_wood">Korpus-Holz</Label>
                                                <Input
                                                    id="body_wood"
                                                    value={formData.body_wood}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, body_wood: e.target.value }))}
                                                    placeholder="z.B. Erle, Esche, Mahagoni"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="neck_wood">Hals-Holz</Label>
                                                <Input
                                                    id="neck_wood"
                                                    value={formData.neck_wood}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, neck_wood: e.target.value }))}
                                                    placeholder="z.B. Ahorn, Mahagoni"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="fretboard_wood">Griffbrett-Holz</Label>
                                                <Input
                                                    id="fretboard_wood"
                                                    value={formData.fretboard_wood}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, fretboard_wood: e.target.value }))}
                                                    placeholder="z.B. Palisander, Ahorn, Ebenholz"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="pickups">Pickups</Label>
                                                <Input
                                                    id="pickups"
                                                    value={formData.pickups}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, pickups: e.target.value }))}
                                                    placeholder="z.B. Fender Custom Shop 60/63"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="electronics">Elektronik</Label>
                                                <Input
                                                    id="electronics"
                                                    value={formData.electronics}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, electronics: e.target.value }))}
                                                    placeholder="z.B. 3-Way Switch, 1 Vol, 2 Tone"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="hardware">Hardware</Label>
                                                <Input
                                                    id="hardware"
                                                    value={formData.hardware}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, hardware: e.target.value }))}
                                                    placeholder="z.B. Fender Vintage Style Tuner"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <Label htmlFor="finish">Finish</Label>
                                                <Input
                                                    id="finish"
                                                    value={formData.finish}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, finish: e.target.value }))}
                                                    placeholder="z.B. 3-Tone Sunburst, Nitrocellulose"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Custom Fields */}
                                    <div className="border-t pt-4 mt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-lg">Eigene Felder</h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    custom_fields: [...(prev.custom_fields || []), { key: '', value: '' }]
                                                }))}
                                            >
                                                + Feld hinzufügen
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {(formData.custom_fields || []).map((field, index) => (
                                                <div key={index} className="flex gap-2 items-end">
                                                    <div className="flex-1">
                                                        <Label htmlFor={`custom-key-${index}`}>Feldname</Label>
                                                        <Input
                                                            id={`custom-key-${index}`}
                                                            value={field.key}
                                                            onChange={(e) => {
                                                                const newFields = [...(formData.custom_fields || [])];
                                                                newFields[index].key = e.target.value;
                                                                setFormData(prev => ({ ...prev, custom_fields: newFields }));
                                                            }}
                                                            placeholder="z.B. Saiten, Stimmmechaniken"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label htmlFor={`custom-value-${index}`}>Wert</Label>
                                                        <Input
                                                            id={`custom-value-${index}`}
                                                            value={field.value}
                                                            onChange={(e) => {
                                                                const newFields = [...(formData.custom_fields || [])];
                                                                newFields[index].value = e.target.value;
                                                                setFormData(prev => ({ ...prev, custom_fields: newFields }));
                                                            }}
                                                            placeholder="z.B. Elixir Nanoweb, Gotoh"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newFields = (formData.custom_fields || []).filter((_, i) => i !== index);
                                                            setFormData(prev => ({ ...prev, custom_fields: newFields }));
                                                        }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
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

                                        {/* Guitar-specific details */}
                                        {listing.category === 'guitars' && (
                                            <>
                                                {formData.body_wood && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Korpus-Holz:</span>
                                                        <span className="text-muted-foreground">{formData.body_wood}</span>
                                                    </div>
                                                )}
                                                {formData.neck_wood && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Hals-Holz:</span>
                                                        <span className="text-muted-foreground">{formData.neck_wood}</span>
                                                    </div>
                                                )}
                                                {formData.fretboard_wood && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Griffbrett-Holz:</span>
                                                        <span className="text-muted-foreground">{formData.fretboard_wood}</span>
                                                    </div>
                                                )}
                                                {formData.pickups && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Pickups:</span>
                                                        <span className="text-muted-foreground">{formData.pickups}</span>
                                                    </div>
                                                )}
                                                {formData.electronics && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Elektronik:</span>
                                                        <span className="text-muted-foreground">{formData.electronics}</span>
                                                    </div>
                                                )}
                                                {formData.hardware && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Hardware:</span>
                                                        <span className="text-muted-foreground">{formData.hardware}</span>
                                                    </div>
                                                )}
                                                {formData.finish && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Finish:</span>
                                                        <span className="text-muted-foreground">{formData.finish}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* Custom fields */}
                                        {(formData.custom_fields || []).filter(field => field.key && field.value).length > 0 && (
                                            <div className="border-t pt-2 mt-2">
                                                <h4 className="font-medium text-xs text-muted-foreground mb-2">Eigene Felder:</h4>
                                                {(formData.custom_fields || [])
                                                    .filter(field => field.key && field.value)
                                                    .map((field, index) => (
                                                        <div key={index} className="flex justify-between">
                                                            <span className="font-medium">{field.key}:</span>
                                                            <span className="text-muted-foreground">{field.value}</span>
                                                        </div>
                                                    ))}
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
