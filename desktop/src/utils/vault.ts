import { promises as fs } from "fs";
import { existsSync } from "fs";
import * as path from "path";
import * as chokidar from "chokidar";
import { NoteFile, NoteFolder, VaultConfig, WikiLink } from "@/types/notes";

export class VaultManager {
  private vaultPath: string;
  private config: VaultConfig;
  private watcher?: chokidar.FSWatcher;
  private onFileChange?: (file: NoteFile) => void;
  private onFileDelete?: (filePath: string) => void;

  constructor(vaultPath: string, config?: Partial<VaultConfig>) {
    this.vaultPath = vaultPath;
    this.config = {
      vaultPath,
      excludeFolders: [
        ".git",
        "node_modules",
        ".obsidian",
        ...(config?.excludeFolders || []),
      ],
      includeExtensions: [".md", ".txt", ...(config?.includeExtensions || [])],
    };
  }

  async initializeVault(): Promise<NoteFolder> {
    const vault = await this.scanDirectory(this.vaultPath);
    this.startWatching();
    return vault;
  }

  private async scanDirectory(dirPath: string): Promise<NoteFolder> {
    const name = path.basename(dirPath);

    const folder: NoteFolder = {
      name,
      path: dirPath,
      children: [],
      isExpanded: true,
    };

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          if (!this.config.excludeFolders.includes(entry.name)) {
            const subFolder = await this.scanDirectory(fullPath);
            folder.children.push(subFolder);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (this.config.includeExtensions.includes(ext)) {
            const noteFile = await this.createNoteFile(fullPath);
            folder.children.push(noteFile);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }

    return folder;
  }

  private async createNoteFile(filePath: string): Promise<NoteFile> {
    const stats = await fs.stat(filePath);
    const content = await fs.readFile(filePath, "utf-8");

    return {
      id: this.generateFileId(filePath),
      name: path.basename(filePath),
      path: filePath,
      content,
      lastModified: stats.mtime,
      size: stats.size,
    };
  }

  private generateFileId(filePath: string): string {
    return Buffer.from(filePath).toString("base64");
  }

  async readNote(filePath: string): Promise<NoteFile | null> {
    try {
      return await this.createNoteFile(filePath);
    } catch (error) {
      console.error(`Error reading note ${filePath}:`, error);
      return null;
    }
  }

  async saveNote(filePath: string, content: string): Promise<boolean> {
    try {
      await fs.writeFile(filePath, content, "utf-8");
      return true;
    } catch (error) {
      console.error(`Error saving note ${filePath}:`, error);
      return false;
    }
  }

  async createNote(fileName: string, folderPath?: string): Promise<string> {
    const targetDir = folderPath || this.vaultPath;
    const filePath = path.join(targetDir, fileName);

    try {
      await fs.writeFile(filePath, "", "utf-8");
      return filePath;
    } catch (error) {
      console.error(`Error creating note ${filePath}:`, error);
      throw error;
    }
  }

  async deleteNote(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error(`Error deleting note ${filePath}:`, error);
      return false;
    }
  }

  parseWikiLinks(content: string): WikiLink[] {
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    const links: WikiLink[] = [];
    let match;

    while ((match = wikiLinkRegex.exec(content)) !== null) {
      const linkText = match[1];
      const [target, displayText] = linkText.includes("|")
        ? linkText.split("|").map((s) => s.trim())
        : [linkText.trim(), linkText.trim()];

      links.push({
        text: displayText,
        target,
        isValid: this.checkLinkExists(target),
      });
    }

    return links;
  }

  private checkLinkExists(target: string): boolean {
    const targetPath = path.join(this.vaultPath, `${target}.md`);
    try {
      return existsSync(targetPath);
    } catch {
      return false;
    }
  }

  private startWatching(): void {
    this.watcher = chokidar.watch(this.vaultPath, {
      ignored: (filePath: string) => {
        return this.config.excludeFolders.some((folder) =>
          filePath.includes(folder),
        );
      },
      persistent: true,
    });

    this.watcher
      .on("change", async (filePath: string) => {
        if (this.isMarkdownFile(filePath) && this.onFileChange) {
          const note = await this.readNote(filePath);
          if (note) this.onFileChange(note);
        }
      })
      .on("unlink", (filePath: string) => {
        if (this.isMarkdownFile(filePath) && this.onFileDelete) {
          this.onFileDelete(filePath);
        }
      });
  }

  private isMarkdownFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    return this.config.includeExtensions.includes(ext);
  }

  setFileChangeListener(callback: (file: NoteFile) => void): void {
    this.onFileChange = callback;
  }

  setFileDeleteListener(callback: (filePath: string) => void): void {
    this.onFileDelete = callback;
  }

  destroy(): void {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}
