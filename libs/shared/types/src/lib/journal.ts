export interface JournalEntry {
  id: string;
  userId?: string;
  prompt?: string;
  content?: string;
  mood?: number;
  tags: string[];
  emotion?: string;
  sliderValue?: number;
  factors: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateJournalEntryDto {
  prompt?: string;
  content?: string;
  mood?: number;
  tags?: string[];
  emotion?: string;
  sliderValue?: number;
  factors?: string[];
}
