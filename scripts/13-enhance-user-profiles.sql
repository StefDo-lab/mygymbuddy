-- Add new columns to user_profiles table for detailed information
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS height_cm INTEGER,
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS health_conditions TEXT[],
ADD COLUMN IF NOT EXISTS medical_notes TEXT;

-- Add a unique constraint on email
ALTER TABLE user_profiles
ADD CONSTRAINT IF NOT EXISTS user_profiles_email_unique UNIQUE (email);

-- Add comments to document the new fields
COMMENT ON COLUMN user_profiles.email IS 'User email address';
COMMENT ON COLUMN user_profiles.height_cm IS 'User height in centimeters';
COMMENT ON COLUMN user_profiles.weight_kg IS 'User weight in kilograms';
COMMENT ON COLUMN user_profiles.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN user_profiles.health_conditions IS 'Array of health conditions';
COMMENT ON COLUMN user_profiles.medical_notes IS 'Additional medical notes or information';
