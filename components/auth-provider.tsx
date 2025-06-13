"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get session from storage
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Error getting session:", error)
      }
      setSession(data.session)
      setUser(data.session?.user || null)
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)
      setIsLoading(false)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
