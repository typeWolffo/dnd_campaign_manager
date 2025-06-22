import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useRoomNotes, useNoteImages } from "../lib/api-hooks";
import { Clock, FileText } from "lucide-react";
import { useState, useMemo, type ReactNode } from "react";
import { Files, Folder, File } from "./animate-ui/components/files";
import { cn } from "~/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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

const parseObsidianLinks = (
  content: string,
  notes: Note[],
  onNoteSelect: (note: Note) => void,
  images?: { id: string; filename: string; originalName: string; url: string }[]
): ReactNode => {
  let processedContent = content.replace(/!\[\[([^\]]+)\]\]/g, (match, imageName) => {
    const image = images?.find(
      img =>
        img.originalName === imageName ||
        img.filename === imageName ||
        img.originalName.includes(imageName)
    );
    if (image) {
      return `![${imageName}](${image.url})`;
    } else {
      return `*Image not found: ${imageName}*`;
    }
  });

  processedContent = processedContent.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
    // Check if this is an image link (has image extension)
    if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(linkText)) {
      const image = images?.find(
        img =>
          img.originalName === linkText ||
          img.filename === linkText ||
          img.originalName.includes(linkText)
      );
      if (image) {
        return `![${linkText}](${image.url})`;
      } else {
        return `*Image not found: ${linkText}*`;
      }
    }

    // Otherwise treat as note link
    const linkedNote = notes.find(note => note.title === linkText);
    if (linkedNote) {
      return `[${linkText}](#obsidian-note-${linkedNote.id})`;
    } else {
      return `~~${linkText}~~`; // Strikethrough for missing links
    }
  });

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ href, children, ...props }) => {
            if (href?.startsWith("#obsidian-note-")) {
              const noteId = href.replace("#obsidian-note-", "");
              const linkedNote = notes.find(note => note.id === noteId);
              if (linkedNote) {
                return (
                  <button
                    type="button"
                    onClick={e => {
                      e.preventDefault();
                      onNoteSelect(linkedNote);
                    }}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer bg-transparent border-none p-0 font-inherit"
                  >
                    {children}
                  </button>
                );
              }
            }
            return (
              <a href={href} {...props}>
                {children}
              </a>
            );
          },
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg shadow-sm my-4"
              loading="lazy"
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
              {...props}
            />
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside space-y-1 my-4 pl-4" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside space-y-1 my-4 pl-4" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-sm leading-relaxed" {...props}>
              {children}
            </li>
          ),
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4 first:mt-0" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3 first:mt-0" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xl font-semibold mt-5 mb-3 first:mt-0" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-lg font-medium mt-4 mb-2 first:mt-0" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-base font-medium mt-4 mb-2 first:mt-0" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6
              className="text-sm font-medium mt-3 mb-2 first:mt-0 text-muted-foreground"
              {...props}
            >
              {children}
            </h6>
          ),
          code: ({ children, className, ...props }) => {
            const isInline = !className?.includes("language-");
            return isInline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm" {...props}>
              {children}
            </pre>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export function NotesSection({ roomId, isGM }: NotesSectionProps) {
  const { data: notes, isLoading, error } = useRoomNotes(roomId);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);

  const selectedNote = useMemo((): Note | null => {
    if (!selectedNoteId || !notes) return null;
    return notes.find(note => note.id === selectedNoteId) || null;
  }, [selectedNoteId, notes]);

  const { data: selectedNoteImages } = useNoteImages(roomId, selectedNoteId || "");

  // Simple note selection with folder expansion
  const handleNoteSelect = (note: Note) => {
    setSelectedNoteId(note.id);

    // Auto-expand folders to show the selected note
    const pathParts = note.obsidianPath.split("/");
    pathParts.pop(); // Remove filename
    const foldersToExpand: string[] = [];

    for (let i = 0; i < pathParts.length; i++) {
      const cumulativePath = pathParts.slice(0, i + 1).join("/");
      foldersToExpand.push(cumulativePath);
    }

    setExpandedFolders(prev => [...new Set([...prev, ...foldersToExpand])]);
  };

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
              <Files
                className="border-0 rounded-none h-full bg-transparent"
                open={expandedFolders}
                onOpenChange={setExpandedFolders}
              >
                {renderFolderStructure(folderStructure, selectedNote, (note: Note) =>
                  handleNoteSelect(note)
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
                        {parseObsidianLinks(
                          section.content,
                          notes || [],
                          (note: Note) => handleNoteSelect(note),
                          selectedNoteImages?.images
                        )}
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
