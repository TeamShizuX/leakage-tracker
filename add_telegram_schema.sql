-- Add Telegram fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Create index for fast lookups when Telegram webhook receives messages
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_chat_id ON public.profiles (telegram_chat_id);
