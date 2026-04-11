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
};

export function getToolContent(slug: string): ToolContent | undefined {
  return toolContent[slug];
}
