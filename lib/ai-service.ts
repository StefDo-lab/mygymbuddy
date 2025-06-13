// lib/ai-service.ts

// Update the AI service to consider health details when generating workout plans

// In the function that prepares the prompt for the AI
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
