"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Dumbbell, Play, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

const DEMO_USER_ID = "550e8400-e29b-41d4-a716-446655440000"

interface WorkoutPlan {
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
      exercise: {
        name: string
        category: string
      }
      sets: number
      reps_per_set: string
    }>
  }>
}

export default function WorkoutPlansPage() {
  const router = useRouter()
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
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
                  name,
                  category
                )
              )
            )
          `)
          .eq("user_id", DEMO_USER_ID)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setWorkoutPlans(data || [])
      } catch (err: any) {
        console.error("Error fetching workout plans:", err)
        setError("Failed to load workout plans")
      } finally {
        setLoading(false)
      }
    }

    fetchWorkoutPlans()
  }, [])

  const getDayName = (dayOfWeek: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[dayOfWeek] || "Unknown"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Dumbbell className="mx-auto h-8 w-8 animate-pulse text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading workout plans...</p>
        </div>
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
          <h1 className="text-lg font-semibold">My Workout Plans</h1>
        </div>
        <Button onClick={() => router.push("/workout-generator")}>
          <Dumbbell className="mr-2 h-4 w-4" />
          Generate New Plan
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-6">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4">
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {workoutPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Workout Plans Yet</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Generate your first AI-powered workout plan to get started on your fitness journey.
            </p>
            <Button onClick={() => router.push("/workout-generator")}>
              <Dumbbell className="mr-2 h-4 w-4" />
              Generate Your First Plan
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {workoutPlans.map((plan) => (
              <Card key={plan.id} className={plan.active ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {plan.name}
                        {plan.active && <Badge variant="default">Active</Badge>}
                        {plan.ai_generated && <Badge variant="secondary">AI Generated</Badge>}
                      </CardTitle>
                      <CardDescription className="mt-2">{plan.description}</CardDescription>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{plan.duration_weeks} weeks</span>
                      </div>
                      <div className="mt-1">Created {formatDate(plan.created_at)}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Workouts ({plan.workouts?.length || 0})</h4>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {plan.workouts?.map((workout) => (
                          <div key={workout.id} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-sm">{workout.name}</h5>
                              <Badge variant="outline" className="text-xs">
                                {getDayName(workout.day_of_week)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{workout.description}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Dumbbell className="h-3 w-3" />
                              <span>{workout.workout_exercises?.length || 0} exercises</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => router.push(`/workout-plan/${plan.id}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  <Button className="flex-1" onClick={() => router.push(`/workout-plan/${plan.id}/start`)}>
                    <Play className="mr-2 h-4 w-4" />
                    Start Workout
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
