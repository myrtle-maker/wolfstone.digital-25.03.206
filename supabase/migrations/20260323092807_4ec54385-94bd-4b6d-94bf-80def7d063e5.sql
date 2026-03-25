CREATE TABLE public.crawlability_checker_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  url_checked TEXT NOT NULL,
  overall_score INTEGER,
  results JSONB
);

ALTER TABLE public.crawlability_checker_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert from service role" ON public.crawlability_checker_leads
  FOR INSERT TO service_role WITH CHECK (true);