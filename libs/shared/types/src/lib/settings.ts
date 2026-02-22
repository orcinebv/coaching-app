export interface Settings {
  id: string;
  userId: string;
  notifications: boolean;
  theme: string;
  language: string;
  checkInTime: string;
}

export interface UpdateSettingsDto {
  notifications?: boolean;
  theme?: string;
  language?: string;
  checkInTime?: string;
}
