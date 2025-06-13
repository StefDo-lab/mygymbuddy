-- First, ensure the exercise_performance_logs table exists (from script 11)
CREATE TABLE IF NOT EXISTS exercise_performance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  workout_session_id UUID NOT NULL, -- We'll add the foreign key constraint later if needed
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

-- Also ensure workout_sessions table exists
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

-- Add foreign key constraint for workout_session_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'exercise_performance_logs_workout_session_id_fkey'
  ) THEN
    ALTER TABLE exercise_performance_logs 
    ADD CONSTRAINT exercise_performance_logs_workout_session_id_fkey 
    FOREIGN KEY (workout_session_id) REFERENCES workout_sessions(id);
  END IF;
END $$;

-- Now add exercise_type field to exercises table
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS exercise_type TEXT CHECK (exercise_type IN ('weight', 'bodyweight', 'time', 'distance'));

-- Add default measurement_unit field to exercises table
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS measurement_unit TEXT;

-- Add comments to document the new fields
COMMENT ON COLUMN exercises.exercise_type IS 'Type of exercise: weight (track weight+reps), bodyweight (track reps only), time (track duration), distance (track distance)';
COMMENT ON COLUMN exercises.measurement_unit IS 'Default unit for measurement: kg, lbs, seconds, minutes, meters, km, etc.';

-- Update existing exercises with appropriate types
UPDATE exercises SET exercise_type = 'bodyweight', measurement_unit = 'reps' WHERE name = 'Push-ups' AND exercise_type IS NULL;
UPDATE exercises SET exercise_type = 'bodyweight', measurement_unit = 'reps' WHERE name = 'Pull-ups' AND exercise_type IS NULL;
UPDATE exercises SET exercise_type = 'bodyweight', measurement_unit = 'reps' WHERE name = 'Squats' AND exercise_type IS NULL;
UPDATE exercises SET exercise_type = 'weight', measurement_unit = 'lbs' WHERE name = 'Deadlifts' AND exercise_type IS NULL;
UPDATE exercises SET exercise_type = 'time', measurement_unit = 'seconds' WHERE name = 'Plank' AND exercise_type IS NULL;
UPDATE exercises SET exercise_type = 'bodyweight', measurement_unit = 'reps' WHERE name = 'Lunges' AND exercise_type IS NULL;
UPDATE exercises SET exercise_type = 'bodyweight', measurement_unit = 'reps' WHERE name = 'Dips' AND exercise_type IS NULL;
UPDATE exercises SET exercise_type = 'bodyweight', measurement_unit = 'reps' WHERE name = 'Burpees' AND exercise_type IS NULL;

-- Set default for any remaining exercises
UPDATE exercises SET exercise_type = 'weight', measurement_unit = 'lbs' WHERE exercise_type IS NULL;

-- Add new columns to exercise_performance_logs for duration and distance
ALTER TABLE exercise_performance_logs
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

ALTER TABLE exercise_performance_logs
ADD COLUMN IF NOT EXISTS distance NUMERIC;

ALTER TABLE exercise_performance_logs
ADD COLUMN IF NOT EXISTS distance_unit TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_workout_id ON workout_sessions(workout_id);
CREATE INDEX IF NOT EXISTS idx_exercise_performance_logs_session_id ON exercise_performance_logs(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_exercise_performance_logs_exercise_id ON exercise_performance_logs(exercise_id);

-- Grant permissions (since we disabled RLS earlier)
GRANT ALL ON workout_sessions TO anon, authenticated;
GRANT ALL ON exercise_performance_logs TO anon, authenticated;

-- Verify the changes
SELECT 'Exercise types updated successfully' as status;
