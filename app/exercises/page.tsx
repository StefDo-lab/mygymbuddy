"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Dumbbell, Target, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

interface Exercise {
  id: string
  name: string
  category: string
  difficulty: string
  target_muscles: string[]
  equipment: string[]
  description: string
}

export default function ExercisesPage() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data, error } = await supabase.from("exercises").select("*").order("name")

        if (error) {
          throw error
        }

        setExercises(data || [])
        setFilteredExercises(data || [])
      } catch (err) {
        console.error("Error fetching exercises:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchExercises()
  }, [])

  useEffect(() => {
    let filtered = exercises

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.target_muscles.some((muscle) => muscle.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((exercise) => exercise.category === categoryFilter)
    }

    // Filter by difficulty
    if (difficultyFilter !== "all") {
      filtered = filtered.filter((exercise) => exercise.difficulty === difficultyFilter)
    }

    setFilteredExercises(filtered)
  }, [exercises, searchTerm, categoryFilter, difficultyFilter])

  const categories = [...new Set(exercises.map((ex) => ex.category))]
  const difficulties = [...new Set(exercises.map((ex) => ex.difficulty))]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Dumbbell className="mx-auto h-8 w-8 animate-pulse text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading exercises...</p>
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
          <h1 className="text-lg font-semibold">Exercise Library</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredExercises.length} of {exercises.length} exercises
          </div>

          {/* Exercise Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{exercise.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video relative rounded-md bg-muted mb-4 flex items-center justify-center">
                    <Dumbbell className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {exercise.category.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                      </Badge>
                    </div>
                    {exercise.target_muscles && exercise.target_muscles.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Target className="h-3 w-3" />
                        <span>Targets: {exercise.target_muscles.slice(0, 2).join(", ")}</span>
                        {exercise.target_muscles.length > 2 && <span>+{exercise.target_muscles.length - 2} more</span>}
                      </div>
                    )}
                    {exercise.equipment && exercise.equipment.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Equipment: {exercise.equipment.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => router.push(`/exercise/${exercise.id}`)}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-12">
              <Dumbbell className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
