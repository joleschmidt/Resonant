/**
 * Fraud Detection Heuristics
 * Anti-scam system for Resonant marketplace
 */

import { PRICING, GUITAR_BRANDS, AMP_BRANDS, EFFECT_BRANDS } from '@/utils/constants';

// ============================================================================
// TYPES
// ============================================================================

export interface FraudScore {
  score: number; // 0-100, higher = more suspicious
  flags: FraudFlag[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface FraudFlag {
  type: FraudFlagType;
  severity: 'low' | 'medium' | 'high';
  message: string;
  details?: Record<string, any>;
}

export type FraudFlagType =
  | 'price_too_low'
  | 'price_too_high'
  | 'price_brand_mismatch'
  | 'new_account_high_value'
  | 'duplicate_images'
  | 'contact_info_in_description'
  | 'external_payment_request'
  | 'suspicious_location_changes'
  | 'many_listings_same_day'
  | 'fake_urgency'
  | 'too_good_to_be_true';

// ============================================================================
// PRICE VALIDATION
// ============================================================================

export function detectSuspiciousPrice(
  brand: string,
  price: number,
  category: string
): FraudFlag[] {
  const flags: FraudFlag[] = [];

  // General price thresholds
  if (price < PRICING.SUSPICIOUS_LOW) {
    flags.push({
      type: 'price_too_low',
      severity: 'medium',
      message: `Preis ungewöhnlich niedrig (€${price} ist unter dem Schwellenwert von €${PRICING.SUSPICIOUS_LOW})`,
      details: { price, threshold: PRICING.SUSPICIOUS_LOW },
    });
  }

  if (price > PRICING.SUSPICIOUS_HIGH) {
    flags.push({
      type: 'price_too_high',
      severity: 'low',
      message: `Preis ungewöhnlich hoch (€${price} ist über dem Schwellenwert von €${PRICING.SUSPICIOUS_HIGH})`,
      details: { price, threshold: PRICING.SUSPICIOUS_HIGH },
    });
  }

  // Brand-specific validation
  const premiumBrands = [
    ...GUITAR_BRANDS.TIER_1,
    ...AMP_BRANDS.TIER_1,
    ...EFFECT_BRANDS.TIER_1,
  ];

  if (premiumBrands.includes(brand)) {
    // Premium brand priced too low (likely scam)
    if (price < 200) {
      flags.push({
        type: 'price_brand_mismatch',
        severity: 'high',
        message: `Preis verdächtig niedrig für Premium-Marke "${brand}" (€${price})`,
        details: { brand, price, expectedMin: 200 },
      });
    }
  }

  // Too good to be true (extremely low compared to typical market prices)
  const tier1AndTier2 = [
    ...GUITAR_BRANDS.TIER_1,
    ...GUITAR_BRANDS.TIER_2,
    ...AMP_BRANDS.TIER_1,
    ...AMP_BRANDS.TIER_2,
  ];

  if (tier1AndTier2.includes(brand) && price < 100) {
    flags.push({
      type: 'too_good_to_be_true',
      severity: 'high',
      message: `Preis deutlich zu niedrig für Marke "${brand}" - möglicher Betrug`,
      details: { brand, price },
    });
  }

  return flags;
}

// ============================================================================
// ACCOUNT AGE & HIGH VALUE DETECTION
// ============================================================================

export function detectNewAccountHighValue(
  accountAgeInDays: number,
  listingPrice: number,
  listingCount: number
): FraudFlag[] {
  const flags: FraudFlag[] = [];

  // New account (< 7 days) with high-value listing
  if (accountAgeInDays < 7 && listingPrice > 1000) {
    flags.push({
      type: 'new_account_high_value',
      severity: 'high',
      message: `Neues Konto (${accountAgeInDays} Tage alt) mit hochwertigem Angebot (€${listingPrice})`,
      details: { accountAge: accountAgeInDays, price: listingPrice },
    });
  }

  // Many listings on same day from new account
  if (accountAgeInDays < 30 && listingCount > 10) {
    flags.push({
      type: 'many_listings_same_day',
      severity: 'medium',
      message: `Viele Anzeigen (${listingCount}) von neuem Konto (${accountAgeInDays} Tage alt)`,
      details: { accountAge: accountAgeInDays, listingCount },
    });
  }

  return flags;
}

// ============================================================================
// DUPLICATE IMAGE DETECTION
// ============================================================================

export async function detectDuplicateImages(
  imageUrls: string[],
  userId: string
): Promise<FraudFlag[]> {
  const flags: FraudFlag[] = [];

  // This would require image hashing and database lookup
  // Placeholder for implementation with actual image hash comparison
  // TODO: Implement with perceptual hashing (pHash) and database storage

  // For now, check if URLs are from suspicious sources or exact duplicates
  const suspiciousDomains = ['imgur.com', 'tinypic.com', 'photobucket.com'];
  const hasSuspiciousDomain = imageUrls.some((url) =>
    suspiciousDomains.some((domain) => url.includes(domain))
  );

  if (hasSuspiciousDomain) {
    flags.push({
      type: 'duplicate_images',
      severity: 'low',
      message: 'Bilder von öffentlicher Bildplattform (nicht Originalbilder?)',
      details: { imageCount: imageUrls.length },
    });
  }

  return flags;
}

// ============================================================================
// CONTACT INFO IN TEXT DETECTION
// ============================================================================

export function detectContactInfoInText(text: string): FraudFlag[] {
  const flags: FraudFlag[] = [];

  // Phone number patterns
  const phonePatterns = [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // 123-456-7890
    /\b\d{4}[-.\s]?\d{7}\b/g, // 0123-4567890
    /\b\+?49[-.\s]?\d{3}[-.\s]?\d{7,8}\b/g, // +49-123-4567890
    /\b0\d{3}[-.\s]?\d{7,8}\b/g, // 0123-4567890
  ];

  const hasPhoneNumber = phonePatterns.some((pattern) => pattern.test(text));

  if (hasPhoneNumber) {
    flags.push({
      type: 'contact_info_in_description',
      severity: 'medium',
      message: 'Telefonnummer in Beschreibung gefunden - Kontakt sollte über Plattform erfolgen',
    });
  }

  // Email patterns
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  if (emailPattern.test(text)) {
    flags.push({
      type: 'contact_info_in_description',
      severity: 'medium',
      message: 'E-Mail-Adresse in Beschreibung gefunden - Kontakt sollte über Plattform erfolgen',
    });
  }

  // External payment mentions (common scam patterns)
  const externalPaymentKeywords = [
    'paypal',
    'freunde',
    'familie',
    'vorkasse',
    'western union',
    'moneygram',
    'überweisung',
    'bargeld',
    'nur überweisung',
  ];

  const lowerText = text.toLowerCase();
  const hasExternalPayment = externalPaymentKeywords.some((keyword) =>
    lowerText.includes(keyword)
  );

  if (hasExternalPayment) {
    flags.push({
      type: 'external_payment_request',
      severity: 'high',
      message: 'Hinweis auf externe Zahlung gefunden - möglicher Betrugsversuch',
    });
  }

  // Urgency/pressure tactics (common scam pattern)
  const urgencyKeywords = [
    'schnell',
    'heute noch',
    'letzte chance',
    'nur heute',
    'begrenzte zeit',
    'sofort',
    'dringend',
  ];

  const hasUrgency =
    urgencyKeywords.filter((keyword) => lowerText.includes(keyword)).length >= 2;

  if (hasUrgency) {
    flags.push({
      type: 'fake_urgency',
      severity: 'low',
      message: 'Dringlichkeits-Sprache erkannt - sei vorsichtig bei Druckausübung',
    });
  }

  return flags;
}

// ============================================================================
// SUSPICIOUS LOCATION CHANGES
// ============================================================================

export function detectSuspiciousLocationChanges(
  locationHistory: Array<{ location: string; timestamp: Date }>
): FraudFlag[] {
  const flags: FraudFlag[] = [];

  if (locationHistory.length >= 3) {
    // Check if location changed frequently (more than once in 7 days)
    const recentChanges = locationHistory.filter(
      (entry) => Date.now() - entry.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
    );

    if (recentChanges.length >= 2) {
      flags.push({
        type: 'suspicious_location_changes',
        severity: 'medium',
        message: `Standort wurde kürzlich ${recentChanges.length}x geändert`,
        details: { changes: recentChanges.length, days: 7 },
      });
    }
  }

  return flags;
}

// ============================================================================
// COMPREHENSIVE FRAUD SCORE CALCULATION
// ============================================================================

export function calculateFraudScore(flags: FraudFlag[]): FraudScore {
  let score = 0;

  // Weight by severity
  flags.forEach((flag) => {
    switch (flag.severity) {
      case 'low':
        score += 10;
        break;
      case 'medium':
        score += 25;
        break;
      case 'high':
        score += 50;
        break;
    }
  });

  // Cap at 100
  score = Math.min(score, 100);

  // Determine risk level
  let riskLevel: FraudScore['riskLevel'];
  if (score >= 75) {
    riskLevel = 'critical';
  } else if (score >= 50) {
    riskLevel = 'high';
  } else if (score >= 25) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (flags.some((f) => f.type === 'price_too_low' || f.type === 'price_brand_mismatch')) {
    recommendations.push('Preis mit Marktpreisen vergleichen');
    recommendations.push('Nach Originalfotos fragen');
  }

  if (flags.some((f) => f.type === 'contact_info_in_description')) {
    recommendations.push('Nur über die Plattform kommunizieren');
  }

  if (flags.some((f) => f.type === 'external_payment_request')) {
    recommendations.push('⚠️ NIEMALS Vorkasse an Fremde zahlen');
    recommendations.push('Nur sichere Zahlungsmethoden verwenden');
  }

  if (flags.some((f) => f.type === 'new_account_high_value')) {
    recommendations.push('Verkäufer-Profil genau prüfen');
    recommendations.push('Bei Zweifel: persönliche Abholung bevorzugen');
  }

  return {
    score,
    flags,
    riskLevel,
    recommendations,
  };
}

// ============================================================================
// MAIN FRAUD DETECTION FUNCTION
// ============================================================================

export async function analyzeListing(params: {
  title: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  images: string[];
  userId: string;
  accountAgeInDays: number;
  userListingCount: number;
  locationHistory?: Array<{ location: string; timestamp: Date }>;
}): Promise<FraudScore> {
  const allFlags: FraudFlag[] = [];

  // 1. Check price
  allFlags.push(...detectSuspiciousPrice(params.brand, params.price, params.category));

  // 2. Check account age vs listing value
  allFlags.push(
    ...detectNewAccountHighValue(
      params.accountAgeInDays,
      params.price,
      params.userListingCount
    )
  );

  // 3. Check for contact info in text
  allFlags.push(...detectContactInfoInText(params.title + ' ' + params.description));

  // 4. Check for duplicate images (async)
  allFlags.push(...(await detectDuplicateImages(params.images, params.userId)));

  // 5. Check location changes
  if (params.locationHistory && params.locationHistory.length > 0) {
    allFlags.push(...detectSuspiciousLocationChanges(params.locationHistory));
  }

  // Calculate final score
  return calculateFraudScore(allFlags);
}
