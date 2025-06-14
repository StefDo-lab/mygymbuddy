import type { UserProfile } from "@/types/fitness"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo"

function preparePrompt(profile: UserProfile): string {
  let healthDetailsText = ""
  if (profile.health_conditions && profile.health_conditions.length > 0) {
    healthDetailsText = `Health conditions: ${profile.health_conditions.join(", ")}`
    if (profile.medical_notes) {
      try {
        const notes = JSON.parse(profile.medical_notes)
        healthDetailsText += "\n\nDetailed health information:\n"
        for (const [condition, details] of Object.entries(notes)) {
          if (details) {
            const displayName = condition
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
            healthDetailsText += `- ${displayName}: ${details}\n`
          }
        }
      } catch (e) {
        console.error("Error parsing medical notes:", e)
      }
    }
  }

  return `User Profile:\n- Age: ${profile.age}\n- Sex: ${profile.sex}\n- Experience Level: ${profile.experience_level}\n- Training Days Per Week: ${profile.training_days_per_week}\n- Goals: ${profile.goals?.join(", ") || "Not specified"}\n\n${healthDetailsText}\n\n${profile.ai_instructions ? `Additional Instructions: ${profile.ai_instructions}` : ""}`
}

async function callOpenAI(prompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    return ""
  }

  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: "You are a helpful fitness assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI request failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || ""
}

function getMockWorkoutPlan(): any {
  return {
    name: "Sample Plan",
    description: "This is a mock workout plan generated without AI.",
    duration_weeks: 4,
    workouts: [
      {
        name: "Full Body A",
        day_of_week: 1,
        description: "Basic full body session",
        exercises: [
          {
            exercise_id: "1",
            sets: 3,
            reps_per_set: "10",
            rest_seconds: 60,
            order_index: 1,
            notes: "",
          },
        ],
      },
    ],
  }
}

export async function generateWorkoutPlan(profile: UserProfile): Promise<any> {
  if (!OPENAI_API_KEY) {
    return getMockWorkoutPlan()
  }

  const prompt = `${preparePrompt(profile)}\n\nCreate a JSON workout plan including name, description, duration_weeks and workouts with exercises.`
  const response = await callOpenAI(prompt)
  try {
    return JSON.parse(response)
  } catch {
    return getMockWorkoutPlan()
  }
}

export async function getExerciseRecommendations(
  profile: UserProfile,
  recentWorkouts: any[],
): Promise<string[]> {
  if (!OPENAI_API_KEY) {
    return [
      "Focus on compound movements like squats and push-ups.",
      "Include core exercises such as planks.",
    ]
  }

  const prompt = `${preparePrompt(profile)}\n\nRecent workouts: ${JSON.stringify(recentWorkouts)}\nProvide three short exercise recommendations.`
  const response = await callOpenAI(prompt)
  return response
    .split(/\n+/)
    .map((l) => l.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
}

export async function generateProgressInsights(
  profile: UserProfile,
  workoutLogs: any[],
): Promise<string[]> {
  if (!OPENAI_API_KEY) {
    return [
      "Keep up the great work with your fitness journey!",
      "Consistency is key - you're building great habits.",
      "Consider tracking your progress to see improvements.",
    ]
  }

  const prompt = `${preparePrompt(profile)}\n\nWorkout logs: ${JSON.stringify(workoutLogs)}\nGive three short insights about the user's progress.`
  const response = await callOpenAI(prompt)
  return response
    .split(/\n+/)
    .map((l) => l.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
}

export { preparePrompt }

