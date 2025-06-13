"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { debugAuthStatus, clearAuthState } from "@/lib/auth-debug"
import { supabase } from "@/lib/supabase"

export default function AuthDebugPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [clearingState, setClearingState] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      setLoading(true)
      const info = await debugAuthStatus()
      setDebugInfo(info)
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleClearState = async () => {
    setClearingState(true)
    const result = await clearAuthState()
    setClearingState(false)

    if (result.success) {
      // Refresh the page to show updated state
      window.location.reload()
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  const handleGoToProfile = () => {
    router.push("/profile-setup")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
          <CardDescription>This page helps diagnose authentication issues with your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Loading authentication status...</div>
          ) : (
            <>
              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="text-sm font-medium">Session Status</h3>
                <pre className="mt-2 whitespace-pre-wrap text-sm">{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>

              {debugInfo?.error && (
                <Alert variant="destructive">
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription>{debugInfo.error}</AlertDescription>
                </Alert>
              )}

              {debugInfo?.hasSession && !debugInfo?.profile && (
                <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertTitle>Profile Missing</AlertTitle>
                  <AlertDescription>
                    You are authenticated but don't have a user profile. You should complete your profile setup.
                  </AlertDescription>
                </Alert>
              )}

              {debugInfo?.hasSession && debugInfo?.user && (
                <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                  <AlertTitle>Authentication Successful</AlertTitle>
                  <AlertDescription>You are signed in as {debugInfo.user.email}</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="flex space-x-2 w-full">
            <Button onClick={handleClearState} disabled={clearingState} variant="destructive" className="flex-1">
              {clearingState ? "Clearing..." : "Clear Auth State"}
            </Button>
            <Button onClick={handleSignOut} className="flex-1">
              Sign Out
            </Button>
          </div>
          <Button onClick={handleGoToProfile} variant="outline" className="w-full">
            Go to Profile Setup
          </Button>
          <Button onClick={() => router.push("/")} variant="outline" className="w-full">
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
