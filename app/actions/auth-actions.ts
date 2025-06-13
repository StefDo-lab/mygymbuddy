"use server"

import { supabase } from "@/lib/supabase"
import type { UserProfile } from "@/types/fitness"
import { revalidatePath } from "next/cache"

export async function createUserProfile(profile: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Creating profile for user:", profile.id)

    if (!profile.id) {
      return { success: false, error: "User ID is required" }
    }

    // Calculate age from date of birth if provided
    let age = profile.age || 30
    if (profile.date_of_birth) {
      try {
        const birthDate = new Date(profile.date_of_birth)
        const today = new Date()
        age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
      } catch (e) {
        console.error("Error calculating age:", e)
        // Continue with the default age if calculation fails
      }
    }

    // First check if a profile already exists for this user
    const { data: existingProfile, error: checkError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", profile.id)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking for existing profile:", checkError)
    }

    if (existingProfile) {
      console.log("Profile already exists, updating instead of creating")
      return updateUserProfile(profile.id as string, profile)
    }

    // Use raw SQL to bypass ORM constraints
    const { error: sqlError } = await supabase.rpc("create_profile_safely", {
      p_user_id: profile.id,
      p_age: age,
      p_sex: profile.sex || "male",
      p_training_days: profile.training_days_per_week || 3,
      p_experience: profile.experience_level || "beginner",
      p_goals: profile.goals || ["strength"],
      p_email: profile.email || null,
    })

    if (sqlError) {
      console.error("Error creating profile with RPC:", sqlError)
      return { success: false, error: sqlError.message }
    }

    // If we successfully created the basic profile, try to update with extended fields
    if (
      profile.height_cm ||
      profile.weight_kg ||
      profile.date_of_birth ||
      profile.health_conditions?.length ||
      profile.medical_notes ||
      profile.ai_instructions
    ) {
      const extendedFields: Record<string, any> = {}

      if (profile.height_cm) extendedFields.height_cm = profile.height_cm
      if (profile.weight_kg) extendedFields.weight_kg = profile.weight_kg
      if (profile.date_of_birth) extendedFields.date_of_birth = profile.date_of_birth
      if (profile.health_conditions?.length) extendedFields.health_conditions = profile.health_conditions
      if (profile.medical_notes) extendedFields.medical_notes = profile.medical_notes
      if (profile.ai_instructions) extendedFields.ai_instructions = profile.ai_instructions

      const { error: updateError } = await supabase.from("user_profiles").update(extendedFields).eq("id", profile.id)

      if (updateError) {
        console.warn("Warning: Could not update extended profile fields:", updateError)
        // Don't return error here, as the base profile was created successfully
      }
    }

    revalidatePath("/profile")
    return { success: true }
  } catch (error: any) {
    console.error("Profile creation error:", error)
    return { success: false, error: error.message }
  }
}

export async function getCurrentUser() {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Error getting session:", sessionError)
      return null
    }

    if (!sessionData.session) {
      return null
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error("Error getting user:", userError)
      return null
    }

    return userData.user
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

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
    // Remove any fields that might not exist in the schema
    const safeProfileData: Record<string, any> = {}

    // Always safe fields
    const safeFields = [
      "age",
      "sex",
      "training_days_per_week",
      "experience_level",
      "goals",
      "rehab_details",
      "sport_details",
      "ai_instructions",
    ]

    // Add safe fields if they exist in profileData
    for (const field of safeFields) {
      if (profileData[field as keyof typeof profileData] !== undefined) {
        safeProfileData[field] = profileData[field as keyof typeof profileData]
      }
    }

    // Try to add extended fields
    try {
      if (profileData.email !== undefined) safeProfileData.email = profileData.email
      if (profileData.height_cm !== undefined) safeProfileData.height_cm = profileData.height_cm
      if (profileData.weight_kg !== undefined) safeProfileData.weight_kg = profileData.weight_kg
      if (profileData.date_of_birth !== undefined) safeProfileData.date_of_birth = profileData.date_of_birth
      if (profileData.health_conditions !== undefined) safeProfileData.health_conditions = profileData.health_conditions
      if (profileData.medical_notes !== undefined) safeProfileData.medical_notes = profileData.medical_notes
    } catch (err) {
      console.warn("Warning: Some extended fields might not exist in schema:", err)
    }

    // Add updated_at timestamp
    safeProfileData.updated_at = new Date().toISOString()

    const { error } = await supabase.from("user_profiles").update(safeProfileData).eq("id", userId)

    if (error) {
      console.error("Error updating user profile:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/profile")
    return { success: true }
  } catch (error: any) {
    console.error("Error in updateUserProfile:", error)
    return { success: false, error: error.message }
  }
}

export async function checkUserProfileExists(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("user_profiles").select("id").eq("id", userId).maybeSingle()

    if (error) {
      console.error("Error checking user profile:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Error in checkUserProfileExists:", error)
    return false
  }
}
