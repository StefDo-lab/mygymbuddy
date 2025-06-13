"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Check, Mail, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  // Account creation
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Validate inputs
      if (!email || !password || password !== confirmPassword) {
        throw new Error("Please fill in all fields and make sure passwords match")
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      console.log("Creating user account with email:", email)

      // Create the user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile-setup`,
        },
      })

      if (authError) {
        console.error("Auth error:", authError)
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error("Failed to create user account")
      }

      console.log("User created:", authData.user.id)
      setRegistrationComplete(true)
      setRegisteredEmail(email)
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Failed to register. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (registrationComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Check className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl">Registration Complete!</CardTitle>
            <CardDescription className="text-center">
              We've sent a confirmation email to <strong>{registeredEmail}</strong>. Please check your inbox and click
              the confirmation link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-blue-50 text-blue-800 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>What's next?</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal pl-4 space-y-1 mt-2">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the confirmation link in the email</li>
                  <li>Complete your profile setup</li>
                  <li>Start using the app!</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/auth")} className="w-full">
              Go to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Create Your Account
          </CardTitle>
          <CardDescription>Enter your email and create a password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>

        {error && (
          <div className="mx-6 mb-4 rounded-lg bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/auth">Cancel</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
