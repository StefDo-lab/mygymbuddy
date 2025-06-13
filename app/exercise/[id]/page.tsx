import Link from "next/link"
import { ArrowLeft, Clock, Dumbbell, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ExercisePage({ params }: { params: { id: string } }) {
  // This would normally fetch the exercise data based on the ID
  const exercise = {
    id: params.id,
    name: "Push-ups",
    category: "Upper Body",
    target: "Chest, Shoulders, Triceps",
    description: "A classic bodyweight exercise that works multiple muscle groups simultaneously.",
    instructions: [
      "Start in a plank position with your hands slightly wider than shoulder-width apart.",
      "Lower your body until your chest nearly touches the floor.",
      "Push yourself back up to the starting position.",
      "Keep your body in a straight line throughout the movement.",
    ],
    tips: [
      "Keep your core engaged throughout the exercise.",
      "Don't let your hips sag or pike up.",
      "For beginners, start with knee push-ups.",
      "For advanced, try diamond push-ups or decline push-ups.",
    ],
    variations: ["Wide Push-ups", "Diamond Push-ups", "Decline Push-ups", "Incline Push-ups", "One-arm Push-ups"],
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">{exercise.name}</h1>
        </div>
      </header>
      <main className="flex-1 p-4">
        <div className="aspect-video relative rounded-md bg-muted mb-6 flex items-center justify-center">
          <Dumbbell className="h-16 w-16 text-muted-foreground" />
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{exercise.category}</div>
            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">Beginner</div>
            <div className="flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              <Clock className="mr-1 h-3 w-3" />
              <span>5-10 min</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-2">Target: {exercise.target}</p>
          <p className="text-sm">{exercise.description}</p>
        </div>

        <Tabs defaultValue="instructions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
            <TabsTrigger value="variations">Variations</TabsTrigger>
          </TabsList>
          <TabsContent value="instructions" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <ol className="space-y-4 list-decimal list-inside text-sm">
                  {exercise.instructions.map((instruction, index) => (
                    <li key={index} className="pl-2">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tips" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-2 list-disc list-inside text-sm">
                  {exercise.tips.map((tip, index) => (
                    <li key={index} className="pl-2">
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="variations" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-2 text-sm">
                  {exercise.variations.map((variation, index) => (
                    <li key={index} className="flex items-center border-b pb-2 last:border-0 last:pb-0">
                      <Dumbbell className="mr-2 h-4 w-4 text-muted-foreground" />
                      {variation}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="sticky bottom-0 z-10 flex h-16 items-center justify-center border-t bg-background px-4">
        <Button className="w-full max-w-xs" size="lg">
          <Play className="mr-2 h-4 w-4" />
          Add to Workout
        </Button>
      </footer>
    </div>
  )
}
