import {App, Modal} from 'obsidian';

export class CarouselModal extends Modal {
	private sources: string[];
	private currentIndex: number;
	private imageEl: HTMLImageElement;
	private counterEl: HTMLElement;

	constructor(app: App, sources: string[], startIndex: number) {
		super(app);
		this.sources = sources;
		this.currentIndex = startIndex;
	}

	onOpen() {
		const {contentEl, modalEl, containerEl} = this;

		containerEl.addClass('carousel-overlay');
		modalEl.addClass('carousel-modal');
		contentEl.addClass('carousel-content');

		contentEl.empty();

		// Close when clicking the backdrop (not the image)
		containerEl.addEventListener('click', (e) => {
			if (e.target === containerEl || e.target === modalEl || e.target === contentEl) {
				this.close();
			}
		});

		// Previous button
		const prevBtn = contentEl.createEl('div', {
			cls: 'carousel-nav carousel-prev',
			text: '\u2039',
		});
		prevBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			this.navigate(-1);
		});

		// Image
		this.imageEl = contentEl.createEl('img', {cls: 'carousel-image'});

		// Next button
		const nextBtn = contentEl.createEl('div', {
			cls: 'carousel-nav carousel-next',
			text: '\u203A',
		});
		nextBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			this.navigate(1);
		});

		// Counter
		this.counterEl = contentEl.createEl('div', {cls: 'carousel-counter'});

		this.showImage();

		this.scope.register([], 'ArrowLeft', () => {
			this.navigate(-1);
			return false;
		});
		this.scope.register([], 'ArrowRight', () => {
			this.navigate(1);
			return false;
		});
	}

	onClose() {
		this.contentEl.empty();
	}

	private navigate(direction: number) {
		this.currentIndex = (this.currentIndex + direction + this.sources.length) % this.sources.length;
		this.showImage();
	}

	private showImage() {
		const src = this.sources[this.currentIndex];
		if (src) this.imageEl.setAttribute('src', src);
		this.counterEl.setText(`${this.currentIndex + 1} / ${this.sources.length}`);
	}
}
