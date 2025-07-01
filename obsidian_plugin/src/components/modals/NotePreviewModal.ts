import { App, Modal } from 'obsidian';
import { PublishedNote } from '../../types';

export class NotePreviewModal extends Modal {
	private note: PublishedNote;

	constructor(app: App, note: PublishedNote) {
		super(app);
		this.note = note;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: this.note.title });

		const info = contentEl.createDiv('note-preview-info');
		info.createEl('p', {
			text: `Last updated: ${new Date(this.note.updatedAt).toLocaleString()}`
		});

		if (this.note.obsidianPath) {
			info.createEl('p', { text: `Path: ${this.note.obsidianPath}` });
		}

		const content = contentEl.createDiv('note-preview-content');

		this.note.sections.forEach((section) => {
			if (section.isPublic) {
				const sectionEl = content.createDiv('public-section');
				const pre = sectionEl.createEl('pre');
				pre.textContent = section.content;
			}
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
