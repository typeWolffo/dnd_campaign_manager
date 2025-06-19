import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useRoomNotes } from "../lib/api-hooks";
import { Clock, FileText } from "lucide-react";

interface NoteSection {
  id?: string;
  content: string;
  isPublic: boolean;
  orderIndex: number;
}

interface NotesSectionProps {
  roomId: string;
  isGM: boolean;
}

export function NotesSection({ roomId, isGM }: NotesSectionProps) {
  const { data: notes, isLoading, error } = useRoomNotes(roomId);

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
      {notes.map(note => (
        <Card key={note.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {note.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </div>
            {note.obsidianPath && isGM && (
              <CardDescription>Source: {note.obsidianPath}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {note.sections?.map((section: NoteSection, index: number) => (
                <div key={section.id || index} className="relative">
                  <div className={`prose prose-sm max-w-none dark:prose-invert`}>
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {section.content}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
            {note.lastSync && (
              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                Last synced: {new Date(note.lastSync).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
