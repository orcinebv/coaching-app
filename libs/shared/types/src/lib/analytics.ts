export interface WeekdayAverage {
  day: string;
  avgMood: number | null;
  avgEnergy: number | null;
  count: number;
}

export interface MoodPatterns {
  weekdayAverages: WeekdayAverage[];
  trendData: { date: string; mood: number; energy: number }[];
  correlation: number | null;
  insights: {
    bestDay: string | null;
    worstDay: string | null;
    totalDataPoints: number;
  };
}

export interface ProgressSummary {
  checkIns: { total: number; avgMood: number; avgEnergy: number };
  goals: { total: number; completed: number; active: number };
  journal: { total: number };
  exercises: { total: number };
}
