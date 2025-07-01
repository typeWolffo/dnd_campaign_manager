import { App, Modal, Notice, TFile, normalizePath } from 'obsidian';
import { PublishedNote } from '../../types';
import { NotePreviewModal } from './NotePreviewModal';
import type CampaignManagerPlugin from '../../core/plugin';

export class PublishedNotesModal extends Modal {
	private notes: PublishedNote[];
	private plugin: CampaignManagerPlugin;

	constructor(app: App, notes: PublishedNote[], plugin: CampaignManagerPlugin) {
		super(app);
		this.notes = notes;
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('published-notes-modal');

		contentEl.createEl('h2', { text: 'Published Notes' });

		if (this.notes.length === 0) {
			contentEl.createEl('p', { text: 'No published notes found in this room.' });
			return;
		}

		const notesList = contentEl.createDiv('published-notes-list');

		this.notes.forEach(note => {
			const noteItem = notesList.createDiv('published-note-item');

			const noteHeader = noteItem.createDiv('note-header');
			noteHeader.createEl('h3', { text: note.title });

			const noteInfo = noteHeader.createDiv('note-info');
			noteInfo.createEl('span', {
				text: `Last updated: ${new Date(note.updatedAt).toLocaleString()}`,
				cls: 'note-date'
			});

			if (note.obsidianPath) {
				const pathEl = noteInfo.createEl('span', {
					text: note.obsidianPath,
					cls: 'note-path'
				});
				pathEl.onclick = () => {
					this.openNoteInObsidian(note.obsidianPath!);
				};
			}

			const actions = noteItem.createDiv('note-actions');

			const previewBtn = actions.createEl('button', { text: 'Preview' });
			previewBtn.onclick = () => {
				this.previewNote(note);
			};
		});
	}

	private async openNoteInObsidian(path: string) {
		const normalizedPath = normalizePath(path);
		const file = this.app.vault.getAbstractFileByPath(normalizedPath);
		if (file instanceof TFile) {
			await this.app.workspace.getLeaf().openFile(file);
			this.close();
		} else {
			new Notice(`File not found: ${normalizedPath}`);
		}
	}

	private previewNote(note: PublishedNote) {
		const previewModal = new NotePreviewModal(this.app, note);
		previewModal.open();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
