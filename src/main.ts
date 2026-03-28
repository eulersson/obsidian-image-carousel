import {MarkdownView, Plugin, TFile} from 'obsidian';
import {CarouselModal} from "./carousel-modal";

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp', 'avif'];
const IMAGE_PATTERN = /!\[.*?\]\((.*?)\)|!\[\[(.*?)\]\]/g;

export default class ImageCarouselPlugin extends Plugin {

	async onload() {
		// Handle clicks in reading mode
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;
			if (target.tagName !== 'IMG') return;

			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!view) return;

			const container = view.contentEl;
			if (!container.contains(target)) return;

			const sources = this.collectImageSources(view);
			if (sources.length === 0) return;

			const clickedSrc = target.getAttribute('src') || '';
			// Match by finding which resolved source ends with the same filename
			let startIndex = 0;
			for (let i = 0; i < sources.length; i++) {
				const s = sources[i];
				if (s && (clickedSrc === s || clickedSrc.includes(s) || s.includes(clickedSrc))) {
					startIndex = i;
					break;
				}
			}

			new CarouselModal(this.app, sources, startIndex).open();
		});

		// Command for edit mode or any mode
		this.addCommand({
			id: 'open-carousel',
			name: 'Open image carousel',
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (!view) return false;

				const sources = this.collectImageSources(view);
				if (sources.length === 0) return false;

				if (!checking) {
					this.openCarouselFromCursor(view, sources);
				}
				return true;
			}
		});
	}

	private collectImageSources(view: MarkdownView): string[] {
		const file = view.file;
		if (!file) return [];

		const content = view.data;
		const sources: string[] = [];
		let match;

		IMAGE_PATTERN.lastIndex = 0;
		while ((match = IMAGE_PATTERN.exec(content)) !== null) {
			const ref = match[1] || match[2]; // markdown syntax or wiki syntax
			if (!ref) continue;

			// Strip any alias (e.g. "image.png|500")
			const cleaned = ref.split('|')[0]?.trim() || '';

			// External URL
			if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
				sources.push(cleaned);
				continue;
			}

			// Resolve vault file
			const linked = this.app.metadataCache.getFirstLinkpathDest(cleaned, file.path);
			if (linked instanceof TFile && IMAGE_EXTENSIONS.includes(linked.extension.toLowerCase())) {
				sources.push(this.app.vault.getResourcePath(linked));
			}
		}

		return sources;
	}

	private openCarouselFromCursor(view: MarkdownView, sources: string[]) {
		const file = view.file;
		let startIndex = 0;

		if (view.getMode() === 'source' && file) {
			const cursor = view.editor.getCursor();
			const cursorOffset = view.editor.posToOffset(cursor);
			const content = view.data;

			IMAGE_PATTERN.lastIndex = 0;
			let match;
			let closestDistance = Infinity;
			let imageIndex = 0;

			while ((match = IMAGE_PATTERN.exec(content)) !== null) {
				const ref = match[1] || match[2];
				if (!ref) continue;

				const cleaned = ref.split('|')[0]?.trim() || '';
				const isExternal = cleaned.startsWith('http://') || cleaned.startsWith('https://');
				const linked = isExternal ? null : this.app.metadataCache.getFirstLinkpathDest(cleaned, file.path);
				const isImage = isExternal || (linked instanceof TFile && IMAGE_EXTENSIONS.includes(linked.extension.toLowerCase()));

				if (!isImage) continue;

				const matchCenter = match.index + match[0].length / 2;
				const distance = Math.abs(cursorOffset - matchCenter);
				if (distance < closestDistance) {
					closestDistance = distance;
					startIndex = imageIndex;
				}
				imageIndex++;
			}
		}

		new CarouselModal(this.app, sources, startIndex).open();
	}
}
