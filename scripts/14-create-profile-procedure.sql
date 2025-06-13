-- Create a stored procedure to insert user profiles
-- This bypasses schema cache issues in the client
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_age INTEGER,
  user_sex TEXT,
  user_training_days INTEGER,
  user_experience TEXT,
  user_goals TEXT[],
  user_email TEXT DEFAULT NULL,
  user_height INTEGER DEFAULT NULL,
  user_weight NUMERIC DEFAULT NULL,
  user_dob DATE DEFAULT NULL,
  user_health_conditions TEXT[] DEFAULT NULL,
  user_medical_notes TEXT DEFAULT NULL,
  user_ai_instructions TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_profiles (
    id, 
    age, 
    sex, 
    training_days_per_week, 
    experience_level, 
    goals,
    email,
    height_cm,
    weight_kg,
    date_of_birth,
    health_conditions,
    medical_notes,
    ai_instructions,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_age,
    user_sex,
    user_training_days,
    user_experience,
    user_goals,
    user_email,
    user_height,
    user_weight,
    user_dob,
    user_health_conditions,
    user_medical_notes,
    user_ai_instructions,
    NOW(),
    NOW()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- If the full insert fails, try with only required fields
    INSERT INTO user_profiles (
      id, 
      age, 
      sex, 
      training_days_per_week, 
      experience_level, 
      goals,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      user_age,
      user_sex,
      user_training_days,
      user_experience,
      user_goals,
      NOW(),
      NOW()
    );
END;
$$ LANGUAGE plpgsql;
