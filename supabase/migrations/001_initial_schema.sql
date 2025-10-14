-- RESONANT Database Schema - Initial Migration
-- Based on json-schemas specifications

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Types
CREATE TYPE account_type AS ENUM ('basic', 'verified', 'premium', 'store', 'admin');
CREATE TYPE verification_status AS ENUM ('unverified', 'email_verified', 'phone_verified', 'identity_verified', 'fully_verified');

-- Profiles Table
-- Extends auth.users with marketplace-specific data
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT CHECK (char_length(bio) <= 500),
  location TEXT CHECK (char_length(location) <= 100),
  
  -- Verification & Account Status
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  account_type account_type NOT NULL DEFAULT 'basic',
  
  -- Ratings & Statistics
  seller_rating DECIMAL(2,1) DEFAULT 0 CHECK (seller_rating >= 0 AND seller_rating <= 5),
  buyer_rating DECIMAL(2,1) DEFAULT 0 CHECK (buyer_rating >= 0 AND buyer_rating <= 5),
  total_sales INTEGER DEFAULT 0 CHECK (total_sales >= 0),
  total_purchases INTEGER DEFAULT 0 CHECK (total_purchases >= 0),
  
  -- User Preferences (JSON)
  preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  -- Constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

-- Indexes for profiles
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_account_type ON public.profiles(account_type);
CREATE INDEX idx_profiles_verification_status ON public.profiles(verification_status);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    -- Generate temporary username from email
    COALESCE(
      split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 8),
      'user_' || substr(NEW.id::text, 1, 8)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles

-- Public: Anyone can view basic profile info
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Users can insert their own profile (via trigger mainly)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON public.profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND account_type = 'admin'
    )
  );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Comments
COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users with marketplace data';
COMMENT ON COLUMN public.profiles.preferences IS 'User preferences stored as JSON: preferred_brands, preferred_types, price_range, search_radius';
COMMENT ON COLUMN public.profiles.seller_rating IS 'Average seller rating from 0.0 to 5.0';
COMMENT ON COLUMN public.profiles.buyer_rating IS 'Average buyer rating from 0.0 to 5.0';

