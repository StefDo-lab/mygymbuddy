"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const to = searchParams.get("to") || "/"

  useEffect(() => {
    // Use a timeout to ensure the page has time to render before redirecting
    const timer = setTimeout(() => {
      window.location.href = to
    }, 1500)

    return () => clearTimeout(timer)
  }, [to])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redirecting...</CardTitle>
          <CardDescription>You are being redirected to {to}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
