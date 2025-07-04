import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileTreeView } from "@/components/notes/FileTreeView";
import { MarkdownEditor } from "@/components/notes/MarkdownEditor";
import { MarkdownPreview } from "@/components/notes/MarkdownPreview";
import { VaultManager } from "@/utils/vault";
import { NoteFile, NoteFolder, ViewMode } from "@/types/notes";
import { FolderOpen, Edit, Eye, Split, Plus, Settings } from "lucide-react";

export default function NotesPage() {
  const [vault, setVault] = useState<NoteFolder | null>(null);
  const [currentNote, setCurrentNote] = useState<NoteFile | null>(null);
  const [vaultManager, setVaultManager] = useState<VaultManager | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [vaultPath, setVaultPath] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const openVault = async (path: string) => {
    setIsLoading(true);
    try {
      const manager = new VaultManager(path);
      manager.setFileChangeListener((file) => {
        if (currentNote && file.path === currentNote.path) {
          setCurrentNote(file);
        }
      });

      const vaultData = await manager.initializeVault();
      setVaultManager(manager);
      setVault(vaultData);
      setVaultPath(path);
    } catch (error) {
      console.error("Error opening vault:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectVaultFolder = async () => {
    try {
      const result = await window.electronAPI?.showOpenDialog({
        properties: ["openDirectory"],
        title: "Select Vault Folder",
      });

      if (result && result.filePaths && result.filePaths.length > 0) {
        await openVault(result.filePaths[0]);
      }
    } catch (error) {
      console.error("Error selecting vault folder:", error);
    }
  };

  const onNoteSelect = async (note: NoteFile) => {
    if (vaultManager) {
      const freshNote = await vaultManager.readNote(note.path);
      if (freshNote) {
        setCurrentNote(freshNote);
      }
    }
  };

  const onNoteSave = async (content: string) => {
    if (currentNote && vaultManager) {
      const success = await vaultManager.saveNote(currentNote.path, content);
      if (success) {
        setCurrentNote({
          ...currentNote,
          content,
          lastModified: new Date(),
        });
      }
    }
  };

  const createNewNote = async () => {
    if (vaultManager && vaultPath) {
      try {
        const fileName = `New Note ${Date.now()}.md`;
        const filePath = await vaultManager.createNote(fileName);
        const newNote = await vaultManager.readNote(filePath);
        if (newNote) {
          setCurrentNote(newNote);
          // Refresh vault
          const vaultData = await vaultManager.initializeVault();
          setVault(vaultData);
        }
      } catch (error) {
        console.error("Error creating new note:", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (vaultManager) {
        vaultManager.destroy();
      }
    };
  }, [vaultManager]);

  if (!vault) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <FolderOpen className="text-muted-foreground mx-auto h-16 w-16" />
          <h2 className="text-xl font-semibold">Open a Vault</h2>
          <p className="text-muted-foreground">
            Select a folder containing your markdown notes
          </p>
          <Button
            onClick={selectVaultFolder}
            className="mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Open Vault"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="bg-background w-80 border-r">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="truncate font-semibold">{vault.name}</h2>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={createNewNote}
                  title="New Note"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectVaultFolder}
                  title="Change Vault"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="h-full overflow-auto">
            <FileTreeView
              folder={vault}
              onNoteSelect={onNoteSelect}
              selectedNote={currentNote}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b p-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
            {currentNote && (
              <span className="text-sm font-medium">{currentNote.name}</span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant={viewMode === "edit" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("edit")}
              title="Edit Mode"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("preview")}
              title="Preview Mode"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "split" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("split")}
              title="Split Mode"
            >
              <Split className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editor/Preview Area */}
        <div className="flex flex-1">
          {currentNote ? (
            <>
              {(viewMode === "edit" || viewMode === "split") && (
                <div
                  className={viewMode === "split" ? "w-1/2 border-r" : "w-full"}
                >
                  <MarkdownEditor
                    content={currentNote.content}
                    onChange={onNoteSave}
                    className="h-full"
                  />
                </div>
              )}
              {(viewMode === "preview" || viewMode === "split") && (
                <div className={viewMode === "split" ? "w-1/2" : "w-full"}>
                  <MarkdownPreview
                    content={currentNote.content}
                    className="h-full"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-muted-foreground flex flex-1 items-center justify-center">
              <div className="text-center">
                <Edit className="mx-auto mb-4 h-12 w-12" />
                <p>Select a note to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
