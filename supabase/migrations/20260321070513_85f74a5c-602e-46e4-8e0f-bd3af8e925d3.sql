
-- Leads table for LLM checker submissions
CREATE TABLE public.llm_checker_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  website TEXT,
  overall_score INTEGER,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.llm_checker_leads ENABLE ROW LEVEL SECURITY;

-- Allow the edge function (service role) to insert leads
-- No public read access needed
CREATE POLICY "Service role can manage leads"
  ON public.llm_checker_leads
  FOR ALL
  USING (true)
  WITH CHECK (true);
