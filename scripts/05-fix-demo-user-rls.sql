-- Temporarily allow demo user for testing
-- This creates a policy that allows the specific demo UUID we're using

-- Drop existing policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create new policies that work with demo user
CREATE POLICY "Users can view own profile or demo user" ON user_profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

CREATE POLICY "Users can update own profile or demo user" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

CREATE POLICY "Users can insert own profile or demo user" ON user_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );
