/**
 * Trust Score Calculation
 * Determines user trustworthiness for anti-scam purposes
 */

import { VERIFICATION_STATUS } from '@/utils/constants';

// ============================================================================
// TYPES
// ============================================================================

export interface TrustScoreResult {
  score: number; // 0-100
  level: 'unverified' | 'basic' | 'verified' | 'trusted' | 'premium';
  badges: TrustBadge[];
  warnings: string[];
}

export interface TrustBadge {
  id: string;
  label: string;
  icon: string;
  verified: boolean;
  weight: number; // Contribution to trust score
}

export interface UserTrustData {
  // Verification
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  mfaEnabled: boolean;

  // Account metrics
  accountAgeInDays: number;
  totalSales: number;
  totalPurchases: number;
  sellerRating: number;
  buyerRating: number;

  // Activity
  activeListings: number;
  completedTransactions: number;
  responseRate: number; // 0-100
  responseTimeHours: number;

  // Flags
  reportCount: number;
  disputeCount: number;
  cancelledTransactions: number;
}

// ============================================================================
// TRUST BADGE DEFINITIONS
// ============================================================================

const TRUST_BADGES: Record<string, Omit<TrustBadge, 'verified'>> = {
  email: {
    id: 'email',
    label: 'E-Mail verifiziert',
    icon: '✅',
    weight: 10,
  },
  phone: {
    id: 'phone',
    label: 'Telefon verifiziert',
    icon: '📱',
    weight: 15,
  },
  identity: {
    id: 'identity',
    label: 'Identität verifiziert',
    icon: '🆔',
    weight: 25,
  },
  mfa: {
    id: 'mfa',
    label: 'Zwei-Faktor-Authentifizierung',
    icon: '🔒',
    weight: 10,
  },
  experienced: {
    id: 'experienced',
    label: 'Erfahrener Nutzer',
    icon: '⭐',
    weight: 15,
  },
  topRated: {
    id: 'topRated',
    label: 'Top bewertet',
    icon: '🏆',
    weight: 20,
  },
  fastResponder: {
    id: 'fastResponder',
    label: 'Schnelle Antworten',
    icon: '⚡',
    weight: 5,
  },
  longTimeMember: {
    id: 'longTimeMember',
    label: 'Langjähriges Mitglied',
    icon: '📅',
    weight: 10,
  },
};

// ============================================================================
// TRUST SCORE CALCULATION
// ============================================================================

export function calculateTrustScore(data: UserTrustData): TrustScoreResult {
  let score = 0;
  const badges: TrustBadge[] = [];
  const warnings: string[] = [];

  // 1. Verification badges
  if (data.emailVerified) {
    badges.push({ ...TRUST_BADGES.email, verified: true });
    score += TRUST_BADGES.email.weight;
  } else {
    warnings.push('E-Mail nicht verifiziert');
  }

  if (data.phoneVerified) {
    badges.push({ ...TRUST_BADGES.phone, verified: true });
    score += TRUST_BADGES.phone.weight;
  }

  if (data.identityVerified) {
    badges.push({ ...TRUST_BADGES.identity, verified: true });
    score += TRUST_BADGES.identity.weight;
  }

  if (data.mfaEnabled) {
    badges.push({ ...TRUST_BADGES.mfa, verified: true });
    score += TRUST_BADGES.mfa.weight;
  }

  // 2. Account age
  if (data.accountAgeInDays >= 365) {
    // 1+ years
    badges.push({ ...TRUST_BADGES.longTimeMember, verified: true });
    score += TRUST_BADGES.longTimeMember.weight;
  }

  // 3. Transaction history
  const totalTransactions = data.totalSales + data.totalPurchases;
  if (totalTransactions >= 10) {
    badges.push({ ...TRUST_BADGES.experienced, verified: true });
    score += TRUST_BADGES.experienced.weight;
  }

  // 4. Ratings
  const averageRating = (data.sellerRating + data.buyerRating) / 2;
  if (averageRating >= 4.5 && totalTransactions >= 5) {
    badges.push({ ...TRUST_BADGES.topRated, verified: true });
    score += TRUST_BADGES.topRated.weight;
  }

  // 5. Response metrics
  if (data.responseRate >= 90 && data.responseTimeHours <= 6) {
    badges.push({ ...TRUST_BADGES.fastResponder, verified: true });
    score += TRUST_BADGES.fastResponder.weight;
  }

  // 6. Negative factors (reduce score)
  if (data.reportCount > 0) {
    score -= data.reportCount * 10;
    warnings.push(`${data.reportCount} Meldung(en)`);
  }

  if (data.disputeCount > 0) {
    score -= data.disputeCount * 15;
    warnings.push(`${data.disputeCount} Streitfall(fälle)`);
  }

  if (data.cancelledTransactions > 3) {
    score -= data.cancelledTransactions * 5;
  }

  // 7. New account penalty
  if (data.accountAgeInDays < 7) {
    score -= 20;
    warnings.push('Sehr neues Konto (unter 7 Tage)');
  } else if (data.accountAgeInDays < 30) {
    score -= 10;
    warnings.push('Neues Konto (unter 30 Tage)');
  }

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine trust level
  let level: TrustScoreResult['level'];
  if (score >= 80) {
    level = 'premium';
  } else if (score >= 60) {
    level = 'trusted';
  } else if (score >= 40) {
    level = 'verified';
  } else if (score >= 20) {
    level = 'basic';
  } else {
    level = 'unverified';
  }

  return {
    score,
    level,
    badges,
    warnings,
  };
}

// ============================================================================
// ACCOUNT AGE FORMATTER
// ============================================================================

export function formatAccountAge(accountAgeInDays: number): string {
  if (accountAgeInDays < 1) {
    return 'Neu';
  } else if (accountAgeInDays < 30) {
    return `${accountAgeInDays} Tag(e)`;
  } else if (accountAgeInDays < 365) {
    const months = Math.floor(accountAgeInDays / 30);
    return `${months} Monat(e)`;
  } else {
    const years = Math.floor(accountAgeInDays / 365);
    return `${years} Jahr(e)`;
  }
}

// ============================================================================
// VERIFICATION LEVEL CHECK
// ============================================================================

export function getVerificationLevel(data: Pick<UserTrustData, 'emailVerified' | 'phoneVerified' | 'identityVerified'>): string {
  if (data.identityVerified) {
    return VERIFICATION_STATUS.FULLY_VERIFIED;
  } else if (data.phoneVerified) {
    return VERIFICATION_STATUS.PHONE_VERIFIED;
  } else if (data.emailVerified) {
    return VERIFICATION_STATUS.EMAIL_VERIFIED;
  } else {
    return VERIFICATION_STATUS.UNVERIFIED;
  }
}

// ============================================================================
// TRUST LEVEL COLORS
// ============================================================================

export function getTrustLevelColor(level: TrustScoreResult['level']): string {
  const colors = {
    unverified: 'text-gray-500',
    basic: 'text-blue-500',
    verified: 'text-green-500',
    trusted: 'text-emerald-600',
    premium: 'text-amber-500',
  };
  return colors[level];
}

export function getTrustLevelBgColor(level: TrustScoreResult['level']): string {
  const colors = {
    unverified: 'bg-gray-100',
    basic: 'bg-blue-50',
    verified: 'bg-green-50',
    trusted: 'bg-emerald-50',
    premium: 'bg-amber-50',
  };
  return colors[level];
}
