/**
 * Application Constants
 * Based on cursor-rules business logic
 */

// User Account Types
export const ACCOUNT_TYPES = {
  BASIC: 'basic',
  VERIFIED: 'verified',
  PREMIUM: 'premium',
  STORE: 'store',
  ADMIN: 'admin',
} as const;

export type AccountType = (typeof ACCOUNT_TYPES)[keyof typeof ACCOUNT_TYPES];

// Verification Status Levels
export const VERIFICATION_STATUS = {
  UNVERIFIED: 'unverified',
  EMAIL_VERIFIED: 'email_verified',
  PHONE_VERIFIED: 'phone_verified',
  IDENTITY_VERIFIED: 'identity_verified',
  FULLY_VERIFIED: 'fully_verified',
} as const;

export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

// Guitar Brands (Tier Classification)
export const GUITAR_BRANDS = {
  TIER_1: ['Fender', 'Gibson', 'Martin', 'Taylor'],
  TIER_2: ['Ibanez', 'ESP', 'Yamaha', 'PRS'],
  TIER_3: ['Epiphone', 'Squier', 'Jackson', 'Schecter'],
} as const;

// Guitar Types
export const GUITAR_TYPES = {
  ELECTRIC: 'electric',
  ACOUSTIC: 'acoustic',
  CLASSICAL: 'classical',
  BASS: 'bass',
  HOLLOW_BODY: 'hollow_body',
  SEMI_HOLLOW: 'semi_hollow',
  TWELVE_STRING: 'twelve_string',
  BARITONE: 'baritone',
  TRAVEL: 'travel',
  RESONATOR: 'resonator',
} as const;

export type GuitarType = (typeof GUITAR_TYPES)[keyof typeof GUITAR_TYPES];

// Condition Hierarchy
export const CONDITIONS = {
  MINT: 'mint',
  EXCELLENT: 'excellent',
  VERY_GOOD: 'very_good',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  FOR_PARTS: 'for_parts',
} as const;

export type Condition = (typeof CONDITIONS)[keyof typeof CONDITIONS];

// Pricing Rules
export const PRICING = {
  MIN_PRICE: 50,
  MAX_PRICE: 50000,
  SUSPICIOUS_LOW: 100,
  SUSPICIOUS_HIGH: 20000,
  CURRENCY: 'EUR',
  DECIMAL_PLACES: 2,
} as const;

// Listing Status
export const LISTING_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PENDING: 'pending',
  SOLD: 'sold',
  EXPIRED: 'expired',
  REMOVED: 'removed',
  REPORTED: 'reported',
} as const;

export type ListingStatus = (typeof LISTING_STATUS)[keyof typeof LISTING_STATUS];

// User Limits by Account Type
export const ACCOUNT_LIMITS = {
  [ACCOUNT_TYPES.BASIC]: {
    canCreateListings: false,
    maxFavorites: 20,
    canMessage: false,
  },
  [ACCOUNT_TYPES.VERIFIED]: {
    canCreateListings: true,
    maxActiveListings: 5,
    canMessage: true,
  },
  [ACCOUNT_TYPES.PREMIUM]: {
    canCreateListings: true,
    maxActiveListings: 20,
    prioritySupport: true,
    advancedAnalytics: true,
    canMessage: true,
  },
  [ACCOUNT_TYPES.STORE]: {
    canCreateListings: true,
    maxActiveListings: 100,
    bulkOperations: true,
    customBranding: true,
    canMessage: true,
  },
  [ACCOUNT_TYPES.ADMIN]: {
    canCreateListings: true,
    maxActiveListings: Infinity,
    canMessage: true,
    adminAccess: true,
  },
} as const;

