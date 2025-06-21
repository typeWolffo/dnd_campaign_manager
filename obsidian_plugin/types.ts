// Campaign Manager Plugin Types

export interface CampaignSettings {
  apiUrl: string;
  email: string;
  password: string;
  selectedRoomId: string;
  autoSync: boolean;
  lastSync: number;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  gmId: string;
  isGM: boolean;
  role: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  session?: any;
}

export interface NoteSection {
  content: string;
  isPublic: boolean;
  orderIndex: number;
}

export interface CreateNotePayload {
  title: string;
  obsidianPath?: string;
  contentHash?: string;
  sections: NoteSection[];
}

export interface ParsedNote {
  title: string;
  sections: NoteSection[];
}

export interface PublishedNote {
  id: string;
  title: string;
  obsidianPath?: string;
  contentHash?: string;
  sections: NoteSection[];
  updatedAt: string;
  createdAt: string;
}

export interface PublishResult {
  success: boolean;
  noteId?: string;
  error?: string;
  created?: boolean;
  updated?: boolean;
}

export const DEFAULT_SETTINGS: CampaignSettings = {
  apiUrl: 'http://localhost:3001',
  email: '',
  password: '',
  selectedRoomId: '',
  autoSync: false,
  lastSync: 0,
};
