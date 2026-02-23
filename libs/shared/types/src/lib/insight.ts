export interface UserInsight {
  id: string;
  userId: string;
  type: 'pattern' | 'milestone' | 'comparison' | 'encouragement';
  title: string;
  content: string;
  data: Record<string, any>;
  isRead: boolean;
  expiresAt: string | null;
  createdAt: string;
}
