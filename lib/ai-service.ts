import type { UserProfile } from "@/types/fitness"
import { mockExercises } from "./supabase"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo"

function preparePrompt(profile: UserProfile): string {
  // Extract health details if available
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
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
            healthDetailsText += `- ${displayName}: ${details}\n`
          }
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
    }
  }

  // Add mock exercises or further prompt preparation logic here
  // ...

  return healthDetailsText
}

// Weitere Funktionen, falls vorhanden

main
