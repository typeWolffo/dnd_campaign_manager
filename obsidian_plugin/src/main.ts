import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, normalizePath } from 'obsidian';
import { CampaignAPI } from './auth';
import { NoteParser } from './parser';
import { CampaignSettings, Room, DEFAULT_SETTINGS, PublishedNote, ImageReference, ParsedNote } from './types';

export default class CampaignManagerPlugin extends Plugin {
	settings: CampaignSettings;
	api: CampaignAPI;
	rooms: Room[] = [];

	async onload() {
		await this.loadSettings();
		this.api = new CampaignAPI(this.settings);

		if (!this.settings.privacyConsentGiven) {
			new PrivacyConsentModal(this.app, this).open();
			return;
		}

		await this.start();
	}

	async start() {
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

		this.addCommand({
			id: 'insert-public-block',
			name: 'Insert PUBLIC block',
			editorCallback: (editor: Editor) => {
				const cursor = editor.getCursor();
				editor.replaceRange('\n[PUBLIC]\n\n[!PUBLIC]\n', cursor);
				editor.setCursor(cursor.line + 2, 0);
			}
		});

		this.addCommand({
			id: 'wrap-selection-public',
			name: 'Wrap selection in PUBLIC block',
			editorCallback: (editor: Editor) => {
				const selection = editor.getSelection();
				if (selection) {
					const replacement = `[PUBLIC]\n${selection}\n[!PUBLIC]`;
					editor.replaceSelection(replacement);
				} else {
					new Notice('No text selected');
				}
			}
		});

		this.addCommand({
			id: 'view-published-notes',
			name: 'View published notes',
			callback: async () => {
				await this.viewPublishedNotes();
			}
		});

		this.addSettingTab(new CampaignSettingTab(this.app, this));

		if (this.settings.apiToken) {
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

			new PublishConfirmModal(this.app, parsed, sectionCount, async (confirmed) => {
				if (confirmed) {
					await this.doPublish(file, parsed);
				}
			}).open();

		} catch (error) {
			new Notice('Failed to read note: ' + error.message);
		}
	}

	private async doPublish(file: TFile, parsed: ParsedNote): Promise<void> {
		try {
			const contentHash = await this.getFileHash(file);

			const existingNotes = await this.api.getPublishedNotes(this.settings.selectedRoomId);

			const duplicates = existingNotes.filter(note => {
				if (note.contentHash && contentHash) {
					return note.contentHash === contentHash && note.obsidianPath !== file.path;
				}
				return note.title === parsed.title && note.obsidianPath !== file.path;
			});

			for (const duplicate of duplicates) {
				try {
					await this.api.deleteNote(this.settings.selectedRoomId, duplicate.id);
				} catch (error) {
					new Notice(`Failed to remove duplicate: ${error.message}`);
				}
			}

			const publicSections = NoteParser.getPublicSections(parsed);

			const noteData = {
				title: parsed.title,
				obsidianPath: file.path,
				contentHash,
				sections: publicSections,
			};

			const publishResult = await this.api.publishNote(this.settings.selectedRoomId, noteData);
			const noteId = publishResult.id;

			const content = await this.app.vault.read(file);
			const publicImages = NoteParser.getPublicImages(content);
			const imagePathMap = new Map<string, string>();

			const uniqueImages = new Map<string, ImageReference>();
			for (const imageRef of publicImages) {
				uniqueImages.set(imageRef.localPath, imageRef);
			}

			if (uniqueImages.size > 0) {
				const existingImagesResponse = await this.api.getExistingImages(this.settings.selectedRoomId, noteId);
				const existingImages = existingImagesResponse.images || [];

				const existingImageMap = new Map<string, string>();
				for (const img of existingImages) {
					existingImageMap.set(img.originalName, img.url);
				}

				const imagesToUpload = new Map<string, ImageReference>();

				for (const [path, imageRef] of uniqueImages) {
					const filename = path.split('/').pop() || path;

					if (existingImageMap.has(filename)) {
						imagePathMap.set(path, existingImageMap.get(filename)!);
					} else {
						imagesToUpload.set(path, imageRef);
					}
				}

				if (imagesToUpload.size > 0) {
					new Notice(`Uploading ${imagesToUpload.size} new image(s)...`);

					for (const [path, imageRef] of imagesToUpload) {
						try {
							const uploadedUrl = await this.uploadImage(imageRef, file, noteId);
							if (uploadedUrl) {
								imagePathMap.set(path, uploadedUrl);
							}
						} catch (error) {
							console.log(`Failed to upload image ${path}: ${error.message}`);
						}
					}
				} else {
					new Notice('All images already exist, reusing existing URLs...');
				}

				if (imagePathMap.size > 0) {
					let updatedContent = content;
					updatedContent = NoteParser.replaceImagePathsInContent(content, imagePathMap);

					const finalParsed = NoteParser.parseNote(updatedContent, parsed.title);
					const finalPublicSections = NoteParser.getPublicSections(finalParsed);

					const updatedNoteData = {
						title: finalParsed.title,
						obsidianPath: file.path,
						contentHash,
						sections: finalPublicSections,
					};

					await this.api.publishNote(this.settings.selectedRoomId, updatedNoteData);
				}
			}

			if (publishResult.created) {
				const imageMsg = imagePathMap.size > 0 ? ` (${imagePathMap.size} images uploaded)` : '';
				const message = duplicates.length > 0
					? `Note "${parsed.title}" published successfully! (Removed ${duplicates.length} duplicate${duplicates.length > 1 ? 's' : ''})${imageMsg}`
					: `Note "${parsed.title}" published successfully!${imageMsg}`;
				new Notice(message);
			} else if (publishResult.updated) {
				const imageMsg = imagePathMap.size > 0 ? ` (${imagePathMap.size} images uploaded)` : '';
				new Notice(`Note "${parsed.title}" updated successfully!${imageMsg}`);
			}

		} catch (error) {
			new Notice('Failed to publish note: ' + error.message);
		}
	}

	private async getFileHash(file: TFile): Promise<string> {
		const content = await this.app.vault.read(file);
		const hashInput = content + '|' + file.basename;
		const hash = this.simpleHash(hashInput);

		return hash;
	}

	private simpleHash(str: string): string {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return Math.abs(hash).toString(36);
	}

	private async uploadImage(imageRef: ImageReference, noteFile: TFile, noteId: string): Promise<string | null> {
		try {
			const normalizedPath = normalizePath(imageRef.localPath);
			const imageFile = this.app.metadataCache.getFirstLinkpathDest(normalizedPath, noteFile.path);
			if (!imageFile) {
				throw new Error(`Image file not found: ${normalizedPath}`);
			}

			const imageBuffer = await this.app.vault.readBinary(imageFile);

			const formData = new FormData();
			const blob = new Blob([imageBuffer], { type: this.getMimeType(imageFile.extension) });
			formData.append('files', blob, imageFile.name);

			const response = await this.api.uploadImage(
				this.settings.selectedRoomId,
				noteId,
				formData
			);

			if (response.success && response.images?.length > 0) {
				return response.images[0].url;
			}

			return null;
		} catch (error) {
			console.error('Failed to upload image:', error);
			throw error;
		}
	}

	private getMimeType(extension: string): string {
		const mimeTypes: Record<string, string> = {
			'jpg': 'image/jpeg',
			'jpeg': 'image/jpeg',
			'png': 'image/png',
			'gif': 'image/gif',
			'bmp': 'image/bmp',
			'svg': 'image/svg+xml',
			'webp': 'image/webp',
			'tiff': 'image/tiff',
		};
		return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
	}

	private previewPublicContent(editor: Editor, view: MarkdownView): void {
		const content = editor.getValue();
		const parsed = NoteParser.parseNote(content, view.file?.basename || 'Untitled');

		new PreviewModal(this.app, parsed).open();
	}

	private async viewPublishedNotes(): Promise<void> {
		if (!this.settings.selectedRoomId) {
			new Notice('Please select a room in settings first');
			return;
		}

		try {
			const notes = await this.api.getPublishedNotes(this.settings.selectedRoomId);
			new PublishedNotesModal(this.app, notes, this).open();
		} catch (error) {
			new Notice('Failed to load published notes: ' + error.message);
		}
	}

	async loadRooms(): Promise<void> {
		try {
			const tokenValid = await this.api.validateToken();

			if (tokenValid) {
				this.rooms = await this.api.getRooms();
			} else {
				console.log('❌ Token invalid, clearing rooms');
				this.rooms = [];
			}
		} catch (error) {
			console.error('❌ Failed to load rooms:', error);
			this.rooms = [];
		}
	}

	async onunload() {
		// No cleanup needed - plugin doesn't register any events or intervals
		// API instance will be garbage collected
	}

	async loadSettings() {
		const data = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);

		if (this.settings.apiToken) {
			this.settings.apiToken = this.decryptSensitiveData(this.settings.apiToken);
		}
	}

	async saveSettings() {
		const settingsToSave = { ...this.settings };

		if (settingsToSave.apiToken) {
			settingsToSave.apiToken = this.encryptSensitiveData(settingsToSave.apiToken);
		}

		await this.saveData(settingsToSave);
		this.api?.updateSettings(this.settings);
	}

	private getDeviceKey(): string {
		const baseKey = 'grimbane-obsidian-plugin-v1';
		const deviceInfo = `${navigator.platform}-${screen.width}x${screen.height}`;
		const combined = `${baseKey}-${deviceInfo}`;
		return this.simpleHash(combined).substring(0, 16);
	}

	private encryptSensitiveData(data: string): string {
		if (!data) return '';

		try {
			const key = this.getDeviceKey();
			const encrypted = data.split('').map((char, index) =>
				String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length))
			).join('');
			return btoa(encrypted);
		} catch (error) {
			console.error('Encryption failed:', error);
			return data;
		}
	}

	private decryptSensitiveData(encryptedData: string): string {
		if (!encryptedData) return '';

		try {
			const encrypted = atob(encryptedData);
			const key = this.getDeviceKey();
			const decrypted = encrypted.split('').map((char, index) =>
				String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length))
			).join('');

			if (decrypted.length > 10 && /^[a-zA-Z0-9_-]+$/.test(decrypted)) {
				return decrypted;
			} else {
				console.warn('Decryption resulted in invalid token format');
				return encryptedData;
			}
		} catch (error) {
			console.error('Decryption failed:', error);
			return encryptedData;
		}
	}
}

class PublishConfirmModal extends Modal {
	private parsed: ParsedNote;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private sectionCount: any;
	private callback: (confirmed: boolean) => void;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

class PublishedNotesModal extends Modal {
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

class NotePreviewModal extends Modal {
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

		this.note.sections.forEach((section: any) => {
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

class CampaignSettingTab extends PluginSettingTab {
	plugin: CampaignManagerPlugin;

	constructor(app: App, plugin: CampaignManagerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName('Grimbane Settings').setHeading();

		// Developer Mode API URL (tylko jeśli developer mode włączony)
		if (this.plugin.settings.developerMode) {
			new Setting(containerEl)
				.setName('API URL')
				.setDesc('Campaign Manager API endpoint (Developer Mode)')
				.addText(text => text
					.setPlaceholder('http://localhost:4000/api')
					.setValue(this.plugin.settings.apiUrl)
					.onChange(async (value) => {
						this.plugin.settings.apiUrl = value;
						await this.plugin.saveSettings();
					}));
		}

		new Setting(containerEl)
			.setName('API token')
			.setDesc('Your campaign manager API token (more secure than password)')
			.addText(text => {
				text.setPlaceholder('API Token')
					.setValue(this.plugin.settings.apiToken)
					.onChange(async (value) => {
						this.plugin.settings.apiToken = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.type = 'password';
			});

		new Setting(containerEl)
			.setName('Test connection')
			.setDesc('Test API token and connection to Campaign Manager')
			.addButton(button => button
				.setButtonText('Test')
				.onClick(async () => {
					const success = await this.plugin.api.testConnection();
					new Notice(success ? 'API token valid! Connection successful!' : 'Invalid API token or connection failed!');
					if (success) {
						await this.plugin.loadRooms();
						this.display(); // Refresh settings to show rooms
					}
				}));

		const gmRooms = this.plugin.rooms.filter(room => room.isGM);

		if (gmRooms.length > 0) {
			new Setting(containerEl)
				.setName('Select room')
				.setDesc('Choose which campaign room to publish to (GM only)')
				.addDropdown(dropdown => {
					dropdown.addOption('', 'Select a room...');

					gmRooms.forEach(room => {
						dropdown.addOption(room.id, `${room.name} (GM)`);
					});

					dropdown.setValue(this.plugin.settings.selectedRoomId);
					dropdown.onChange(async (value) => {
						this.plugin.settings.selectedRoomId = value;
						await this.plugin.saveSettings();
					});
				});
		} else {
			new Setting(containerEl)
				.setName('Rooms')
				.setDesc('No rooms available where you are Game Master. Create a room in the web interface to publish notes.')
				.addText(() => { });
		}

		// Danger Zone
		containerEl.createEl('hr');
		const dangerZoneSetting = new Setting(containerEl).setName('⚠️ Danger Zone').setHeading();
		dangerZoneSetting.settingEl.addClass('danger-zone');

		new Setting(containerEl)
			.setName('Developer mode')
			.setDesc('Enable custom API URL for development. Disabling will reset to production server.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.developerMode)
				.onChange(async (value) => {
					this.plugin.settings.developerMode = value;

					if (!value) {
						this.plugin.settings.apiUrl = 'https://api-dnd.failytales.com/api';
					}

					await this.plugin.saveSettings();
					this.display();
				}));
	}
}

class PrivacyConsentModal extends Modal {
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
