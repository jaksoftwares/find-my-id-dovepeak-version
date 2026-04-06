-- Recommended SQL to fix foreign key cascades
ALTER TABLE public.claims DROP CONSTRAINT IF EXISTS claims_claimant_fkey;
ALTER TABLE public.claims ADD CONSTRAINT claims_claimant_fkey FOREIGN KEY (claimant) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.lost_requests DROP CONSTRAINT IF EXISTS lost_requests_user_id_fkey;
ALTER TABLE public.lost_requests ADD CONSTRAINT lost_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;





-- Fix the new user trigger to support all fields and handle conflicts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, phone, registration_number, faculty)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Student'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'registration_number',
    new.raw_user_meta_data->>'faculty'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    registration_number = EXCLUDED.registration_number,
    faculty = EXCLUDED.faculty;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 1. DROP any existing triggers on the auth.users table to avoid conflicts
DO $$
DECLARE
    trig_name RECORD;
BEGIN
    FOR trig_name IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'users' 
          AND (event_object_schema = 'auth' OR event_object_schema = 'public')
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(trig_name.trigger_name) || ' ON auth.users;';
    END LOOP;
END $$;

-- 2. Create the robust profile sync function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, phone, registration_number, faculty)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Student'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'registration_number',
    new.raw_user_meta_data->>'faculty'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    registration_number = EXCLUDED.registration_number,
    faculty = EXCLUDED.faculty;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. LINK the trigger to the Auth table (This is the missing piece!)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Diagnostic Trigger: Tells us EXACTLY why it's failing
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  err_msg text;
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, phone, registration_number, faculty)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'full_name', 'Student'),
      new.email,
      COALESCE(new.raw_user_meta_data->>'role', 'student'),
      new.raw_user_meta_data->>'phone',
      new.raw_user_meta_data->>'registration_number',
      new.raw_user_meta_data->>'faculty'
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      role = EXCLUDED.role,
      phone = EXCLUDED.phone,
      registration_number = EXCLUDED.registration_number,
      faculty = EXCLUDED.faculty;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS err_msg = MESSAGE_TEXT;
    RAISE EXCEPTION 'Profile Creation FAIL: %', err_msg;
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
