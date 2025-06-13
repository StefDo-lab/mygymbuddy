"use server"

import { supabase } from "@/lib/supabase"
import { generateWorkoutPlan, getExerciseRecommendations, generateProgressInsights } from "@/lib/ai-service"
import type { UserProfile } from "@/types/fitness"
import { revalidatePath } from "next/cache"

export async function createAIWorkoutPlan(userId: string) {
  try {
    console.log("Starting AI workout plan creation for user:", userId)

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      throw new Error("Invalid user ID format")
    }

    // Get user profile
    console.log("Fetching user profile...")
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      throw new Error(`Failed to fetch user profile: ${profileError.message}`)
    }

    if (!userProfile) {
      throw new Error("User profile not found. Please create a profile first.")
    }

    console.log("User profile found:", userProfile)

    // Generate workout plan using AI
    console.log("Generating AI workout plan...")
    const workoutPlan = await generateWorkoutPlan(userProfile as UserProfile)
    console.log("AI workout plan generated:", workoutPlan)

    // Deactivate existing plans
    console.log("Deactivating existing plans...")
    const { error: deactivateError } = await supabase
      .from("workout_plans")
      .update({ active: false })
      .eq("user_id", userId)

    if (deactivateError) {
      console.error("Error deactivating plans:", deactivateError)
      // Don't throw here, just log the error
    }

    // Save the workout plan to the database
    console.log("Saving workout plan...")
    const { data: planData, error: planError } = await supabase
      .from("workout_plans")
      .insert({
        user_id: userId,
        name: workoutPlan.name,
        description: workoutPlan.description,
        duration_weeks: workoutPlan.duration_weeks,
        ai_generated: true,
        active: true,
      })
      .select()
      .single()

    if (planError) {
      console.error("Plan save error:", planError)
      throw new Error(`Failed to save workout plan: ${planError.message}`)
    }

    console.log("Workout plan saved:", planData)

    // Save the workouts
    if (workoutPlan.workouts && workoutPlan.workouts.length > 0) {
      for (const workout of workoutPlan.workouts) {
        console.log("Saving workout:", workout.name)
        const { data: workoutData, error: workoutError } = await supabase
          .from("workouts")
          .insert({
            plan_id: planData.id,
            name: workout.name,
            day_of_week: workout.day_of_week,
            description: workout.description,
          })
          .select()
          .single()

        if (workoutError) {
          console.error("Workout save error:", workoutError)
          throw new Error(`Failed to save workout: ${workoutError.message}`)
        }

        console.log("Workout saved:", workoutData)

        // Save the exercises for this workout
        if (workout.exercises && workout.exercises.length > 0) {
          for (const exercise of workout.exercises) {
            console.log("Saving exercise:", exercise.exercise_id)
            const { error: exerciseError } = await supabase.from("workout_exercises").insert({
              workout_id: workoutData.id,
              exercise_id: exercise.exercise_id,
              sets: exercise.sets,
              reps_per_set: exercise.reps_per_set,
              rest_seconds: exercise.rest_seconds,
              order_index: exercise.order_index,
              notes: exercise.notes,
            })

            if (exerciseError) {
              console.error("Exercise save error:", exerciseError)
              throw new Error(`Failed to save workout exercise: ${exerciseError.message}`)
            }
          }
        }
      }
    }

    console.log("All data saved successfully!")
    revalidatePath("/")
    return { success: true, planId: planData.id }
  } catch (error) {
    console.error("Create workout plan error:", error)
    throw error
  }
}

export async function getRecommendations(userId: string) {
  try {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      throw new Error("Invalid user ID format")
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (profileError) {
      throw new Error(`Failed to fetch user profile: ${profileError.message}`)
    }

    // Get recent workouts
    const { data: recentWorkouts } = await supabase
      .from("workout_logs")
      .select(`
        *,
        workout:workouts(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    // Get recommendations based on user profile and workout history
    const recommendations = await getExerciseRecommendations(userProfile as UserProfile, recentWorkouts || [])

    return recommendations
  } catch (error) {
    console.error("Get recommendations error:", error)
    return []
  }
}

export async function getProgressInsights(userId: string) {
  try {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return ["Complete your profile to get personalized insights!"]
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (profileError) {
      return ["Complete your profile to get personalized insights!"]
    }

    // Get workout logs
    const { data: workoutLogs } = await supabase
      .from("workout_logs")
      .select(`
        *,
        workout:workouts(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)

    const insights = await generateProgressInsights(userProfile as UserProfile, workoutLogs || [])

    return insights
  } catch (error) {
    console.error("Get insights error:", error)
    return [
      "Keep up the great work with your fitness journey!",
      "Consistency is key - you're building great habits.",
      "Consider tracking your progress to see improvements.",
    ]
  }
}
