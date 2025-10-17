-- Stats, Ratings, and Transactions Schema
-- Transaction lifecycle and rating system

-- Transaction status enum
DO $$ BEGIN
  CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  status public.transaction_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  rater_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT no_self_rating CHECK (rater_id != rated_user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_listing_id ON public.transactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON public.transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_ratings_transaction_id ON public.ratings(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated_user_id ON public.ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rater_id ON public.ratings(rater_id);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Buyers can create transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Participants can update transaction status"
  ON public.transactions
  FOR UPDATE
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone"
  ON public.ratings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings for their transactions"
  ON public.ratings
  FOR INSERT
  WITH CHECK (
    rater_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

-- Function to update seller rating on new rating
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET seller_rating = (
    SELECT COALESCE(AVG(score), 0)
    FROM public.ratings
    WHERE rated_user_id = NEW.rated_user_id
  )
  WHERE id = NEW.rated_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_seller_rating_on_rating
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_rating();

-- Function to increment sales/purchases on transaction completion
CREATE OR REPLACE FUNCTION update_transaction_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Increment seller's total_sales
    UPDATE public.profiles
    SET total_sales = total_sales + 1
    WHERE id = NEW.seller_id;
    
    -- Increment buyer's total_purchases
    UPDATE public.profiles
    SET total_purchases = total_purchases + 1
    WHERE id = NEW.buyer_id;
    
    -- Mark listing as sold
    UPDATE public.listings
    SET status = 'sold', sold_at = NEW.completed_at
    WHERE id = NEW.listing_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_transaction_stats_on_completion
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_stats();

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.transactions TO authenticated;
GRANT ALL ON public.ratings TO authenticated;
GRANT SELECT ON public.ratings TO anon;

