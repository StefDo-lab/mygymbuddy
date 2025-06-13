-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('workout_plans', 'workouts', 'workout_exercises', 'workout_logs', 'exercise_logs');

-- Force disable RLS on all workout tables
ALTER TABLE public.workout_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to be sure
DROP POLICY IF EXISTS "Users can view own workout plans or demo user" ON workout_plans;
DROP POLICY IF EXISTS "Users can create own workout plans or demo user" ON workout_plans;
DROP POLICY IF EXISTS "Users can update own workout plans or demo user" ON workout_plans;

DROP POLICY IF EXISTS "Users can view workouts or demo user" ON workouts;
DROP POLICY IF EXISTS "Users can create workouts or demo user" ON workouts;
DROP POLICY IF EXISTS "Users can update workouts or demo user" ON workouts;

DROP POLICY IF EXISTS "Users can view workout exercises or demo user" ON workout_exercises;
DROP POLICY IF EXISTS "Users can create workout exercises or demo user" ON workout_exercises;
DROP POLICY IF EXISTS "Users can update workout exercises or demo user" ON workout_exercises;

DROP POLICY IF EXISTS "Users can view own workout logs or demo user" ON workout_logs;
DROP POLICY IF EXISTS "Users can create own workout logs or demo user" ON workout_logs;

DROP POLICY IF EXISTS "Users can view own exercise logs or demo user" ON exercise_logs;
DROP POLICY IF EXISTS "Users can create own exercise logs or demo user" ON exercise_logs;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('workout_plans', 'workouts', 'workout_exercises', 'workout_logs', 'exercise_logs');
