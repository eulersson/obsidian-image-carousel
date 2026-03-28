# Image Carousel

An Obsidian plugin that lets you browse images in a document as a full-screen carousel.

## Usage

### Reading mode

Click any image in a note to open the carousel.

### Edit mode

Open the command palette (`Cmd/Ctrl+P`) and run **Open image carousel**. The carousel starts from the image closest to your cursor.

### Navigation

- **Left/Right arrow keys** to navigate between images
- **Escape** or click the backdrop to close
- Click the left/right arrows on screen

## Installation

### Manual

1. Download `main.js`, `styles.css`, and `manifest.json` from the [latest release](https://github.com/eulersson/obsidian-image-carousel/releases/latest)
2. Create a folder `obsidian-image-carousel` in your vault's `.obsidian/plugins/` directory
3. Place the downloaded files in that folder
4. Restart Obsidian and enable the plugin in **Settings → Community plugins**

### From source

```bash
git clone https://github.com/eulersson/obsidian-image-carousel.git
cd obsidian-image-carousel
npm install
npm run build
```

Copy `main.js`, `styles.css`, and `manifest.json` to your vault's `.obsidian/plugins/obsidian-image-carousel/` folder.
