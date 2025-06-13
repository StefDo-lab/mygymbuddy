"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export interface WorkoutSessionData {
  userId: string
  workoutId?: string
  startedAt: string
  notes?: string
}

export interface ExerciseLogData {
  workoutSessionId: string
  exerciseId: string
  setNumber: number
  plannedReps?: string
  actualReps?: number
  plannedWeight?: number
  actualWeight?: number
  durationSeconds?: number
  distance?: number
  distanceUnit?: string
  restSeconds?: number
  completed: boolean
  difficultyRating?: number
  notes?: string
  isExtraSet?: boolean
  isAddedExercise?: boolean
}

export async function createWorkoutSession(data: WorkoutSessionData) {
  try {
    const { data: session, error } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: data.userId,
        workout_id: data.workoutId,
        started_at: data.startedAt,
        notes: data.notes,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create workout session: ${error.message}`)
    }

    return { success: true, sessionId: session.id }
  } catch (error) {
    console.error("Create workout session error:", error)
    throw error
  }
}

export async function logExercisePerformance(data: ExerciseLogData) {
  try {
    const { error } = await supabase.from("exercise_performance_logs").upsert({
      workout_session_id: data.workoutSessionId,
      exercise_id: data.exerciseId,
      set_number: data.setNumber,
      planned_reps: data.plannedReps,
      actual_reps: data.actualReps,
      planned_weight: data.plannedWeight,
      actual_weight: data.actualWeight,
      duration_seconds: data.durationSeconds,
      distance: data.distance,
      distance_unit: data.distanceUnit,
      rest_seconds: data.restSeconds,
      completed: data.completed,
      difficulty_rating: data.difficultyRating,
      notes: data.notes,
      is_extra_set: data.isExtraSet,
      is_added_exercise: data.isAddedExercise,
    })

    if (error) {
      throw new Error(`Failed to log exercise performance: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Log exercise performance error:", error)
    throw error
  }
}

export async function completeWorkoutSession(sessionId: string, totalDurationMinutes?: number) {
  try {
    const { error } = await supabase
      .from("workout_sessions")
      .update({
        completed_at: new Date().toISOString(),
        total_duration_minutes: totalDurationMinutes,
      })
      .eq("id", sessionId)

    if (error) {
      throw new Error(`Failed to complete workout session: ${error.message}`)
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Complete workout session error:", error)
    throw error
  }
}

export async function getWorkoutHistory(userId: string, limit = 10) {
  try {
    const { data, error } = await supabase
      .from("workout_sessions")
      .select(`
        *,
        workout:workouts(name, description),
        exercise_performance_logs(
          *,
          exercise:exercises(name, category, exercise_type, measurement_unit)
        )
      `)
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch workout history: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Get workout history error:", error)
    return []
  }
}

export async function getExerciseProgress(userId: string, exerciseId: string) {
  try {
    const { data, error } = await supabase
      .from("exercise_performance_logs")
      .select(`
        *,
        workout_session:workout_sessions!inner(user_id, started_at)
      `)
      .eq("workout_session.user_id", userId)
      .eq("exercise_id", exerciseId)
      .eq("completed", true)
      .order("workout_session.started_at", { ascending: false })
      .limit(20)

    if (error) {
      throw new Error(`Failed to fetch exercise progress: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Get exercise progress error:", error)
    return []
  }
}
