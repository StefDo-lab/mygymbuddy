-- Temporarily disable RLS on workout-related tables for testing
-- This allows the demo user to work without complex RLS policies

-- Disable RLS on workout_plans
ALTER TABLE workout_plans DISABLE ROW LEVEL SECURITY;

-- Disable RLS on workouts  
ALTER TABLE workouts DISABLE ROW LEVEL SECURITY;

-- Disable RLS on workout_exercises
ALTER TABLE workout_exercises DISABLE ROW LEVEL SECURITY;

-- Disable RLS on workout_logs
ALTER TABLE workout_logs DISABLE ROW LEVEL SECURITY;

-- Disable RLS on exercise_logs
ALTER TABLE exercise_logs DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled only on user_profiles (which we already fixed)
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY; -- This stays enabled

-- Note: In a production app, you would want RLS enabled for security
-- But for testing/demo purposes, this allows everything to work smoothly
