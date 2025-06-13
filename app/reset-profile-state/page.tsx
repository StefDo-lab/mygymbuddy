"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function ResetProfileStatePage() {
  const [resetComplete, setResetComplete] = useState(false)

  const handleReset = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("profileSetupComplete")
      setResetComplete(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Profile State</CardTitle>
          <CardDescription>
            Use this utility to reset the profile setup state if you're stuck in a redirect loop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetComplete ? (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>
                Profile state has been reset successfully. You can now navigate to the dashboard.
              </AlertDescription>
            </Alert>
          ) : (
            <p>
              This will clear the local storage flag that tracks whether you've completed profile setup. Use this if
              you're experiencing issues with profile setup redirection.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {!resetComplete && (
            <Button onClick={handleReset} className="w-full">
              Reset Profile State
            </Button>
          )}
          <Button variant={resetComplete ? "default" : "outline"} className="w-full" asChild>
            <Link href="/">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
