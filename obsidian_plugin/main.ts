import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { CampaignAPI } from './auth';
import { NoteParser } from './parser';
import { CampaignSettings, Room, DEFAULT_SETTINGS } from './types';

export default class CampaignManagerPlugin extends Plugin {
	settings: CampaignSettings;
	api: CampaignAPI;
	rooms: Room[] = [];

	async onload() {
		await this.loadSettings();
		this.api = new CampaignAPI(this.settings);

		this.addRibbonIcon('upload', 'Publish to Campaign', async () => {
			await this.publishCurrentNote();
		});

		this.addCommand({
			id: 'publish-note',
			name: 'Publish note to campaign',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				await this.publishCurrentNote();
			}
		});

		this.addCommand({
			id: 'preview-public-content',
			name: 'Preview public content',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.previewPublicContent(editor, view);
			}
		});

		this.addSettingTab(new CampaignSettingTab(this.app, this));

		if (this.settings.email && this.settings.password) {
			await this.loadRooms();
		}
	}

	async publishCurrentNote(): Promise<void> {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			new Notice('No active note to publish');
			return;
		}

		const file = activeView.file;
		if (!file) {
			new Notice('No file selected');
			return;
		}

		if (!this.settings.selectedRoomId) {
			new Notice('Please select a room in settings first');
			return;
		}

		try {
			const content = await this.app.vault.read(file);
			const parsed = NoteParser.parseNote(content, file.basename);

			const sectionCount = NoteParser.getSectionCount(parsed);

			// Show confirmation modal (even if no public content - allows clearing from database)
			new PublishConfirmModal(this.app, parsed, sectionCount, async (confirmed) => {
				if (confirmed) {
					await this.doPublish(file, parsed);
				}
			}).open();

		} catch (error) {
			new Notice('Failed to read note: ' + error.message);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private async doPublish(file: TFile, parsed: any): Promise<void> {
		try {
			const noteData = {
				title: parsed.title,
				obsidianPath: file.path,
				sections: parsed.sections,
			};

			const result = await this.api.publishNote(this.settings.selectedRoomId, noteData);

			if (result.created) {
				new Notice(`Note "${parsed.title}" published successfully!`);
			} else if (result.updated) {
				new Notice(`Note "${parsed.title}" updated successfully!`);
			}

		} catch (error) {
			new Notice('Failed to publish note: ' + error.message);
		}
	}

	private previewPublicContent(editor: Editor, view: MarkdownView): void {
		const content = editor.getValue();
		const parsed = NoteParser.parseNote(content, view.file?.basename || 'Untitled');

		new PreviewModal(this.app, parsed).open();
	}

	async loadRooms(): Promise<void> {
		try {
			const loginSuccess = await this.api.login();
			if (loginSuccess) {
				this.rooms = await this.api.getRooms();
			}
		} catch (error) {
			console.error('Failed to load rooms:', error);
		}
	}

	async onunload() {
		// Cleanup
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.api?.updateSettings(this.settings);
	}
}

class PublishConfirmModal extends Modal {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private parsed: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private sectionCount: any;
	private callback: (confirmed: boolean) => void;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(app: App, parsed: any, sectionCount: any, callback: (confirmed: boolean) => void) {
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

class PreviewModal extends Modal {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private parsed: any;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(app: App, parsed: any) {
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

class CampaignSettingTab extends PluginSettingTab {
	plugin: CampaignManagerPlugin;

	constructor(app: App, plugin: CampaignManagerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'D&D Campaign Manager Settings' });

		new Setting(containerEl)
			.setName('API URL')
			.setDesc('Campaign Manager API endpoint')
			.addText(text => text
				.setPlaceholder('http://localhost:3001')
				.setValue(this.plugin.settings.apiUrl)
				.onChange(async (value) => {
					this.plugin.settings.apiUrl = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Email')
			.setDesc('Your campaign manager account email')
			.addText(text => text
				.setPlaceholder('email@example.com')
				.setValue(this.plugin.settings.email)
				.onChange(async (value) => {
					this.plugin.settings.email = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Password')
			.setDesc('Your campaign manager account password')
			.addText(text => {
				text.setPlaceholder('Password')
					.setValue(this.plugin.settings.password)
					.onChange(async (value) => {
						this.plugin.settings.password = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.type = 'password';
			});

		new Setting(containerEl)
			.setName('Test Connection')
			.setDesc('Test connection to Campaign Manager API')
			.addButton(button => button
				.setButtonText('Test')
				.onClick(async () => {
					const success = await this.plugin.api.testConnection();
					new Notice(success ? 'Connection successful!' : 'Connection failed!');
					if (success) {
						await this.plugin.loadRooms();
						this.display(); // Refresh settings to show rooms
					}
				}));

		if (this.plugin.rooms.length > 0) {
			new Setting(containerEl)
				.setName('Select Room')
				.setDesc('Choose which campaign room to publish to')
				.addDropdown(dropdown => {
					dropdown.addOption('', 'Select a room...');

					this.plugin.rooms.forEach(room => {
						dropdown.addOption(room.id, `${room.name} (${room.role.toUpperCase()})`);
					});

					dropdown.setValue(this.plugin.settings.selectedRoomId);
					dropdown.onChange(async (value) => {
						this.plugin.settings.selectedRoomId = value;
						await this.plugin.saveSettings();
					});
				});
		}

		new Setting(containerEl)
			.setName('Auto Sync')
			.setDesc('Automatically sync notes when saved')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoSync)
				.onChange(async (value) => {
					this.plugin.settings.autoSync = value;
					await this.plugin.saveSettings();
				}));
	}
}
