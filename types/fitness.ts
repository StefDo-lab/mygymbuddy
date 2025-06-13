export interface Exercise {
  id: string
  name: string
  category: string
  difficulty: string
  target_muscles: string[]
  equipment: string[]
  description: string
  instructions: string[]
  tips: string[]
  variations: string[]
  video_url?: string
  exercise_type?: "weight" | "bodyweight" | "time" | "distance"
  measurement_unit?: string
}

export interface UserProfile {
  id?: string
  email?: string
  age: number
  sex: "male" | "female" | "other"
  training_days_per_week: number
  experience_level: "beginner" | "intermediate" | "pro"
  goals: string[]
  rehab_details?: string
  sport_details?: string
  ai_instructions?: string
  height_cm?: number
  weight_kg?: number
  date_of_birth?: string
  health_conditions?: string[]
  medical_notes?: string
  created_at?: string
  updated_at?: string
}

export interface HealthQuestionnaire {
  hasHeartCondition: boolean
  hasChestPain: boolean
  hasJointProblems: boolean
  takesMedication: boolean
  hasOtherConditions: boolean
  otherConditionsDetails?: string
}
