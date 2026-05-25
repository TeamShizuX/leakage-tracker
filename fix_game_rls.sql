-- Drop the restrictive policies that rely on auth.uid()
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON games;
DROP POLICY IF EXISTS "Enable update for creator" ON games;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON game_participants;

-- Create policies that allow the Next.js API (anon client) to perform operations
CREATE POLICY "Allow anon all access" ON games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all access" ON game_participants FOR ALL USING (true) WITH CHECK (true);
