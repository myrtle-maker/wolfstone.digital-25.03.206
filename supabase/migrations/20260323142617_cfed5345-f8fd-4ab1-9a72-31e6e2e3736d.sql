CREATE POLICY "Only service role can select crawlability leads"
  ON public.crawlability_checker_leads
  FOR SELECT TO service_role
  USING (true);