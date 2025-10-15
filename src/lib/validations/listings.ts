/**
 * Zod Validation Schemas for Listings
 * Multi-category validation for Guitars, Amps, and Effects
 */

import { z } from 'zod';
import {
    LISTING_CATEGORIES,
    GUITAR_TYPES,
    AMP_TYPES,
    EFFECT_TYPES,
    CONDITIONS,
    LISTING_STATUS,
    PRICING
} from '@/utils/constants';

// Base listing schema (common fields)
export const baseListingSchema = z.object({
    title: z.string()
        .min(10, 'Titel muss mindestens 10 Zeichen lang sein')
        .max(100, 'Titel darf maximal 100 Zeichen lang sein'),

    description: z.string()
        .min(50, 'Beschreibung muss mindestens 50 Zeichen lang sein')
        .max(5000, 'Beschreibung darf maximal 5000 Zeichen lang sein'),

    price: z.number()
        .min(PRICING.MIN_PRICE, `Preis muss mindestens ${PRICING.MIN_PRICE}€ betragen`)
        .max(PRICING.MAX_PRICE, `Preis darf maximal ${PRICING.MAX_PRICE}€ betragen`)
        .multipleOf(0.01, 'Preis muss auf Cent genau sein'),

    original_price: z.number()
        .min(0, 'Originalpreis muss positiv sein')
        .max(PRICING.MAX_PRICE, `Originalpreis darf maximal ${PRICING.MAX_PRICE}€ betragen`)
        .optional(),

    price_negotiable: z.boolean().default(false),

    condition: z.enum([
        CONDITIONS.MINT,
        CONDITIONS.EXCELLENT,
        CONDITIONS.VERY_GOOD,
        CONDITIONS.GOOD,
        CONDITIONS.FAIR,
        CONDITIONS.POOR,
        CONDITIONS.FOR_PARTS
    ] as const),

    condition_notes: z.string()
        .max(500, 'Zustandsbeschreibung darf maximal 500 Zeichen lang sein')
        .optional(),

    location_city: z.string()
        .min(2, 'Stadt muss mindestens 2 Zeichen lang sein')
        .max(100, 'Stadt darf maximal 100 Zeichen lang sein'),

    location_state: z.string()
        .max(100, 'Bundesland darf maximal 100 Zeichen lang sein')
        .optional(),

    location_postal_code: z.string()
        .regex(/^\d{5}$/, 'PLZ muss 5 Ziffern haben')
        .optional(),

    shipping_available: z.boolean().default(true),

    shipping_cost: z.number()
        .min(0, 'Versandkosten müssen positiv sein')
        .max(500, 'Versandkosten dürfen maximal 500€ betragen')
        .optional(),

    shipping_methods: z.array(z.string()).default(['standard']),

    pickup_available: z.boolean().default(true),

    images: z.array(z.string().url('Bild-URL muss gültig sein'))
        .min(1, 'Mindestens ein Bild ist erforderlich')
        .max(10, 'Maximal 10 Bilder erlaubt'),

    videos: z.array(z.string().url('Video-URL muss gültig sein'))
        .max(3, 'Maximal 3 Videos erlaubt')
        .optional(),

    case_included: z.boolean().default(false),

    accessories: z.array(z.string())
        .max(20, 'Maximal 20 Zubehör-Artikel')
        .optional(),

    tags: z.array(z.string()
        .min(1, 'Tag darf nicht leer sein')
        .max(30, 'Tag darf maximal 30 Zeichen lang sein')
    )
        .max(10, 'Maximal 10 Tags erlaubt')
        .optional(),

    status: z.enum([
        LISTING_STATUS.DRAFT,
        LISTING_STATUS.ACTIVE,
        LISTING_STATUS.PENDING,
        LISTING_STATUS.SOLD,
        LISTING_STATUS.EXPIRED,
        LISTING_STATUS.REMOVED,
        LISTING_STATUS.REPORTED
    ] as const).optional(),
});

// Guitar-specific schema
export const guitarDetailsSchema = z.object({
    brand: z.string()
        .min(1, 'Marke ist erforderlich')
        .max(100, 'Marke darf maximal 100 Zeichen lang sein'),

    model: z.string()
        .min(1, 'Modell ist erforderlich')
        .max(100, 'Modell darf maximal 100 Zeichen lang sein'),

    series: z.string()
        .max(100, 'Serie darf maximal 100 Zeichen lang sein')
        .optional(),

    year: z.number()
        .int('Jahr muss eine ganze Zahl sein')
        .min(1900, 'Jahr muss mindestens 1900 sein')
        .max(2030, 'Jahr darf maximal 2030 sein')
        .optional(),

    country_of_origin: z.string()
        .max(100, 'Herkunftsland darf maximal 100 Zeichen lang sein')
        .optional(),

    guitar_type: z.enum([
        GUITAR_TYPES.ELECTRIC,
        GUITAR_TYPES.ACOUSTIC,
        GUITAR_TYPES.CLASSICAL,
        GUITAR_TYPES.BASS,
        GUITAR_TYPES.HOLLOW_BODY,
        GUITAR_TYPES.SEMI_HOLLOW,
        GUITAR_TYPES.TWELVE_STRING,
        GUITAR_TYPES.BARITONE,
        GUITAR_TYPES.TRAVEL,
        GUITAR_TYPES.RESONATOR
    ] as const),

    specifications: z.record(z.any()).optional(),
});

// Amp-specific schema
export const ampDetailsSchema = z.object({
    brand: z.string()
        .min(1, 'Marke ist erforderlich')
        .max(100, 'Marke darf maximal 100 Zeichen lang sein'),

    model: z.string()
        .min(1, 'Modell ist erforderlich')
        .max(100, 'Modell darf maximal 100 Zeichen lang sein'),

    series: z.string()
        .max(100, 'Serie darf maximal 100 Zeichen lang sein')
        .optional(),

    year: z.number()
        .int('Jahr muss eine ganze Zahl sein')
        .min(1900, 'Jahr muss mindestens 1900 sein')
        .max(2030, 'Jahr darf maximal 2030 sein')
        .optional(),

    country_of_origin: z.string()
        .max(100, 'Herkunftsland darf maximal 100 Zeichen lang sein')
        .optional(),

    amp_type: z.enum([
        AMP_TYPES.TUBE,
        AMP_TYPES.SOLID_STATE,
        AMP_TYPES.HYBRID,
        AMP_TYPES.MODELING,
        AMP_TYPES.COMBO,
        AMP_TYPES.HEAD,
        AMP_TYPES.CABINET
    ] as const),

    wattage: z.number()
        .int('Wattzahl muss eine ganze Zahl sein')
        .min(1, 'Wattzahl muss mindestens 1 sein')
        .max(1000, 'Wattzahl darf maximal 1000 sein')
        .optional(),

    speaker_config: z.string()
        .max(50, 'Lautsprecher-Konfiguration darf maximal 50 Zeichen lang sein')
        .optional(),

    channels: z.number()
        .int('Kanalanzahl muss eine ganze Zahl sein')
        .min(1, 'Mindestens 1 Kanal erforderlich')
        .max(10, 'Maximal 10 Kanäle')
        .default(1),

    effects_loop: z.boolean().default(false),

    reverb: z.boolean().default(false),

    headphone_out: z.boolean().default(false),

    specifications: z.record(z.any()).optional(),
});

// Effect-specific schema
export const effectDetailsSchema = z.object({
    brand: z.string()
        .min(1, 'Marke ist erforderlich')
        .max(100, 'Marke darf maximal 100 Zeichen lang sein'),

    model: z.string()
        .min(1, 'Modell ist erforderlich')
        .max(100, 'Modell darf maximal 100 Zeichen lang sein'),

    series: z.string()
        .max(100, 'Serie darf maximal 100 Zeichen lang sein')
        .optional(),

    year: z.number()
        .int('Jahr muss eine ganze Zahl sein')
        .min(1900, 'Jahr muss mindestens 1900 sein')
        .max(2030, 'Jahr darf maximal 2030 sein')
        .optional(),

    country_of_origin: z.string()
        .max(100, 'Herkunftsland darf maximal 100 Zeichen lang sein')
        .optional(),

    effect_type: z.enum([
        EFFECT_TYPES.DISTORTION,
        EFFECT_TYPES.OVERDRIVE,
        EFFECT_TYPES.FUZZ,
        EFFECT_TYPES.BOOST,
        EFFECT_TYPES.COMPRESSOR,
        EFFECT_TYPES.EQ,
        EFFECT_TYPES.DELAY,
        EFFECT_TYPES.REVERB,
        EFFECT_TYPES.CHORUS,
        EFFECT_TYPES.FLANGER,
        EFFECT_TYPES.PHASER,
        EFFECT_TYPES.TREMOLO,
        EFFECT_TYPES.WAH,
        EFFECT_TYPES.PITCH_SHIFTER,
        EFFECT_TYPES.HARMONIZER,
        EFFECT_TYPES.LOOPER,
        EFFECT_TYPES.MULTI_EFFECT
    ] as const),

    true_bypass: z.boolean().default(false),

    power_supply: z.string()
        .max(50, 'Stromversorgung darf maximal 50 Zeichen lang sein')
        .optional(),

    stereo: z.boolean().default(false),

    midi: z.boolean().default(false),

    expression_pedal: z.boolean().default(false),

    specifications: z.record(z.any()).optional(),
});

// Complete schemas for each category
export const createGuitarListingSchema = baseListingSchema.extend({
    category: z.literal(LISTING_CATEGORIES.GUITARS),
}).merge(guitarDetailsSchema);

export const createAmpListingSchema = baseListingSchema.extend({
    category: z.literal(LISTING_CATEGORIES.AMPS),
}).merge(ampDetailsSchema);

export const createEffectListingSchema = baseListingSchema.extend({
    category: z.literal(LISTING_CATEGORIES.EFFECTS),
}).merge(effectDetailsSchema);

// Union schema for all listing types
export const createListingSchema = z.discriminatedUnion('category', [
    createGuitarListingSchema,
    createAmpListingSchema,
    createEffectListingSchema,
]);

// Update listing schema (all fields optional)
export const updateListingSchema = z.object({
    title: z.string()
        .min(10, 'Titel muss mindestens 10 Zeichen lang sein')
        .max(100, 'Titel darf maximal 100 Zeichen lang sein')
        .optional(),

    description: z.string()
        .min(50, 'Beschreibung muss mindestens 50 Zeichen lang sein')
        .max(5000, 'Beschreibung darf maximal 5000 Zeichen lang sein')
        .optional(),

    price: z.number()
        .min(PRICING.MIN_PRICE, `Preis muss mindestens ${PRICING.MIN_PRICE}€ betragen`)
        .max(PRICING.MAX_PRICE, `Preis darf maximal ${PRICING.MAX_PRICE}€ betragen`)
        .multipleOf(0.01, 'Preis muss auf Cent genau sein')
        .optional(),

    original_price: z.number()
        .min(0, 'Originalpreis muss positiv sein')
        .max(PRICING.MAX_PRICE, `Originalpreis darf maximal ${PRICING.MAX_PRICE}€ betragen`)
        .optional(),

    price_negotiable: z.boolean().optional(),

    condition: z.enum([
        CONDITIONS.MINT,
        CONDITIONS.EXCELLENT,
        CONDITIONS.VERY_GOOD,
        CONDITIONS.GOOD,
        CONDITIONS.FAIR,
        CONDITIONS.POOR,
        CONDITIONS.FOR_PARTS
    ] as const).optional(),

    condition_notes: z.string()
        .max(500, 'Zustandsbeschreibung darf maximal 500 Zeichen lang sein')
        .optional(),

    status: z.enum([
        LISTING_STATUS.DRAFT,
        LISTING_STATUS.ACTIVE,
        LISTING_STATUS.PENDING,
        LISTING_STATUS.SOLD,
        LISTING_STATUS.EXPIRED,
        LISTING_STATUS.REMOVED,
        LISTING_STATUS.REPORTED
    ] as const).optional(),

    location_city: z.string()
        .min(2, 'Stadt muss mindestens 2 Zeichen lang sein')
        .max(100, 'Stadt darf maximal 100 Zeichen lang sein')
        .optional(),

    location_state: z.string()
        .max(100, 'Bundesland darf maximal 100 Zeichen lang sein')
        .optional(),

    location_postal_code: z.string()
        .regex(/^\d{5}$/, 'PLZ muss 5 Ziffern haben')
        .optional(),

    shipping_available: z.boolean().optional(),

    shipping_cost: z.number()
        .min(0, 'Versandkosten müssen positiv sein')
        .max(500, 'Versandkosten dürfen maximal 500€ betragen')
        .optional(),

    shipping_methods: z.array(z.string()).optional(),

    pickup_available: z.boolean().optional(),

    images: z.array(z.string().url('Bild-URL muss gültig sein'))
        .min(1, 'Mindestens ein Bild ist erforderlich')
        .max(10, 'Maximal 10 Bilder erlaubt')
        .optional(),

    videos: z.array(z.string().url('Video-URL muss gültig sein'))
        .max(3, 'Maximal 3 Videos erlaubt')
        .optional(),

    case_included: z.boolean().optional(),

    accessories: z.array(z.string())
        .max(20, 'Maximal 20 Zubehör-Artikel')
        .optional(),

    tags: z.array(z.string()
        .min(1, 'Tag darf nicht leer sein')
        .max(30, 'Tag darf maximal 30 Zeichen lang sein')
    )
        .max(10, 'Maximal 10 Tags erlaubt')
        .optional(),
});

// Search and filter schemas
export const listingFiltersSchema = z.object({
    category: z.enum([
        LISTING_CATEGORIES.GUITARS,
        LISTING_CATEGORIES.AMPS,
        LISTING_CATEGORIES.EFFECTS
    ] as const).optional(),

    search: z.string().max(100, 'Suchbegriff darf maximal 100 Zeichen lang sein').optional(),

    price_min: z.number()
        .min(PRICING.MIN_PRICE, `Mindestpreis muss mindestens ${PRICING.MIN_PRICE}€ betragen`)
        .optional(),

    price_max: z.number()
        .max(PRICING.MAX_PRICE, `Höchstpreis darf maximal ${PRICING.MAX_PRICE}€ betragen`)
        .optional(),

    condition: z.array(z.enum([
        CONDITIONS.MINT,
        CONDITIONS.EXCELLENT,
        CONDITIONS.VERY_GOOD,
        CONDITIONS.GOOD,
        CONDITIONS.FAIR,
        CONDITIONS.POOR,
        CONDITIONS.FOR_PARTS
    ] as const)).optional(),

    location_city: z.string().max(100, 'Stadt darf maximal 100 Zeichen lang sein').optional(),

    brand: z.array(z.string()).optional(),

    guitar_type: z.array(z.enum([
        GUITAR_TYPES.ELECTRIC,
        GUITAR_TYPES.ACOUSTIC,
        GUITAR_TYPES.CLASSICAL,
        GUITAR_TYPES.BASS,
        GUITAR_TYPES.HOLLOW_BODY,
        GUITAR_TYPES.SEMI_HOLLOW,
        GUITAR_TYPES.TWELVE_STRING,
        GUITAR_TYPES.BARITONE,
        GUITAR_TYPES.TRAVEL,
        GUITAR_TYPES.RESONATOR
    ] as const)).optional(),

    amp_type: z.array(z.enum([
        AMP_TYPES.TUBE,
        AMP_TYPES.SOLID_STATE,
        AMP_TYPES.HYBRID,
        AMP_TYPES.MODELING,
        AMP_TYPES.COMBO,
        AMP_TYPES.HEAD,
        AMP_TYPES.CABINET
    ] as const)).optional(),

    effect_type: z.array(z.enum([
        EFFECT_TYPES.DISTORTION,
        EFFECT_TYPES.OVERDRIVE,
        EFFECT_TYPES.FUZZ,
        EFFECT_TYPES.BOOST,
        EFFECT_TYPES.COMPRESSOR,
        EFFECT_TYPES.EQ,
        EFFECT_TYPES.DELAY,
        EFFECT_TYPES.REVERB,
        EFFECT_TYPES.CHORUS,
        EFFECT_TYPES.FLANGER,
        EFFECT_TYPES.PHASER,
        EFFECT_TYPES.TREMOLO,
        EFFECT_TYPES.WAH,
        EFFECT_TYPES.PITCH_SHIFTER,
        EFFECT_TYPES.HARMONIZER,
        EFFECT_TYPES.LOOPER,
        EFFECT_TYPES.MULTI_EFFECT
    ] as const)).optional(),

    year_min: z.number()
        .int('Jahr muss eine ganze Zahl sein')
        .min(1900, 'Jahr muss mindestens 1900 sein')
        .optional(),

    year_max: z.number()
        .int('Jahr muss eine ganze Zahl sein')
        .max(2030, 'Jahr darf maximal 2030 sein')
        .optional(),

    shipping_available: z.boolean().optional(),

    pickup_available: z.boolean().optional(),
});

export const listingSortSchema = z.object({
    field: z.enum(['created_at', 'price', 'title', 'views']),
    direction: z.enum(['asc', 'desc']),
});

// Type exports
export type BaseListingData = z.infer<typeof baseListingSchema>;
export type GuitarDetailsData = z.infer<typeof guitarDetailsSchema>;
export type AmpDetailsData = z.infer<typeof ampDetailsSchema>;
export type EffectDetailsData = z.infer<typeof effectDetailsSchema>;
export type CreateGuitarListingData = z.infer<typeof createGuitarListingSchema>;
export type CreateAmpListingData = z.infer<typeof createAmpListingSchema>;
export type CreateEffectListingData = z.infer<typeof createEffectListingSchema>;
export type CreateListingData = z.infer<typeof createListingSchema>;
export type UpdateListingData = z.infer<typeof updateListingSchema>;
export type ListingFiltersData = z.infer<typeof listingFiltersSchema>;
export type ListingSortData = z.infer<typeof listingSortSchema>;
