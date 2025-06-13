-- Create workout session logs table
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL,
  workout_id UUID REFERENCES workouts(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  total_duration_minutes INTEGER
);

-- Create detailed exercise logs table
CREATE TABLE IF NOT EXISTS exercise_performance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  workout_session_id UUID REFERENCES workout_sessions(id) NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  set_number INTEGER NOT NULL,
  planned_reps TEXT, -- What was planned (e.g., "8-12")
  actual_reps INTEGER, -- What was actually performed
  planned_weight NUMERIC, -- What was planned
  actual_weight NUMERIC, -- What was actually used
  rest_seconds INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5), -- 1=too easy, 5=too hard
  notes TEXT,
  is_extra_set BOOLEAN DEFAULT FALSE, -- If this was an added set
  is_added_exercise BOOLEAN DEFAULT FALSE -- If this was an exercise added during workout
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_workout_id ON workout_sessions(workout_id);
CREATE INDEX IF NOT EXISTS idx_exercise_performance_logs_session_id ON exercise_performance_logs(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_exercise_performance_logs_exercise_id ON exercise_performance_logs(exercise_id);

-- Grant permissions
GRANT ALL ON workout_sessions TO anon, authenticated;
GRANT ALL ON exercise_performance_logs TO anon, authenticated;
