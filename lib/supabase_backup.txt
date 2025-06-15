import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Initialize the Supabase client with additional options for better reliability
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "fitness-app-auth",
  },
  global: {
    headers: {
      "x-application-name": "fitness-app",
    },
  },
  // Add reasonable timeouts
  realtime: {
    timeout: 30000, // 30 seconds
  },
})

// Export a function to get a fresh client when needed
export function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "fitness-app-auth-" + Date.now(), // Unique storage key
    },
  })
}

export const createClientComponentClient = () => {
  return supabase // Return the same singleton instance
}

// Mock data for demonstration
export const mockExercises = [
  {
    id: 1,
    name: "Push-ups",
    category: "Upper Body",
    target_muscles: ["Chest", "Shoulders", "Triceps"],
    difficulty: "Beginner",
    equipment: "Bodyweight",
    instructions: [
      "Start in a plank position with hands slightly wider than shoulder-width apart",
      "Lower your body until your chest nearly touches the floor",
      "Push yourself back up to the starting position",
      "Keep your body in a straight line throughout the movement",
    ],
  },
  {
    id: 2,
    name: "Squats",
    category: "Lower Body",
    target_muscles: ["Quadriceps", "Hamstrings", "Glutes"],
    difficulty: "Beginner",
    equipment: "Bodyweight",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Lower your body as if sitting back into a chair",
      "Keep your chest up and knees behind your toes",
      "Return to standing position",
    ],
  },
  {
    id: 3,
    name: "Plank",
    category: "Core",
    target_muscles: ["Core", "Shoulders"],
    difficulty: "Beginner",
    equipment: "Bodyweight",
    instructions: [
      "Start in a push-up position",
      "Lower to your forearms",
      "Keep your body in a straight line",
      "Hold the position",
    ],
  },
]

export const mockUserProfile = {
  id: 1,
  age: 28,
  sex: "male",
  training_days_per_week: 4,
  experience: "intermediate",
  goals: ["muscle", "strength"],
  created_at: new Date().toISOString(),
}
