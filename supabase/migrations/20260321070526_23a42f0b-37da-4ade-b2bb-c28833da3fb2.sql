
-- Drop the overly permissive policy
DROP POLICY "Service role can manage leads" ON public.llm_checker_leads;

-- Only allow authenticated service_role access (edge functions)
-- No anon/public access at all
CREATE POLICY "Only service role can insert leads"
  ON public.llm_checker_leads
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Only service role can select leads"
  ON public.llm_checker_leads
  FOR SELECT
  TO service_role
  USING (true);
