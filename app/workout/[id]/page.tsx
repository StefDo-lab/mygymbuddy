"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Clock, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

interface WorkoutSession {
  id: string
  name: string
  description: string
  workout_exercises: Array<{
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
      instructions: string[]
    }
  }>
}

export default function WorkoutSessionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [workout, setWorkout] = useState<WorkoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [completedSets, setCompletedSets] = useState<Record<string, number[]>>({})
  const [isResting, setIsResting] = useState(false)
  const [restTimeLeft, setRestTimeLeft] = useState(0)

  useEffect(() => {
    const fetchWorkout = async () => {
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
          .eq("id", params.id)
          .single()

        if (error) {
          throw error
        }

        // Sort exercises by order
        if (data.workout_exercises) {
          data.workout_exercises.sort((a: any, b: any) => a.order_index - b.order_index)
        }

        setWorkout(data)
      } catch (err) {
        console.error("Error fetching workout:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkout()
  }, [params.id])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            setIsResting(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isResting, restTimeLeft])

  const handleSetComplete = (exerciseId: string, setNumber: number) => {
    setCompletedSets((prev) => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []), setNumber],
    }))

    const currentExercise = workout?.workout_exercises[currentExerciseIndex]
    if (currentExercise) {
      if (setNumber < currentExercise.sets) {
        // Start rest timer if not the last set
        if (currentExercise.rest_seconds) {
          setRestTimeLeft(currentExercise.rest_seconds)
          setIsResting(true)
        }
        setCurrentSet(setNumber + 1)
      } else {
        // Move to next exercise
        if (currentExerciseIndex < workout.workout_exercises.length - 1) {
          setCurrentExerciseIndex(currentExerciseIndex + 1)
          setCurrentSet(1)
        }
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    if (!workout) return 0
    const totalSets = workout.workout_exercises.reduce((sum, ex) => sum + ex.sets, 0)
    const completedSetsCount = Object.values(completedSets).reduce((sum, sets) => sum + sets.length, 0)
    return (completedSetsCount / totalSets) * 100
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Play className="mx-auto h-8 w-8 animate-pulse text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading workout...</p>
        </div>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Workout not found</p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const currentExercise = workout.workout_exercises[currentExerciseIndex]
  const isWorkoutComplete = currentExerciseIndex >= workout.workout_exercises.length

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-lg font-semibold">{workout.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4" />
            <span>
              {currentExerciseIndex + 1}/{workout.workout_exercises.length}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium">Workout Progress</h2>
            <span className="text-sm text-muted-foreground">
              {Object.values(completedSets).reduce((sum, sets) => sum + sets.length, 0)}/
              {workout.workout_exercises.reduce((sum, ex) => sum + ex.sets, 0)} sets
            </span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {isResting && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Rest Time</h3>
                <div className="text-3xl font-bold text-orange-600 mb-4">{formatTime(restTimeLeft)}</div>
                <Button onClick={() => setIsResting(false)}>Skip Rest</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!isWorkoutComplete && currentExercise && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{currentExercise.exercise.name}</span>
                <Badge variant="outline">{currentExercise.exercise.category}</Badge>
              </CardTitle>
              <CardDescription>{currentExercise.exercise.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    Set {currentSet} of {currentExercise.sets}
                  </div>
                  <div className="text-muted-foreground">{currentExercise.reps_per_set} reps</div>
                </div>

                {currentExercise.exercise.instructions && (
                  <div>
                    <h4 className="font-medium mb-2">Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {currentExercise.exercise.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {currentExercise.notes && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      <strong>Note:</strong> {currentExercise.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {isWorkoutComplete && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <Check className="mx-auto h-16 w-16 text-green-600 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Workout Complete!</h2>
                <p className="text-muted-foreground mb-6">Great job finishing your workout session.</p>
                <Button onClick={() => router.push("/")}>Back to Dashboard</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!isWorkoutComplete && currentExercise && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {Array.from({ length: currentExercise.sets }, (_, i) => i + 1).map((setNumber) => {
              const isCompleted = completedSets[currentExercise.id]?.includes(setNumber)
              const isCurrent = setNumber === currentSet
              return (
                <Button
                  key={setNumber}
                  variant={isCompleted ? "default" : isCurrent ? "outline" : "ghost"}
                  className={`h-16 ${isCurrent ? "border-primary" : ""}`}
                  onClick={() => !isCompleted && handleSetComplete(currentExercise.id, setNumber)}
                  disabled={isCompleted || setNumber !== currentSet}
                >
                  <div className="text-center">
                    <div className="font-medium">Set {setNumber}</div>
                    <div className="text-xs">{currentExercise.reps_per_set} reps</div>
                    {isCompleted && <Check className="mx-auto mt-1 h-4 w-4" />}
                  </div>
                </Button>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
