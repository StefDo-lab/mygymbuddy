"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function StartWorkoutPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [workoutPlan, setWorkoutPlan] = useState<any>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null)
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
                  id,
                  name,
                  category
                )
              )
            )
          `)
          .eq("id", params.id)
          .single()

        if (error) {
          throw error
        }

        // Sort workouts by day of week
        if (data.workouts) {
          data.workouts.sort((a: any, b: any) => a.day_of_week - b.day_of_week)
        }

        setWorkoutPlan(data)

        // Auto-select today's workout if available
        const today = new Date().getDay()
        const todayWorkout = data.workouts?.find((w: any) => w.day_of_week === today)
        if (todayWorkout) {
          setSelectedWorkout(todayWorkout.id)
        } else if (data.workouts?.length > 0) {
          setSelectedWorkout(data.workouts[0].id)
        }
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

  const handleStartWorkout = () => {
    if (selectedWorkout) {
      router.push(`/workout?id=${selectedWorkout}`)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Play className="mx-auto h-8 w-8 animate-pulse text-primary" />
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
          <Button variant="ghost" size="icon" onClick={() => router.push(`/workout-plan/${params.id}`)}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-lg font-semibold">Start Workout</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{workoutPlan.name}</CardTitle>
              <CardDescription>{workoutPlan.description}</CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select a Workout</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {workoutPlan.workouts?.map((workout: any) => (
                <Card
                  key={workout.id}
                  className={`cursor-pointer transition-colors ${
                    selectedWorkout === workout.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedWorkout(workout.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{workout.name}</CardTitle>
                    <CardDescription>{getDayName(workout.day_of_week)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{workout.description}</p>
                    <p className="text-sm">
                      <span className="font-medium">{workout.workout_exercises?.length || 0}</span> exercises
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <Button size="lg" className="w-full max-w-xs" onClick={handleStartWorkout} disabled={!selectedWorkout}>
              <Play className="mr-2 h-4 w-4" />
              Start Workout
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
