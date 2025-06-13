"use server"

import { supabase } from "@/lib/supabase"
import { createWorkoutSession, logExercisePerformance, completeWorkoutSession } from "./workout-logging-actions"

// Demo user ID
const DEMO_USER_ID = "550e8400-e29b-41d4-a716-446655440000"

export async function createDemoWorkoutHistory() {
  try {
    // Get the first workout from the active plan
    const { data: planData, error: planError } = await supabase
      .from("workout_plans")
      .select(`
        *,
        workouts (
          *,
          workout_exercises (
            *,
            exercise:exercises (
              *
            )
          )
        )
      `)
      .eq("user_id", DEMO_USER_ID)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (planError) {
      throw planError
    }

    if (!planData?.workouts || planData.workouts.length === 0) {
      throw new Error("No workouts found in active plan")
    }

    // Create demo workout sessions for the past week
    const demoSessions = []

    // Create 3 workout sessions from the past week
    for (let i = 0; i < 3; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (i + 1)) // Past days

      // Select a workout from the plan
      const workoutIndex = i % planData.workouts.length
      const workout = planData.workouts[workoutIndex]

      if (!workout) continue

      // Create a workout session
      const startTime = new Date(date)
      startTime.setHours(18, 0, 0, 0) // 6:00 PM

      const result = await createWorkoutSession({
        userId: DEMO_USER_ID,
        workoutId: workout.id,
        startedAt: startTime.toISOString(),
        notes: i === 0 ? "Felt good today, increased weights on most exercises" : undefined,
      })

      if (!result.success) continue

      const sessionId = result.sessionId
      demoSessions.push(sessionId)

      // Log exercise performances
      if (workout.workout_exercises) {
        for (const exercise of workout.workout_exercises) {
          const exerciseType = exercise.exercise.exercise_type || "weight"

          for (let setNum = 1; setNum <= exercise.sets; setNum++) {
            // Create realistic performance data
            let actualReps: number | undefined
            let actualWeight: number | undefined
            let durationSeconds: number | undefined
            let distance: number | undefined
            let distanceUnit: string | undefined

            switch (exerciseType) {
              case "weight":
                actualReps = Math.floor(Math.random() * 5) + 8 // 8-12 reps
                actualWeight = (Math.floor(Math.random() * 10) + 10) * 5 // 50-100 lbs in 5lb increments
                break
              case "bodyweight":
                actualReps = Math.floor(Math.random() * 10) + 10 // 10-20 reps
                break
              case "time":
                durationSeconds = (Math.floor(Math.random() * 6) + 5) * 10 // 50-100 seconds
                break
              case "distance":
                distance = Math.floor(Math.random() * 500) + 500 // 500-1000
                distanceUnit = "meters"
                break
            }

            await logExercisePerformance({
              workoutSessionId: sessionId,
              exerciseId: exercise.exercise.id,
              setNumber: setNum,
              plannedReps: exercise.reps_per_set,
              actualReps,
              actualWeight,
              durationSeconds,
              distance,
              distanceUnit,
              restSeconds: exercise.rest_seconds,
              completed: true,
              notes: setNum === 1 && i === 0 ? "This felt challenging but doable" : undefined,
              isExtraSet: false,
              isAddedExercise: false,
            })
          }

          // Add an extra set for one exercise in the first workout
          if (i === 0) {
            await logExercisePerformance({
              workoutSessionId: sessionId,
              exerciseId: exercise.exercise.id,
              setNumber: exercise.sets + 1,
              plannedReps: exercise.reps_per_set,
              actualReps: exerciseType !== "time" ? Math.floor(Math.random() * 5) + 6 : undefined, // 6-10 reps
              actualWeight: exerciseType === "weight" ? (Math.floor(Math.random() * 8) + 8) * 5 : undefined, // 40-80 lbs
              durationSeconds: exerciseType === "time" ? (Math.floor(Math.random() * 4) + 4) * 10 : undefined, // 40-80 seconds
              restSeconds: exercise.rest_seconds,
              completed: true,
              notes: "Added an extra set for more volume",
              isExtraSet: true,
              isAddedExercise: false,
            })
            break // Only add an extra set for one exercise
          }
        }
      }

      // Complete the workout session
      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + 45 + Math.floor(Math.random() * 30)) // 45-75 minute workout

      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
      await completeWorkoutSession(sessionId, durationMinutes)
    }

    return { success: true, count: demoSessions.length }
  } catch (error) {
    console.error("Error creating demo workout history:", error)
    return { success: false, error: String(error) }
  }
}
