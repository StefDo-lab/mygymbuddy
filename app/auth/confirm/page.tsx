"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const confirmSignUp = async () => {
      try {
        // Get the token_hash from the URL
        const tokenHash = searchParams.get("token_hash")
        const type = searchParams.get("type")

        if (!tokenHash || !type) {
          setStatus("error")
          setError("Invalid confirmation link. Missing parameters.")
          return
        }

        console.log("Confirming with:", { tokenHash, type })

        // Verify the OTP
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as any,
        })

        if (error) {
          console.error("Confirmation error:", error)
          setStatus("error")
          setError(error.message)
          return
        }

        setStatus("success")
      } catch (err: any) {
        console.error("Confirmation error:", err)
        setStatus("error")
        setError(err.message || "An error occurred during confirmation")
      }
    }

    confirmSignUp()
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {status === "loading" ? (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle className="text-center text-2xl">
            {status === "loading"
              ? "Confirming your email..."
              : status === "success"
                ? "Email Confirmed!"
                : "Confirmation Failed"}
          </CardTitle>
          <CardDescription className="text-center">
            {status === "loading"
              ? "Please wait while we confirm your email address."
              : status === "success"
                ? "Your email has been successfully confirmed. You can now sign in to your account."
                : "We couldn't confirm your email address."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "error" && error && (
            <div className="rounded-lg bg-red-50 p-3 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status !== "loading" && (
            <Button onClick={() => router.push("/auth")}>{status === "success" ? "Sign In" : "Try Again"}</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
