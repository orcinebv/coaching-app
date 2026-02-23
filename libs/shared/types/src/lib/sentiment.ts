export interface EmotionScores {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
}

export interface SentimentResult {
  id: string;
  userId: string;
  sourceType: 'journal' | 'message';
  sourceId: string;
  overall: number;
  emotions: EmotionScores;
  crisis: boolean;
  createdAt: string;
}

export interface SentimentSummary {
  avgOverall: number | null;
  dominantEmotion: string | null;
  trend: 'improving' | 'stable' | 'declining';
  crisisDetected: boolean;
  totalAnalyses: number;
}
