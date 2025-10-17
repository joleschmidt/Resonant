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

export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

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
      listings: {
        Row: {
          id: string;
          seller_id: string;
          category: 'guitars' | 'amps' | 'effects';
          title: string;
          description: string;
          slug: string | null;
          price: number;
          original_price: number | null;
          price_negotiable: boolean;
          condition: string;
          condition_notes: string | null;
          status: string;
          location_city: string;
          location_state: string | null;
          location_country: string;
          location_postal_code: string | null;
          shipping_available: boolean;
          shipping_cost: number | null;
          shipping_methods: string[];
          pickup_available: boolean;
          images: string[];
          videos: string[];
          case_included: boolean;
          accessories: string[];
          tags: string[];
          views: number;
          favorites_count: number;
          inquiries_count: number;
          search_vector: string | null;
          created_at: string;
          updated_at: string;
          published_at: string | null;
          sold_at: string | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          seller_id: string;
          category: 'guitars' | 'amps' | 'effects';
          title: string;
          description: string;
          slug?: string | null;
          price: number;
          original_price?: number | null;
          price_negotiable?: boolean;
          condition: string;
          condition_notes?: string | null;
          status?: string;
          location_city: string;
          location_state?: string | null;
          location_country?: string;
          location_postal_code?: string | null;
          shipping_available?: boolean;
          shipping_cost?: number | null;
          shipping_methods?: string[];
          pickup_available?: boolean;
          images?: string[];
          videos?: string[];
          case_included?: boolean;
          accessories?: string[];
          tags?: string[];
          views?: number;
          favorites_count?: number;
          inquiries_count?: number;
          search_vector?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          sold_at?: string | null;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          seller_id?: string;
          category?: 'guitars' | 'amps' | 'effects';
          title?: string;
          description?: string;
          slug?: string | null;
          price?: number;
          original_price?: number | null;
          price_negotiable?: boolean;
          condition?: string;
          condition_notes?: string | null;
          status?: string;
          location_city?: string;
          location_state?: string | null;
          location_country?: string;
          location_postal_code?: string | null;
          shipping_available?: boolean;
          shipping_cost?: number | null;
          shipping_methods?: string[];
          pickup_available?: boolean;
          images?: string[];
          videos?: string[];
          case_included?: boolean;
          accessories?: string[];
          tags?: string[];
          views?: number;
          favorites_count?: number;
          inquiries_count?: number;
          search_vector?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          sold_at?: string | null;
          expires_at?: string | null;
        } & Record<string, unknown>;
      };
      guitars_detail: {
        Row: {
          listing_id: string;
          brand: string;
          model: string | null;
          series: string | null;
          year: number | null;
          country_of_origin: string | null;
          guitar_type: string;
          specifications: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          listing_id: string;
          brand: string;
          model?: string | null;
          series?: string | null;
          year?: number | null;
          country_of_origin?: string | null;
          guitar_type: string;
          specifications?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          listing_id?: string;
          brand?: string;
          model?: string | null;
          series?: string | null;
          year?: number | null;
          country_of_origin?: string | null;
          guitar_type?: string;
          specifications?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        } & Record<string, unknown>;
      };
      amps_detail: {
        Row: {
          listing_id: string;
          brand: string;
          model: string | null;
          series: string | null;
          year: number | null;
          country_of_origin: string | null;
          amp_type: string;
          wattage: number | null;
          speaker_config: string | null;
          channels: number;
          effects_loop: boolean;
          reverb: boolean;
          headphone_out: boolean;
          specifications: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          listing_id: string;
          brand: string;
          model?: string | null;
          series?: string | null;
          year?: number | null;
          country_of_origin?: string | null;
          amp_type: string;
          wattage?: number | null;
          speaker_config?: string | null;
          channels?: number;
          effects_loop?: boolean;
          reverb?: boolean;
          headphone_out?: boolean;
          specifications?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          listing_id?: string;
          brand?: string;
          model?: string | null;
          series?: string | null;
          year?: number | null;
          country_of_origin?: string | null;
          amp_type?: string;
          wattage?: number | null;
          speaker_config?: string | null;
          channels?: number;
          effects_loop?: boolean;
          reverb?: boolean;
          headphone_out?: boolean;
          specifications?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        } & Record<string, unknown>;
      };
      effects_detail: {
        Row: {
          listing_id: string;
          brand: string;
          model: string | null;
          series: string | null;
          year: number | null;
          country_of_origin: string | null;
          effect_type: string;
          true_bypass: boolean;
          power_supply: string | null;
          stereo: boolean;
          midi: boolean;
          expression_pedal: boolean;
          specifications: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          listing_id: string;
          brand: string;
          model?: string | null;
          series?: string | null;
          year?: number | null;
          country_of_origin?: string | null;
          effect_type: string;
          true_bypass?: boolean;
          power_supply?: string | null;
          stereo?: boolean;
          midi?: boolean;
          expression_pedal?: boolean;
          specifications?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          listing_id?: string;
          brand?: string;
          model?: string | null;
          series?: string | null;
          year?: number | null;
          country_of_origin?: string | null;
          effect_type?: string;
          true_bypass?: boolean;
          power_supply?: string | null;
          stereo?: boolean;
          midi?: boolean;
          expression_pedal?: boolean;
          specifications?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        } & Record<string, unknown>;
      };
      conversations: {
        Row: {
          id: string;
          listing_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          user_id: string;
          joined_at: string;
          last_read_at: string | null;
        };
        Insert: {
          conversation_id: string;
          user_id: string;
          joined_at?: string;
          last_read_at?: string | null;
        };
        Update: {
          conversation_id?: string;
          user_id?: string;
          joined_at?: string;
          last_read_at?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          read?: boolean;
          created_at?: string;
        };
      };
      followers: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          amount: number;
          status: TransactionStatus;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          amount: number;
          status?: TransactionStatus;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          listing_id?: string;
          buyer_id?: string;
          seller_id?: string;
          amount?: number;
          status?: TransactionStatus;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      ratings: {
        Row: {
          id: string;
          transaction_id: string | null;
          listing_id: string | null;
          rater_id: string;
          rated_user_id: string;
          score: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id?: string | null;
          listing_id?: string | null;
          rater_id: string;
          rated_user_id: string;
          score: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string | null;
          listing_id?: string | null;
          rater_id?: string;
          rated_user_id?: string;
          score?: number;
          comment?: string | null;
          created_at?: string;
        };
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
      listing_category: 'guitars' | 'amps' | 'effects';
      listing_status: 'draft' | 'active' | 'pending' | 'sold' | 'expired' | 'removed' | 'reported';
      transaction_status: TransactionStatus;
      guitar_type: string;
      amp_type: string;
      effect_type: string;
    };
  };
}

