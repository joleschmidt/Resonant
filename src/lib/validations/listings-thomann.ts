/**
 * Thomann Category Listing Validation
 * Updated to use 3-level category hierarchy
 */

import { z } from 'zod';
import {
  PARENT_CATEGORIES,
  INSTRUMENT_CATEGORIES,
  AMPLIFIER_CATEGORIES,
  EFFECTS_ACCESSORIES_CATEGORIES,
  E_GITARREN_SUBCATEGORIES,
  KONZERTGITARREN_SUBCATEGORIES,
  WESTERNGITARREN_SUBCATEGORIES,
  E_BAESSE_SUBCATEGORIES,
  AKUSTIKBAESSE_SUBCATEGORIES,
  UKULELEN_SUBCATEGORIES,
  BLUEGRASS_SUBCATEGORIES,
  TRAVELGITARREN_SUBCATEGORIES,
  SONSTIGE_SAITEN_SUBCATEGORIES,
  E_GITARREN_VERSTAERKER_SUBCATEGORIES,
  BASSVERSTAERKER_SUBCATEGORIES,
  AKUSTIK_VERSTAERKER_SUBCATEGORIES,
  EFFEKTE_SUBCATEGORIES,
  PICKUPS_SUBCATEGORIES,
  SAITEN_SUBCATEGORIES,
  ERSATZTEILE_SUBCATEGORIES,
  ZUBEHOER_SUBCATEGORIES,
  DRAHTLOS_SUBCATEGORIES,
  CONDITIONS,
  LISTING_STATUS,
  PRICING,
  GUITAR_BRANDS,
  AMP_BRANDS,
  EFFECT_BRANDS,
} from '@/utils/constants';

// ============================================================================
// BASE LISTING SCHEMA (Common fields for all listing types)
// ============================================================================

export const baseListingSchema = z.object({
  title: z
    .string()
    .min(10, 'Titel muss mindestens 10 Zeichen lang sein')
    .max(100, 'Titel darf maximal 100 Zeichen lang sein'),

  description: z
    .string()
    .min(50, 'Beschreibung muss mindestens 50 Zeichen lang sein')
    .max(5000, 'Beschreibung darf maximal 5000 Zeichen lang sein'),

  price: z
    .number()
    .min(PRICING.MIN_PRICE, `Preis muss mindestens ${PRICING.MIN_PRICE}€ betragen`)
    .max(PRICING.MAX_PRICE, `Preis darf maximal ${PRICING.MAX_PRICE}€ betragen`)
    .multipleOf(0.01, 'Preis muss auf Cent genau sein'),

  original_price: z
    .number()
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
    CONDITIONS.FOR_PARTS,
  ] as const),

  condition_notes: z
    .string()
    .max(500, 'Zustandsbeschreibung darf maximal 500 Zeichen lang sein')
    .optional(),

  // Thomann 3-level category structure
  parent_category: z.enum([
    PARENT_CATEGORIES.INSTRUMENTS,
    PARENT_CATEGORIES.AMPLIFIERS,
    PARENT_CATEGORIES.EFFECTS_ACCESSORIES,
  ] as const),

  category: z.string().min(1, 'Kategorie ist erforderlich'),

  subcategory: z.string().optional(),

  // Brand and model (common for most items)
  brand: z
    .string()
    .min(1, 'Marke ist erforderlich')
    .max(100, 'Marke darf maximal 100 Zeichen lang sein'),

  model: z
    .string()
    .min(1, 'Modell ist erforderlich')
    .max(100, 'Modell darf maximal 100 Zeichen lang sein'),

  series: z
    .string()
    .max(100, 'Serie darf maximal 100 Zeichen lang sein')
    .optional(),

  year: z
    .number()
    .int('Jahr muss eine ganze Zahl sein')
    .min(1900, 'Jahr muss mindestens 1900 sein')
    .max(2030, 'Jahr darf maximal 2030 sein')
    .optional(),

  country_of_origin: z
    .string()
    .max(100, 'Herkunftsland darf maximal 100 Zeichen lang sein')
    .optional(),

  location_city: z
    .string()
    .min(2, 'Stadt muss mindestens 2 Zeichen lang sein')
    .max(100, 'Stadt darf maximal 100 Zeichen lang sein'),

  location_state: z
    .string()
    .max(100, 'Bundesland darf maximal 100 Zeichen lang sein')
    .optional(),

  location_postal_code: z
    .string()
    .regex(/^\d{5}$/, 'PLZ muss 5 Ziffern haben')
    .optional(),

  shipping_available: z.boolean().default(true),

  shipping_cost: z
    .number()
    .min(0, 'Versandkosten müssen positiv sein')
    .max(500, 'Versandkosten dürfen maximal 500€ betragen')
    .optional(),

  shipping_methods: z.array(z.string()).default(['standard']),

  pickup_available: z.boolean().default(true),

  images: z
    .array(z.string().url('Bild-URL muss gültig sein'))
    .min(1, 'Mindestens ein Bild ist erforderlich')
    .max(10, 'Maximal 10 Bilder erlaubt'),

  videos: z
    .array(z.string().url('Video-URL muss gültig sein'))
    .max(3, 'Maximal 3 Videos erlaubt')
    .optional(),

  case_included: z.boolean().default(false),

  accessories: z
    .array(z.string())
    .max(20, 'Maximal 20 Zubehör-Artikel')
    .optional(),

  tags: z
    .array(
      z
        .string()
        .min(1, 'Tag darf nicht leer sein')
        .max(30, 'Tag darf maximal 30 Zeichen lang sein')
    )
    .max(10, 'Maximal 10 Tags erlaubt')
    .optional(),

  status: z
    .enum([
      LISTING_STATUS.DRAFT,
      LISTING_STATUS.ACTIVE,
      LISTING_STATUS.PENDING,
      LISTING_STATUS.SOLD,
      LISTING_STATUS.EXPIRED,
      LISTING_STATUS.REMOVED,
      LISTING_STATUS.REPORTED,
    ] as const)
    .optional(),

  // Additional specifications (flexible JSONB field)
  specifications: z.record(z.any()).optional(),
});

// ============================================================================
// BRAND VALIDATION HELPERS
// ============================================================================

const getAllGuitarBrands = () => [
  ...GUITAR_BRANDS.TIER_1,
  ...GUITAR_BRANDS.TIER_2,
  ...GUITAR_BRANDS.TIER_3,
];

const getAllAmpBrands = () => [
  ...AMP_BRANDS.TIER_1,
  ...AMP_BRANDS.TIER_2,
  ...AMP_BRANDS.TIER_3,
];

const getAllEffectBrands = () => [
  ...EFFECT_BRANDS.TIER_1,
  ...EFFECT_BRANDS.TIER_2,
  ...EFFECT_BRANDS.TIER_3,
];

// ============================================================================
// PRICE VALIDATION WITH SUSPICIOUS DETECTION
// ============================================================================

export function validatePrice(
  price: number,
  brand: string,
  category: string
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Suspicious low price
  if (price < PRICING.SUSPICIOUS_LOW) {
    warnings.push(`Preis ungewöhnlich niedrig (unter €${PRICING.SUSPICIOUS_LOW})`);
  }

  // Suspicious high price
  if (price > PRICING.SUSPICIOUS_HIGH) {
    warnings.push(`Preis ungewöhnlich hoch (über €${PRICING.SUSPICIOUS_HIGH})`);
  }

  // Brand-specific validation
  const tier1Brands = [
    ...GUITAR_BRANDS.TIER_1,
    ...AMP_BRANDS.TIER_1,
    ...EFFECT_BRANDS.TIER_1,
  ];

  if (tier1Brands.includes(brand) && price < 200) {
    warnings.push(`Preis ungewöhnlich niedrig für Premium-Marke "${brand}"`);
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

// ============================================================================
// CREATE LISTING SCHEMA
// ============================================================================

export const createListingSchema = baseListingSchema;

// ============================================================================
// UPDATE LISTING SCHEMA (All fields optional)
// ============================================================================

export const updateListingSchema = baseListingSchema.partial();

// ============================================================================
// SEARCH AND FILTER SCHEMAS
// ============================================================================

export const listingFiltersSchema = z.object({
  parent_category: z
    .enum([
      PARENT_CATEGORIES.INSTRUMENTS,
      PARENT_CATEGORIES.AMPLIFIERS,
      PARENT_CATEGORIES.EFFECTS_ACCESSORIES,
    ] as const)
    .optional(),

  category: z.string().optional(),

  subcategory: z.string().optional(),

  search: z
    .string()
    .max(100, 'Suchbegriff darf maximal 100 Zeichen lang sein')
    .optional(),

  price_min: z
    .number()
    .min(PRICING.MIN_PRICE, `Mindestpreis muss mindestens ${PRICING.MIN_PRICE}€ betragen`)
    .optional(),

  price_max: z
    .number()
    .max(PRICING.MAX_PRICE, `Höchstpreis darf maximal ${PRICING.MAX_PRICE}€ betragen`)
    .optional(),

  condition: z
    .array(
      z.enum([
        CONDITIONS.MINT,
        CONDITIONS.EXCELLENT,
        CONDITIONS.VERY_GOOD,
        CONDITIONS.GOOD,
        CONDITIONS.FAIR,
        CONDITIONS.POOR,
        CONDITIONS.FOR_PARTS,
      ] as const)
    )
    .optional(),

  location_city: z
    .string()
    .max(100, 'Stadt darf maximal 100 Zeichen lang sein')
    .optional(),

  location_postal_code: z.string().regex(/^\d{5}$/, 'PLZ muss 5 Ziffern haben').optional(),

  radius: z.number().min(0).max(500).optional(), // km

  brand: z.array(z.string()).optional(),

  year_min: z
    .number()
    .int('Jahr muss eine ganze Zahl sein')
    .min(1900, 'Jahr muss mindestens 1900 sein')
    .optional(),

  year_max: z
    .number()
    .int('Jahr muss eine ganze Zahl sein')
    .max(2030, 'Jahr darf maximal 2030 sein')
    .optional(),

  shipping_available: z.boolean().optional(),

  pickup_available: z.boolean().optional(),

  sort_by: z.enum(['newest', 'price_asc', 'price_desc', 'distance', 'relevance']).optional(),
});

export const listingSortSchema = z.object({
  field: z.enum(['created_at', 'price', 'title', 'views']),
  direction: z.enum(['asc', 'desc']),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type BaseListingData = z.infer<typeof baseListingSchema>;
export type CreateListingData = z.infer<typeof createListingSchema>;
export type UpdateListingData = z.infer<typeof updateListingSchema>;
export type ListingFiltersData = z.infer<typeof listingFiltersSchema>;
export type ListingSortData = z.infer<typeof listingSortSchema>;

