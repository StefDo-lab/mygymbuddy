"use client"

import Link from "next/link"
import { Dumbbell, BarChart, Calendar, Clock, History, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockUserProfile } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"
import { UserMenu } from "@/components/user-menu"

export default function Home() {
  const [userProfile, setUserProfile] = useState(mockUserProfile)
  const [loading, setLoading] = useState(true)
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([])
  const [todaysWorkout, setTodaysWorkout] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if user is authenticated
        const { data: sessionData } = await supabase.auth.getSession()

        if (sessionData.session?.user) {
          // Check localStorage first - if profile setup is complete, don't redirect
          const profileCompleted = typeof window !== "undefined" ? localStorage.getItem("profileSetupComplete") : null

          if (!profileCompleted) {
            // Only check database if localStorage doesn't have the flag
            const { data: profileData, error: profileError } = await supabase
              .from("user_profiles")
              .select("id")
              .eq("id", sessionData.session.user.id)
              .maybeSingle()

            if (profileError) {
              console.error("Error checking profile:", profileError)
            }

            // If authenticated user has no profile, redirect to profile setup
            if (sessionData.session.user.id && !profileData) {
              console.log("User has no profile, redirecting to profile setup")
              router.push("/profile-setup")
              return
            } else if (profileData) {
              // If profile exists, set the localStorage flag
              if (typeof window !== "undefined") {
                localStorage.setItem("profileSetupComplete", "true")
              }
            }
          }

          // Now load the full profile data
          const { data: fullProfileData, error: fullProfileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", sessionData.session.user.id)
            .maybeSingle()

          if (fullProfileError) {
            console.error("Error loading full profile:", fullProfileError)
          }

          if (fullProfileData) {
            console.log("User profile loaded successfully")
            setUserProfile(fullProfileData)
          } else {
            console.log("Using mock profile data")
            setUserProfile(mockUserProfile)
          }
        } else {
          setUserProfile(mockUserProfile)
        }

        // Load workout plans
        const { data: plans, error } = await supabase
          .from("workout_plans")
          .select(`
            *,
            workouts (
              id,
              name,
              day_of_week,
              description
            )
          `)
          .eq("user_id", "550e8400-e29b-41d4-a716-446655440000")
          .order("created_at", { ascending: false })
          .limit(5)

        if (plans) {
          setWorkoutPlans(plans)

          // Find today's workout
          const today = new Date().getDay()
          const activePlan = plans.find((plan) => plan.active)
          if (activePlan?.workouts) {
            const todayWorkout = activePlan.workouts.find((w: any) => w.day_of_week === today)
            setTodaysWorkout(todayWorkout || activePlan.workouts[0])
          }
        }
      } catch (error) {
        console.log("Using mock data due to:", error)
        setUserProfile(mockUserProfile)
        setWorkoutPlans([])
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Dumbbell className="mx-auto h-8 w-8 animate-pulse text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading your fitness data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">FitTrack</span>
        </div>
        <UserMenu />
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your fitness dashboard.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Workout Plans</CardTitle>
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">Active plans available</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed Workouts</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+3 from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Streak</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5 days</div>
                <p className="text-xs text-muted-foreground">Keep it up!</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8h 24m</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
                <CardDescription>Your fitness journey at a glance</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
                <p className="text-muted-foreground">Progress charts coming soon</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with your fitness journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" asChild>
                  <Link href="/workout-generator">
                    <Dumbbell className="mr-2 h-4 w-4" />
                    Generate Workout
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/workout-plans">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Workout Plans
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/workout-history">
                    <History className="mr-2 h-4 w-4" />
                    Workout History
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Update Profile
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/exercises">
                    <BarChart className="mr-2 h-4 w-4" />
                    Exercise Library
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
