-- Add username_finalized flag and username enforcement helpers

-- Column to mark username as finalized (immutable after first user choice)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username_finalized boolean NOT NULL DEFAULT false;

-- Ensure username is always stored lowercase on insert/update
CREATE OR REPLACE FUNCTION public.enforce_username_lowercase()
RETURNS trigger AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN
    NEW.username := lower(NEW.username);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_username_lowercase'
  ) THEN
    CREATE TRIGGER profiles_username_lowercase
      BEFORE INSERT OR UPDATE OF username ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.enforce_username_lowercase();
  END IF;
END $$;

-- Validate username format on insert/update (lowercase a-z0-9_-, length 3-20)
CREATE OR REPLACE FUNCTION public.is_valid_username(u text)
RETURNS boolean
LANGUAGE sql
AS $$
  SELECT u ~ '^[a-z0-9_-]{3,20}$';
$$;

CREATE OR REPLACE FUNCTION public.check_username_valid()
RETURNS trigger AS $$
BEGIN
  IF NEW.username IS NOT NULL AND NOT public.is_valid_username(NEW.username) THEN
    RAISE EXCEPTION 'invalid username';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_username_valid'
  ) THEN
    CREATE TRIGGER profiles_username_valid
      BEFORE INSERT OR UPDATE OF username ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.check_username_valid();
  END IF;
END $$;


