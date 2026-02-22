export interface Conversation {
  id: string;
  title: string;
  userId?: string;
  status?: string;
  lastMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateConversationDto {
  title: string;
}

export interface UpdateConversationDto {
  title?: string;
  status?: string;
}
