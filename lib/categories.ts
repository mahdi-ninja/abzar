export interface Category {
  slug: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const categories: Category[] = [
  {
    slug: "text",
    name: "Text & Language",
    icon: "✦",
    color: "orange",
    description: "Transform, analyze, and generate text",
  },
  {
    slug: "developer",
    name: "Developer Tools",
    icon: "⌘",
    color: "blue",
    description: "Format, encode, decode, and debug",
  },
  {
    slug: "design",
    name: "Color & Design",
    icon: "◆",
    color: "purple",
    description: "Pick colors, generate palettes, build CSS",
  },
  {
    slug: "image",
    name: "Image & Media",
    icon: "▲",
    color: "emerald",
    description: "Resize, convert, edit, and generate media",
  },
  {
    slug: "math",
    name: "Math & Data",
    icon: "∑",
    color: "yellow",
    description: "Calculate, convert, and visualize numbers",
  },
  {
    slug: "finance",
    name: "Finance & Business",
    icon: "◎",
    color: "cyan",
    description: "Budgets, loans, invoices, and trackers",
  },
  {
    slug: "security",
    name: "Security & Privacy",
    icon: "⬡",
    color: "rose",
    description: "Generate passwords, hash data, encrypt notes",
  },
  {
    slug: "productivity",
    name: "Productivity",
    icon: "✧",
    color: "violet",
    description: "Timers, boards, planners, and trackers",
  },
  {
    slug: "health",
    name: "Health & Fitness",
    icon: "♦",
    color: "orange",
    description: "Calculators and trackers for wellbeing",
  },
  {
    slug: "networking",
    name: "Networking & Sysadmin",
    icon: "◇",
    color: "green",
    description: "Subnet, bandwidth, ports, and DNS",
  },
  {
    slug: "education",
    name: "Education & Learning",
    icon: "▽",
    color: "blue",
    description: "Quizzes, flashcards, and interactive learning",
  },
  {
    slug: "fun",
    name: "Fun & Creative",
    icon: "★",
    color: "pink",
    description: "Music, art, games, and creative toys",
  },
  {
    slug: "files",
    name: "File Utilities",
    icon: "◫",
    color: "lime",
    description: "Merge, split, convert, and clean files",
  },
  {
    slug: "datetime",
    name: "Date & Time",
    icon: "◉",
    color: "amber",
    description: "Timezones, countdowns, and date math",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
