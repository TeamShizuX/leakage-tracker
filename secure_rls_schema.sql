-- Secure RLS Policies for Leakage Tracker

-- 1. Transactions Table
DROP POLICY IF EXISTS "Allow anon all access" ON public.transactions;

CREATE POLICY "Users can manage their own transactions" 
ON public.transactions 
FOR ALL 
TO authenticated 
USING (
  user_id = (SELECT whatsapp_number FROM public.profiles WHERE id = auth.uid())
) 
WITH CHECK (
  user_id = (SELECT whatsapp_number FROM public.profiles WHERE id = auth.uid())
);


-- 2. Incomes Table
DROP POLICY IF EXISTS "Allow anon all access on incomes" ON public.incomes;

CREATE POLICY "Users can manage their own incomes" 
ON public.incomes 
FOR ALL 
TO authenticated 
USING (
  user_id = (SELECT whatsapp_number FROM public.profiles WHERE id = auth.uid())
) 
WITH CHECK (
  user_id = (SELECT whatsapp_number FROM public.profiles WHERE id = auth.uid())
);


-- 3. Games Table
DROP POLICY IF EXISTS "Allow anon all access" ON public.games;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.games;

CREATE POLICY "Authenticated users can view all games" 
ON public.games 
FOR SELECT 
TO authenticated 
USING (true);

-- (Next.js backend with service role handles insert/update/delete for games)


-- 4. Game Participants Table
DROP POLICY IF EXISTS "Allow anon all access" ON public.game_participants;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.game_participants;

CREATE POLICY "Authenticated users can view participants" 
ON public.game_participants 
FOR SELECT 
TO authenticated 
USING (true);

-- (Next.js backend with service role handles insert/update/delete for participants)
