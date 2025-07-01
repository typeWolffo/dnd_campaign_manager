import type {
  GetApiRoomsByIdData,
  PostApiRoomsByIdNotesPayload,
  GetApiRoomsByIdNotesData,
  PostApiRoomsByIdNotesData,
  GetApiAuthSessionData
} from './api/data-contracts';

export interface CampaignSettings {
  apiUrl: string;
  apiToken: string;
  selectedRoomId: string;
  autoSync: boolean;
  lastSync: number;
  privacyConsentGiven: boolean;
  developerMode: boolean;
}

export type Room = GetApiRoomsByIdData;
export type AuthResponse = GetApiAuthSessionData;
export type CreateNotePayload = PostApiRoomsByIdNotesPayload & {
  contentHash?: string;
};
export type PublishedNote = GetApiRoomsByIdNotesData[0] & {
  contentHash?: string;
};
export type PublishResult = PostApiRoomsByIdNotesData & {
  success: boolean;
  error?: string;
};

export type NoteSection = PostApiRoomsByIdNotesPayload['sections'][number];

export interface ImageReference {
  localPath: string;
  altText?: string;
  type: 'markdown' | 'wikilink'; // ![](path) vs ![[path]]
  lineNumber: number;
  isInPublicSection: boolean;
}

export interface ExistingImage {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface ParsedNote {
  title: string;
  sections: NoteSection[];
}

export const DEFAULT_SETTINGS: CampaignSettings = {
  apiUrl: 'https://api-dnd.failytales.com/api',
  apiToken: '',
  selectedRoomId: '',
  autoSync: false,
  lastSync: 0,
  privacyConsentGiven: false,
  developerMode: false,
};
