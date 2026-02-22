export interface CheckIn {
  id: string;
  userId?: string;
  mood: number;
  energy: number;
  notes?: string;
  goals?: string;
  createdAt?: string;
}

export interface CreateCheckInDto {
  mood: number;
  energy: number;
  notes?: string;
  goals?: string;
}

export interface CheckInStats {
  totalConversations: number;
  totalCheckIns: number;
  averageMood: number;
  averageEnergy: number;
  currentStreak: number;
}
