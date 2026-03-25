
CREATE TABLE public.backlink_checker_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  url_checked TEXT NOT NULL,
  overall_score INTEGER,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.backlink_checker_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role can insert backlink leads"
ON public.backlink_checker_leads
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Only service role can select backlink leads"
ON public.backlink_checker_leads
FOR SELECT
TO service_role
USING (true);
