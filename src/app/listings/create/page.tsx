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

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return selectedCategory !== '';
            case 2:
                // Details step - check category-specific required fields
                if (selectedCategory === LISTING_CATEGORIES.GUITARS) {
                    const hasRequiredFields = formData.guitar_details?.brand &&
                        formData.guitar_details?.model &&
                        formData.guitar_details?.guitar_type &&
                        formData.condition;

                    // If relic is checked, relic_level must be selected
                    const relicValid = !formData.guitar_details?.has_relic || formData.guitar_details?.relic_level;

                    return hasRequiredFields && relicValid;
                } else if (selectedCategory === LISTING_CATEGORIES.AMPS) {
                    return formData.amp_details?.brand &&
                        formData.amp_details?.model &&
                        formData.amp_details?.amp_type;
                } else if (selectedCategory === LISTING_CATEGORIES.EFFECTS) {
                    return formData.effect_details?.brand &&
                        formData.effect_details?.model &&
                        formData.effect_details?.effect_type;
                }
                return false;
            case 3:
                // Grunddaten step
                return formData.title &&
                    formData.description &&
                    formData.price &&
                    formData.price > 0;
            case 4:
                // Bilder step
                return images.length > 0;
            case 5:
                // Ort & Versand step
                return formData.location_city &&
                    (formData.shipping_available || formData.pickup_available);
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (currentStep < 6 && isStepValid()) {
            // Auto-fill title when moving to step 3 (Grunddaten)
            if (currentStep === 2) {
                let suggestedTitle = '';

                if (selectedCategory === LISTING_CATEGORIES.GUITARS && formData.guitar_details) {
                    const { brand, model, color, relic_level } = formData.guitar_details;
                    let relicText = '';
                    if (relic_level) {
                        switch (relic_level) {
                            case 'nos':
                                relicText = 'NOS';
                                break;
                            case 'closet_classic':
                                relicText = 'Closet Classic';
                                break;
                            case 'journeyman':
                                relicText = 'Journeyman Relic';
                                break;
                            case 'relic':
                                relicText = 'Relic';
                                break;
                            case 'heavy_relic':
                                relicText = 'Heavy Relic';
                                break;
                            default:
                                relicText = relic_level;
                        }
                    }
                    suggestedTitle = [brand, model, relicText, color].filter(Boolean).join(' ');
                } else if (selectedCategory === LISTING_CATEGORIES.AMPS && formData.amp_details) {
                    const { brand, model, color } = formData.amp_details;
                    suggestedTitle = [brand, model, color].filter(Boolean).join(' ');
                } else if (selectedCategory === LISTING_CATEGORIES.EFFECTS && formData.effect_details) {
                    const { brand, model, color } = formData.effect_details;
                    suggestedTitle = [brand, model, color].filter(Boolean).join(' ');
                }

                if (suggestedTitle && !formData.title) {
                    setFormData(prev => ({ ...prev, title: suggestedTitle }));
                }
            }

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

            // Prepare data for API
            const listingData = {
                category: selectedCategory,
                title: formData.title,
                description: formData.description,
                price: formData.price,
                original_price: formData.original_price,
                price_negotiable: formData.price_negotiable,
                condition: formData.condition,
                condition_notes: formData.condition_notes,
                location_city: formData.location_city,
                location_state: formData.location_state,
                location_postal_code: formData.location_postal_code,
                shipping_available: formData.shipping_available,
                shipping_cost: formData.shipping_cost,
                shipping_methods: formData.shipping_methods,
                pickup_available: formData.pickup_available,
                images: uploadedImageUrls,
                videos: formData.videos || [],
                case_included: formData.case_included,
                accessories: formData.accessories || [],
                tags: formData.tags || [],
                status: 'active'
            };

            // Add category-specific details
            if (selectedCategory === LISTING_CATEGORIES.GUITARS && formData.guitar_details) {
                Object.assign(listingData, {
                    brand: formData.guitar_details.brand,
                    model: formData.guitar_details.model,
                    series: formData.guitar_details.series,
                    year: formData.guitar_details.year,
                    country_of_origin: formData.guitar_details.country_of_origin,
                    guitar_type: formData.guitar_details.guitar_type,
                    specifications: formData.guitar_details.specifications || {}
                });
            } else if (selectedCategory === LISTING_CATEGORIES.AMPS && formData.amp_details) {
                Object.assign(listingData, {
                    brand: formData.amp_details.brand,
                    model: formData.amp_details.model,
                    series: formData.amp_details.series,
                    year: formData.amp_details.year,
                    country_of_origin: formData.amp_details.country_of_origin,
                    amp_type: formData.amp_details.amp_type,
                    wattage: formData.amp_details.wattage,
                    speaker_config: formData.amp_details.speaker_config,
                    channels: formData.amp_details.channels,
                    effects_loop: formData.amp_details.effects_loop,
                    reverb: formData.amp_details.reverb,
                    headphone_out: formData.amp_details.headphone_out,
                    specifications: formData.amp_details.specifications || {}
                });
            } else if (selectedCategory === LISTING_CATEGORIES.EFFECTS && formData.effect_details) {
                Object.assign(listingData, {
                    brand: formData.effect_details.brand,
                    model: formData.effect_details.model,
                    series: formData.effect_details.series,
                    year: formData.effect_details.year,
                    country_of_origin: formData.effect_details.country_of_origin,
                    effect_type: formData.effect_details.effect_type,
                    true_bypass: formData.effect_details.true_bypass,
                    power_supply: formData.effect_details.power_supply,
                    stereo: formData.effect_details.stereo,
                    midi: formData.effect_details.midi,
                    expression_pedal: formData.effect_details.expression_pedal,
                    specifications: formData.effect_details.specifications || {}
                });
            }

            // Debug: Log the data being sent
            console.log('Sending listing data:', listingData);

            // Then create the listing
            const response = await fetch('/api/listings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(listingData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(errorData.error || 'Failed to create listing');
            }

            const result = await response.json();
            console.log('Listing created successfully:', result);
            router.push(`/listings/${result.id}`);
        } catch (error) {
            console.error('Error creating listing:', error);
            setErrors({ submit: `Fehler beim Erstellen der Anzeige: ${error.message}` });
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
                                className={`cursor-pointer hover:shadow-lg transition-all ${selectedCategory === LISTING_CATEGORIES.GUITARS
                                    ? 'ring-2 ring-primary bg-primary/5 border-primary'
                                    : 'hover:shadow-lg'
                                    }`}
                                onClick={() => handleCategorySelect(LISTING_CATEGORIES.GUITARS)}
                            >
                                <CardContent className="p-6 text-center">
                                    <div className="text-4xl mb-4">🎸</div>
                                    <h3 className="text-lg font-semibold mb-2">Gitarre</h3>
                                    <p className="text-sm text-muted-foreground">
                                        E-Gitarren, Akustikgitarren, Bass, Klassik
                                    </p>
                                    {selectedCategory === LISTING_CATEGORIES.GUITARS && (
                                        <div className="mt-2 text-primary font-medium text-sm">
                                            ✓ Ausgewählt
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card
                                className={`cursor-pointer hover:shadow-lg transition-all ${selectedCategory === LISTING_CATEGORIES.AMPS
                                    ? 'ring-2 ring-primary bg-primary/5 border-primary'
                                    : 'hover:shadow-lg'
                                    }`}
                                onClick={() => handleCategorySelect(LISTING_CATEGORIES.AMPS)}
                            >
                                <CardContent className="p-6 text-center">
                                    <div className="text-4xl mb-4">🔊</div>
                                    <h3 className="text-lg font-semibold mb-2">Verstärker</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Röhrenamps, Transistoramps, Combo, Head, Cabinet
                                    </p>
                                    {selectedCategory === LISTING_CATEGORIES.AMPS && (
                                        <div className="mt-2 text-primary font-medium text-sm">
                                            ✓ Ausgewählt
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card
                                className={`cursor-pointer hover:shadow-lg transition-all ${selectedCategory === LISTING_CATEGORIES.EFFECTS
                                    ? 'ring-2 ring-primary bg-primary/5 border-primary'
                                    : 'hover:shadow-lg'
                                    }`}
                                onClick={() => handleCategorySelect(LISTING_CATEGORIES.EFFECTS)}
                            >
                                <CardContent className="p-6 text-center">
                                    <div className="text-4xl mb-4">🎛️</div>
                                    <h3 className="text-lg font-semibold mb-2">Effekte</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Verzerrer, Delay, Reverb, Modulation, Multi-Effekte
                                    </p>
                                    {selectedCategory === LISTING_CATEGORIES.EFFECTS && (
                                        <div className="mt-2 text-primary font-medium text-sm">
                                            ✓ Ausgewählt
                                        </div>
                                    )}
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
                                            <label className="text-sm font-medium">Farbe</label>
                                            <input
                                                type="text"
                                                placeholder="z.B. Sunburst, Schwarz, Weiß"
                                                className="w-full mt-1 p-3 border rounded-lg"
                                                value={formData.guitar_details?.color || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    guitar_details: {
                                                        ...prev.guitar_details,
                                                        color: e.target.value
                                                    }
                                                }))}
                                            />

                                            <div className="mt-4 space-y-3">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id="relic"
                                                        checked={formData.guitar_details?.has_relic || false}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            guitar_details: {
                                                                ...prev.guitar_details,
                                                                has_relic: e.target.checked,
                                                                relic_level: e.target.checked ? prev.guitar_details?.relic_level : undefined
                                                            }
                                                        }))}
                                                    />
                                                    <label htmlFor="relic" className="text-sm font-medium">Relic (Vintage-Aging)</label>
                                                </div>

                                                {formData.guitar_details?.has_relic && (
                                                    <div>
                                                        <label className="text-sm font-medium">Relic-Stufe *</label>
                                                        <select
                                                            className="w-full mt-1 p-3 border rounded-lg"
                                                            value={formData.guitar_details?.relic_level || ''}
                                                            onChange={(e) => setFormData(prev => ({
                                                                ...prev,
                                                                guitar_details: {
                                                                    ...prev.guitar_details,
                                                                    relic_level: e.target.value
                                                                }
                                                            }))}
                                                        >
                                                            <option value="">Wähle eine Relic-Stufe</option>
                                                            <option value="nos">NOS (New Old Stock)</option>
                                                            <option value="closet_classic">Closet Classic</option>
                                                            <option value="journeyman">Journeyman Relic</option>
                                                            <option value="relic">Relic</option>
                                                            <option value="heavy_relic">Heavy Relic / Super Heavy Relic</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
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
                                            <label className="text-sm font-medium">Farbe</label>
                                            <input
                                                type="text"
                                                placeholder="z.B. Schwarz, Braun, Weiß"
                                                className="w-full mt-1 p-3 border rounded-lg"
                                                value={formData.amp_details?.color || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    amp_details: {
                                                        ...prev.amp_details,
                                                        color: e.target.value
                                                    }
                                                }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
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
                                        <div>
                                            {/* Empty div for grid layout */}
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

                                    <div className="grid grid-cols-2 gap-4">
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
                                        <div>
                                            <label className="text-sm font-medium">Farbe</label>
                                            <input
                                                type="text"
                                                placeholder="z.B. Schwarz, Orange, Gelb"
                                                className="w-full mt-1 p-3 border rounded-lg"
                                                value={formData.effect_details?.color || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    effect_details: {
                                                        ...prev.effect_details,
                                                        color: e.target.value
                                                    }
                                                }))}
                                            />
                                        </div>
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
                                    {/* Images Preview */}
                                    {images.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-semibold mb-3">Bilder ({images.length})</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                {images.map((file, index) => (
                                                    <div key={index} className="relative group">
                                                        <div className="aspect-square rounded-lg overflow-hidden bg-muted border">
                                                            <img
                                                                src={URL.createObjectURL(file)}
                                                                alt={`Preview ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        {/* Image Number Badge */}
                                                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                                            {index + 1}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

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
            {currentStep > 1 && (
                <div className="flex items-center justify-between mt-8">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                    >
                        Zurück
                    </Button>

                    <div className="flex gap-2">
                        {currentStep < 6 ? (
                            <Button
                                onClick={handleNext}
                                disabled={!isStepValid()}
                            >
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
            )}

            {/* Validation Hints */}
            {!isStepValid() && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 text-sm">
                        {currentStep === 1 && "Bitte wähle eine Kategorie aus"}
                        {currentStep === 2 && "Bitte fülle alle Pflichtfelder aus (mit * markiert)"}
                        {currentStep === 3 && "Bitte fülle Titel, Beschreibung und Preis aus"}
                        {currentStep === 4 && "Bitte lade mindestens ein Bild hoch"}
                        {currentStep === 5 && "Bitte gib deinen Standort an und wähle mindestens eine Versandoption"}
                    </p>
                </div>
            )}

            {/* Error Display */}
            {errors.submit && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive">{errors.submit}</p>
                </div>
            )}
        </div>
    );
}
