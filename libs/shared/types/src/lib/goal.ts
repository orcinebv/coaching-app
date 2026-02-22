export interface Goal {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  status: 'active' | 'completed' | 'abandoned';
  progress: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGoalDto {
  title: string;
  description?: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
}

export interface GoalStats {
  total: number;
  completed: number;
  active: number;
  avgProgress: number;
}
