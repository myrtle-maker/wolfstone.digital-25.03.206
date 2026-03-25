
-- Trigger to prevent non-service-role users from modifying quota columns
CREATE OR REPLACE FUNCTION public.protect_profile_quotas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If caller is not service_role, reset quota columns to their old values
  IF current_setting('role') != 'service_role' THEN
    NEW.daily_scan_limit := OLD.daily_scan_limit;
    NEW.max_saved_prompts := OLD.max_saved_prompts;
    NEW.monthly_refresh_credits := OLD.monthly_refresh_credits;
    NEW.last_credit_reset := OLD.last_credit_reset;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_profile_quotas_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_quotas();

-- RPC for deducting refresh credits (service-level operation)
CREATE OR REPLACE FUNCTION public.deduct_refresh_credit(_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits integer;
  last_reset timestamptz;
BEGIN
  SELECT monthly_refresh_credits, last_credit_reset
  INTO current_credits, last_reset
  FROM public.profiles
  WHERE id = _user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  -- Auto-reset if last reset > 30 days ago
  IF last_reset < now() - interval '30 days' THEN
    current_credits := 5;
    UPDATE public.profiles
    SET monthly_refresh_credits = 4, last_credit_reset = now()
    WHERE id = _user_id;
    RETURN 4;
  END IF;

  IF current_credits <= 0 THEN
    RETURN -1; -- signal: no credits
  END IF;

  UPDATE public.profiles
  SET monthly_refresh_credits = current_credits - 1
  WHERE id = _user_id;

  RETURN current_credits - 1;
END;
$$;
