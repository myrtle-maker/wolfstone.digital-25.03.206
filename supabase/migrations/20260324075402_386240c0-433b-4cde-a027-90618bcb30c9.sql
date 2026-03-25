-- Create projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  website text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects"
ON public.projects FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all projects"
ON public.projects FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add project_id to saved_prompts (nullable for backward compat)
ALTER TABLE public.saved_prompts ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add website column to saved_prompts
ALTER TABLE public.saved_prompts ADD COLUMN website text DEFAULT '';