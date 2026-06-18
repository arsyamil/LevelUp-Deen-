-- Add role and email columns to users_profile.
-- Previously stored in Clerk publicMetadata and Clerk user record.
-- Now Supabase is the sole auth and identity provider.

ALTER TABLE public.users_profile
  ADD COLUMN IF NOT EXISTS role varchar(30) NOT NULL DEFAULT 'user';

ALTER TABLE public.users_profile
  ADD COLUMN IF NOT EXISTS email varchar(255);
