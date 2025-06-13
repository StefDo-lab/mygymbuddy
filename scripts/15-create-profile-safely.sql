-- Create a function to safely create user profiles
CREATE OR REPLACE FUNCTION create_profile_safely(
  p_user_id UUID,
  p_age INTEGER,
  p_sex TEXT,
  p_training_days INTEGER,
  p_experience TEXT,
  p_goals TEXT[],
  p_email TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- First check if the user exists in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    -- Check if profile already exists
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = p_user_id) THEN
      -- Insert the profile
      INSERT INTO user_profiles (
        id, 
        age, 
        sex, 
        training_days_per_week, 
        experience_level, 
        goals,
        email,
        created_at,
        updated_at
      ) VALUES (
        p_user_id,
        p_age,
        p_sex,
        p_training_days,
        p_experience,
        p_goals,
        p_email,
        NOW(),
        NOW()
      );
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't throw it
    RAISE NOTICE 'Error creating profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
