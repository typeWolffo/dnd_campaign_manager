import { App, Modal } from 'obsidian';
import type CampaignManagerPlugin from '../../core/plugin';

export class PrivacyConsentModal extends Modal {
	private plugin: CampaignManagerPlugin;

	constructor(app: App, plugin: CampaignManagerPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('privacy-consent-modal');

		contentEl.createEl('h2', { text: '🔒 Privacy & Security Notice' });

		const warning = contentEl.createDiv('privacy-warning');
		warning.createEl('h3', { text: 'This plugin transmits data to external servers' });

		const list = warning.createEl('ul');
		list.createEl('li', { text: '✅ Only content within [PUBLIC] markers is sent' });
		list.createEl('li', { text: '✅ Private content outside [PUBLIC] blocks stays local' });
		list.createEl('li', { text: '✅ Images in public sections are uploaded' });
		list.createEl('li', { text: '🔐 API tokens are encrypted before storage' });

		contentEl.createEl('p', {
			text: '⚠️ By continuing, you acknowledge that public content will be shared with your campaign server.'
		});

		contentEl.createEl('p', {
			text: 'You can review what content will be published using the "Preview public content" command before publishing.'
		});

		const buttonContainer = contentEl.createDiv('modal-button-container');

		const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
		cancelBtn.onclick = () => {
			this.plugin.settings.privacyConsentGiven = false;
			this.close();
		};

		const acceptBtn = buttonContainer.createEl('button', {
			text: 'I Understand - Continue',
			cls: 'mod-cta'
		});
		acceptBtn.onclick = async () => {
			this.plugin.settings.privacyConsentGiven = true;
			await this.plugin.saveSettings();
			this.close();
			await this.plugin.start();
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
