-- Favorites and Offers schema with RLS

-- Favorites table (bookmark listings)
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, listing_id)
);

-- Offers status type
DO $$ BEGIN
  CREATE TYPE public.offer_status AS ENUM ('pending','accepted','declined','withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Offers table (price offers for listings)
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  message TEXT,
  status public.offer_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON public.offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON public.offers(buyer_id);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Favorites policies
-- Anyone can read favorites (for counts); rows are non-sensitive
CREATE POLICY IF NOT EXISTS "Favorites are viewable by everyone"
  ON public.favorites
  FOR SELECT
  USING (true);

-- Authenticated users can add their own favorites
CREATE POLICY IF NOT EXISTS "Users can insert own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY IF NOT EXISTS "Users can delete own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Offers policies
-- Insert: only authenticated users, enforce buyer_id = auth.uid()
CREATE POLICY IF NOT EXISTS "Users can create offers"
  ON public.offers
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Allow the buyer or listing owner to view their offers (optional, for future use)
CREATE POLICY IF NOT EXISTS "Offers are viewable by buyer or seller"
  ON public.offers
  FOR SELECT
  USING (
    buyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.seller_id = auth.uid()
    )
  );

-- Basic grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.favorites TO authenticated;
GRANT SELECT ON public.favorites TO anon;
GRANT ALL ON public.offers TO authenticated;

