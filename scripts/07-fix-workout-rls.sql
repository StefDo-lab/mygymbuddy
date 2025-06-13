-- Update RLS policies for workout-related tables to allow demo user

-- Drop existing policies for workout_plans
DROP POLICY IF EXISTS "Users can view own workout plans" ON workout_plans;
DROP POLICY IF EXISTS "Users can create own workout plans" ON workout_plans;
DROP POLICY IF EXISTS "Users can update own workout plans" ON workout_plans;

-- Create new policies for workout_plans that work with demo user
CREATE POLICY "Users can view own workout plans or demo user" ON workout_plans
  FOR SELECT USING (
    auth.uid() = user_id OR 
    user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

CREATE POLICY "Users can create own workout plans or demo user" ON workout_plans
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

CREATE POLICY "Users can update own workout plans or demo user" ON workout_plans
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

-- Update policies for workouts table
DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can create own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON workouts;

CREATE POLICY "Users can view workouts or demo user" ON workouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_plans 
      WHERE workout_plans.id = workouts.plan_id 
      AND (auth.uid() = workout_plans.user_id OR workout_plans.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid)
    )
  );

CREATE POLICY "Users can create workouts or demo user" ON workouts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_plans 
      WHERE workout_plans.id = workouts.plan_id 
      AND (auth.uid() = workout_plans.user_id OR workout_plans.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid)
    )
  );

CREATE POLICY "Users can update workouts or demo user" ON workouts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workout_plans 
      WHERE workout_plans.id = workouts.plan_id 
      AND (auth.uid() = workout_plans.user_id OR workout_plans.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid)
    )
  );

-- Update policies for workout_exercises table
DROP POLICY IF EXISTS "Users can view own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can create own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can update own workout exercises" ON workout_exercises;

CREATE POLICY "Users can view workout exercises or demo user" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts 
      JOIN workout_plans ON workout_plans.id = workouts.plan_id
      WHERE workouts.id = workout_exercises.workout_id 
      AND (auth.uid() = workout_plans.user_id OR workout_plans.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid)
    )
  );

CREATE POLICY "Users can create workout exercises or demo user" ON workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts 
      JOIN workout_plans ON workout_plans.id = workouts.plan_id
      WHERE workouts.id = workout_exercises.workout_id 
      AND (auth.uid() = workout_plans.user_id OR workout_plans.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid)
    )
  );

CREATE POLICY "Users can update workout exercises or demo user" ON workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      JOIN workout_plans ON workout_plans.id = workouts.plan_id
      WHERE workouts.id = workout_exercises.workout_id 
      AND (auth.uid() = workout_plans.user_id OR workout_plans.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid)
    )
  );

-- Update policies for workout_logs table
DROP POLICY IF EXISTS "Users can view own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can create own workout logs" ON workout_logs;

CREATE POLICY "Users can view own workout logs or demo user" ON workout_logs
  FOR SELECT USING (
    auth.uid() = user_id OR 
    user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

CREATE POLICY "Users can create own workout logs or demo user" ON workout_logs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

-- Update policies for exercise_logs table
DROP POLICY IF EXISTS "Users can view own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can create own exercise logs" ON exercise_logs;

CREATE POLICY "Users can view own exercise logs or demo user" ON exercise_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_logs 
      WHERE workout_logs.id = exercise_logs.workout_log_id 
      AND (auth.uid() = workout_logs.user_id OR workout_logs.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid)
    )
  );

CREATE POLICY "Users can create own exercise logs or demo user" ON exercise_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_logs 
      WHERE workout_logs.id = exercise_logs.workout_log_id 
      AND (auth.uid() = workout_logs.user_id OR workout_logs.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid)
    )
  );
