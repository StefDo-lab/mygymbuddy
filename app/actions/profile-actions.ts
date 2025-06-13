"use server"

import type { UserProfile } from "@/types/fitness"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }

    return data as UserProfile
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    return null
  }
}

export async function updateUserProfile(
  userId: string,
  profileData: Partial<UserProfile>,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create a clean profile object with only the fields we want to update
    const cleanProfile: Record<string, any> = {}

    // Add all the fields that exist in profileData
    if (profileData.age !== undefined) cleanProfile.age = profileData.age
    if (profileData.sex !== undefined) cleanProfile.sex = profileData.sex
    if (profileData.training_days_per_week !== undefined)
      cleanProfile.training_days_per_week = profileData.training_days_per_week
    if (profileData.experience_level !== undefined) cleanProfile.experience_level = profileData.experience_level
    if (profileData.goals !== undefined) cleanProfile.goals = profileData.goals
    if (profileData.rehab_details !== undefined) cleanProfile.rehab_details = profileData.rehab_details
    if (profileData.sport_details !== undefined) cleanProfile.sport_details = profileData.sport_details
    if (profileData.ai_instructions !== undefined) cleanProfile.ai_instructions = profileData.ai_instructions
    if (profileData.email !== undefined) cleanProfile.email = profileData.email
    if (profileData.height_cm !== undefined) cleanProfile.height_cm = profileData.height_cm
    if (profileData.weight_kg !== undefined) cleanProfile.weight_kg = profileData.weight_kg
    if (profileData.date_of_birth !== undefined) cleanProfile.date_of_birth = profileData.date_of_birth
    if (profileData.health_conditions !== undefined) cleanProfile.health_conditions = profileData.health_conditions
    if (profileData.medical_notes !== undefined) cleanProfile.medical_notes = profileData.medical_notes

    // Add updated_at timestamp
    cleanProfile.updated_at = new Date().toISOString()

    // Update the profile
    const { error } = await supabase.from("user_profiles").update(cleanProfile).eq("id", userId)

    if (error) {
      console.error("Error updating user profile:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/profile")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating user profile:", error)
    return { success: false, error: error.message }
  }
}
