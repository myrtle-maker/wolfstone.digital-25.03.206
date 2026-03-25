-- Track tool usage by IP for rate limiting
CREATE TABLE public.tool_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  tool_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by IP + tool + date
CREATE INDEX idx_tool_usage_ip_tool_date 
  ON public.tool_usage (ip_address, tool_name, created_at);

-- Auto-cleanup: delete entries older than 7 days
CREATE OR REPLACE FUNCTION public.cleanup_old_tool_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.tool_usage 
  WHERE created_at < now() - interval '7 days';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_cleanup_tool_usage
  AFTER INSERT ON public.tool_usage
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.cleanup_old_tool_usage();

-- RLS: only service role can read/write
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role insert" ON public.tool_usage
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role select" ON public.tool_usage
  FOR SELECT TO service_role
  USING (true);

CREATE POLICY "Service role delete" ON public.tool_usage
  FOR DELETE TO service_role
  USING (true);