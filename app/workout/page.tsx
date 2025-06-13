"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Check, Clock, Play, Plus, Edit3, Search, Timer, Weight, Dumbbell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import {
  createWorkoutSession,
  logExercisePerformance,
  completeWorkoutSession,
} from "../actions/workout-logging-actions"

// Demo user ID
const DEMO_USER_ID = "550e8400-e29b-41d4-a716-446655440000"

interface WorkoutExercise {
  id: string
  sets: number
  reps_per_set: string
  rest_seconds: number
  order_index: number
  notes: string
  exercise: {
    id: string
    name: string
    category: string
    description: string
    target_muscles: string[]
    exercise_type?: "weight" | "bodyweight" | "time" | "distance"
    measurement_unit?: string
  }
}

interface Workout {
  id: string
  name: string
  description: string
  workout_exercises: WorkoutExercise[]
}

interface ExerciseLog {
  exerciseId: string
  setNumber: number
  reps?: number
  weight?: number
  duration?: number
  distance?: number
  distanceUnit?: string
  completed: boolean
  notes?: string
}

interface Exercise {
  id: string
  name: string
  category: string
  description: string
  target_muscles: string[]
  exercise_type?: "weight" | "bodyweight" | "time" | "distance"
  measurement_unit?: string
}

export default function WorkoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workoutId = searchParams.get("id")

  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, ExerciseLog[]>>({})
  const [extraSets, setExtraSets] = useState<Record<string, number>>({})
  const [addedExercises, setAddedExercises] = useState<WorkoutExercise[]>([])
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [exerciseSearch, setExerciseSearch] = useState("")
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [editingSet, setEditingSet] = useState<{ exerciseId: string; setNumber: number } | null>(null)
  const [isResting, setIsResting] = useState(false)
  const [workoutSessionId, setWorkoutSessionId] = useState<string | null>(null)
  const [workoutStartTime, setWorkoutStartTime] = useState<Date>(new Date())
  const [savingWorkout, setSavingWorkout] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!workoutId) {
        // If no workout ID provided, get the first workout from the active plan
        try {
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

          if (planData?.workouts && planData.workouts.length > 0) {
            const today = new Date().getDay()
            const todayWorkout = planData.workouts.find((w: any) => w.day_of_week === today)
            const selectedWorkout = todayWorkout || planData.workouts[0]

            if (selectedWorkout.workout_exercises) {
              selectedWorkout.workout_exercises.sort((a: any, b: any) => a.order_index - b.order_index)
            }

            setWorkout(selectedWorkout)
            createNewWorkoutSession(selectedWorkout.id)
          } else {
            setError("No workouts found in your active plan")
          }
        } catch (err: any) {
          console.error("Error fetching workout plan:", err)
          setError("Failed to load workout")
        }
      } else {
        try {
          const { data, error } = await supabase
            .from("workouts")
            .select(`
              *,
              workout_exercises (
                *,
                exercise:exercises (
                  *
                )
              )
            `)
            .eq("id", workoutId)
            .single()

          if (error) {
            throw error
          }

          if (data.workout_exercises) {
            data.workout_exercises.sort((a: any, b: any) => a.order_index - b.order_index)
          }

          setWorkout(data)
          createNewWorkoutSession(data.id)
        } catch (err: any) {
          console.error("Error fetching workout:", err)
          setError("Failed to load workout")
        }
      }
      setLoading(false)
    }

    const fetchExercises = async () => {
      try {
        const { data, error } = await supabase.from("exercises").select("*").order("name")

        if (data) {
          setAvailableExercises(data)
        }
      } catch (err) {
        console.error("Error fetching exercises:", err)
      }
    }

    fetchWorkout()
    fetchExercises()
  }, [workoutId])

  const createNewWorkoutSession = async (workoutId: string) => {
    try {
      const startTime = new Date()
      setWorkoutStartTime(startTime)

      const result = await createWorkoutSession({
        userId: DEMO_USER_ID,
        workoutId: workoutId,
        startedAt: startTime.toISOString(),
      })

      if (result.success) {
        setWorkoutSessionId(result.sessionId)
      }
    } catch (err) {
      console.error("Error creating workout session:", err)
    }
  }

  const updateExerciseLog = (exerciseId: string, setNumber: number, updates: Partial<ExerciseLog>) => {
    setExerciseLogs((prev) => {
      const exerciseLogs = prev[exerciseId] || []
      const existingLogIndex = exerciseLogs.findIndex((log) => log.setNumber === setNumber)

      if (existingLogIndex >= 0) {
        const updatedLogs = [...exerciseLogs]
        updatedLogs[existingLogIndex] = { ...updatedLogs[existingLogIndex], ...updates }
        return { ...prev, [exerciseId]: updatedLogs }
      } else {
        const newLog: ExerciseLog = {
          exerciseId,
          setNumber,
          completed: false,
          ...updates,
        }
        return { ...prev, [exerciseId]: [...exerciseLogs, newLog] }
      }
    })
  }

  const saveSetToDatabase = async (exerciseId: string, setNumber: number) => {
    if (!workoutSessionId) return

    const log = getExerciseLog(exerciseId, setNumber)
    if (!log) return

    const exercise = [...(workout?.workout_exercises || []), ...addedExercises].find((ex) => ex.id === exerciseId)

    if (!exercise) return

    const isExtraSet = setNumber > exercise.sets
    const isAddedExercise = addedExercises.some((ex) => ex.id === exerciseId)

    try {
      await logExercisePerformance({
        workoutSessionId,
        exerciseId: exercise.exercise.id,
        setNumber,
        plannedReps: exercise.reps_per_set,
        actualReps: log.reps,
        plannedWeight: undefined,
        actualWeight: log.weight,
        durationSeconds: log.duration,
        distance: log.distance,
        distanceUnit: log.distanceUnit,
        restSeconds: exercise.rest_seconds,
        completed: log.completed,
        notes: log.notes,
        isExtraSet,
        isAddedExercise,
      })
    } catch (err) {
      console.error("Error saving set to database:", err)
    }
  }

  const addExtraSet = (exerciseId: string) => {
    setExtraSets((prev) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] || 0) + 1,
    }))
  }

  const addExerciseToWorkout = (exercise: Exercise) => {
    const newWorkoutExercise: WorkoutExercise = {
      id: `added-${Date.now()}`,
      sets: 3,
      reps_per_set: exercise.exercise_type === "time" ? "30 sec" : "8-12",
      rest_seconds: 60,
      order_index: (workout?.workout_exercises.length || 0) + addedExercises.length,
      notes: "Added during workout",
      exercise: {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        description: exercise.description,
        target_muscles: exercise.target_muscles || [],
        exercise_type: exercise.exercise_type || "weight",
        measurement_unit: exercise.measurement_unit || "lbs",
      },
    }

    setAddedExercises((prev) => [...prev, newWorkoutExercise])
    setShowAddExercise(false)
    setExerciseSearch("")
  }

  const getExerciseLog = (exerciseId: string, setNumber: number): ExerciseLog | undefined => {
    return exerciseLogs[exerciseId]?.find((log) => log.setNumber === setNumber)
  }

  const getTotalSets = (exerciseId: string, originalSets: number): number => {
    return originalSets + (extraSets[exerciseId] || 0)
  }

  const getProgress = () => {
    if (!workout) return 0

    const allExercises = [...workout.workout_exercises, ...addedExercises]
    let totalSets = 0
    let completedSets = 0

    allExercises.forEach((ex) => {
      const sets = getTotalSets(ex.id, ex.sets)
      totalSets += sets

      for (let i = 1; i <= sets; i++) {
        const log = getExerciseLog(ex.id, i)
        if (log?.completed) {
          completedSets++
        }
      }
    })

    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0
  }

  const handleCompleteSet = async (exerciseId: string, setNumber: number) => {
    updateExerciseLog(exerciseId, setNumber, {
      completed: true,
    })

    await saveSetToDatabase(exerciseId, setNumber)
    setDialogOpen(false)
    setEditingSet(null)
  }

  const handleCompleteWorkout = async () => {
    if (!workoutSessionId) return

    setSavingWorkout(true)

    try {
      // Calculate workout duration in minutes
      const endTime = new Date()
      const durationMinutes = Math.round((endTime.getTime() - workoutStartTime.getTime()) / 60000)

      await completeWorkoutSession(workoutSessionId, durationMinutes)

      // Redirect to workout history page
      router.push("/workout-history")
    } catch (err) {
      console.error("Error completing workout:", err)
      setSavingWorkout(false)
    }
  }

  const filteredExercises = availableExercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.category.toLowerCase().includes(exerciseSearch.toLowerCase()),
  )

  const getExerciseTypeIcon = (type?: string) => {
    switch (type) {
      case "weight":
        return <Weight className="h-4 w-4" />
      case "time":
        return <Timer className="h-4 w-4" />
      case "distance":
        return <ArrowLeft className="h-4 w-4" />
      case "bodyweight":
      default:
        return <Dumbbell className="h-4 w-4" />
    }
  }

  const formatMeasurement = (exercise: WorkoutExercise["exercise"], log?: ExerciseLog) => {
    const type = exercise.exercise.exercise_type || "weight"
    const unit = exercise.exercise.measurement_unit || "lbs"

    switch (type) {
      case "weight":
        return log?.weight ? `${log.weight} ${unit}` : "—"
      case "time":
        return log?.duration ? `${log.duration} ${unit}` : "—"
      case "distance":
        return log?.distance ? `${log.distance} ${log.distanceUnit || unit}` : "—"
      case "bodyweight":
      default:
        return "Bodyweight"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Play className="mx-auto h-8 w-8 animate-pulse text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading your workout...</p>
        </div>
      </div>
    )
  }

  if (error || !workout) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Workout not found"}</p>
          <Button onClick={() => router.push("/")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  const allExercises = [...workout.workout_exercises, ...addedExercises]
  const workoutProgress = getProgress()
  const isWorkoutComplete = workoutProgress >= 100

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-lg font-semibold">{workout.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Exercise
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Exercise</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search exercises..."
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredExercises.slice(0, 10).map((exercise) => (
                    <div
                      key={exercise.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => addExerciseToWorkout(exercise)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{exercise.name}</div>
                        <Badge variant="outline" className="text-xs">
                          {exercise.exercise_type || "weight"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{exercise.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4" />
            <span>45 min</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium">Workout Progress</h2>
            <span className="text-sm text-muted-foreground">{Math.round(workoutProgress)}% complete</span>
          </div>
          <Progress value={workoutProgress} className="h-2" />
        </div>

        <div className="space-y-4">
          {allExercises.map((exercise, exerciseIndex) => {
            const totalSets = getTotalSets(exercise.id, exercise.sets)
            const isAdded = exerciseIndex >= workout.workout_exercises.length
            const exerciseType = exercise.exercise.exercise_type || "weight"

            return (
              <Card key={exercise.id} className={isAdded ? "border-blue-200 bg-blue-50/30" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {exercise.exercise.name}
                        <Badge variant="outline" className="text-xs">
                          {exerciseType}
                        </Badge>
                        {isAdded && (
                          <Badge variant="secondary" className="text-xs">
                            Added
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {exercise.sets} sets × {exercise.reps_per_set}
                        {extraSets[exercise.id] && ` + ${extraSets[exercise.id]} extra sets`}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => addExtraSet(exercise.id)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Set
                    </Button>
                  </div>
                  {exercise.exercise.target_muscles && exercise.exercise.target_muscles.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Targets: {exercise.exercise.target_muscles.join(", ")}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: totalSets }).map((_, setIndex) => {
                      const setNumber = setIndex + 1
                      const log = getExerciseLog(exercise.id, setNumber)
                      const isExtra = setNumber > exercise.sets

                      return (
                        <div
                          key={setIndex}
                          className={`rounded-lg border p-3 ${
                            log?.completed ? "bg-green-50 border-green-200" : "bg-muted/30"
                          } ${isExtra ? "border-dashed border-blue-300" : ""}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                Set {setNumber}
                                {isExtra && " (Extra)"}
                              </span>
                              {log?.completed && <Check className="h-4 w-4 text-green-600" />}
                            </div>
                            <Dialog
                              open={
                                editingSet?.exerciseId === exercise.id &&
                                editingSet?.setNumber === setNumber &&
                                dialogOpen
                              }
                              onOpenChange={(open) => {
                                setDialogOpen(open)
                                if (!open) setEditingSet(null)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingSet({ exerciseId: exercise.id, setNumber })
                                    setDialogOpen(true)
                                  }}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-sm">
                                <DialogHeader>
                                  <DialogTitle>Log Set {setNumber}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    {/* For all exercise types, show reps input */}
                                    {exerciseType !== "time" && (
                                      <div>
                                        <Label htmlFor="reps">Reps</Label>
                                        <Input
                                          id="reps"
                                          type="number"
                                          placeholder={exercise.reps_per_set}
                                          value={log?.reps || ""}
                                          onChange={(e) =>
                                            updateExerciseLog(exercise.id, setNumber, {
                                              reps: Number.parseInt(e.target.value) || 0,
                                            })
                                          }
                                        />
                                      </div>
                                    )}

                                    {/* For weight-based exercises, show weight input */}
                                    {exerciseType === "weight" && (
                                      <div>
                                        <Label htmlFor="weight">
                                          Weight ({exercise.exercise.measurement_unit || "lbs"})
                                        </Label>
                                        <Input
                                          id="weight"
                                          type="number"
                                          placeholder="0"
                                          value={log?.weight || ""}
                                          onChange={(e) =>
                                            updateExerciseLog(exercise.id, setNumber, {
                                              weight: Number.parseFloat(e.target.value) || 0,
                                            })
                                          }
                                        />
                                      </div>
                                    )}

                                    {/* For time-based exercises, show duration input */}
                                    {exerciseType === "time" && (
                                      <div>
                                        <Label htmlFor="duration">
                                          Duration ({exercise.exercise.measurement_unit || "seconds"})
                                        </Label>
                                        <Input
                                          id="duration"
                                          type="number"
                                          placeholder="30"
                                          value={log?.duration || ""}
                                          onChange={(e) =>
                                            updateExerciseLog(exercise.id, setNumber, {
                                              duration: Number.parseInt(e.target.value) || 0,
                                            })
                                          }
                                        />
                                      </div>
                                    )}

                                    {/* For distance-based exercises, show distance inputs */}
                                    {exerciseType === "distance" && (
                                      <>
                                        <div>
                                          <Label htmlFor="distance">Distance</Label>
                                          <Input
                                            id="distance"
                                            type="number"
                                            placeholder="0"
                                            value={log?.distance || ""}
                                            onChange={(e) =>
                                              updateExerciseLog(exercise.id, setNumber, {
                                                distance: Number.parseFloat(e.target.value) || 0,
                                              })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="distanceUnit">Unit</Label>
                                          <Select
                                            value={log?.distanceUnit || exercise.exercise.measurement_unit || "meters"}
                                            onValueChange={(value) =>
                                              updateExerciseLog(exercise.id, setNumber, {
                                                distanceUnit: value,
                                              })
                                            }
                                          >
                                            <SelectTrigger id="distanceUnit">
                                              <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="meters">meters</SelectItem>
                                              <SelectItem value="km">kilometers</SelectItem>
                                              <SelectItem value="miles">miles</SelectItem>
                                              <SelectItem value="yards">yards</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  <div>
                                    <Label htmlFor="notes">Notes (optional)</Label>
                                    <Textarea
                                      id="notes"
                                      placeholder="How did this set feel?"
                                      value={log?.notes || ""}
                                      onChange={(e) =>
                                        updateExerciseLog(exercise.id, setNumber, {
                                          notes: e.target.value,
                                        })
                                      }
                                      className="min-h-[60px]"
                                    />
                                  </div>
                                  <Button className="w-full" onClick={() => handleCompleteSet(exercise.id, setNumber)}>
                                    Complete Set
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {/* Show appropriate tracking fields based on exercise type */}
                            {exerciseType !== "time" && (
                              <div>
                                <span className="text-muted-foreground">Reps: </span>
                                <span className="font-medium">{log?.reps || exercise.reps_per_set}</span>
                              </div>
                            )}

                            {exerciseType === "weight" && (
                              <div>
                                <span className="text-muted-foreground">Weight: </span>
                                <span className="font-medium">
                                  {log?.weight ? `${log.weight} ${exercise.exercise.measurement_unit || "lbs"}` : "—"}
                                </span>
                              </div>
                            )}

                            {exerciseType === "time" && (
                              <div>
                                <span className="text-muted-foreground">Duration: </span>
                                <span className="font-medium">
                                  {log?.duration
                                    ? `${log.duration} ${exercise.exercise.measurement_unit || "seconds"}`
                                    : exercise.reps_per_set}
                                </span>
                              </div>
                            )}

                            {exerciseType === "distance" && (
                              <div>
                                <span className="text-muted-foreground">Distance: </span>
                                <span className="font-medium">
                                  {log?.distance
                                    ? `${log.distance} ${
                                        log.distanceUnit || exercise.exercise.measurement_unit || "meters"
                                      }`
                                    : "—"}
                                </span>
                              </div>
                            )}

                            {exerciseType === "bodyweight" && (
                              <div>
                                <span className="text-muted-foreground">Type: </span>
                                <span className="font-medium">Bodyweight</span>
                              </div>
                            )}

                            <div>
                              <span className="text-muted-foreground">Status: </span>
                              <span
                                className={`font-medium ${log?.completed ? "text-green-600" : "text-muted-foreground"}`}
                              >
                                {log?.completed ? "Done" : "Pending"}
                              </span>
                            </div>
                          </div>

                          {log?.notes && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                              <strong>Note:</strong> {log.notes}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {exercise.notes && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
                      <strong>AI Note:</strong> {exercise.notes}
                    </div>
                  )}

                  {exercise.rest_seconds && (
                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Rest: {exercise.rest_seconds} seconds between sets
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>

      <footer className="sticky bottom-0 z-10 flex h-16 items-center justify-center border-t bg-background px-4">
        <Button
          className="w-full max-w-xs"
          size="lg"
          onClick={handleCompleteWorkout}
          disabled={!isWorkoutComplete || savingWorkout}
        >
          {savingWorkout ? (
            <>
              <Dumbbell className="mr-2 h-4 w-4 animate-spin" />
              Saving Workout...
            </>
          ) : isWorkoutComplete ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Complete Workout
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Continue Workout
            </>
          )}
        </Button>
      </footer>
    </div>
  )
}
