-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table with profile information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  age INTEGER,
  sex TEXT CHECK (sex IN ('male', 'female', 'other')),
  training_days_per_week INTEGER CHECK (training_days_per_week BETWEEN 1 AND 7),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'pro')),
  goals TEXT[] -- Array of goals like ['muscle', 'strength', 'rehab', 'sport-specific']
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'upper_body', 'lower_body', 'core', etc.
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  target_muscles TEXT[], -- Array of target muscles
  equipment TEXT[], -- Array of required equipment
  description TEXT,
  instructions TEXT[],
  tips TEXT[],
  variations TEXT[],
  video_url TEXT
);

-- Create workout plans table
CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL,
  ai_generated BOOLEAN DEFAULT TRUE,
  active BOOLEAN DEFAULT TRUE
);

-- Create workouts table (individual sessions within a plan)
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  plan_id UUID REFERENCES workout_plans(id) NOT NULL,
  name TEXT NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  description TEXT
);

-- Create workout_exercises table (exercises within a workout)
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  sets INTEGER NOT NULL,
  reps_per_set TEXT NOT NULL, -- e.g., '8-12' or '5' or 'failure'
  rest_seconds INTEGER,
  order_index INTEGER NOT NULL,
  notes TEXT
);

-- Create workout_logs table (completed workouts)
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  workout_id UUID REFERENCES workouts(id) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create exercise_logs table (completed exercises within a workout)
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_log_id UUID REFERENCES workout_logs(id) NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC,
  completed BOOLEAN DEFAULT TRUE,
  notes TEXT
);
