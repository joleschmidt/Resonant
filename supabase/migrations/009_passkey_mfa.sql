-- Migration: Passkey & MFA Support
-- Adds support for WebAuthn passkeys and TOTP MFA enrollment tracking

-- ============================================================================
-- 1. ADD MFA ENROLLMENT TRACKING TO PROFILES
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS mfa_enrolled_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS passkey_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS passkey_enrolled_at TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- 2. CREATE MFA_SESSIONS TABLE (Track sensitive action sessions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mfa_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('payment', 'high_value_transaction', 'security_settings')),
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mfa_sessions_user_id ON public.mfa_sessions(user_id);
CREATE INDEX idx_mfa_sessions_expires_at ON public.mfa_sessions(expires_at);

-- RLS Policies
ALTER TABLE public.mfa_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own MFA sessions"
  ON public.mfa_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own MFA sessions"
  ON public.mfa_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. CREATE PASSKEY_CREDENTIALS TABLE (Store WebAuthn credential metadata)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.passkey_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  credential_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  counter BIGINT DEFAULT 0,
  device_type TEXT, -- e.g., 'platform', 'cross-platform'
  device_name TEXT, -- User-friendly name
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT passkey_credentials_counter_positive CHECK (counter >= 0)
);

-- Indexes
CREATE INDEX idx_passkey_credentials_user_id ON public.passkey_credentials(user_id);
CREATE INDEX idx_passkey_credentials_credential_id ON public.passkey_credentials(credential_id);

-- RLS Policies
ALTER TABLE public.passkey_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own passkeys"
  ON public.passkey_credentials
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passkeys"
  ON public.passkey_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own passkeys"
  ON public.passkey_credentials
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own passkeys"
  ON public.passkey_credentials
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. CREATE FUNCTION TO CHECK MFA REQUIREMENT
-- ============================================================================

CREATE OR REPLACE FUNCTION require_mfa_for_action(
  p_action_type TEXT,
  p_transaction_value NUMERIC DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_mfa_enabled BOOLEAN;
  v_recent_session_count INTEGER;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has MFA enabled
  SELECT mfa_enabled INTO v_mfa_enabled
  FROM public.profiles
  WHERE id = v_user_id;
  
  -- If MFA not enabled, don't require it (but maybe should for certain actions)
  IF NOT v_mfa_enabled THEN
    -- For high-value transactions, require MFA even if not enrolled
    IF p_action_type = 'high_value_transaction' AND p_transaction_value > 1000 THEN
      RETURN TRUE;
    END IF;
    RETURN FALSE;
  END IF;
  
  -- Check for recent MFA session (within last hour)
  SELECT COUNT(*) INTO v_recent_session_count
  FROM public.mfa_sessions
  WHERE user_id = v_user_id
    AND session_type = p_action_type
    AND expires_at > NOW();
  
  -- If no recent session, require MFA
  RETURN v_recent_session_count = 0;
END;
$$;

-- ============================================================================
-- 5. CREATE FUNCTION TO AUTO-CLEANUP EXPIRED MFA SESSIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_mfa_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.mfa_sessions
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- ============================================================================
-- 6. ADD INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_mfa_enabled ON public.profiles(mfa_enabled) WHERE mfa_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_passkey_enabled ON public.profiles(passkey_enabled) WHERE passkey_enabled = TRUE;

-- ============================================================================
-- 7. ADD COMMENTS
-- ============================================================================

COMMENT ON COLUMN public.profiles.mfa_enabled IS 'Whether TOTP MFA is enabled for this user';
COMMENT ON COLUMN public.profiles.mfa_enrolled_at IS 'Timestamp when user enrolled in MFA';
COMMENT ON COLUMN public.profiles.passkey_enabled IS 'Whether user has at least one passkey registered';
COMMENT ON COLUMN public.profiles.passkey_enrolled_at IS 'Timestamp when user registered first passkey';

COMMENT ON TABLE public.mfa_sessions IS 'Tracks verified MFA sessions for sensitive actions';
COMMENT ON TABLE public.passkey_credentials IS 'Stores WebAuthn passkey credential metadata';

-- ============================================================================
-- MIGRATION COMPLETE
-- Users can now register passkeys and enable TOTP MFA
-- MFA sessions track verified sensitive actions
-- ============================================================================
