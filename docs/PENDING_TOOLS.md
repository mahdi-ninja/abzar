# Pending Tools Inventory

Registry-backed snapshot of all currently planned tools in Abzar.

**Last Updated**: 2026-04-19  
**Source of Truth**: `lib/tools-registry.ts`  
**Planned Tools**: 128

## Summary

| Category | Planned |
|----------|---------|
| Text & Language | 9 |
| Developer Tools | 16 |
| Color & Design | 16 |
| Image & Media | 16 |
| Math & Data | 9 |
| Finance & Business | 10 |
| Security & Privacy | 7 |
| Productivity | 8 |
| Health & Fitness | 8 |
| Networking & Sysadmin | 7 |
| Education & Learning | 8 |
| Fun & Creative | 0 |
| File Utilities | 7 |
| Date & Time | 7 |

## Text & Language

| Tool | Slug | Deps | Description |
|------|------|------|-------------|
| Text Diff Tool | `text-diff` | `medium` | Side-by-side comparison with highlighted additions, deletions, and changes |
| Morse Code Translator | `morse-code` | `light` | Encode/decode Morse code with audio playback via Web Audio API |
| Word Frequency Analyzer | `word-frequency` | `light` | Visualize most-used words in text — useful for SEO and writing |
| Text Similarity Checker | `text-similarity` | `light` | Compare two texts using cosine similarity to detect overlap |
| Name & Username Generator | `name-generator` | `light` | Random name generator with filters for style, length, and theme |
| Text-to-Speech Previewer | `text-to-speech` | `light` | Preview text in browser voices and speeds using SpeechSynthesis API |
| Transliteration Tool | `transliteration` | `light` | Convert between writing systems — Latin ↔ Cyrillic |
| Unicode Character Lookup | `unicode-lookup` | `light` | Search, browse, and copy Unicode symbols, emojis, and special characters |
| Zalgo Text Generator | `zalgo-text` | `light` | Add combining characters to text for stylistic/meme use |

## Developer Tools

| Tool | Slug | Deps | Description |
|------|------|------|-------------|
| JWT Builder | `jwt-builder` | `light` | Craft and sign JWTs with a user-provided secret |
| SQL Formatter | `sql-formatter` | `medium` | Beautify and indent raw SQL queries |
| CSS Flexbox Playground | `flexbox-playground` | `light` | Visual playground for flex container and item properties |
| CSS Grid Playground | `grid-playground` | `light` | Interactive grid layout visualizer and CSS generator |
| Open Graph Previewer | `og-preview` | `light` | Preview Open Graph tags for a webpage |
| Responsive Breakpoint Tester | `breakpoint-tester` | `light` | Preview a URL at common device widths |
| Snippet Manager | `snippet-manager` | `medium` | Save, tag, and search reusable code snippets locally |
| API Response Mocker | `api-mocker` | `light` | Generate fake JSON API responses from a schema |
| Diff / Patch Viewer | `diff-viewer` | `light` | View unified diffs and patches with syntax highlighting |
| YAML ↔ JSON Converter | `yaml-json` | `medium` | Convert YAML to JSON and back with validation |
| CSV ↔ JSON Converter | `csv-json` | `medium` | Convert CSV data to JSON and vice versa |
| XML ↔ JSON Converter | `xml-json` | `light` | Convert simple XML documents to JSON and back |
| TOML ↔ JSON Converter | `toml-json` | `medium` | Convert TOML to JSON and back |
| HTTP Status Code Reference | `http-status-codes` | `light` | Search and browse common HTTP status codes |
| User-Agent Parser | `user-agent-parser` | `light` | Parse user-agent strings into browser, OS, and device details |
| Markdown Table Generator | `markdown-table` | `light` | Build and export Markdown tables visually |

## Color & Design

| Tool | Slug | Deps | Description |
|------|------|------|-------------|
| Color Palette Generator | `palette-generator` | `light` | Generate harmonious color palettes from a base color |
| Color Palette Extractor | `palette-extractor` | `light` | Extract dominant colors from an uploaded image |
| Duotone Image Filter | `duotone-filter` | `light` | Apply a two-color duotone effect to images |
| Font Pairing Previewer | `font-pairing` | `light` | Preview heading/body font combinations |
| Box Shadow Generator | `box-shadow` | `light` | Create CSS box-shadow values with live preview |
| Border Radius Previewer | `border-radius` | `light` | Generate custom border radius values visually |
| CSS Animation Builder | `animation-builder` | `light` | Assemble keyframe animations and timing options |
| Glassmorphism Generator | `glassmorphism` | `light` | Generate translucent glass-style CSS cards |
| Neumorphism Generator | `neumorphism` | `light` | Create soft-shadow neumorphic UI styles |
| Pattern / Texture Generator | `pattern-generator` | `light` | Generate repeating SVG or CSS texture backgrounds |
| Mockup Frame Generator | `mockup-generator` | `light` | Place screenshots inside browser or device mockup frames |
| Sprite Sheet Generator | `sprite-sheet` | `light` | Combine multiple small images into a sprite sheet |
| SVG Optimizer / Viewer | `svg-optimizer` | `light` | View and optimize inline SVG markup |
| Favicon Generator | `favicon-generator` | `medium` | Generate favicon sizes and related assets from one source image |
| Tailwind Color Lookup | `tailwind-colors` | `light` | Browse and copy Tailwind color scales |
| Typography Scale Calculator | `type-scale` | `light` | Build modular typography scales from a base size and ratio |

## Image & Media

| Tool | Slug | Deps | Description |
|------|------|------|-------------|
| Image Compressor | `image-compressor` | `light` | Compress image files in-browser |
| Image Format Converter | `image-converter` | `light` | Convert images between common file formats |
| Image to Base64 | `image-to-base64` | `light` | Convert images into Base64 strings |
| EXIF Data Viewer | `exif-viewer` | `medium` | Inspect EXIF metadata from photos |
| QR Code Reader | `qr-reader` | `medium` | Decode QR codes from camera or uploaded image |
| Barcode Generator | `barcode-generator` | `medium` | Create downloadable barcodes in common formats |
| ASCII Art Generator | `ascii-art` | `light` | Convert images or text into ASCII art |
| Placeholder Image Generator | `placeholder-image` | `light` | Generate simple placeholder images with custom sizes and labels |
| Image Color Replacer | `color-replacer` | `light` | Replace selected colors in an image |
| Photo Collage Maker | `collage-maker` | `light` | Arrange multiple photos into a collage layout |
| Watermark Tool | `watermark` | `light` | Add text or image watermarks to pictures |
| Audio Trimmer | `audio-trimmer` | `light` | Trim audio clips locally in the browser |
| Video to GIF Converter | `video-to-gif` | `massive` | Convert short video clips into GIFs |
| Waveform Visualizer | `waveform-visualizer` | `light` | Display waveform views for audio files |
| Screen Recorder | `screen-recorder` | `light` | Record the screen and download the capture |
| Webcam Photo Booth | `webcam-booth` | `light` | Capture webcam photos with simple effects |

## Math & Data

| Tool | Slug | Deps | Description |
|------|------|------|-------------|
| Matrix Calculator | `matrix-calculator` | `light` | Perform basic matrix operations and transformations |
| Statistics Calculator | `statistics-calculator` | `light` | Compute descriptive statistics for numeric data |
| Scientific Calculator | `scientific-calculator` | `light` | Advanced calculator with trig, logs, and exponents |
| Graphing Calculator | `graphing-calculator` | `heavy` | Plot mathematical functions interactively |
| Boolean Algebra Simplifier | `boolean-algebra` | `light` | Simplify boolean expressions and truth tables |
| Number to Words | `number-to-words` | `light` | Convert numbers into spelled-out words |
| Bitwise Operation Visualizer | `bitwise-visualizer` | `light` | Show binary bitwise operations step by step |
| Probability Calculator | `probability-calculator` | `light` | Compute common probability scenarios |
| Number Base Converter | `arbitrary-base-converter` | `light` | Convert values between arbitrary bases |

## Finance & Business

| Tool | Slug | Deps | Description |
|------|------|------|-------------|
| Compound Interest Calculator | `compound-interest` | `light` | Project compounding growth over time |
| Currency Converter | `currency-converter` | `light` | Convert values between currencies |
| Subscription Tracker | `subscription-tracker` | `light` | Track recurring subscriptions and costs |
| Net Worth Tracker | `net-worth-tracker` | `light` | Track assets, liabilities, and total net worth |
| 50/30/20 Budget Planner | `budget-planner` | `light` | Plan spending using the 50/30/20 budgeting model |
| Debt Snowball/Avalanche Calculator | `debt-calculator` | `light` | Compare debt payoff strategies |
| Tax Estimator (Freelancer) | `tax-estimator` | `light` | Estimate taxes for freelance income |
| Break-Even Calculator | `break-even` | `light` | Compute break-even points for pricing and sales |
| Savings Goal Tracker | `savings-goal` | `light` | Track progress toward a savings target |
| Stock Position Size Calculator | `position-size` | `light` | Calculate position size from risk and entry parameters |

## Security & Privacy

| Tool | Slug | Deps | Description |
|------|------|------|-------------|
| Password Strength Checker | `password-strength` | `light` | Estimate password strength and common weaknesses |
| File Checksum Verifier | `checksum-verifier` | `light` | Compare file hashes to expected checksums |
| Encrypted Notes | `encrypted-notes` | `light` | Store encrypted text notes locally |
| Encrypted Vault | `encrypted-vault` | `light` | Securely store sensitive local data in-browser |
| TOTP Code Generator | `totp-generator` | `light` | Generate time-based one-time passwords |
| Privacy Metadata Stripper | `metadata-stripper` | `light` | Remove metadata from supported files |
| Secure Text Sharing Encoder | `secure-share` | `light` | Encode text for safer sharing workflows |

## Productivity

| Tool | Slug | Deps | Description |
|------|------|------|-------------|
| To-Do List / Checklist | `todo-list` | `light` | Manage simple tasks and checklists locally |
| Meeting Cost Calculator | `meeting-cost` | `light` | Estimate the cost of meetings from attendees and rates |
| Decision Matrix | `decision-matrix` | `light` | Score options against weighted criteria |
| Eisenhower Matrix | `eisenhower-matrix` | `light` | Sort tasks by urgency and importance |
| Mind Map Builder | `mind-map` | `light` | Build simple node-based idea maps |
| Daily Planner / Schedule | `daily-planner` | `light` | Plan a day with blocks, tasks, and timing |
| Sticky Notes Wall | `sticky-notes` | `light` | Arrange simple notes on a visual board |
| Goal Tracker | `goal-tracker` | `light` | Track long-term goals and milestones |

## Health & Fitness

| Tool | Slug | Deps | Description |
|------|------|------|-------------|
| TDEE & Macro Calculator | `tdee-calculator` | `light` | Estimate daily calorie needs and macro targets |
| Water Intake Tracker | `water-tracker` | `light` | Track daily water consumption |
| HIIT / Tabata Timer | `hiit-timer` | `light` | Interval timer for workout circuits and Tabata sessions |
| Body Measurement Tracker | `body-tracker` | `light` | Record and compare body measurements over time |
| Calorie Counter | `calorie-counter` | `light` | Track calories consumed during the day |
| One-Rep Max Calculator | `one-rep-max` | `light` | Estimate one-rep max from weight and reps |
| Pace Calculator | `pace-calculator` | `light` | Convert distance, time, and pace |
| Breathing Exercise Timer | `breathing-timer` | `light` | Guide timed inhale/exhale breathing exercises |

## Networking & Sysadmin

| Tool | Slug | Deps | Description |
|------|------|------|-------------|
| IPv4 ↔ IPv6 Converter | `ip-converter` | `light` | Convert and inspect IPv4 and IPv6 representations |
| CIDR Range Visualizer | `cidr-visualizer` | `light` | Visualize address ranges from CIDR blocks |
| Bandwidth Calculator | `bandwidth-calculator` | `light` | Estimate transfer time from file size and bandwidth |
| DNS Record Reference | `dns-reference` | `light` | Browse common DNS record types and meanings |
| Port Number Reference | `port-reference` | `light` | Search common port numbers and their services |
| MAC Address Lookup | `mac-lookup` | `light` | Inspect MAC address structure and vendor info |
| Network Mask Calculator | `netmask-calculator` | `light` | Convert masks between dotted-decimal and CIDR notation |

## Education & Learning

| Tool | Slug | Deps | Description |
|------|------|------|-------------|
| Mental Math Trainer | `mental-math` | `light` | Practice quick arithmetic drills |
| Periodic Table Explorer | `periodic-table` | `light` | Browse chemical elements and properties |
| Geography Quiz | `geography-quiz` | `light` | Quiz users on maps, capitals, or flags |
| Music Interval Trainer | `interval-trainer` | `light` | Practice recognizing musical intervals |
| Language Vocabulary Builder | `vocabulary-builder` | `light` | Build and review vocabulary lists |
| Times Table Trainer | `times-tables` | `light` | Practice multiplication tables interactively |
| Color Blindness Simulator | `color-blind-sim` | `light` | Simulate common types of color blindness |
| Binary / Hex Teaching Tool | `binary-teacher` | `light` | Teach binary and hexadecimal through examples |

## Fun & Creative

No planned tools remain in this category right now.

## File Utilities

| Tool | Slug | Deps | Description |
|------|------|------|-------------|
| PDF Splitter | `pdf-splitter` | `heavy` | Split PDF files into separate pages or ranges |
| PDF Page Rotator | `pdf-rotator` | `heavy` | Rotate pages in a PDF before export |
| File Size Analyzer | `file-size-analyzer` | `light` | Inspect and compare file sizes |
| Text File Merger | `text-merger` | `light` | Combine multiple text files into one output |
| ZIP File Creator | `zip-creator` | `heavy` | Package files into a downloadable ZIP archive |
| File Rename Batch Tool | `file-renamer` | `heavy` | Batch-rename uploaded files with patterns |
| Plain Text Cleaner | `text-cleaner` | `light` | Clean and normalize pasted plain text |

## Date & Time

| Tool | Slug | Deps | Description |
|------|------|------|-------------|
| Timezone Converter | `timezone-converter` | `light` | Convert time values across multiple timezones |
| Date Adder/Subtractor | `date-add-subtract` | `light` | Add or subtract durations from a date |
| Week Number Lookup | `week-number` | `light` | Look up ISO week numbers for dates |
| Working Days Calculator | `working-days` | `light` | Calculate working days between dates |
| Calendar Generator | `calendar-generator` | `light` | Generate printable calendar layouts |
| Timezone Meeting Planner | `meeting-planner` | `light` | Find overlap times across participant timezones |
| Relative Time Display | `relative-time` | `light` | Format timestamps as relative time strings |

## Notes

- This file is intended to stay in sync with `lib/tools-registry.ts`.
- If a tool moves from planned to implemented, update the registry first and then move it between the inventory docs.
