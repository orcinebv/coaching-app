export interface Exercise {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
  benefits: string[];
  isActive: boolean;
  createdAt?: string;
}

export interface ExerciseCompletion {
  id: string;
  userId?: string;
  exerciseId: string;
  notes?: string;
  rating?: number;
  completedAt?: string;
  exercise?: { title: string; category: string };
}

export interface ExerciseStats {
  total: number;
  totalMinutes: number;
  categoryCounts: Record<string, number>;
  avgRating: number;
}
