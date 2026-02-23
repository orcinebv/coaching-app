export interface ExerciseSummary {
  id: string;
  title: string;
  category: string;
  duration: number;
  difficulty: string;
}

export interface Recommendation {
  id: string;
  userId: string;
  exerciseId: string | null;
  type: 'exercise' | 'article' | 'intervention';
  title: string;
  reason: string;
  score: number;
  helpful: boolean | null;
  dismissed: boolean;
  createdAt: string;
  exercise: ExerciseSummary | null;
}
