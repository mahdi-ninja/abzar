# Implemented Tools Inventory

Registry-backed snapshot of all currently implemented tools in Abzar.

**Last Updated**: 2026-04-19  
**Source of Truth**: `lib/tools-registry.ts`  
**Implemented Tools**: 74  
**Status Breakdown**: 64 `live`, 10 `featured`

## Summary

| Category | Implemented |
|----------|-------------|
| Text & Language | 9 |
| Developer Tools | 10 |
| Color & Design | 3 |
| Image & Media | 3 |
| Math & Data | 7 |
| Finance & Business | 6 |
| Security & Privacy | 4 |
| Productivity | 7 |
| Health & Fitness | 2 |
| Networking & Sysadmin | 1 |
| Education & Learning | 3 |
| Fun & Creative | 13 |
| File Utilities | 4 |
| Date & Time | 2 |

## Text & Language

Transform, analyze, and generate text.

| Tool | Slug | Status | Deps | Description |
|------|------|--------|------|-------------|
| Word & Character Counter | `word-counter` | `live` | `light` | Count words, characters, sentences, paragraphs with readability scores |
| Markdown Editor | `markdown-editor` | `live` | `medium` | Live split-pane editor with instant HTML preview and export |
| Lorem Ipsum Generator | `lorem-ipsum` | `live` | `light` | Generate placeholder text in multiple styles (classic, hipster, corporate) |
| Case Converter | `case-converter` | `live` | `light` | Transform text between camelCase, snake_case, PascalCase, Title Case, UPPER, lower, kebab-case |
| Regex Tester | `regex-tester` | `featured` | `light` | Test regular expressions with real-time match highlighting, capture groups, and cheat sheet |
| Slug Generator | `slug-generator` | `live` | `light` | Turn titles and phrases into clean URL-friendly slugs |
| String Escaper/Unescaper | `string-escaper` | `live` | `light` | Escape and unescape text for HTML, JSON, URLs, XML, CSV, and regex |
| Whitespace Cleaner | `whitespace-cleaner` | `live` | `light` | Strip trailing spaces, normalize line endings, and clean invisible whitespace |
| Reverse Text / Mirror | `reverse-text` | `live` | `light` | Reverse characters, words, or mirrored text for stylistic effects |

## Developer Tools

Format, encode, decode, and debug.

| Tool | Slug | Status | Deps | Description |
|------|------|--------|------|-------------|
| JSON Formatter & Validator | `json-formatter` | `featured` | `light` | Pretty-print, validate, minify, and inspect JSON with a tree view |
| Base64 Encoder/Decoder | `base64` | `live` | `light` | Encode and decode text or files to and from Base64 |
| URL Encoder/Decoder | `url-encoder` | `live` | `light` | Percent-encode and decode URL components safely |
| JWT Decoder | `jwt-decoder` | `live` | `light` | Decode JWT header and payload with expiration insights |
| UUID / ULID Generator | `uuid-generator` | `live` | `light` | Generate UUIDs, ULIDs, and related unique identifiers |
| Cron Expression Builder | `cron-builder` | `live` | `light` | Build cron expressions with human-readable schedule previews |
| HTML Entity Encoder | `html-entities` | `live` | `light` | Encode and decode HTML entities in named and numeric forms |
| Timestamp Converter | `timestamp-converter` | `live` | `light` | Convert Unix, ISO 8601, RFC 2822, and human-readable timestamps |
| Chmod Calculator | `chmod-calculator` | `live` | `light` | Visual Unix permission calculator with octal and symbolic output |
| Epoch Countdown | `epoch-countdown` | `live` | `light` | Live countdown to a target Unix timestamp |

## Color & Design

Pick colors, generate palettes, and build CSS.

| Tool | Slug | Status | Deps | Description |
|------|------|--------|------|-------------|
| Color Picker & Converter | `color-picker` | `featured` | `light` | Pick colors and convert between HEX, RGB, HSL, and related formats |
| CSS Gradient Generator | `gradient-generator` | `live` | `light` | Build linear, radial, and conic gradients visually |
| Contrast Ratio Checker | `contrast-checker` | `live` | `light` | Check color pairs against WCAG contrast thresholds |

## Image & Media

Resize, convert, edit, and generate media.

| Tool | Slug | Status | Deps | Description |
|------|------|--------|------|-------------|
| Image Resizer & Cropper | `image-resizer` | `featured` | `light` | Resize and crop images in-browser using Canvas APIs |
| QR Code Generator | `qr-generator` | `featured` | `medium` | Generate QR codes with downloadable output |
| Pixel Art Editor | `pixel-art` | `live` | `light` | Draw pixel art on a grid with export support |

## Math & Data

Calculate, convert, and visualize numbers.

| Tool | Slug | Status | Deps | Description |
|------|------|--------|------|-------------|
| Unit Converter | `unit-converter` | `featured` | `light` | Convert between common units for length, weight, volume, speed, and more |
| Percentage Calculator | `percentage-calculator` | `live` | `light` | Calculate percentages, percentage change, and ratios |
| Hex / Binary / Decimal Converter | `number-base-converter` | `live` | `light` | Convert values across binary, octal, decimal, and hexadecimal |
| Roman Numeral Converter | `roman-numerals` | `live` | `light` | Convert between Roman numerals and Arabic numbers |
| Aspect Ratio Calculator | `aspect-ratio` | `live` | `light` | Calculate and convert aspect ratios and common resolutions |
| Data Size Converter | `data-size-converter` | `live` | `light` | Convert bytes across KB, MB, GB, TB, and related units |
| Random Number Generator | `random-generator` | `live` | `light` | Generate random numbers, dice rolls, coin flips, and similar outputs |

## Finance & Business

Budgets, loans, invoices, and trackers.

| Tool | Slug | Status | Deps | Description |
|------|------|--------|------|-------------|
| Mortgage / Loan Calculator | `mortgage-calculator` | `featured` | `light` | Calculate payments, total interest, and amortization over time |
| Tip / Bill Splitter | `tip-calculator` | `live` | `light` | Split bills, tips, and per-person totals quickly |
| Invoice Generator | `invoice-generator` | `live` | `heavy` | Create invoices in-browser and export them to PDF |
| Salary ↔ Hourly Converter | `salary-converter` | `live` | `light` | Convert salary, hourly, weekly, monthly, and annual pay |
| ROI Calculator | `roi-calculator` | `live` | `light` | Measure return on investment across different scenarios |
| Markup / Margin Calculator | `markup-margin` | `live` | `light` | Convert between cost, markup percentage, and margin |

## Security & Privacy

Generate passwords, hash data, and work with cryptographic utilities.

| Tool | Slug | Status | Deps | Description |
|------|------|--------|------|-------------|
| Password Generator | `password-generator` | `featured` | `light` | Generate strong passwords with configurable rules |
| Hash Generator | `hash-generator` | `live` | `light` | Create SHA and MD5 hashes for text or files |
| HMAC Generator | `hmac-generator` | `live` | `light` | Generate keyed HMAC signatures in-browser |
| Random Byte Generator | `random-bytes` | `live` | `light` | Produce cryptographically secure random bytes |

## Productivity

Timers, boards, planners, and trackers.

| Tool | Slug | Status | Deps | Description |
|------|------|--------|------|-------------|
| Pomodoro Timer | `pomodoro` | `featured` | `light` | Focus timer with configurable work and break intervals |
| Stopwatch & Lap Timer | `stopwatch` | `live` | `light` | Precision stopwatch with lap recording |
| Countdown Timer | `countdown` | `live` | `light` | Count down to a date or duration |
| Kanban Board | `kanban` | `live` | `light` | Local-first drag-and-drop task board |
| Habit Tracker | `habit-tracker` | `live` | `light` | Track habits, streaks, and progress over time |
| Notepad with Auto-Save | `notepad` | `live` | `light` | Simple writing pad with local persistence |
| Reading Time Estimator | `reading-time` | `live` | `light` | Estimate reading time at different reading speeds |

## Health & Fitness

Calculators and trackers for wellbeing.

| Tool | Slug | Status | Deps | Description |
|------|------|--------|------|-------------|
| BMI Calculator | `bmi-calculator` | `live` | `light` | Calculate body mass index and interpret the result |
| Sleep Cycle Calculator | `sleep-calculator` | `live` | `light` | Suggest bedtime and wake-up times around sleep cycles |

## Networking & Sysadmin

Subnet, bandwidth, ports, and DNS.

| Tool | Slug | Status | Deps | Description |
|------|------|--------|------|-------------|
| Subnet Calculator | `subnet-calculator` | `live` | `light` | Calculate network, broadcast, and host ranges from CIDR input |

## Education & Learning

Quizzes, flashcards, and interactive learning.

| Tool | Slug | Status | Deps | Description |
|------|------|--------|------|-------------|
| Typing Speed Test | `typing-test` | `featured` | `light` | Measure typing speed, accuracy, and difficulty performance |
| Flashcard App | `flashcards` | `live` | `light` | Study flashcards locally with simple review flows |
| Algorithm Visualizer | `algorithm-visualizer` | `live` | `light` | Visualize sorting and search algorithms step by step |

## Fun & Creative

Music, art, games, and creative toys.

| Tool | Slug | Status | Deps | Description |
|------|------|--------|------|-------------|
| Drum Machine / Beat Maker | `drum-machine` | `live` | `light` | Step sequencer for drum patterns in the browser |
| Generative Art Tool | `generative-art` | `live` | `light` | Create procedurally generated visual art |
| Meme Generator | `meme-generator` | `live` | `light` | Add text overlays to images and export memes |
| Soundboard | `soundboard` | `live` | `light` | Trigger and mix short sound effects |
| Conway's Game of Life | `game-of-life` | `live` | `light` | Explore the Game of Life cellular automaton |
| Procedural Terrain Generator | `terrain-generator` | `live` | `light` | Generate terrain maps and related visual outputs |
| Drawing Canvas | `drawing-canvas` | `live` | `light` | Freeform drawing canvas with export support |
| Fortune / Magic 8-Ball | `magic-8-ball` | `live` | `light` | Random fortune-style answer generator |
| Dice Roller (D&D) | `dice-roller` | `live` | `light` | Roll polyhedral dice with history tracking |
| Noise / Ambient Sound Generator | `ambient-sounds` | `live` | `light` | Play layered ambient sounds for focus or relaxation |
| CSS Art Playground | `css-art` | `live` | `light` | Explore CSS-based art compositions |
| Emoji Picker / Search | `emoji-search` | `live` | `light` | Search and copy emoji quickly |
| Random Color Palette Game | `palette-game` | `live` | `light` | Interactive palette guessing and color play |

## File Utilities

Merge, split, convert, and clean files.

| Tool | Slug | Status | Deps | Description |
|------|------|--------|------|-------------|
| PDF Merger | `pdf-merger` | `live` | `heavy` | Combine multiple PDFs into a single output file |
| Markdown → HTML Converter | `markdown-to-html` | `live` | `medium` | Convert Markdown to HTML with preview-friendly output |
| HTML → Markdown Converter | `html-to-markdown` | `live` | `medium` | Convert HTML content back into Markdown |
| JSON to CSV Exporter | `json-to-csv` | `live` | `light` | Flatten JSON data into CSV output |

## Date & Time

Timezones, countdowns, and date math.

| Tool | Slug | Status | Deps | Description |
|------|------|--------|------|-------------|
| Date Difference Calculator | `date-difference` | `live` | `light` | Compute days, weeks, months, and years between dates |
| Age Calculator | `age-calculator` | `live` | `light` | Calculate exact age from a birth date |

## Notes

- This file is intended to stay in sync with `lib/tools-registry.ts`.
- If a tool is implemented in code but missing here, update the registry first and regenerate this inventory.
