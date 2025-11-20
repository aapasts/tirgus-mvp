-- Allow anonymous listings
ALTER TABLE public.listings ALTER COLUMN user_id DROP NOT NULL;

-- Update policy to allow anonymous inserts
DROP POLICY IF EXISTS "Users can insert their own listings." ON public.listings;

CREATE POLICY "Anyone can insert listings."
  ON public.listings FOR INSERT
  WITH CHECK ( true );

-- Update policy for updating listings (only owner can update, but if user_id is null, no one can update - which is fine for anon)
-- Existing policy:
-- create policy "Users can update own listings."
--   on public.listings for update
--   using ( auth.uid() = user_id );
-- This remains valid. If user_id is NULL, auth.uid() = NULL is false (or null), so anon listings are immutable by default.
