export interface NoteFile {
  id: string;
  name: string;
  path: string;
  content: string;
  lastModified: Date;
  size: number;
}

export interface NoteFolder {
  name: string;
  path: string;
  children: (NoteFile | NoteFolder)[];
  isExpanded?: boolean;
}

export interface WikiLink {
  text: string;
  target: string;
  isValid: boolean;
}

export interface NoteStats {
  totalNotes: number;
  totalSize: number;
  lastModified: Date;
}

export type ViewMode = "edit" | "preview" | "split";

export interface VaultConfig {
  vaultPath: string;
  excludeFolders: string[];
  includeExtensions: string[];
}
