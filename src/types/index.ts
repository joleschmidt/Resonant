/**
 * Central Type Exports
 */

import type { AccountType, VerificationStatus, UserPreferences } from './database';

export type { Database, AccountType, VerificationStatus, UserPreferences } from './database';

// Re-export from constants for convenience
export type {
  AccountType as AccountTypeConstant,
  VerificationStatus as VerificationStatusConstant,
  GuitarType,
  Condition,
  ListingStatus,
} from '@/utils/constants';

// Profile Types
export interface Profile {
  id: string;
  username: string;
  username_finalized: boolean;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  verification_status: VerificationStatus;
  account_type: AccountType;
  seller_rating: number;
  buyer_rating: number;
  total_sales: number;
  total_purchases: number;
  preferences: {
    preferred_brands?: string[];
    preferred_types?: string[];
    price_range?: {
      min: number;
      max: number;
    };
    search_radius?: number;
  };
  created_at: string;
  updated_at: string;
  last_active_at: string | null;
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

