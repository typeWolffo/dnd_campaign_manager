import { App, Modal } from 'obsidian';
import { ParsedNote } from '../../types';

export class PublishConfirmModal extends Modal {
	private parsed: ParsedNote;
	private sectionCount: any;
	private callback: (confirmed: boolean) => void;

	constructor(app: App, parsed: ParsedNote, sectionCount: any, callback: (confirmed: boolean) => void) {
		super(app);
		this.parsed = parsed;
		this.sectionCount = sectionCount;
		this.callback = callback;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		const hasPublicContent = this.sectionCount.public > 0;

		contentEl.createEl('h2', {
			text: hasPublicContent ? 'Confirm Publication' : 'Clear Note from Database'
		});

		contentEl.createEl('p', {
			text: `Title: ${this.parsed.title}`
		});

		contentEl.createEl('p', {
			text: `Public sections: ${this.sectionCount.public}`
		});

		contentEl.createEl('p', {
			text: `Private sections: ${this.sectionCount.private} (will not be published)`
		});

		if (!hasPublicContent) {
			contentEl.createEl('p', {
				text: 'No [PUBLIC] content found. This will clear all published sections from the database.',
				cls: 'mod-warning'
			});
		}

		const buttonContainer = contentEl.createDiv('modal-button-container');

		const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
		cancelBtn.onclick = () => {
			this.callback(false);
			this.close();
		};

		const publishBtn = buttonContainer.createEl('button', {
			text: hasPublicContent ? 'Publish' : 'Clear from Database',
			cls: 'mod-cta'
		});

		publishBtn.onclick = () => {
			this.callback(true);
			this.close();
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
