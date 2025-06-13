-- Add exercise_type field to exercises table
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS exercise_type TEXT CHECK (exercise_type IN ('weight', 'bodyweight', 'time', 'distance'));

-- Add default measurement_unit field to exercises table
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS measurement_unit TEXT;

-- Add comments to document the new fields
COMMENT ON COLUMN exercises.exercise_type IS 'Type of exercise: weight (track weight+reps), bodyweight (track reps only), time (track duration), distance (track distance)';
COMMENT ON COLUMN exercises.measurement_unit IS 'Default unit for measurement: kg, lbs, seconds, minutes, meters, km, etc.';

-- Update existing exercises with appropriate types
UPDATE exercises SET exercise_type = 'bodyweight', measurement_unit = 'reps' WHERE name = 'Push-ups';
UPDATE exercises SET exercise_type = 'bodyweight', measurement_unit = 'reps' WHERE name = 'Pull-ups';
UPDATE exercises SET exercise_type = 'bodyweight', measurement_unit = 'reps' WHERE name = 'Squats';
UPDATE exercises SET exercise_type = 'weight', measurement_unit = 'lbs' WHERE name = 'Deadlifts';
UPDATE exercises SET exercise_type = 'time', measurement_unit = 'seconds' WHERE name = 'Plank';
UPDATE exercises SET exercise_type = 'bodyweight', measurement_unit = 'reps' WHERE name = 'Lunges';
UPDATE exercises SET exercise_type = 'bodyweight', measurement_unit = 'reps' WHERE name = 'Dips';
UPDATE exercises SET exercise_type = 'bodyweight', measurement_unit = 'reps' WHERE name = 'Burpees';

-- Set default for any remaining exercises
UPDATE exercises SET exercise_type = 'weight', measurement_unit = 'lbs' WHERE exercise_type IS NULL;

-- Add column to exercise_performance_logs for duration
ALTER TABLE exercise_performance_logs
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Add column to exercise_performance_logs for distance
ALTER TABLE exercise_performance_logs
ADD COLUMN IF NOT EXISTS distance NUMERIC;

-- Add column to exercise_performance_logs for distance unit
ALTER TABLE exercise_performance_logs
ADD COLUMN IF NOT EXISTS distance_unit TEXT;
