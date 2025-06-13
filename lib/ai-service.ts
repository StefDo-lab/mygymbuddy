// lib/ai-service.ts

import type { UserProfile } from "@/types/fitness"

// Mock function for generating workout plans
export async function generateWorkoutPlan(profile: UserProfile) {
  console.log("Generating workout plan for profile:", profile)

  // In a real implementation, this would call an AI service
  // For now, we'll return a mock workout plan
  return {
    name: `${profile.experience_level} Workout Plan`,
    description: `A personalized workout plan for ${profile.goals?.join(", ") || "general fitness"}.`,
    duration_weeks: 4,
    workouts: [
      {
        name: "Upper Body Day",
        day_of_week: 1, // Monday
        description: "Focus on chest, shoulders, and triceps",
        exercises: [
          {
            exercise_id: "1", // Bench Press
            sets: 3,
            reps_per_set: 10,
            rest_seconds: 60,
            order_index: 1,
            notes: "Focus on form",
          },
          {
            exercise_id: "4", // Shoulder Press
            sets: 3,
            reps_per_set: 12,
            rest_seconds: 60,
            order_index: 2,
            notes: "",
          },
        ],
      },
      {
        name: "Lower Body Day",
        day_of_week: 3, // Wednesday
        description: "Focus on legs and core",
        exercises: [
          {
            exercise_id: "7", // Squats
            sets: 4,
            reps_per_set: 10,
            rest_seconds: 90,
            order_index: 1,
            notes: "Go heavy but maintain form",
          },
          {
            exercise_id: "8", // Lunges
            sets: 3,
            reps_per_set: 12,
            rest_seconds: 60,
            order_index: 2,
            notes: "",
          },
        ],
      },
      {
        name: "Full Body Day",
        day_of_week: 5, // Friday
        description: "Full body workout with compound movements",
        exercises: [
          {
            exercise_id: "1", // Bench Press
            sets: 3,
            reps_per_set: 8,
            rest_seconds: 90,
            order_index: 1,
            notes: "",
          },
          {
            exercise_id: "7", // Squats
            sets: 3,
            reps_per_set: 8,
            rest_seconds: 90,
            order_index: 2,
            notes: "",
          },
        ],
      },
    ],
  }
}

// Mock function for exercise recommendations
export async function getExerciseRecommendations(profile: UserProfile, recentWorkouts: any[]) {
  console.log("Getting exercise recommendations for profile:", profile)
  console.log("Recent workouts:", recentWorkouts)

  // In a real implementation, this would analyze workout history and use AI
  // For now, we'll return mock recommendations
  return [
    {
      id: "1",
      name: "Bench Press",
      reason: "Great for building chest strength",
    },
    {
      id: "7",
      name: "Squats",
      reason: "Essential for lower body development",
    },
    {
      id: "12",
      name: "Pull-ups",
      reason: "Helps improve back and arm strength",
    },
  ]
}

// Adding the missing generateProgressInsights function
export async function generateProgressInsights(profile: UserProfile, workoutLogs: any[]) {
  console.log("Generating progress insights for profile:", profile)
  console.log("Workout logs:", workoutLogs)

  // In a real implementation, this would analyze workout history and use AI
  // For now, we'll return mock insights
  const insights = [
    "You've been consistent with your workouts. Keep it up!",
    `Your ${profile.goals?.[0] || "fitness"} progress is on track.`,
    "Consider increasing weights on your compound exercises.",
    "Your workout frequency matches your goals well.",
    "Try adding more variety to your exercise selection.",
  ]

  // Return a subset of insights based on workout history length
  const insightCount = Math.min(3, Math.max(1, workoutLogs.length / 2))
  return insights.slice(0, insightCount)
}

// Update the preparePrompt function
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
