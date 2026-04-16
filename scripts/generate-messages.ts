import { tools } from '../lib/tools-registry';
import { categories } from '../lib/categories';
import { toolContent } from '../lib/tool-content';
import { writeFileSync, mkdirSync } from 'fs';

mkdirSync('messages/en', { recursive: true });

// tools.json
const toolsMessages: Record<string, { name: string; description: string }> = {};
for (const t of tools) {
  toolsMessages[t.slug] = { name: t.name, description: t.description };
}
writeFileSync('messages/en/tools.json', JSON.stringify({ tools: toolsMessages }, null, 2) + '\n');

// categories.json
const catMessages: Record<string, { name: string; description: string }> = {};
for (const c of categories) {
  catMessages[c.slug] = { name: c.name, description: c.description };
}
writeFileSync('messages/en/categories.json', JSON.stringify({ categories: catMessages }, null, 2) + '\n');

// tool-content.json
const contentMessages: Record<string, { about: string; howTo: string[] }> = {};
for (const [slug, content] of Object.entries(toolContent)) {
  contentMessages[slug] = { about: content.about, howTo: content.howTo };
}
writeFileSync('messages/en/tool-content.json', JSON.stringify({ toolContent: contentMessages }, null, 2) + '\n');

console.log('Generated messages/en/tools.json, categories.json, tool-content.json');
