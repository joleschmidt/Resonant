/**
 * Database Types
 * Generated from Supabase schema
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AccountType = 'basic' | 'verified' | 'premium' | 'store' | 'admin';

export type VerificationStatus =
  | 'unverified'
  | 'email_verified'
  | 'phone_verified'
  | 'identity_verified'
  | 'fully_verified';

export interface UserPreferences {
  preferred_brands?: string[];
  preferred_types?: ('electric' | 'acoustic' | 'classical' | 'bass')[];
  price_range?: {
    min: number;
    max: number;
  };
  search_radius?: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
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
          preferences: UserPreferences;
          created_at: string;
          updated_at: string;
          last_active_at: string | null;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          email: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          verification_status?: VerificationStatus;
          account_type?: AccountType;
          seller_rating?: number;
          buyer_rating?: number;
          total_sales?: number;
          total_purchases?: number;
          preferences?: UserPreferences;
          created_at?: string;
          updated_at?: string;
          last_active_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          email?: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          verification_status?: VerificationStatus;
          account_type?: AccountType;
          seller_rating?: number;
          buyer_rating?: number;
          total_sales?: number;
          total_purchases?: number;
          preferences?: UserPreferences | Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
          last_active_at?: string | null;
        } & Record<string, unknown>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      account_type: AccountType;
      verification_status: VerificationStatus;
    };
  };
}

