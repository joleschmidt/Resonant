/**
 * Central Type Exports
 */

import type { AccountType, VerificationStatus, UserPreferences, TransactionStatus } from './database';

export type { Database, AccountType, VerificationStatus, UserPreferences, TransactionStatus } from './database';

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

// Messaging Types
export interface Conversation {
  id: string;
  listing_id: string | null;
  created_at: string;
  updated_at: string;
  participants?: Profile[];
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: Profile;
}

// Transaction Types
export interface Transaction {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: TransactionStatus;
  created_at: string;
  completed_at: string | null;
}

// Rating Types
export interface Rating {
  id: string;
  transaction_id: string | null;
  listing_id: string | null;
  rater_id: string;
  rated_user_id: string;
  score: number;
  comment: string | null;
  created_at: string;
  rater?: Profile;
}

