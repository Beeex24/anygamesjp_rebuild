import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Transform string to Date object
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
  }),
});

const mobileblog = defineCollection({
  // Load Markdown and MDX files in the `src/content/mobileblog/` directory.
  loader: glob({ base: "./src/content/mobileblog", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Transform string to Date object
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
  }),
});

const device = defineCollection({
  loader: glob({ base: "./src/content/device", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
  }),
});

const minecraft_blog = defineCollection({
  loader: glob({
    base: "./src/content/minecraft_blog",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
  }),
});

// 🆕 マインクラフトMOD紹介コレクション
const minecraft_mod_blog = defineCollection({
  loader: glob({
    base: "./src/content/minecraft_mod_blog",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    // MOD固有のフィールド
    version: z.array(z.string()).optional(), // マイクラバージョン (例: "1.21.1")
    category: z.string().optional(), // カテゴリー (例: "技術系", "農業", "冒険")
    author: z.string().optional(), // MOD作者名
    downloads: z.string().optional(), // ダウンロード数 (例: "2.3M")
    downloadLink: z.string().url().optional(), // ダウンロードリンク
    curseforgeUrl: z.string().url().optional(), // CurseForge URL
    fabricUrl: z.string().url().optional(), // Fabric URL
    neoforgeUrl: z.string().url().optional(), // NeoForge URL
    quiltUrl: z.string().url().optional(), // Quilt URL
    modrinthUrl: z.string().url().optional(), // Modrinth URL
    requirements: z.array(z.string()).optional(), // 前提MOD (例: ["Forge", "Fabric API"])
    tags: z.array(z.string()).optional(), // タグ (例: ["自動化", "工業化"])
    difficulty: z.enum(["初心者向け", "中級者向け", "上級者向け",""]).optional(), // 難易度
    modLoader: z.union([
        z.enum(["Forge", "Fabric", "NeoForge", "Quilt", "OptiFine", "Iris"]),
        z.array(z.enum(["Forge", "Fabric", "NeoForge", "Quilt", "OptiFine", "Iris"])),
      ])
      .optional(), // MODローダー
  }),
});

export const collections = {
  blog,
  mobileblog,
  device,
  minecraft_blog,
  minecraft_mod_blog,
};
