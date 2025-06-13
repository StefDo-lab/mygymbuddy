"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token from the URL
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (!token || type !== "email_confirmation") {
          setVerificationStatus("error")
          setError("Invalid verification link. Please request a new verification email.")
          return
        }

        // Verify the email
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        })

        if (error) {
          console.error("Verification error:", error)
          setVerificationStatus("error")
          setError(error.message)
          return
        }

        setVerificationStatus("success")
      } catch (err: any) {
        console.error("Verification error:", err)
        setVerificationStatus("error")
        setError(err.message || "An error occurred during verification")
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {verificationStatus === "loading" ? (
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            ) : verificationStatus === "success" ? (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle className="text-center text-2xl">
            {verificationStatus === "loading"
              ? "Verifying your email..."
              : verificationStatus === "success"
                ? "Email Verified!"
                : "Verification Failed"}
          </CardTitle>
          <CardDescription className="text-center">
            {verificationStatus === "loading"
              ? "Please wait while we verify your email address."
              : verificationStatus === "success"
                ? "Your email has been successfully verified. You can now sign in to your account."
                : "We couldn't verify your email address."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verificationStatus === "error" && error && (
            <div className="rounded-lg bg-red-50 p-3 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {verificationStatus !== "loading" && (
            <Button onClick={() => router.push("/auth")}>
              {verificationStatus === "success" ? "Sign In" : "Try Again"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
