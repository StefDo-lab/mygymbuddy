"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, User, MessageSquare, Dumbbell, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserProfile } from "../actions/profile-actions"
import { updateUserProfile } from "../actions/profile-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

// Demo user ID - this should match the one we created in the SQL script
const DEMO_USER_ID = "550e8400-e29b-41d4-a716-446655440000"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getUserProfile(DEMO_USER_ID)
        if (data) {
          setProfile(data)
        } else {
          router.push("/profile-setup")
        }
      } catch (err) {
        console.error("Error loading profile:", err)
        setError("Failed to load profile. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await updateUserProfile(DEMO_USER_ID, profile)
      setSuccessMessage("Profile updated successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      console.error("Failed to update profile:", err)
      setError(`Failed to save profile: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    try {
      const birthDate = new Date(dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    } catch (e) {
      return profile?.age || "Unknown"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy")
    } catch (e) {
      return "Not set"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <User className="mx-auto h-8 w-8 animate-pulse text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading profile...</p>
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
          <h1 className="text-lg font-semibold">Profile Settings</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" />
                Your Fitness Profile
              </CardTitle>
              <CardDescription>Customize your AI workout experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium">{profile?.email || "Fitness Enthusiast"}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.date_of_birth ? calculateAge(profile.date_of_birth) : profile?.age} years • {profile?.sex}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Height</p>
                  <p className="text-muted-foreground">{profile?.height_cm || "Not set"} cm</p>
                </div>
                <div>
                  <p className="font-medium">Weight</p>
                  <p className="text-muted-foreground">{profile?.weight_kg || "Not set"} kg</p>
                </div>
                <div>
                  <p className="font-medium">Training Days/Week</p>
                  <p className="text-muted-foreground">{profile?.training_days_per_week} days</p>
                </div>
                <div>
                  <p className="font-medium">Experience Level</p>
                  <p className="text-muted-foreground capitalize">{profile?.experience_level}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium">Fitness Goals</div>
                <div className="flex flex-wrap gap-2">
                  {profile?.goals?.map((goal: string) => (
                    <div key={goal} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary capitalize">
                      {goal}
                    </div>
                  ))}
                </div>
              </div>
              {profile?.health_conditions && profile.health_conditions.length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium">Health Conditions</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.health_conditions.map((condition: string) => (
                      <div key={condition} className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-800">
                        {condition}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push("/profile-setup")}>
                Edit Basic Profile
              </Button>
            </CardFooter>
          </Card>

          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">
                <User className="mr-2 h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="health">
                <Heart className="mr-2 h-4 w-4" />
                Health
              </TabsTrigger>
              <TabsTrigger value="fitness">
                <Dumbbell className="mr-2 h-4 w-4" />
                Fitness
              </TabsTrigger>
              <TabsTrigger value="ai">
                <MessageSquare className="mr-2 h-4 w-4" />
                AI Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ""}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-of-birth">Date of Birth</Label>
                    <Input
                      id="date-of-birth"
                      type="date"
                      value={profile?.date_of_birth || ""}
                      onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                    />
                    {profile?.date_of_birth && (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(profile.date_of_birth)} ({calculateAge(profile.date_of_birth)} years old)
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={profile?.height_cm || ""}
                        onChange={(e) => setProfile({ ...profile, height_cm: Number(e.target.value) })}
                        placeholder="175"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={profile?.weight_kg || ""}
                        onChange={(e) => setProfile({ ...profile, weight_kg: Number(e.target.value) })}
                        placeholder="70"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health">
              <Card>
                <CardHeader>
                  <CardTitle>Health Information</CardTitle>
                  <CardDescription>Update your health conditions and medical information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Health Conditions</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="heart-condition"
                          checked={profile?.health_conditions?.includes("Heart condition") || false}
                          onCheckedChange={(checked) => {
                            const conditions = profile?.health_conditions || []
                            if (checked) {
                              setProfile({ ...profile, health_conditions: [...conditions, "Heart condition"] })
                            } else {
                              setProfile({
                                ...profile,
                                health_conditions: conditions.filter((c: string) => c !== "Heart condition"),
                              })
                            }
                          }}
                        />
                        <Label htmlFor="heart-condition">Heart condition</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="chest-pain"
                          checked={profile?.health_conditions?.includes("Chest pain") || false}
                          onCheckedChange={(checked) => {
                            const conditions = profile?.health_conditions || []
                            if (checked) {
                              setProfile({ ...profile, health_conditions: [...conditions, "Chest pain"] })
                            } else {
                              setProfile({
                                ...profile,
                                health_conditions: conditions.filter((c: string) => c !== "Chest pain"),
                              })
                            }
                          }}
                        />
                        <Label htmlFor="chest-pain">Chest pain during physical activity</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="joint-problems"
                          checked={profile?.health_conditions?.includes("Joint problems") || false}
                          onCheckedChange={(checked) => {
                            const conditions = profile?.health_conditions || []
                            if (checked) {
                              setProfile({ ...profile, health_conditions: [...conditions, "Joint problems"] })
                            } else {
                              setProfile({
                                ...profile,
                                health_conditions: conditions.filter((c: string) => c !== "Joint problems"),
                              })
                            }
                          }}
                        />
                        <Label htmlFor="joint-problems">Bone or joint problems</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="medication"
                          checked={profile?.health_conditions?.includes("Takes medication") || false}
                          onCheckedChange={(checked) => {
                            const conditions = profile?.health_conditions || []
                            if (checked) {
                              setProfile({ ...profile, health_conditions: [...conditions, "Takes medication"] })
                            } else {
                              setProfile({
                                ...profile,
                                health_conditions: conditions.filter((c: string) => c !== "Takes medication"),
                              })
                            }
                          }}
                        />
                        <Label htmlFor="medication">Currently taking medication</Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medical-notes">Medical Notes</Label>
                    <Textarea
                      id="medical-notes"
                      placeholder="Any additional medical information..."
                      value={profile?.medical_notes || ""}
                      onChange={(e) => setProfile({ ...profile, medical_notes: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fitness">
              <Card>
                <CardHeader>
                  <CardTitle>Fitness Preferences</CardTitle>
                  <CardDescription>Update your fitness goals and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="training-days">Training Days Per Week</Label>
                    <Input
                      id="training-days"
                      type="number"
                      min="1"
                      max="7"
                      value={profile?.training_days_per_week || 3}
                      onChange={(e) => setProfile({ ...profile, training_days_per_week: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={profile?.experience_level === "beginner" ? "default" : "outline"}
                        onClick={() => setProfile({ ...profile, experience_level: "beginner" })}
                      >
                        Beginner
                      </Button>
                      <Button
                        type="button"
                        variant={profile?.experience_level === "intermediate" ? "default" : "outline"}
                        onClick={() => setProfile({ ...profile, experience_level: "intermediate" })}
                      >
                        Intermediate
                      </Button>
                      <Button
                        type="button"
                        variant={profile?.experience_level === "pro" ? "default" : "outline"}
                        onClick={() => setProfile({ ...profile, experience_level: "pro" })}
                      >
                        Advanced
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Fitness Goals</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="muscle"
                          checked={profile?.goals?.includes("muscle") || false}
                          onCheckedChange={(checked) => {
                            const goals = profile?.goals || []
                            if (checked) {
                              setProfile({ ...profile, goals: [...goals, "muscle"] })
                            } else {
                              setProfile({ ...profile, goals: goals.filter((g: string) => g !== "muscle") })
                            }
                          }}
                        />
                        <Label htmlFor="muscle">Build Muscle Mass</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="strength"
                          checked={profile?.goals?.includes("strength") || false}
                          onCheckedChange={(checked) => {
                            const goals = profile?.goals || []
                            if (checked) {
                              setProfile({ ...profile, goals: [...goals, "strength"] })
                            } else {
                              setProfile({ ...profile, goals: goals.filter((g: string) => g !== "strength") })
                            }
                          }}
                        />
                        <Label htmlFor="strength">Improve Strength</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rehab"
                          checked={profile?.goals?.includes("rehab") || false}
                          onCheckedChange={(checked) => {
                            const goals = profile?.goals || []
                            if (checked) {
                              setProfile({ ...profile, goals: [...goals, "rehab"] })
                            } else {
                              setProfile({
                                ...profile,
                                goals: goals.filter((g: string) => g !== "rehab"),
                                rehab_details: "",
                              })
                            }
                          }}
                        />
                        <Label htmlFor="rehab">Rehabilitation/Recovery</Label>
                      </div>
                      {profile?.goals?.includes("rehab") && (
                        <div className="ml-6 space-y-2">
                          <Label htmlFor="rehab-details" className="text-sm text-muted-foreground">
                            Please describe your injury, condition, or recovery needs:
                          </Label>
                          <Textarea
                            id="rehab-details"
                            placeholder="e.g., Lower back pain, knee injury recovery, post-surgery rehabilitation..."
                            value={profile?.rehab_details || ""}
                            onChange={(e) => setProfile({ ...profile, rehab_details: e.target.value })}
                            className="min-h-[80px]"
                          />
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sport"
                          checked={profile?.goals?.includes("sport-specific") || false}
                          onCheckedChange={(checked) => {
                            const goals = profile?.goals || []
                            if (checked) {
                              setProfile({ ...profile, goals: [...goals, "sport-specific"] })
                            } else {
                              setProfile({
                                ...profile,
                                goals: goals.filter((g: string) => g !== "sport-specific"),
                                sport_details: "",
                              })
                            }
                          }}
                        />
                        <Label htmlFor="sport">Sport-Specific Training</Label>
                      </div>
                      {profile?.goals?.includes("sport-specific") && (
                        <div className="ml-6 space-y-2">
                          <Label htmlFor="sport-details" className="text-sm text-muted-foreground">
                            Which sport(s) are you training for?
                          </Label>
                          <Textarea
                            id="sport-details"
                            placeholder="e.g., Soccer, Basketball, Marathon running, Rock climbing, Tennis..."
                            value={profile?.sport_details || ""}
                            onChange={(e) => setProfile({ ...profile, sport_details: e.target.value })}
                            className="min-h-[80px]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai">
              <Card>
                <CardHeader>
                  <CardTitle>AI Instructions</CardTitle>
                  <CardDescription>
                    Provide specific instructions for the AI when generating your workouts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="e.g., 'I prefer bodyweight exercises', 'Avoid exercises that require equipment', 'Focus on functional movements'..."
                    value={profile?.ai_instructions || ""}
                    onChange={(e) => setProfile({ ...profile, ai_instructions: e.target.value })}
                    className="min-h-[150px]"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3">
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 rounded-lg bg-green-50 p-3">
              <p className="text-sm font-medium text-green-900">Success</p>
              <p className="text-xs text-green-700">{successMessage}</p>
            </div>
          )}

          <div className="mt-6">
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
              {!saving && <Save className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
