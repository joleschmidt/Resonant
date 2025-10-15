/**
 * Create Listing Page
 * Multi-step form for creating listings in all categories
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye, Send } from 'lucide-react';
import { ImageUploader } from '@/components/features/listings/ImageUploader';
import { LISTING_CATEGORIES } from '@/utils/constants';
import type { CreateListingRequest } from '@/types/listings';

export default function CreateListingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [formData, setFormData] = useState<Partial<CreateListingRequest>>({});
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const steps = [
        { id: 1, title: 'Kategorie wählen', description: 'Wähle die Kategorie für deine Anzeige' },
        { id: 2, title: 'Details', description: 'Spezifische Details je nach Kategorie' },
        { id: 3, title: 'Grunddaten', description: 'Titel, Beschreibung und Preis' },
        { id: 4, title: 'Bilder', description: 'Lade Bilder deines Instruments hoch' },
        { id: 5, title: 'Ort & Versand', description: 'Standort und Versandoptionen' },
        { id: 6, title: 'Vorschau', description: 'Überprüfe deine Anzeige vor der Veröffentlichung' }
    ];

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        setFormData(prev => ({ ...prev, category }));
        setCurrentStep(2); // Details step comes after category selection
    };

    const handleNext = () => {
        if (currentStep < 6) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSaveDraft = async () => {
        setLoading(true);
        try {
            // TODO: Implement draft saving
            console.log('Saving draft...', { ...formData, images });
        } catch (error) {
            console.error('Error saving draft:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        setLoading(true);
        try {
            // First upload images
            const uploadedImageUrls: string[] = [];

            if (images.length > 0) {
                const uploadPromises = images.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await fetch('/api/upload/listing-images', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Upload fehlgeschlagen');
                    }

                    const data = await response.json();
                    return data.url;
                });

                uploadedImageUrls.push(...(await Promise.all(uploadPromises)));
            }

            // Then create the listing
            const response = await fetch('/api/listings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    images: uploadedImageUrls,
                    status: 'active'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create listing');
            }

            const result = await response.json();
            router.push(`/listings/${result.id}`);
        } catch (error) {
            console.error('Error creating listing:', error);
            setErrors({ submit: 'Fehler beim Erstellen der Anzeige' });
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2">Was möchtest du verkaufen?</h2>
                            <p className="text-muted-foreground">
                                Wähle die Kategorie, die am besten zu deinem Instrument passt
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => handleCategorySelect(LISTING_CATEGORIES.GUITARS)}
                            >
                                <CardContent className="p-6 text-center">
                                    <div className="text-4xl mb-4">🎸</div>
                                    <h3 className="text-lg font-semibold mb-2">Gitarre</h3>
                                    <p className="text-sm text-muted-foreground">
                                        E-Gitarren, Akustikgitarren, Bass, Klassik
                                    </p>
                                </CardContent>
                            </Card>

                            <Card
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => handleCategorySelect(LISTING_CATEGORIES.AMPS)}
                            >
                                <CardContent className="p-6 text-center">
                                    <div className="text-4xl mb-4">🔊</div>
                                    <h3 className="text-lg font-semibold mb-2">Verstärker</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Röhrenamps, Transistoramps, Combo, Head, Cabinet
                                    </p>
                                </CardContent>
                            </Card>

                            <Card
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => handleCategorySelect(LISTING_CATEGORIES.EFFECTS)}
                            >
                                <CardContent className="p-6 text-center">
                                    <div className="text-4xl mb-4">🎛️</div>
                                    <h3 className="text-lg font-semibold mb-2">Effekte</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Verzerrer, Delay, Reverb, Modulation, Multi-Effekte
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Spezifische Details</h2>
                            <p className="text-muted-foreground">
                                Ergänze kategorie-spezifische Informationen
                            </p>
                        </div>

                        <div className="space-y-4">
                            {selectedCategory === LISTING_CATEGORIES.GUITARS && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Marke *</label>
                                            <input
                                                type="text"
                                                placeholder="z.B. Fender, Gibson, Ibanez"
                                                className="w-full mt-1 p-3 border rounded-lg"
                                                value={formData.guitar_details?.brand || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    guitar_details: {
                                                        ...prev.guitar_details,
                                                        brand: e.target.value
                                                    }
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Modell *</label>
                                            <input
                                                type="text"
                                                placeholder="z.B. Stratocaster, Les Paul"
                                                className="w-full mt-1 p-3 border rounded-lg"
                                                value={formData.guitar_details?.model || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    guitar_details: {
                                                        ...prev.guitar_details,
                                                        model: e.target.value
                                                    }
                                                }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Gitarrentyp *</label>
                                            <select
                                                className="w-full mt-1 p-3 border rounded-lg"
                                                value={formData.guitar_details?.guitar_type || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    guitar_details: {
                                                        ...prev.guitar_details,
                                                        guitar_type: e.target.value
                                                    }
                                                }))}
                                            >
                                                <option value="">Wähle einen Typ</option>
                                                <option value="electric">E-Gitarre</option>
                                                <option value="acoustic">Akustikgitarre</option>
                                                <option value="bass">Bass</option>
                                                <option value="classical">Klassikgitarre</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Baujahr</label>
                                            <input
                                                type="number"
                                                placeholder="1995"
                                                className="w-full mt-1 p-3 border rounded-lg"
                                                value={formData.guitar_details?.year || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    guitar_details: {
                                                        ...prev.guitar_details,
                                                        year: parseInt(e.target.value) || undefined
                                                    }
                                                }))}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Zustand *</label>
                                        <select
                                            className="w-full mt-1 p-3 border rounded-lg"
                                            value={formData.condition || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                                        >
                                            <option value="">Wähle den Zustand</option>
                                            <option value="new">Neu</option>
                                            <option value="excellent">Sehr gut</option>
                                            <option value="good">Gut</option>
                                            <option value="fair">Befriedigend</option>
                                            <option value="poor">Schlecht</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {selectedCategory === LISTING_CATEGORIES.AMPS && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Marke *</label>
                                            <input
                                                type="text"
                                                placeholder="z.B. Marshall, Fender, Orange"
                                                className="w-full mt-1 p-3 border rounded-lg"
                                                value={formData.amp_details?.brand || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    amp_details: {
                                                        ...prev.amp_details,
                                                        brand: e.target.value
                                                    }
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Modell *</label>
                                            <input
                                                type="text"
                                                placeholder="z.B. JCM800, Twin Reverb"
                                                className="w-full mt-1 p-3 border rounded-lg"
                                                value={formData.amp_details?.model || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    amp_details: {
                                                        ...prev.amp_details,
                                                        model: e.target.value
                                                    }
                                                }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Amptyp *</label>
                                            <select
                                                className="w-full mt-1 p-3 border rounded-lg"
                                                value={formData.amp_details?.amp_type || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    amp_details: {
                                                        ...prev.amp_details,
                                                        amp_type: e.target.value
                                                    }
                                                }))}
                                            >
                                                <option value="">Wähle einen Typ</option>
                                                <option value="tube">Röhrenamp</option>
                                                <option value="solid_state">Transistoramp</option>
                                                <option value="hybrid">Hybrid</option>
                                                <option value="modeling">Modeling</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Leistung (Watt)</label>
                                            <input
                                                type="number"
                                                placeholder="50"
                                                className="w-full mt-1 p-3 border rounded-lg"
                                                value={formData.amp_details?.wattage || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    amp_details: {
                                                        ...prev.amp_details,
                                                        wattage: parseInt(e.target.value) || undefined
                                                    }
                                                }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedCategory === LISTING_CATEGORIES.EFFECTS && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Marke *</label>
                                            <input
                                                type="text"
                                                placeholder="z.B. Boss, Electro-Harmonix, Strymon"
                                                className="w-full mt-1 p-3 border rounded-lg"
                                                value={formData.effect_details?.brand || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    effect_details: {
                                                        ...prev.effect_details,
                                                        brand: e.target.value
                                                    }
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Modell *</label>
                                            <input
                                                type="text"
                                                placeholder="z.B. DS-1, Big Muff, Timeline"
                                                className="w-full mt-1 p-3 border rounded-lg"
                                                value={formData.effect_details?.model || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    effect_details: {
                                                        ...prev.effect_details,
                                                        model: e.target.value
                                                    }
                                                }))}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Effekttyp *</label>
                                        <select
                                            className="w-full mt-1 p-3 border rounded-lg"
                                            value={formData.effect_details?.effect_type || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                effect_details: {
                                                    ...prev.effect_details,
                                                    effect_type: e.target.value
                                                }
                                            }))}
                                        >
                                            <option value="">Wähle einen Typ</option>
                                            <option value="distortion">Verzerrer</option>
                                            <option value="overdrive">Overdrive</option>
                                            <option value="delay">Delay</option>
                                            <option value="reverb">Reverb</option>
                                            <option value="modulation">Modulation</option>
                                            <option value="multi">Multi-Effekt</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Grunddaten</h2>
                            <p className="text-muted-foreground">
                                Beschreibe dein Instrument und setze einen Preis
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Titel *</label>
                                <input
                                    type="text"
                                    placeholder="z.B. Fender Stratocaster 1995, sehr guter Zustand"
                                    className="w-full mt-1 p-3 border rounded-lg"
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Beschreibung *</label>
                                <textarea
                                    placeholder="Beschreibe dein Instrument detailliert..."
                                    rows={4}
                                    className="w-full mt-1 p-3 border rounded-lg"
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Preis (€) *</label>
                                    <input
                                        type="number"
                                        placeholder="500"
                                        className="w-full mt-1 p-3 border rounded-lg"
                                        value={formData.price || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Originalpreis (€)</label>
                                    <input
                                        type="number"
                                        placeholder="800"
                                        className="w-full mt-1 p-3 border rounded-lg"
                                        value={formData.original_price || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="negotiable"
                                    checked={formData.price_negotiable || false}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price_negotiable: e.target.checked }))}
                                />
                                <label htmlFor="negotiable" className="text-sm">Preis verhandelbar</label>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Bilder hochladen</h2>
                            <p className="text-muted-foreground">
                                Lade mindestens ein Bild deines Instruments hoch
                            </p>
                        </div>

                        <ImageUploader
                            images={images}
                            onImagesChange={setImages}
                            maxImages={10}
                            disabled={loading}
                        />
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Ort & Versand</h2>
                            <p className="text-muted-foreground">
                                Wo befindet sich das Instrument und wie kann es abgeholt/versendet werden?
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Stadt *</label>
                                <input
                                    type="text"
                                    placeholder="Berlin"
                                    className="w-full mt-1 p-3 border rounded-lg"
                                    value={formData.location_city || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location_city: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Bundesland</label>
                                    <input
                                        type="text"
                                        placeholder="Berlin"
                                        className="w-full mt-1 p-3 border rounded-lg"
                                        value={formData.location_state || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, location_state: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">PLZ</label>
                                    <input
                                        type="text"
                                        placeholder="10115"
                                        className="w-full mt-1 p-3 border rounded-lg"
                                        value={formData.location_postal_code || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, location_postal_code: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="shipping"
                                        checked={formData.shipping_available || false}
                                        onChange={(e) => setFormData(prev => ({ ...prev, shipping_available: e.target.checked }))}
                                    />
                                    <label htmlFor="shipping" className="text-sm">Versand möglich</label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="pickup"
                                        checked={formData.pickup_available || false}
                                        onChange={(e) => setFormData(prev => ({ ...prev, pickup_available: e.target.checked }))}
                                    />
                                    <label htmlFor="pickup" className="text-sm">Abholung möglich</label>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Vorschau</h2>
                            <p className="text-muted-foreground">
                                Überprüfe deine Anzeige vor der Veröffentlichung
                            </p>
                        </div>

                        <Card>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-semibold">{formData.title}</h3>
                                        <p className="text-2xl font-bold text-primary">
                                            {formData.price ? `${formData.price}€` : 'Preis nicht festgelegt'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-muted-foreground">{formData.description}</p>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>📍 {formData.location_city}</span>
                                        {formData.shipping_available && <span>🚚 Versand</span>}
                                        {formData.pickup_available && <span>👤 Abholung</span>}
                                    </div>

                                    <div className="flex gap-2">
                                        <Badge variant="outline">{selectedCategory}</Badge>
                                        {formData.price_negotiable && <Badge variant="outline">Verhandlungsbasis</Badge>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Zurück
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Anzeige erstellen</h1>
                        <p className="text-muted-foreground">
                            Schritt {currentStep} von {steps.length}: {steps[currentStep - 1]?.title}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        Entwurf speichern
                    </Button>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center">
                            <div className="flex items-center">
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                    ${currentStep >= step.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                    }
                                `}>
                                    {step.id}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`
                                        w-16 h-1 mx-2
                                        ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}
                                    `} />
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <p className={`text-xs font-medium ${currentStep === step.id ? 'text-primary' : 'text-muted-foreground'
                                    }`}>
                                    {step.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <Card>
                <CardContent className="p-6">
                    {renderStepContent()}
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                >
                    Zurück
                </Button>

                <div className="flex gap-2">
                    {currentStep < 6 ? (
                        <Button onClick={handleNext}>
                            Weiter
                        </Button>
                    ) : (
                        <Button onClick={handlePublish} disabled={loading} className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            {loading ? 'Wird veröffentlicht...' : 'Veröffentlichen'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {errors.submit && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive">{errors.submit}</p>
                </div>
            )}
        </div>
    );
}
