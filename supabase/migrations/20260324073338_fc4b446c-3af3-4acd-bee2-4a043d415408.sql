
-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Enum for client request status
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected');

-- Enum for visibility mode
CREATE TYPE public.visibility_mode AS ENUM ('brand', 'citation');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  company TEXT DEFAULT '',
  daily_scan_limit INTEGER NOT NULL DEFAULT 1,
  max_saved_prompts INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Client access requests
CREATE TABLE public.client_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  company TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.client_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a request"
  ON public.client_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all requests"
  ON public.client_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests"
  ON public.client_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Saved prompts
CREATE TABLE public.saved_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  prompt_text TEXT NOT NULL DEFAULT '',
  mode visibility_mode NOT NULL DEFAULT 'brand',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own prompts"
  ON public.saved_prompts FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all prompts"
  ON public.saved_prompts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Prompt tracking results (daily scans)
CREATE TABLE public.prompt_tracking_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_prompt_id UUID NOT NULL REFERENCES public.saved_prompts(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'absent',
  snippets JSONB DEFAULT '[]'::jsonb,
  response TEXT DEFAULT ''
);

ALTER TABLE public.prompt_tracking_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tracking results"
  ON public.prompt_tracking_results FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.saved_prompts sp
      WHERE sp.id = saved_prompt_id AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all tracking results"
  ON public.prompt_tracking_results FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert tracking results"
  ON public.prompt_tracking_results FOR INSERT TO service_role
  WITH CHECK (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
