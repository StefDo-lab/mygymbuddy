-- Completely disable RLS and grant public access for testing

-- Disable RLS on all tables
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises DISABLE ROW LEVEL SECURITY;

-- Grant public access to all tables
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT ALL ON public.workout_plans TO anon, authenticated;
GRANT ALL ON public.workouts TO anon, authenticated;
GRANT ALL ON public.workout_exercises TO anon, authenticated;
GRANT ALL ON public.workout_logs TO anon, authenticated;
GRANT ALL ON public.exercise_logs TO anon, authenticated;
GRANT ALL ON public.exercises TO anon, authenticated;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'workout_plans', 'workouts', 'workout_exercises', 'workout_logs', 'exercise_logs', 'exercises');
