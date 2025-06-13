"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Dumbbell, Play, Target } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"

interface WorkoutPlanDetails {
  id: string
  name: string
  description: string
  duration_weeks: number
  ai_generated: boolean
  active: boolean
  created_at: string
  workouts: Array<{
    id: string
    name: string
    day_of_week: number
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
        difficulty: string
        target_muscles: string[]
        description: string
        instructions: string[]
      }
    }>
  }>
}

export default function WorkoutPlanDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlanDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      try {
        const { data, error } = await supabase
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
          .eq("id", params.id)
          .single()

        if (error) {
          throw error
        }

        // Sort workouts by day of week and exercises by order
        if (data.workouts) {
          data.workouts.sort((a: any, b: any) => a.day_of_week - b.day_of_week)
          data.workouts.forEach((workout: any) => {
            if (workout.workout_exercises) {
              workout.workout_exercises.sort((a: any, b: any) => a.order_index - b.order_index)
            }
          })
        }

        setWorkoutPlan(data)
      } catch (err: any) {
        console.error("Error fetching workout plan:", err)
        setError("Failed to load workout plan")
      } finally {
        setLoading(false)
      }
    }

    fetchWorkoutPlan()
  }, [params.id])

  const getDayName = (dayOfWeek: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[dayOfWeek] || "Unknown"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Dumbbell className="mx-auto h-8 w-8 animate-pulse text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading workout plan...</p>
        </div>
      </div>
    )
  }

  if (error || !workoutPlan) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || "Workout plan not found"}</p>
          <Button className="mt-4" onClick={() => router.push("/workout-plans")}>
            Back to Plans
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/workout-plans")}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-lg font-semibold">{workoutPlan.name}</h1>
        </div>
        <Button onClick={() => router.push(`/workout-plan/${workoutPlan.id}/start`)}>
          <Play className="mr-2 h-4 w-4" />
          Start Workout
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {workoutPlan.name}
                    {workoutPlan.active && <Badge variant="default">Active</Badge>}
                    {workoutPlan.ai_generated && <Badge variant="secondary">AI Generated</Badge>}
                  </CardTitle>
                  <CardDescription className="mt-2">{workoutPlan.description}</CardDescription>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{workoutPlan.duration_weeks} weeks</span>
                  </div>
                  <div className="mt-1">Created {formatDate(workoutPlan.created_at)}</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="workouts">Workouts</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Total Workouts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{workoutPlan.workouts?.length || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Total Exercises</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {workoutPlan.workouts?.reduce(
                        (total, workout) => total + (workout.workout_exercises?.length || 0),
                        0,
                      ) || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{workoutPlan.duration_weeks} weeks</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="workouts">
              <div className="space-y-6">
                {workoutPlan.workouts?.map((workout) => (
                  <Card key={workout.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{workout.name}</CardTitle>
                          <CardDescription>{workout.description}</CardDescription>
                        </div>
                        <Badge variant="outline">{getDayName(workout.day_of_week)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {workout.workout_exercises?.map((workoutExercise, index) => (
                          <div key={workoutExercise.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium">
                                  {index + 1}. {workoutExercise.exercise.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {workoutExercise.exercise.category}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {workoutExercise.exercise.difficulty}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div className="font-medium">
                                  {workoutExercise.sets} sets × {workoutExercise.reps_per_set} reps
                                </div>
                                {workoutExercise.rest_seconds && (
                                  <div className="text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {workoutExercise.rest_seconds}s rest
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{workoutExercise.exercise.description}</p>
                            {workoutExercise.exercise.target_muscles && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Target className="h-3 w-3" />
                                <span>Targets: {workoutExercise.exercise.target_muscles.join(", ")}</span>
                              </div>
                            )}
                            {workoutExercise.notes && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                <strong>Note:</strong> {workoutExercise.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
