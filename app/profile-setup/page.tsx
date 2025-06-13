"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, User, Heart, Dumbbell, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createUserProfile, getCurrentUser, checkUserProfileExists } from "../actions/auth-actions"
import type { UserProfile } from "@/types/fitness"

export default function ProfileSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setupComplete, setSetupComplete] = useState(false)
  const [databaseError, setDatabaseError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [profileExists, setProfileExists] = useState(false)
  const [bypassCheck] = useState(() => {
    // Check if URL has bypass parameter
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).has("bypass")
    }
    return false
  })

  // Step 1: Personal information
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    age: 30,
    sex: "male",
    height_cm: 175,
    weight_kg: 70,
    date_of_birth: "",
    training_days_per_week: 3,
    experience_level: "beginner",
    goals: [],
  })

  // Step 2: Health questionnaire
  const [healthQuestionnaire, setHealthQuestionnaire] = useState<Record<string, any>>({
    hasHeartCondition: false,
    heartConditionDetails: "",
    hasChestPain: false,
    chestPainDetails: "",
    hasJointProblems: false,
    jointProblemsDetails: "",
    takesMedication: false,
    medicationDetails: "",
    hasOtherConditions: false,
    otherConditionsDetails: "",
  })

  // Step 3: Fitness preferences
  const [aiInstructions, setAiInstructions] = useState("")

  useEffect(() => {
    async function checkAuth() {
      try {
        // Check if profile setup is already completed via localStorage
        if (typeof window !== "undefined") {
          const profileCompleted = localStorage.getItem("profileSetupComplete")
          if (profileCompleted) {
            console.log("Profile setup already completed according to localStorage")
            window.location.href = "/"
            return
          }
        }

        const user = await getCurrentUser()

        if (!user) {
          // Not logged in, redirect to login
          router.push("/auth")
          return
        }

        setUserId(user.id)
        setUserEmail(user.email || null)

        // Skip profile check if bypass parameter is present
        if (bypassCheck) {
          console.log("Bypassing profile check due to URL parameter")
          setLoading(false)
          return
        }

        // Check if profile already exists
        const exists = await checkUserProfileExists(user.id)
        console.log("Profile exists check:", exists)
        setProfileExists(exists)

        if (exists) {
          console.log("Profile already exists, redirecting to dashboard")
          // Set localStorage flag
          if (typeof window !== "undefined") {
            localStorage.setItem("profileSetupComplete", "true")
          }
          // Profile already exists, redirect to dashboard
          window.location.href = "/"
          return
        }

        setLoading(false)
      } catch (err) {
        console.error("Auth check error:", err)
        setError("Failed to verify your account. Please try logging in again.")
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, bypassCheck])

  const nextStep = () => {
    setError(null)
    setStep(step + 1)
  }

  const prevStep = () => {
    setError(null)
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!userId) {
      setError("User ID not found. Please try logging in again.")
      return
    }

    setSubmitting(true)
    setError(null)
    setDatabaseError(null)

    try {
      // Prepare health conditions array from questionnaire
      const healthConditions: string[] = []
      const medicalNotes: Record<string, string> = {}

      if (healthQuestionnaire.hasHeartCondition) {
        healthConditions.push("Heart condition")
        if (healthQuestionnaire.heartConditionDetails) {
          medicalNotes["Heart condition"] = healthQuestionnaire.heartConditionDetails
        }
      }

      if (healthQuestionnaire.hasChestPain) {
        healthConditions.push("Chest pain")
        if (healthQuestionnaire.chestPainDetails) {
          medicalNotes["Chest pain"] = healthQuestionnaire.chestPainDetails
        }
      }

      if (healthQuestionnaire.hasJointProblems) {
        healthConditions.push("Joint problems")
        if (healthQuestionnaire.jointProblemsDetails) {
          medicalNotes["Joint problems"] = healthQuestionnaire.jointProblemsDetails
        }
      }

      if (healthQuestionnaire.takesMedication) {
        healthConditions.push("Takes medication")
        if (healthQuestionnaire.medicationDetails) {
          medicalNotes["Medication"] = healthQuestionnaire.medicationDetails
        }
      }

      if (healthQuestionnaire.hasOtherConditions) {
        healthConditions.push("Other conditions")
        if (healthQuestionnaire.otherConditionsDetails) {
          medicalNotes["Other conditions"] = healthQuestionnaire.otherConditionsDetails
        }
      }

      // Create user profile with server action
      console.log("Creating user profile")

      // Create a profile object with all fields
      const userProfile = {
        id: userId,
        email: userEmail,
        age: profile.age || 30,
        sex: profile.sex || "male",
        training_days_per_week: profile.training_days_per_week || 3,
        experience_level: profile.experience_level || "beginner",
        goals: profile.goals?.length ? profile.goals : ["strength"],
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
        date_of_birth: profile.date_of_birth || null,
        health_conditions: healthConditions,
        medical_notes: JSON.stringify(medicalNotes),
        ai_instructions: aiInstructions,
      }

      const result = await createUserProfile(userProfile)

      if (!result.success) {
        console.error("Profile creation error:", result.error)
        setDatabaseError(result.error || "There was an issue saving your profile details.")
      } else {
        // Set localStorage flag to indicate profile setup is complete
        if (typeof window !== "undefined") {
          localStorage.setItem("profileSetupComplete", "true")
        }

        // Profile created successfully, set state
        setSetupComplete(true)
      }
    } catch (err: any) {
      console.error("Profile setup error:", err)
      setError(err.message || "Failed to save profile. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Loading...</CardTitle>
            <CardDescription className="text-center">Please wait while we verify your account.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const renderStep = () => {
    if (setupComplete) {
      return (
        <>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Check className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl">Profile Setup Complete!</CardTitle>
            <CardDescription className="text-center">
              Your profile has been created successfully. You can now start using the app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {databaseError && (
              <Alert className="mb-4 bg-yellow-50 text-yellow-800 border-yellow-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  We encountered an issue saving some of your profile details. You can update them later in your profile
                  settings.
                </AlertDescription>
              </Alert>
            )}
            <Alert className="bg-blue-50 text-blue-800 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>What's next?</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal pl-4 space-y-1 mt-2">
                  <li>Explore workout plans</li>
                  <li>Generate AI-powered workouts</li>
                  <li>Track your progress</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => {
                window.location.href = "/"
              }}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardFooter>
        </>
      )
    }

    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date-of-birth">Date of Birth</Label>
                <Input
                  id="date-of-birth"
                  type="date"
                  value={profile.date_of_birth || ""}
                  onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Optional</p>
              </div>
              <div className="space-y-2">
                <Label>Sex</Label>
                <RadioGroup
                  value={profile.sex}
                  onValueChange={(value) => setProfile({ ...profile, sex: value as "male" | "female" | "other" })}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height_cm || ""}
                    onChange={(e) => setProfile({ ...profile, height_cm: Number(e.target.value) })}
                    placeholder="175"
                  />
                  <p className="text-xs text-muted-foreground">Optional</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={profile.weight_kg || ""}
                    onChange={(e) => setProfile({ ...profile, weight_kg: Number(e.target.value) })}
                    placeholder="70"
                  />
                  <p className="text-xs text-muted-foreground">Optional</p>
                </div>
              </div>
            </CardContent>
          </>
        )

      // Other cases remain the same...
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Health Questionnaire
              </CardTitle>
              <CardDescription>Help us understand your health status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Health questionnaire content remains the same */}
              <p className="text-sm text-muted-foreground">
                Please answer the following questions to help us create safe workout plans for you.
              </p>
              <div className="space-y-3">
                {/* Health questionnaire fields remain the same */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="heart-condition"
                      checked={healthQuestionnaire.hasHeartCondition}
                      onCheckedChange={(checked) =>
                        setHealthQuestionnaire({ ...healthQuestionnaire, hasHeartCondition: !!checked })
                      }
                    />
                    <div>
                      <Label htmlFor="heart-condition" className="font-medium">
                        Heart Condition
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Do you have a heart condition or have you ever been told you have one?
                      </p>
                    </div>
                  </div>
                  {healthQuestionnaire.hasHeartCondition && (
                    <div className="pl-7 pt-2">
                      <Label htmlFor="heart-condition-details" className="text-sm">
                        Please provide details:
                      </Label>
                      <Textarea
                        id="heart-condition-details"
                        value={healthQuestionnaire.heartConditionDetails || ""}
                        onChange={(e) =>
                          setHealthQuestionnaire({
                            ...healthQuestionnaire,
                            heartConditionDetails: e.target.value,
                          })
                        }
                        placeholder="Describe your heart condition..."
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
                {/* Other health fields remain the same */}
              </div>
            </CardContent>
          </>
        )

      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Fitness Preferences
              </CardTitle>
              <CardDescription>Tell us about your fitness goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fitness preferences content remains the same */}
              <div className="space-y-2">
                <Label htmlFor="training-days">Training Days Per Week</Label>
                <Input
                  id="training-days"
                  type="number"
                  min="1"
                  max="7"
                  value={profile.training_days_per_week || 3}
                  onChange={(e) => setProfile({ ...profile, training_days_per_week: Number(e.target.value) })}
                />
              </div>
              {/* Other fitness fields remain the same */}
            </CardContent>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between px-6 pt-6">
          <div className="flex items-center space-x-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-2 rounded-full ${
                  s === step ? "bg-primary" : s < step ? "bg-primary/60" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">Step {step} of 3</div>
        </div>

        {renderStep()}

        {error && (
          <div className="mx-6 mb-4 rounded-lg bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep} disabled={submitting}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/">Skip for now</Link>
            </Button>
          )}

          {step < 3 ? (
            <Button onClick={nextStep}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving Profile..." : "Complete Setup"}
              {!submitting && <Check className="ml-2 h-4 w-4" />}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
