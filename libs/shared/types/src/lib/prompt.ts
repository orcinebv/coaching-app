export interface DailyPrompt {
  id: string;
  userId: string;
  prompt: string;
  type: 'reflection' | 'goal' | 'gratitude' | 'challenge';
  rating: number | null;
  skipped: boolean;
  createdAt: string;
}
