-- Create games table
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create game_participants table
CREATE TABLE game_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(game_id, profile_id)
);

-- Setup Row Level Security (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read games
CREATE POLICY "Enable read access for all users" ON games FOR SELECT USING (true);
-- Allow anyone to create games (where they are the creator)
CREATE POLICY "Enable insert for authenticated users" ON games FOR INSERT WITH CHECK (auth.uid() = created_by);
-- Allow creators to update their own games (to start them)
CREATE POLICY "Enable update for creator" ON games FOR UPDATE USING (auth.uid() = created_by);

-- Allow anyone to read game participants
CREATE POLICY "Enable read access for all users" ON game_participants FOR SELECT USING (true);
-- Allow users to join games
CREATE POLICY "Enable insert for authenticated users" ON game_participants FOR INSERT WITH CHECK (auth.uid() = profile_id);
