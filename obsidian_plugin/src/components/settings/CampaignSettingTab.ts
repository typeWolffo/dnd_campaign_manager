import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import type CampaignManagerPlugin from '../../core/plugin';

export class CampaignSettingTab extends PluginSettingTab {
	plugin: CampaignManagerPlugin;

	constructor(app: App, plugin: CampaignManagerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName('Grimbane Settings').setHeading();

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
