// lib/ai-service.ts

// Update the AI service to consider health details when generating workout plans

// In the function that prepares the prompt for the AI
import type { UserProfile } from "@/types/fitness"
import { mockExercises } from "./supabase"

function preparePrompt(profile: any) {
  // Extract health details if available
  let healthDetailsText = ""
  if (profile.health_conditions && profile.health_conditions.length > 0) {
    healthDetailsText = "Health conditions: " + profile.health_conditions.join(", ")

    // Add detailed health information if available
    if (profile.medical_notes) {
      try {
        const medicalNotes = JSON.parse(profile.medical_notes)
        healthDetailsText += "\n\nDetailed health information:\n"

        for (const [condition, details] of Object.entries(medicalNotes)) {
          if (details) {
            // Convert condition from snake_case to Title Case
            const displayName = condition
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")

            healthDetailsText += `- ${displayName}: ${details}\n`
          }
        }
      } catch (e) {
        console.error("Error parsing medical notes:", e)
      }
    }
  }

  // Include health details in the prompt
  const prompt = `
    User Profile:
    - Age: ${profile.age}
    - Sex: ${profile.sex}
    - Experience Level: ${profile.experience_level}
    - Training Days Per Week: ${profile.training_days_per_week}
    - Goals: ${profile.goals?.join(", ") || "Not specified"}
    
    ${healthDetailsText}
    
    ${profile.ai_instructions ? `Additional Instructions: ${profile.ai_instructions}` : ""}
    
    Based on this profile, create a personalized workout plan...
  `

  return prompt
}

export async function generateWorkoutPlan(profile: UserProfile) {
  // In a real implementation this would call an AI service using the prompt.
  preparePrompt(profile)

  const workouts = Array.from(
    { length: profile.training_days_per_week || 3 },
    (_, i) => ({
      name: `Workout Day ${i + 1}`,
      day_of_week: i % 7,
      description: "Auto generated workout",
      exercises: mockExercises.map((ex, idx) => ({
        exercise_id: String(ex.id),
        sets: 3,
        reps_per_set: "8-12",
        rest_seconds: 60,
        order_index: idx + 1,
        notes: "",
      })),
    }),
  )

  return {
    name: "Starter Plan",
    description: "Sample workout plan generated without AI.",
    duration_weeks: 4,
    workouts,
  }
}

export async function getExerciseRecommendations(
  profile: UserProfile,
  recentWorkouts: any[],
) {
  // Recommend exercises not recently performed (stub implementation)
  const recentIds = new Set(
    recentWorkouts.flatMap((w) =>
      (w.workout_exercises || []).map((we: any) => String(we.exercise_id)),
    ),
  )

  const recommendations = mockExercises
    .filter((ex) => !recentIds.has(String(ex.id)))
    .map((ex) => ex.name)

  return recommendations.slice(0, 5)
}

export async function generateProgressInsights(
  profile: UserProfile,
  workoutLogs: any[],
) {
  // Simple stub insights
  if (!workoutLogs || workoutLogs.length === 0) {
    return ["Start logging your workouts to see progress insights!"]
  }

  return [
    "Great consistency! Keep it up.",
    "Consider gradually increasing intensity for continued progress.",
    "Remember to rest and recover between sessions.",
  ]
}
