"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Dumbbell, Loader2, Brain } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createAIWorkoutPlan } from "../actions/workout-actions"
import { supabase } from "@/lib/supabase"

export default function WorkoutGeneratorPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    // Use the same UUID format as in profile setup
    const demoUserId = "550e8400-e29b-41d4-a716-446655440000"
    setUserId(demoUserId)
    checkUserProfile(demoUserId)
  }, [])

  const checkUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

      if (data) {
        setHasProfile(true)
      } else {
        setHasProfile(false)
      }
    } catch (err) {
      console.log("No profile found, user needs to create one")
      setHasProfile(false)
    }
  }

  const handleGeneratePlan = async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const result = await createAIWorkoutPlan(userId)
      if (result.success) {
        // For now, just show success message since we don't have the workout plan view yet
        alert("Workout plan generated successfully! Check your dashboard.")
        router.push("/")
      }
    } catch (err) {
      setError("Failed to generate workout plan. Please make sure you have a complete profile and try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProfile = () => {
    router.push("/profile-setup")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-lg font-semibold">AI Workout Generator</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              AI Workout Plan Generator
            </CardTitle>
            <CardDescription>
              Our AI will create a personalized workout plan based on your profile, goals, and experience level
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="text-center">
              <Dumbbell className="mx-auto h-24 w-24 text-primary/20 mb-4" />
              {!hasProfile && (
                <div className="rounded-lg bg-orange-50 p-4 mb-4">
                  <p className="text-sm font-medium text-orange-900">Profile Required</p>
                  <p className="text-xs text-orange-700">
                    You need to set up your fitness profile first to generate a personalized workout plan
                  </p>
                </div>
              )}
              {hasProfile && (
                <div className="rounded-lg bg-green-50 p-4 mb-4">
                  <p className="text-sm font-medium text-green-900">Profile Complete</p>
                  <p className="text-xs text-green-700">Ready to generate your personalized AI workout plan</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {hasProfile ? (
              <Button className="w-full" size="lg" onClick={handleGeneratePlan} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate My AI Workout Plan
                  </>
                )}
              </Button>
            ) : (
              <Button className="w-full" size="lg" onClick={handleCreateProfile}>
                Set Up Profile First
              </Button>
            )}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 w-full">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">The AI will consider your:</p>
              <div className="flex flex-wrap gap-1 justify-center">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Age & Experience</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Fitness Goals</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Training Days</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
