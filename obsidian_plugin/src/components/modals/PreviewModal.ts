import { App, Modal } from 'obsidian';
import { NoteParser } from '../../parser';
import { ParsedNote } from 'src/types';

export class PreviewModal extends Modal {
	private parsed: ParsedNote;

	constructor(app: App, parsed: ParsedNote) {
		super(app);
		this.parsed = parsed;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Public Content Preview' });

		const publicContent = NoteParser.getPublicContent(this.parsed);

		if (publicContent) {
			const preEl = contentEl.createEl('pre');
			preEl.textContent = publicContent;
		} else {
			contentEl.createEl('p', {
				text: 'No public content found. Use [PUBLIC] markers to mark content for publication.'
			});
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
