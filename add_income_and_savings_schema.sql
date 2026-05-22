-- Create incomes table
CREATE TABLE public.incomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Storing WhatsApp Phone Number here for consistency with transactions
    source TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'LKR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS) for incomes
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for anon key for MVP purposes
CREATE POLICY "Allow anon all access on incomes" 
ON public.incomes 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- Add savings_goal to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS savings_goal NUMERIC DEFAULT 0;
