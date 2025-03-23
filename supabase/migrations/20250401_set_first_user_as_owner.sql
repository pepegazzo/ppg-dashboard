
-- This migration will set the first user who signs up as the owner

-- Create a function to make the first user an owner
CREATE OR REPLACE FUNCTION public.set_first_user_as_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- If this is the first user, set them as owner
  IF user_count = 1 THEN
    UPDATE public.profiles
    SET is_owner = TRUE
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create a trigger to run after a new profile is inserted
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_first_user_as_owner();
