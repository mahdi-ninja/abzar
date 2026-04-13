export interface ToolContent {
  about: string;
  howTo: string[];
}

export const toolContent: Record<string, ToolContent> = {
  "json-formatter": {
    about:
      "Paste or type JSON to instantly format, validate, and minify it. The tree view lets you explore nested structures interactively. Everything runs locally in your browser — your data never leaves your device.",
    howTo: [
      "Paste your JSON into the input area",
      "Click Format to pretty-print, or Minify to compress",
      "Use the tree view to explore nested structures",
      "Click Copy to copy the result to your clipboard",
    ],
  },
  base64: {
    about:
      "Encode text or files to Base64 and decode Base64 strings back to their original form. Useful for embedding data in URLs, emails, or HTML. Supports both text and binary file encoding.",
    howTo: [
      "Choose Text or File mode",
      "Paste text or drop a file into the input area",
      "Toggle between Encode and Decode",
      "Copy the result or download the decoded file",
    ],
  },
  "color-picker": {
    about:
      "Pick any color and see it in all major formats simultaneously — HEX, RGB, HSL, HSB, and CMYK. Use the native color picker or type values directly. Great for web development and design work.",
    howTo: [
      "Click the color swatch to open the color picker",
      "Or type a value in any format field (HEX, RGB, HSL, etc.)",
      "All formats update in sync automatically",
      "Click Copy next to any format to copy it",
    ],
  },
  "password-generator": {
    about:
      "Generate cryptographically strong passwords using your browser's secure random number generator. Customize length, character types, and generate multiple passwords at once. Includes entropy calculation to show password strength.",
    howTo: [
      "Adjust the length slider to set password length",
      "Toggle character types: uppercase, lowercase, numbers, symbols",
      "Click Generate to create a new password",
      "Use Bulk mode to generate multiple passwords at once",
      "Click Copy to copy the password to your clipboard",
    ],
  },
  "uuid-generator": {
    about:
      "Generate universally unique identifiers in various formats. Supports v4 UUIDs (random), ULIDs (time-sortable), and nanoids (compact). Generate in bulk and copy all at once.",
    howTo: [
      "Select the ID type: UUID v4, ULID, or nanoid",
      "Set the quantity (1-100)",
      "Click Generate to create IDs",
      "Click Copy All to copy all generated IDs",
    ],
  },
  "word-counter": {
    about:
      "Analyze your text with real-time word, character, sentence, and paragraph counts. Includes readability scores (Flesch-Kincaid, Gunning Fog) to help you gauge text complexity and reading level.",
    howTo: [
      "Type or paste text into the input area",
      "View real-time counts in the stats cards below",
      "Check readability scores for complexity analysis",
      "Use the character/word breakdown for detailed analysis",
    ],
  },
  "unit-converter": {
    about:
      "Convert between units of length, weight, volume, temperature, speed, area, and data storage. Supports both metric and imperial systems with instant conversion as you type.",
    howTo: [
      "Select a unit category (Length, Weight, etc.)",
      "Choose source and target units from the dropdowns",
      "Type a value in the input field",
      "Use the swap button to reverse the conversion",
    ],
  },
  "timestamp-converter": {
    about:
      "Convert between Unix timestamps, ISO 8601, RFC 2822, and human-readable date formats. Automatically detects the input format. Useful for debugging APIs, logs, and database records.",
    howTo: [
      "Paste a timestamp or date string into the input",
      "The format is auto-detected and all conversions are shown",
      'Click "Now" to use the current date and time',
      "Copy any format with the copy button next to it",
    ],
  },
  "hash-generator": {
    about:
      "Generate SHA-1, SHA-256, SHA-512, and MD5 hashes of text or files using the Web Crypto API. All processing happens in your browser — your data is never uploaded anywhere.",
    howTo: [
      "Choose Text or File mode",
      "Type text or drop a file to hash",
      "All hash algorithms are computed simultaneously",
      "Click Copy next to any hash to copy it",
    ],
  },
  "qr-generator": {
    about:
      "Generate QR codes for URLs, plain text, Wi-Fi credentials, and vCards. Customize size and error correction level. Download as PNG or SVG for use in print or digital media.",
    howTo: [
      "Select the content type (URL, Text, Wi-Fi, or vCard)",
      "Fill in the required fields",
      "Adjust size and error correction if needed",
      "Download the QR code as PNG or SVG",
    ],
  },
  "generative-art": {
    about:
      "Create procedurally generated artwork entirely in your browser using Canvas API. Choose from Perlin noise landscapes, flowing wave patterns, particle flow fields, and overlapping circle compositions. Adjust scale and seed to explore infinite variations, then download as PNG.",
    howTo: [
      "Pick an algorithm: Perlin Noise, Circles, Waves, or Flow Field",
      "Choose a color palette from the dropdown",
      "Adjust Scale to control detail density",
      "Drag the Seed slider or click Randomize for a new variation",
      "Click Download PNG to save the artwork",
    ],
  },
  "meme-generator": {
    about:
      "Create memes in your browser by uploading any image and adding classic Impact-style text overlays. Adjust font size, text color, and copy for top and bottom captions. Everything runs locally — no uploads, no watermarks.",
    howTo: [
      "Drop or click to upload an image",
      "Type your top and bottom caption text",
      "Adjust font size and text color",
      "Click Download PNG to save the meme",
      "Click Change Image to start over with a new photo",
    ],
  },
  "soundboard": {
    about:
      "Build a custom soundboard by uploading your own audio clips. Each file becomes a trigger button — click to play instantly. Control global volume with the slider and stop all sounds at once. Perfect for streaming, presentations, or sound effects.",
    howTo: [
      "Drop audio files (MP3, WAV, OGG) onto the upload area",
      "Click any sound button to play it",
      "Adjust the volume slider to control playback level",
      "Hover a tile and click × to remove it",
      "Click Stop All to silence everything at once",
    ],
  },
  "terrain-generator": {
    about:
      "Generate realistic 2D terrain maps using fractal Brownian motion (fBm) built on Perlin noise. Adjust scale to zoom in or out, increase detail octaves for more rugged terrain, and explore thousands of unique landscapes with the seed slider. Download any map as PNG.",
    howTo: [
      "Drag the Seed slider to explore different terrains",
      "Increase Scale to zoom out (larger continent-scale features)",
      "Increase Detail (octaves) for more rugged, detailed terrain",
      "Click New Terrain to jump to a random seed",
      "Click Download PNG to save the map",
    ],
  },
  "drawing-canvas": {
    about:
      "A lightweight freehand drawing canvas with brush and eraser tools, a 12-color palette plus custom color picker, adjustable brush size, and undo history. Works with mouse and touch. Download your drawing as a PNG when finished.",
    howTo: [
      "Select Brush or Eraser from the toolbar",
      "Pick a color from the palette or the custom color picker",
      "Adjust brush size with the slider",
      "Draw on the canvas — touch and stylus are supported",
      "Click Undo to step back, Clear to start fresh, or Download PNG to save",
    ],
  },
  "ambient-sounds": {
    about:
      "Generate soothing ambient soundscapes entirely in your browser using the Web Audio API — no downloads, no streaming. Layer white noise, pink noise, brown noise, rain, and ocean waves, each with its own volume control. Great for focus, sleep, or relaxation.",
    howTo: [
      "Click a sound card to toggle it on or off",
      "Drag each card's volume slider to blend the mix",
      "Layer multiple sounds for a richer environment",
      "Click Stop All to silence everything at once",
    ],
  },
  "css-art": {
    about:
      "A live CSS playground for creating pure CSS illustrations and animations. Edit HTML and CSS in real time with an instant preview rendered in a sandboxed iframe. Start from one of the built-in examples — sunset, smiley, spinner, card, or checkerboard — and customize freely.",
    howTo: [
      "Choose an example from the dropdown to get started",
      "Edit the HTML and CSS panels — the preview updates live",
      "Click Copy HTML+CSS to copy the code to your clipboard",
      "Click Download HTML to save a standalone file you can open in any browser",
    ],
  },
  "emoji-search": {
    about:
      "Browse and search over 300 emojis by name, keyword, or category. Click any emoji to copy it to your clipboard. Recently used emojis appear at the top for quick re-access. All data is bundled locally — no network requests.",
    howTo: [
      "Type in the search box to filter emojis by name or keyword",
      "Click a category button to browse by theme",
      "Click any emoji to copy it to your clipboard",
      "Recently copied emojis appear at the top of the grid",
    ],
  },
  "palette-game": {
    about:
      "Train your color sense by sorting shuffled color tiles to match a target palette. A new random palette is generated each round. Score 100% by placing every tile in the correct brightness order. Your best scores per difficulty are saved locally.",
    howTo: [
      "Choose a difficulty: Easy (3 colors), Medium (5), or Hard (8)",
      "Click Start Game to see the target palette and scrambled tiles",
      "Drag tiles to swap their positions and match the target order",
      "Click Submit to see your score, or New Game to play a fresh round",
    ],
  },
};

export function getToolContent(slug: string): ToolContent | undefined {
  return toolContent[slug];
}
