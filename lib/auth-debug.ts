import { supabase } from "./supabase"

export async function debugAuthStatus() {
  try {
    // Check session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return {
        hasSession: false,
        error: sessionError.message,
        user: null,
      }
    }

    // Check user
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error("User error:", userError)
      return {
        hasSession: !!sessionData.session,
        error: userError.message,
        user: null,
      }
    }

    // Check if user has a profile
    let profileData = null
    let profileError = null

    if (userData.user) {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userData.user.id).single()

      profileData = data
      profileError = error
    }

    return {
      hasSession: !!sessionData.session,
      user: userData.user,
      profile: profileData,
      profileError: profileError ? profileError.message : null,
    }
  } catch (err: any) {
    console.error("Debug auth error:", err)
    return {
      hasSession: false,
      error: err.message,
      user: null,
    }
  }
}

export async function clearAuthState() {
  try {
    // Sign out to clear any problematic state
    await supabase.auth.signOut()

    // Clear local storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("supabase.auth.token")
      localStorage.removeItem("fitness-app-auth")

      // Clear all supabase-related items
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("supabase.") || key.startsWith("sb-")) {
          localStorage.removeItem(key)
        }
      })
    }

    return { success: true }
  } catch (err: any) {
    console.error("Clear auth state error:", err)
    return { success: false, error: err.message }
  }
}
