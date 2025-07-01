import { Editor, MarkdownView, Notice } from 'obsidian';
import { PreviewModal } from '../components/modals/PreviewModal';
import { NoteParser } from '../parser';
import type CampaignManagerPlugin from './plugin';

export class PluginCommands {
	private plugin: CampaignManagerPlugin;

	constructor(plugin: CampaignManagerPlugin) {
		this.plugin = plugin;
	}

	registerCommands() {
		this.plugin.addCommand({
			id: 'publish-note',
			name: 'Publish note to campaign',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				await this.plugin.publishCurrentNote();
			}
		});

		this.plugin.addCommand({
			id: 'preview-public-content',
			name: 'Preview public content',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.previewPublicContent(editor, view);
			}
		});

		this.plugin.addCommand({
			id: 'insert-public-block',
			name: 'Insert PUBLIC block',
			editorCallback: (editor: Editor) => {
				const cursor = editor.getCursor();
				editor.replaceRange('\n[PUBLIC]\n\n[!PUBLIC]\n', cursor);
				editor.setCursor(cursor.line + 2, 0);
			}
		});

		this.plugin.addCommand({
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

		this.plugin.addCommand({
			id: 'view-published-notes',
			name: 'View published notes',
			callback: async () => {
				await this.plugin.viewPublishedNotes();
			}
		});
	}

	private previewPublicContent(editor: Editor, view: MarkdownView): void {
		const content = editor.getValue();
		const parsed = NoteParser.parseNote(content, view.file?.basename || 'Untitled');

		new PreviewModal(this.plugin.app, parsed).open();
	}
}
