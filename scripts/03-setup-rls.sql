-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for workout_plans
CREATE POLICY "Users can view own workout plans" ON workout_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout plans" ON workout_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans" ON workout_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for workout_logs
CREATE POLICY "Users can view own workout logs" ON workout_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout logs" ON workout_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for exercise_logs
CREATE POLICY "Users can view own exercise logs" ON exercise_logs
  FOR SELECT USING (
    auth.uid() = (
      SELECT user_id FROM workout_logs 
      WHERE workout_logs.id = exercise_logs.workout_log_id
    )
  );

CREATE POLICY "Users can create own exercise logs" ON exercise_logs
  FOR INSERT WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM workout_logs 
      WHERE workout_logs.id = exercise_logs.workout_log_id
    )
  );

-- Exercises table is public (read-only for all users)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view exercises" ON exercises FOR SELECT USING (true);
