export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
}

export interface CreateMessageDto {
  content: string;
  conversationId: string;
}
