-- Create a function to bypass RLS and allow admins to upgrade users
CREATE OR REPLACE FUNCTION admin_upgrade_user(target_user_id UUID, target_is_premium BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET is_premium = target_is_premium
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
