import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useRoomNotes } from "../lib/api-hooks";
import { Clock, FileText } from "lucide-react";
import { useState, useMemo, type ReactNode } from "react";
import { Files, Folder, File } from "./animate-ui/components/files";
import { cn } from "~/lib/utils";

interface NoteSection {
  id?: string;
  content: string;
  isPublic: boolean;
  orderIndex: number;
}

interface Note {
  id: string;
  title: string;
  obsidianPath: string;
  lastSync: string;
  createdAt: string;
  updatedAt: string;
  sections: NoteSection[];
}

interface NoteWithFileName extends Note {
  fileName: string;
}

interface FolderStructure {
  _files?: NoteWithFileName[];
  [folderName: string]: FolderStructure | NoteWithFileName[] | undefined;
}

interface NotesSectionProps {
  roomId: string;
  isGM: boolean;
}

const buildFolderStructure = (notes: Note[]): FolderStructure => {
  const structure: FolderStructure = {};

  notes.forEach(note => {
    const pathParts = note.obsidianPath.split("/");
    const fileName = pathParts.pop() || note.title;

    let current: FolderStructure = structure;
    pathParts.forEach(folder => {
      if (!current[folder]) {
        current[folder] = {};
      }
      current = current[folder] as FolderStructure;
    });

    if (!current._files) {
      current._files = [];
    }
    current._files.push({ ...note, fileName });
  });

  return structure;
};

const isFolderStructure = (
  value: FolderStructure[keyof FolderStructure]
): value is FolderStructure => {
  return typeof value === "object" && !Array.isArray(value) && value !== undefined;
};

const isFileArray = (
  value: FolderStructure[keyof FolderStructure]
): value is NoteWithFileName[] => {
  return Array.isArray(value);
};

const renderFolderStructure = (
  structure: FolderStructure,
  selectedNote: Note | null,
  onNoteSelect: (note: Note) => void,
  path = ""
): ReactNode[] => {
  const elements: ReactNode[] = [];

  Object.entries(structure).forEach(([key, value]) => {
    if (key === "_files" && isFileArray(value)) {
      value.forEach((note: NoteWithFileName) => {
        elements.push(
          <File
            key={note.id}
            name={note.fileName.replace(".md", "")}
            className={cn({
              "bg-primary/10": selectedNote?.id === note.id,
            })}
            onClick={() => onNoteSelect(note)}
            sideComponent={
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            }
          />
        );
      });
    } else if (key !== "_files" && isFolderStructure(value)) {
      const folderPath = path ? `${path}/${key}` : key;
      elements.push(
        <Folder key={folderPath} name={key}>
          {renderFolderStructure(value, selectedNote, onNoteSelect, folderPath)}
        </Folder>
      );
    }
  });

  return elements;
};

export function NotesSection({ roomId, isGM }: NotesSectionProps) {
  const { data: notes, isLoading, error } = useRoomNotes(roomId);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const selectedNote = useMemo((): Note | null => {
    if (!selectedNoteId || !notes) return null;
    return notes.find(note => note.id === selectedNoteId) || null;
  }, [selectedNoteId, notes]);

  const folderStructure = useMemo((): FolderStructure => {
    if (!notes || notes.length === 0) return {};
    return buildFolderStructure(notes);
  }, [notes]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Notes</CardTitle>
          <CardDescription>Published notes from your Obsidian vault</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span className="ml-2 text-gray-500">Loading notes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            Failed to load notes. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Notes</CardTitle>
          <CardDescription>Published notes from your Obsidian vault</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No notes published yet.</p>
            <p className="text-sm mt-1">
              {isGM
                ? "Connect your Obsidian plugin to share notes with players."
                : "Your GM hasn't published any notes yet."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Notes</CardTitle>
          <CardDescription>Published notes from your Obsidian vault</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 md:h-[600px] h-[800px]">
            {/* Files Explorer */}
            <div className="border-r">
              <Files className="border-0 rounded-none h-full bg-transparent">
                {renderFolderStructure(folderStructure, selectedNote, (note: Note) =>
                  setSelectedNoteId(note.id)
                )}
              </Files>
            </div>

            {/* Note Content */}
            <div className="p-6 overflow-auto">
              {selectedNote ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{selectedNote.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(selectedNote.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {selectedNote.obsidianPath && isGM && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Source: {selectedNote.obsidianPath}
                    </p>
                  )}

                  <div className="space-y-4">
                    {selectedNote.sections?.map((section: NoteSection, index: number) => (
                      <div key={section.id || index} className="relative">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                            {section.content}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedNote.lastSync && (
                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                      Last synced: {new Date(selectedNote.lastSync).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <p>Select a note to view its content</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
