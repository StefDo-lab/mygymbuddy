-- Add new columns to user_profiles table for detailed information
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS rehab_details TEXT,
ADD COLUMN IF NOT EXISTS sport_details TEXT,
ADD COLUMN IF NOT EXISTS ai_instructions TEXT;

-- Add a comment to document the new fields
COMMENT ON COLUMN user_profiles.rehab_details IS 'Details about rehabilitation needs or injuries';
COMMENT ON COLUMN user_profiles.sport_details IS 'Details about specific sports to train for';
COMMENT ON COLUMN user_profiles.ai_instructions IS 'Direct instructions or preferences for the AI';
