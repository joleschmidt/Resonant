-- RESONANT Database Schema - Listings Migration
-- Multi-category listings system for Guitars, Amps, and Effects

-- Custom Types for Listings
CREATE TYPE listing_category AS ENUM ('guitars', 'amps', 'effects');
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'pending', 'sold', 'expired', 'removed', 'reported');
CREATE TYPE guitar_type AS ENUM (
  'electric', 'acoustic', 'classical', 'bass', 'hollow_body',
  'semi_hollow', 'twelve_string', 'baritone', 'travel', 'resonator'
);
CREATE TYPE amp_type AS ENUM (
  'tube', 'solid_state', 'hybrid', 'modeling', 'combo', 'head', 'cabinet'
);
CREATE TYPE effect_type AS ENUM (
  'distortion', 'overdrive', 'fuzz', 'boost', 'compressor', 'eq',
  'delay', 'reverb', 'chorus', 'flanger', 'phaser', 'tremolo',
  'wah', 'pitch_shifter', 'harmonizer', 'looper', 'multi_effect'
);

-- Base Listings Table
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category listing_category NOT NULL,
  
  -- Basic Information
  title TEXT NOT NULL CHECK (char_length(title) >= 10 AND char_length(title) <= 100),
  description TEXT NOT NULL CHECK (char_length(description) >= 50 AND char_length(description) <= 2000),
  slug TEXT UNIQUE,
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL CHECK (price >= 50 AND price <= 50000),
  original_price DECIMAL(10,2) CHECK (original_price >= 0),
  price_negotiable BOOLEAN DEFAULT false,
  
  -- Condition & Status
  condition TEXT NOT NULL CHECK (condition IN ('mint', 'excellent', 'very_good', 'good', 'fair', 'poor', 'for_parts')),
  condition_notes TEXT CHECK (char_length(condition_notes) <= 500),
  status listing_status NOT NULL DEFAULT 'draft',
  
  -- Location
  location_city TEXT NOT NULL CHECK (char_length(location_city) <= 100),
  location_state TEXT CHECK (char_length(location_state) <= 100),
  location_country TEXT DEFAULT 'DE' CHECK (char_length(location_country) = 2),
  location_postal_code TEXT,
  
  -- Shipping
  shipping_available BOOLEAN DEFAULT true,
  shipping_cost DECIMAL(8,2) CHECK (shipping_cost >= 0 AND shipping_cost <= 500),
  shipping_methods TEXT[] DEFAULT ARRAY['standard'],
  pickup_available BOOLEAN DEFAULT true,
  
  -- Media
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  videos TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Additional Info
  case_included BOOLEAN DEFAULT false,
  accessories TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Metrics
  views INTEGER DEFAULT 0 CHECK (views >= 0),
  favorites_count INTEGER DEFAULT 0 CHECK (favorites_count >= 0),
  inquiries_count INTEGER DEFAULT 0 CHECK (inquiries_count >= 0),
  
  -- Search
  search_vector tsvector,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  sold_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Guitar Details Table
CREATE TABLE public.guitars_detail (
  listing_id UUID PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
  
  -- Basic Info
  brand TEXT NOT NULL,
  model TEXT,
  series TEXT,
  year INTEGER CHECK (year >= 1900 AND year <= 2030),
  country_of_origin TEXT,
  guitar_type guitar_type NOT NULL,
  
  -- Specifications (JSONB for flexibility)
  specifications JSONB DEFAULT '{}'::jsonb,
  
  -- Common guitar specs in JSONB:
  -- body_type, body_material, neck_material, fretboard_material,
  -- number_of_frets, scale_length, pickup_configuration,
  -- electronics, hardware, finish, etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Amp Details Table
CREATE TABLE public.amps_detail (
  listing_id UUID PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
  
  -- Basic Info
  brand TEXT NOT NULL,
  model TEXT,
  series TEXT,
  year INTEGER CHECK (year >= 1900 AND year <= 2030),
  country_of_origin TEXT,
  amp_type amp_type NOT NULL,
  
  -- Technical Specs
  wattage INTEGER CHECK (wattage > 0),
  speaker_config TEXT, -- e.g., "1x12", "2x12", "4x10"
  channels INTEGER DEFAULT 1 CHECK (channels > 0),
  effects_loop BOOLEAN DEFAULT false,
  reverb BOOLEAN DEFAULT false,
  headphone_out BOOLEAN DEFAULT false,
  
  -- Specifications (JSONB for flexibility)
  specifications JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Effect Details Table
CREATE TABLE public.effects_detail (
  listing_id UUID PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
  
  -- Basic Info
  brand TEXT NOT NULL,
  model TEXT,
  series TEXT,
  year INTEGER CHECK (year >= 1900 AND year <= 2030),
  country_of_origin TEXT,
  effect_type effect_type NOT NULL,
  
  -- Technical Specs
  true_bypass BOOLEAN DEFAULT false,
  power_supply TEXT, -- e.g., "9V DC", "Battery", "18V DC"
  stereo BOOLEAN DEFAULT false,
  midi BOOLEAN DEFAULT false,
  expression_pedal BOOLEAN DEFAULT false,
  
  -- Specifications (JSONB for flexibility)
  specifications JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for Performance
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX idx_listings_price ON public.listings(price);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX idx_listings_location_city ON public.listings(location_city);
CREATE INDEX idx_listings_search_vector ON public.listings USING GIN(search_vector);

-- Guitar-specific indexes
CREATE INDEX idx_guitars_brand ON public.guitars_detail(brand);
CREATE INDEX idx_guitars_guitar_type ON public.guitars_detail(guitar_type);
CREATE INDEX idx_guitars_year ON public.guitars_detail(year);

-- Amp-specific indexes
CREATE INDEX idx_amps_brand ON public.amps_detail(brand);
CREATE INDEX idx_amps_amp_type ON public.amps_detail(amp_type);
CREATE INDEX idx_amps_wattage ON public.amps_detail(wattage);

-- Effect-specific indexes
CREATE INDEX idx_effects_brand ON public.effects_detail(brand);
CREATE INDEX idx_effects_effect_type ON public.effects_detail(effect_type);

-- Auto-update updated_at timestamps
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guitars_detail_updated_at
  BEFORE UPDATE ON public.guitars_detail
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amps_detail_updated_at
  BEFORE UPDATE ON public.amps_detail
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_effects_detail_updated_at
  BEFORE UPDATE ON public.effects_detail
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_listing_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('german', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('german', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('german', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search vector
CREATE TRIGGER update_listing_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_search_vector();

-- Row Level Security (RLS)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guitars_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amps_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.effects_detail ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listings
CREATE POLICY "Listings are viewable by everyone when active"
  ON public.listings
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can view their own listings"
  ON public.listings
  FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "Verified users can create listings"
  ON public.listings
  FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND account_type IN ('verified', 'premium', 'store', 'admin')
    )
  );

CREATE POLICY "Users can update their own listings"
  ON public.listings
  FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own listings"
  ON public.listings
  FOR DELETE
  USING (auth.uid() = seller_id);

-- RLS Policies for detail tables
CREATE POLICY "Guitar details are viewable with listings"
  ON public.guitars_detail
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id
      AND (status = 'active' OR auth.uid() = seller_id)
    )
  );

CREATE POLICY "Users can manage their guitar details"
  ON public.guitars_detail
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id
      AND auth.uid() = seller_id
    )
  );

CREATE POLICY "Amp details are viewable with listings"
  ON public.amps_detail
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id
      AND (status = 'active' OR auth.uid() = seller_id)
    )
  );

CREATE POLICY "Users can manage their amp details"
  ON public.amps_detail
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id
      AND auth.uid() = seller_id
    )
  );

CREATE POLICY "Effect details are viewable with listings"
  ON public.effects_detail
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id
      AND (status = 'active' OR auth.uid() = seller_id)
    )
  );

CREATE POLICY "Users can manage their effect details"
  ON public.effects_detail
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id
      AND auth.uid() = seller_id
    )
  );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.listings TO authenticated;
GRANT ALL ON public.guitars_detail TO authenticated;
GRANT ALL ON public.amps_detail TO authenticated;
GRANT ALL ON public.effects_detail TO authenticated;
GRANT SELECT ON public.listings TO anon;
GRANT SELECT ON public.guitars_detail TO anon;
GRANT SELECT ON public.amps_detail TO anon;
GRANT SELECT ON public.effects_detail TO anon;

-- Comments
COMMENT ON TABLE public.listings IS 'Base listings table for all categories (guitars, amps, effects)';
COMMENT ON TABLE public.guitars_detail IS 'Guitar-specific details linked to listings';
COMMENT ON TABLE public.amps_detail IS 'Amplifier-specific details linked to listings';
COMMENT ON TABLE public.effects_detail IS 'Effects pedal-specific details linked to listings';
COMMENT ON COLUMN public.listings.images IS 'Array of image URLs stored in Supabase Storage';
COMMENT ON COLUMN public.listings.search_vector IS 'Full-text search vector for title, description, and tags';
COMMENT ON COLUMN public.guitars_detail.specifications IS 'Flexible JSONB field for guitar specifications like body material, pickups, etc.';
COMMENT ON COLUMN public.amps_detail.specifications IS 'Flexible JSONB field for amp specifications like tubes, speakers, etc.';
COMMENT ON COLUMN public.effects_detail.specifications IS 'Flexible JSONB field for effect specifications like algorithms, controls, etc.';
