-- Add Admin role and Roast Count to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roast_count INTEGER DEFAULT 0;

-- Ensure RLS allows the update
-- We need to ensure that the user can update their own roast_count 
-- (This should already be covered by the existing UPDATE policy: "Users can update own profile")

-- However, for the admin dashboard, we need a policy to allow admins to view all profiles 
-- (This is already covered by: "Public profiles are viewable by everyone")

-- And we need a policy for admins to update OTHER users' profiles (to set is_premium)
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
