import { Notice, TFile, normalizePath } from 'obsidian';
import { NoteParser } from '../parser';
import { HashUtils } from '../utils/hash';
import { PublishConfirmModal } from '../components/modals/PublishConfirmModal';
import type { ImageReference, ParsedNote } from '../types';
import type CampaignManagerPlugin from './plugin';

export class PublishingService {
	private plugin: CampaignManagerPlugin;

	constructor(plugin: CampaignManagerPlugin) {
		this.plugin = plugin;
	}

	async publishCurrentNote(): Promise<void> {
		const activeView = this.plugin.app.workspace.getActiveViewOfType(this.plugin.MarkdownView);
		if (!activeView) {
			new Notice('No active note to publish');

			return;
		}

		const file = activeView.file;
		if (!file) {
			new Notice('No file selected');

			return;
		}

		if (!this.plugin.settings.selectedRoomId) {
			new Notice('Please select a room in settings first');

			return;
		}

		try {
			const content = await this.plugin.app.vault.read(file);
			const parsed = NoteParser.parseNote(content, file.basename);

			const sectionCount = NoteParser.getSectionCount(parsed);

			new PublishConfirmModal(this.plugin.app, parsed, sectionCount, async (confirmed) => {
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

			const existingNotes = await this.plugin.api.getPublishedNotes(this.plugin.settings.selectedRoomId);

			const duplicates = existingNotes.filter(note => {
				if (note.contentHash && contentHash) {
					return note.contentHash === contentHash && note.obsidianPath !== file.path;
				}

				return note.title === parsed.title && note.obsidianPath !== file.path;
			});

			for (const duplicate of duplicates) {
				try {
					await this.plugin.api.deleteNote(this.plugin.settings.selectedRoomId, duplicate.id);
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

			const publishResult = await this.plugin.api.publishNote(this.plugin.settings.selectedRoomId, noteData);
			const noteId = publishResult.id;

			const content = await this.plugin.app.vault.read(file);
			const publicImages = NoteParser.getPublicImages(content);
			const imagePathMap = new Map<string, string>();

			const uniqueImages = new Map<string, ImageReference>();

			for (const imageRef of publicImages) {
				uniqueImages.set(imageRef.localPath, imageRef);
			}

			if (uniqueImages.size > 0) {
				const existingImagesResponse = await this.plugin.api.getExistingImages(this.plugin.settings.selectedRoomId, noteId);
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

					await this.plugin.api.publishNote(this.plugin.settings.selectedRoomId, updatedNoteData);
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
		const content = await this.plugin.app.vault.read(file);
		const hashInput = content + '|' + file.basename;
		const hash = HashUtils.simpleHash(hashInput);

		return hash;
	}

	private async uploadImage(imageRef: ImageReference, noteFile: TFile, noteId: string): Promise<string | null> {
		try {
			const normalizedPath = normalizePath(imageRef.localPath);
			const imageFile = this.plugin.app.metadataCache.getFirstLinkpathDest(normalizedPath, noteFile.path);
			if (!imageFile) {
				throw new Error(`Image file not found: ${normalizedPath}`);
			}

			const imageBuffer = await this.plugin.app.vault.readBinary(imageFile);

			const formData = new FormData();
			const blob = new Blob([imageBuffer], { type: this.getMimeType(imageFile.extension) });
			formData.append('files', blob, imageFile.name);

			const response = await this.plugin.api.uploadImage(
				this.plugin.settings.selectedRoomId,
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
}
