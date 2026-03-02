export interface CheckIn {
  id: string;
  userId?: string;
  mood: number;
  energy: number;
  notes?: string;
  goals?: string;
  sleepHours?: number;
  sleepQuality?: number;
  waterGlasses?: number;
  activityMinutes?: number;
  stressLevel?: number;
  createdAt?: string;
}

export interface CreateCheckInDto {
  mood: number;
  energy: number;
  notes?: string;
  goals?: string;
  sleepHours?: number;
  sleepQuality?: number;
  waterGlasses?: number;
  activityMinutes?: number;
  stressLevel?: number;
}

export interface CheckInStats {
  totalConversations: number;
  totalCheckIns: number;
  averageMood: number;
  averageEnergy: number;
  currentStreak: number;
}

export interface HealthSummary {
  week: string;
  avgSleepHours: number | null;
  avgSleepQuality: number | null;
  avgWaterGlasses: number | null;
  avgActivityMinutes: number | null;
  avgStressLevel: number | null;
  count: number;
}
