
-- Restrict client_requests INSERT to only allow setting expected fields
DROP POLICY "Anyone can submit a request" ON public.client_requests;
CREATE POLICY "Anyone can submit a request"
  ON public.client_requests FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending');
