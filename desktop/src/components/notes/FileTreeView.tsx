import React, { useState } from "react";
import { NoteFile, NoteFolder } from "@/types/notes";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/utils/tailwind";

interface FileTreeViewProps {
  folder: NoteFolder;
  onNoteSelect: (note: NoteFile) => void;
  selectedNote?: NoteFile | null;
  level?: number;
}

export function FileTreeView({
  folder,
  onNoteSelect,
  selectedNote,
  level = 0,
}: FileTreeViewProps) {
  const [isExpanded, setIsExpanded] = useState(folder.isExpanded ?? true);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNoteClick = (note: NoteFile) => {
    onNoteSelect(note);
  };

  const isNoteSelected = (note: NoteFile) => {
    return selectedNote?.path === note.path;
  };

  const indentClass = `pl-${level * 4}`;

  return (
    <div className="text-sm">
      {/* Folder header */}
      <div
        className={cn(
          "hover:bg-accent flex cursor-pointer items-center px-2 py-1",
          indentClass,
        )}
        onClick={handleToggle}
      >
        {isExpanded ? (
          <ChevronDown className="mr-1 h-4 w-4" />
        ) : (
          <ChevronRight className="mr-1 h-4 w-4" />
        )}
        {isExpanded ? (
          <FolderOpen className="mr-2 h-4 w-4 text-blue-500" />
        ) : (
          <Folder className="mr-2 h-4 w-4 text-blue-500" />
        )}
        <span className="truncate">{folder.name}</span>
      </div>

      {/* Folder contents */}
      {isExpanded && (
        <div>
          {folder.children.map((child) => {
            if ("children" in child) {
              // It's a folder
              return (
                <FileTreeView
                  key={child.path}
                  folder={child}
                  onNoteSelect={onNoteSelect}
                  selectedNote={selectedNote}
                  level={level + 1}
                />
              );
            } else {
              // It's a file
              const note = child as NoteFile;
              return (
                <div
                  key={note.id}
                  className={cn(
                    "hover:bg-accent flex cursor-pointer items-center px-2 py-1",
                    `pl-${(level + 1) * 4}`,
                    isNoteSelected(note) && "bg-accent",
                  )}
                  onClick={() => handleNoteClick(note)}
                >
                  <File className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="truncate">{note.name}</span>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
