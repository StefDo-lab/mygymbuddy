"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Dumbbell, BarChart, Plus } from "lucide-react"
import { format, parseISO } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getWorkoutHistory } from "../actions/workout-logging-actions"
import { createDemoWorkoutHistory } from "../actions/demo-data-actions"

// Demo user ID
const DEMO_USER_ID = "550e8400-e29b-41d4-a716-446655440000"

interface ExercisePerformanceLog {
  id: string
  exercise: {
    name: string
    category: string
    exercise_type: string
    measurement_unit: string
  }
  set_number: number
  actual_reps?: number
  actual_weight?: number
  duration_seconds?: number
  distance?: number
  distance_unit?: string
  completed: boolean
  notes?: string
  is_extra_set: boolean
  is_added_exercise: boolean
}

interface WorkoutSession {
  id: string
  started_at: string
  completed_at: string
  total_duration_minutes: number
  notes: string
  workout: {
    name: string
    description: string
  }
  exercise_performance_logs: ExercisePerformanceLog[]
}

export default function WorkoutHistoryPage() {
  const router = useRouter()
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creatingDemo, setCreatingDemo] = useState(false)

  useEffect(() => {
    fetchWorkoutHistory()
  }, [])

  const fetchWorkoutHistory = async () => {
    try {
      setLoading(true)
      const history = await getWorkoutHistory(DEMO_USER_ID, 20)
      setWorkoutHistory(history)
    } catch (err) {
      console.error("Error fetching workout history:", err)
      setError("Failed to load workout history")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDemoData = async () => {
    try {
      setCreatingDemo(true)
      const result = await createDemoWorkoutHistory()
      if (result.success) {
        await fetchWorkoutHistory()
      } else {
        setError(`Failed to create demo data: ${result.error}`)
      }
    } catch (err) {
      console.error("Error creating demo data:", err)
      setError("Failed to create demo workout data")
    } finally {
      setCreatingDemo(false)
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A"

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins} min`
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy • h:mm a")
    } catch (e) {
      return dateString
    }
  }

  const getExerciseTypeLabel = (type: string) => {
    switch (type) {
      case "weight":
        return "Weight"
      case "bodyweight":
        return "Bodyweight"
      case "time":
        return "Time"
      case "distance":
        return "Distance"
      default:
        return type
    }
  }

  const formatPerformance = (log: ExercisePerformanceLog) => {
    const type = log.exercise.exercise_type || "weight"
    const unit = log.exercise.measurement_unit || ""

    switch (type) {
      case "weight":
        return log.actual_weight
          ? `${log.actual_reps || 0} reps × ${log.actual_weight} ${unit}`
          : `${log.actual_reps || 0} reps`
      case "bodyweight":
        return `${log.actual_reps || 0} reps`
      case "time":
        return log.duration_seconds ? `${log.duration_seconds} ${unit}` : "N/A"
      case "distance":
        return log.distance ? `${log.distance} ${log.distance_unit || unit}` : "N/A"
      default:
        return "N/A"
    }
  }

  const groupLogsByExercise = (logs: ExercisePerformanceLog[]) => {
    const grouped: Record<string, ExercisePerformanceLog[]> = {}

    logs.forEach((log) => {
      const key = log.exercise.name
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(log)
    })

    return Object.entries(grouped).map(([name, logs]) => ({
      name,
      logs: logs.sort((a, b) => a.set_number - b.set_number),
      exerciseType: logs[0].exercise.exercise_type,
      category: logs[0].exercise.category,
    }))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-lg font-semibold">Workout History</h1>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-lg font-semibold">Workout History</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/workout-plans")}>
          <BarChart className="h-4 w-4 mr-2" />
          View Progress
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 mb-6">
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {workoutHistory.length === 0 && !loading && !error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Workout History Yet</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Complete your first workout to start tracking your progress.
            </p>
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <Button onClick={() => router.push("/workout-plans")}>
                <Dumbbell className="mr-2 h-4 w-4" />
                Start a Workout
              </Button>
              <Button variant="outline" onClick={handleCreateDemoData} disabled={creatingDemo}>
                <Plus className="mr-2 h-4 w-4" />
                {creatingDemo ? "Creating Demo Data..." : "Create Demo Workout Data"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Workouts</h2>
              <Badge variant="outline" className="text-xs">
                {workoutHistory.length} sessions
              </Badge>
            </div>

            <div className="space-y-4">
              {workoutHistory.map((session) => {
                const groupedExercises = groupLogsByExercise(session.exercise_performance_logs || [])

                return (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{session.workout?.name || "Workout Session"}</CardTitle>
                          <CardDescription>{formatDate(session.started_at)}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(session.total_duration_minutes)}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" />
                            {session.exercise_performance_logs?.length || 0} sets
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {groupedExercises.map((exercise, index) => (
                          <AccordionItem key={index} value={`exercise-${index}`}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full pr-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{exercise.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {getExerciseTypeLabel(exercise.exerciseType)}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">{exercise.logs.length} sets</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 pl-4">
                                {exercise.logs.map((log) => (
                                  <div
                                    key={log.id}
                                    className="flex items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0"
                                  >
                                    <div>
                                      <span className="font-medium">Set {log.set_number}</span>
                                      {log.is_extra_set && (
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                          Extra
                                        </Badge>
                                      )}
                                      {log.is_added_exercise && (
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                          Added
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-muted-foreground">{formatPerformance(log)}</div>
                                  </div>
                                ))}

                                {exercise.logs.some((log) => log.notes) && (
                                  <div className="mt-2 p-2 bg-muted rounded-md text-xs">
                                    <p className="font-medium mb-1">Notes:</p>
                                    {exercise.logs
                                      .filter((log) => log.notes)
                                      .map((log, i) => (
                                        <p key={i} className="mb-1 last:mb-0">
                                          <span className="font-medium">Set {log.set_number}:</span> {log.notes}
                                        </p>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>

                      {session.notes && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium mb-1">Session Notes:</p>
                          <p className="text-sm">{session.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
