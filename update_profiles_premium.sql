-- Update profiles table with Premium features
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS budget_limit NUMERIC DEFAULT 10000;

-- Ensure RLS allows the update
-- (Already handled by existing policies if the user is authenticated)
