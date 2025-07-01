import { App, Plugin, MarkdownView, Notice } from 'obsidian';
import { CampaignAPI } from '../auth';
import { CampaignSettings, Room, DEFAULT_SETTINGS, PublishedNote } from '../types';
import { EncryptionUtils } from '../utils/encryption';
import { PluginCommands } from './commands';
import { PublishingService } from './publishing';
import { CampaignSettingTab } from '../components/settings/CampaignSettingTab';
import { PrivacyConsentModal } from '../components/modals/PrivacyConsentModal';
import { PublishedNotesModal } from '../components/modals/PublishedNotesModal';

export default class CampaignManagerPlugin extends Plugin {
	settings: CampaignSettings;
	api: CampaignAPI;
	rooms: Room[] = [];
	MarkdownView = MarkdownView; // Expose for other classes

	private commands: PluginCommands;
	private publishingService: PublishingService;

	async onload() {
		await this.loadSettings();
		this.api = new CampaignAPI(this.settings);
		this.commands = new PluginCommands(this);
		this.publishingService = new PublishingService(this);

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

		this.commands.registerCommands();

		this.addSettingTab(new CampaignSettingTab(this.app, this));

		if (this.settings.apiToken) {
			await this.loadRooms();
		}
	}

	async publishCurrentNote(): Promise<void> {
		return this.publishingService.publishCurrentNote();
	}

	async viewPublishedNotes(): Promise<void> {
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
			this.settings.apiToken = EncryptionUtils.decryptSensitiveData(this.settings.apiToken);
		}
	}

	async saveSettings() {
		const settingsToSave = { ...this.settings };

		if (settingsToSave.apiToken) {
			settingsToSave.apiToken = EncryptionUtils.encryptSensitiveData(settingsToSave.apiToken);
		}

		await this.saveData(settingsToSave);
		this.api?.updateSettings(this.settings);
	}
}
