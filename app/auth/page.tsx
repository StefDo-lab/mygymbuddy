"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, Dumbbell, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [emailResent, setEmailResent] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Clear any stuck state on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          console.log("User already has a session")
          // If user already has a session, redirect to home
          router.push("/")
        }
      } catch (err) {
        console.error("Error checking session:", err)
      }
    }

    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setIsEmailUnconfirmed(false)
    setEmailResent(false)
    setDebugInfo(null)

    try {
      console.log("Signing in with:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
        if (error.message.includes("Email not confirmed")) {
          setIsEmailUnconfirmed(true)
        } else {
          setError(error.message)
        }
        setLoading(false)
        return
      }

      console.log("Sign in successful:", data)
      setDebugInfo("Sign in successful, checking profile...")

      // Check if user has a profile
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle()

        if (profileError) {
          console.error("Error checking profile:", profileError)
        }

        // If no profile exists, redirect to profile setup
        if (!profileData) {
          console.log("No profile found, redirecting to profile setup")
          setDebugInfo("No profile found, redirecting to profile setup...")
          window.location.href = "/profile-setup"
          return
        }
      }

      // If profile exists or check failed, go to dashboard
      setDebugInfo("Sign in successful, redirecting to dashboard...")
      window.location.href = "/"
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Failed to login. Please check your credentials.")
      setLoading(false)
    }
  }

  const handleResendVerificationEmail = async () => {
    setResendingEmail(true)
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (error) {
        setError(`Failed to resend verification email: ${error.message}`)
      } else {
        setEmailResent(true)
      }
    } catch (err: any) {
      setError(`Failed to resend verification email: ${err.message}`)
    } finally {
      setResendingEmail(false)
    }
  }

  const handleDemoLogin = () => {
    setLoading(true)
    // Use hard navigation for demo user too
    window.location.href = "/"
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="rounded-full bg-primary/10 p-3">
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Welcome back</CardTitle>
          <CardDescription className="text-center">Sign in to your fitness account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {isEmailUnconfirmed && (
              <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Email verification required</AlertTitle>
                <AlertDescription>
                  Please verify your email address before logging in. Check your inbox for a verification email.
                  {!emailResent ? (
                    <Button
                      variant="link"
                      className="text-amber-800 p-0 h-auto font-semibold ml-1"
                      onClick={handleResendVerificationEmail}
                      disabled={resendingEmail}
                    >
                      {resendingEmail ? "Sending..." : "Resend verification email"}
                    </Button>
                  ) : (
                    <span className="block mt-1 font-medium">✓ Verification email sent!</span>
                  )}
                </AlertDescription>
              </Alert>
            )}

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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/reset-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && !isEmailUnconfirmed && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {debugInfo && (
              <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
                <AlertDescription>{debugInfo}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <LogIn className="ml-2 h-4 w-4" />}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
            <Button variant="outline" className="w-full" onClick={handleDemoLogin} disabled={loading}>
              Continue as Demo User
            </Button>
            <div className="text-center text-xs text-gray-500">
              <Link href="/auth-debug" className="hover:underline">
                Troubleshoot sign-in issues
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
