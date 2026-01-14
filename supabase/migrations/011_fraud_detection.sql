-- Migration: Fraud Detection & Trust Scoring
-- Adds fraud detection scoring and trust metrics

-- ============================================================================
-- 1. ADD FRAUD DETECTION COLUMNS TO LISTINGS
-- ============================================================================

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS fraud_score INTEGER DEFAULT 0 CHECK (fraud_score >= 0 AND fraud_score <= 100),
  ADD COLUMN IF NOT EXISTS suspicious_flags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reviewed_by_admin BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS admin_review_notes TEXT,
  ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS flagged_reason TEXT;

-- ============================================================================
-- 2. ADD TRUST METRICS TO PROFILES
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  ADD COLUMN IF NOT EXISTS response_rate INTEGER DEFAULT 0 CHECK (response_rate >= 0 AND response_rate <= 100),
  ADD COLUMN IF NOT EXISTS average_response_time_hours INTEGER DEFAULT 0 CHECK (average_response_time_hours >= 0),
  ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0 CHECK (report_count >= 0),
  ADD COLUMN IF NOT EXISTS dispute_count INTEGER DEFAULT 0 CHECK (dispute_count >= 0),
  ADD COLUMN IF NOT EXISTS cancelled_transaction_count INTEGER DEFAULT 0 CHECK (cancelled_transaction_count >= 0);

-- ============================================================================
-- 3. CREATE FRAUD_REPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fraud_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reporter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('scam', 'fake_listing', 'stolen_images', 'price_manipulation', 'harassment', 'other')),
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fraud_reports_description_length CHECK (char_length(description) >= 20 AND char_length(description) <= 2000)
);

-- Indexes
CREATE INDEX idx_fraud_reports_listing_id ON public.fraud_reports(listing_id);
CREATE INDEX idx_fraud_reports_reported_user_id ON public.fraud_reports(reported_user_id);
CREATE INDEX idx_fraud_reports_reporter_user_id ON public.fraud_reports(reporter_user_id);
CREATE INDEX idx_fraud_reports_status ON public.fraud_reports(status);
CREATE INDEX idx_fraud_reports_created_at ON public.fraud_reports(created_at DESC);

-- RLS Policies
ALTER TABLE public.fraud_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON public.fraud_reports
  FOR SELECT
  USING (auth.uid() = reporter_user_id OR auth.uid() = reported_user_id);

CREATE POLICY "Users can create fraud reports"
  ON public.fraud_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Admins can manage fraud reports"
  ON public.fraud_reports
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- ============================================================================
-- 4. CREATE LOCATION_HISTORY TABLE (Track suspicious location changes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.location_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  location_city TEXT NOT NULL,
  location_postal_code TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  
  CONSTRAINT location_history_city_length CHECK (char_length(location_city) >= 2)
);

-- Indexes
CREATE INDEX idx_location_history_user_id ON public.location_history(user_id);
CREATE INDEX idx_location_history_listing_id ON public.location_history(listing_id);
CREATE INDEX idx_location_history_changed_at ON public.location_history(changed_at DESC);

-- RLS Policies
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own location history"
  ON public.location_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. CREATE FUNCTION TO CALCULATE TRUST SCORE
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_user_trust_score(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trust_score INTEGER := 0;
  v_account_age_days INTEGER;
  v_email_verified BOOLEAN;
  v_phone_verified BOOLEAN;
  v_identity_verified BOOLEAN;
  v_mfa_enabled BOOLEAN;
  v_total_sales INTEGER;
  v_total_purchases INTEGER;
  v_seller_rating NUMERIC;
  v_buyer_rating NUMERIC;
  v_report_count INTEGER;
  v_dispute_count INTEGER;
BEGIN
  -- Get profile data
  SELECT 
    EXTRACT(DAY FROM NOW() - created_at)::INTEGER,
    verification_status IN ('email_verified', 'phone_verified', 'identity_verified', 'fully_verified'),
    verification_status IN ('phone_verified', 'identity_verified', 'fully_verified'),
    verification_status = 'identity_verified',
    COALESCE(mfa_enabled, FALSE),
    COALESCE(total_sales, 0),
    COALESCE(total_purchases, 0),
    COALESCE(seller_rating, 0),
    COALESCE(buyer_rating, 0),
    COALESCE(report_count, 0),
    COALESCE(dispute_count, 0)
  INTO
    v_account_age_days,
    v_email_verified,
    v_phone_verified,
    v_identity_verified,
    v_mfa_enabled,
    v_total_sales,
    v_total_purchases,
    v_seller_rating,
    v_buyer_rating,
    v_report_count,
    v_dispute_count
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Start with base score
  v_trust_score := 0;
  
  -- Verification bonuses
  IF v_email_verified THEN v_trust_score := v_trust_score + 10; END IF;
  IF v_phone_verified THEN v_trust_score := v_trust_score + 15; END IF;
  IF v_identity_verified THEN v_trust_score := v_trust_score + 25; END IF;
  IF v_mfa_enabled THEN v_trust_score := v_trust_score + 10; END IF;
  
  -- Account age bonus
  IF v_account_age_days >= 365 THEN v_trust_score := v_trust_score + 10; END IF;
  
  -- Transaction history bonus
  IF v_total_sales + v_total_purchases >= 10 THEN
    v_trust_score := v_trust_score + 15;
  END IF;
  
  -- Rating bonus
  IF (v_seller_rating + v_buyer_rating) / 2 >= 4.5 THEN
    v_trust_score := v_trust_score + 20;
  END IF;
  
  -- Penalties
  v_trust_score := v_trust_score - (v_report_count * 10);
  v_trust_score := v_trust_score - (v_dispute_count * 15);
  
  -- New account penalty
  IF v_account_age_days < 7 THEN
    v_trust_score := v_trust_score - 20;
  ELSIF v_account_age_days < 30 THEN
    v_trust_score := v_trust_score - 10;
  END IF;
  
  -- Cap between 0 and 100
  v_trust_score := GREATEST(0, LEAST(100, v_trust_score));
  
  -- Update profile
  UPDATE public.profiles
  SET trust_score = v_trust_score
  WHERE id = p_user_id;
  
  RETURN v_trust_score;
END;
$$;

-- ============================================================================
-- 6. CREATE FUNCTION TO FLAG SUSPICIOUS LISTING
-- ============================================================================

CREATE OR REPLACE FUNCTION flag_suspicious_listing(
  p_listing_id UUID,
  p_fraud_score INTEGER,
  p_flags JSONB,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.listings
  SET 
    fraud_score = p_fraud_score,
    suspicious_flags = p_flags,
    flagged_at = NOW(),
    flagged_reason = p_reason
  WHERE id = p_listing_id;
  
  -- If fraud score is critical (>75), also notify admins
  IF p_fraud_score >= 75 THEN
    -- TODO: Implement admin notification system
    NULL;
  END IF;
END;
$$;

-- ============================================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_listings_fraud_score ON public.listings(fraud_score DESC) WHERE fraud_score > 0;
CREATE INDEX idx_listings_flagged_at ON public.listings(flagged_at DESC) WHERE flagged_at IS NOT NULL;
CREATE INDEX idx_listings_reviewed_by_admin ON public.listings(reviewed_by_admin) WHERE reviewed_by_admin = FALSE;

CREATE INDEX idx_profiles_trust_score ON public.profiles(trust_score DESC);
CREATE INDEX idx_profiles_report_count ON public.profiles(report_count DESC) WHERE report_count > 0;

-- ============================================================================
-- 8. CREATE TRIGGER TO AUTO-CALCULATE TRUST SCORE ON PROFILE UPDATE
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_calculate_trust_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Recalculate trust score when relevant fields change
  IF (
    OLD.verification_status IS DISTINCT FROM NEW.verification_status OR
    OLD.mfa_enabled IS DISTINCT FROM NEW.mfa_enabled OR
    OLD.total_sales IS DISTINCT FROM NEW.total_sales OR
    OLD.total_purchases IS DISTINCT FROM NEW.total_purchases OR
    OLD.seller_rating IS DISTINCT FROM NEW.seller_rating OR
    OLD.buyer_rating IS DISTINCT FROM NEW.buyer_rating OR
    OLD.report_count IS DISTINCT FROM NEW.report_count OR
    OLD.dispute_count IS DISTINCT FROM NEW.dispute_count
  ) THEN
    PERFORM calculate_user_trust_score(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_calculate_trust_score
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_trust_score();

-- ============================================================================
-- 9. ADD COMMENTS
-- ============================================================================

COMMENT ON COLUMN public.listings.fraud_score IS 'Fraud detection score (0-100, higher = more suspicious)';
COMMENT ON COLUMN public.listings.suspicious_flags IS 'Array of fraud flags detected for this listing';
COMMENT ON COLUMN public.profiles.trust_score IS 'User trust score (0-100, higher = more trustworthy)';

COMMENT ON TABLE public.fraud_reports IS 'User-submitted fraud reports for listings and users';
COMMENT ON TABLE public.location_history IS 'Tracks location changes for fraud detection';

-- ============================================================================
-- MIGRATION COMPLETE
-- Fraud detection and trust scoring system is now active
-- ============================================================================
