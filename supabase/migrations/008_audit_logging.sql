-- Audit Logging System
-- Tracks security-relevant events for monitoring and compliance

-- Audit event types
CREATE TYPE audit_event_type AS ENUM (
  'auth_login_success',
  'auth_login_failed',
  'auth_signup',
  'auth_logout',
  'listing_created',
  'listing_updated',
  'listing_deleted',
  'transaction_created',
  'transaction_completed',
  'transaction_cancelled',
  'message_sent',
  'rating_created',
  'profile_updated',
  'suspicious_activity',
  'rate_limit_exceeded',
  'file_upload_failed',
  'unauthorized_access'
);

-- Audit log table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type audit_event_type NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  resource_type TEXT, -- e.g., 'listing', 'transaction', 'message'
  resource_id UUID,
  event_data JSONB DEFAULT '{}'::jsonb,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for efficient querying
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_severity ON public.audit_logs(severity);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- RLS Policies - Only admins can view audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND account_type = 'admin'
    )
  );

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_event_type audit_event_type,
  p_user_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_event_data JSONB DEFAULT '{}'::jsonb,
  p_severity TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    event_type,
    user_id,
    ip_address,
    user_agent,
    resource_type,
    resource_id,
    event_data,
    severity
  ) VALUES (
    p_event_type,
    p_user_id,
    p_ip_address,
    p_user_agent,
    p_resource_type,
    p_resource_id,
    p_event_data,
    p_severity
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Trigger to log listing creation
CREATE OR REPLACE FUNCTION public.audit_listing_creation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.log_audit_event(
    'listing_created',
    NEW.seller_id,
    NULL,
    NULL,
    'listing',
    NEW.id,
    jsonb_build_object(
      'category', NEW.category,
      'price', NEW.price,
      'status', NEW.status
    ),
    'info'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_listing_creation
  AFTER INSERT ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_listing_creation();

-- Trigger to log transaction creation
CREATE OR REPLACE FUNCTION public.audit_transaction_creation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.log_audit_event(
    'transaction_created',
    NEW.buyer_id,
    NULL,
    NULL,
    'transaction',
    NEW.id,
    jsonb_build_object(
      'listing_id', NEW.listing_id,
      'amount', NEW.amount,
      'seller_id', NEW.seller_id
    ),
    'info'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_transaction_creation
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_transaction_creation();

-- Trigger to log transaction completion
CREATE OR REPLACE FUNCTION public.audit_transaction_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    PERFORM public.log_audit_event(
      'transaction_completed',
      NEW.buyer_id,
      NULL,
      NULL,
      'transaction',
      NEW.id,
      jsonb_build_object(
        'listing_id', NEW.listing_id,
        'amount', NEW.amount,
        'seller_id', NEW.seller_id
      ),
      'info'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_transaction_completion
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_transaction_completion();

-- Function to detect suspicious activity
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Detect users with multiple failed transactions
  INSERT INTO public.audit_logs (event_type, user_id, resource_type, event_data, severity)
  SELECT
    'suspicious_activity',
    buyer_id,
    'user',
    jsonb_build_object(
      'reason', 'multiple_cancelled_transactions',
      'count', COUNT(*)
    ),
    'warning'
  FROM public.transactions
  WHERE status = 'cancelled'
    AND created_at > NOW() - INTERVAL '7 days'
  GROUP BY buyer_id
  HAVING COUNT(*) >= 5;
  
  -- Detect rapid price changes on listings
  -- (Can be expanded with more sophisticated logic)
END;
$$;

-- Grants
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.detect_suspicious_activity TO authenticated;

-- Comments
COMMENT ON TABLE public.audit_logs IS 'Audit log for security-relevant events';
COMMENT ON FUNCTION public.log_audit_event IS 'Function to log audit events from application code';
COMMENT ON FUNCTION public.detect_suspicious_activity IS 'Function to detect and log suspicious activity patterns';

