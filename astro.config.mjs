// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';
import { readdirSync, readFileSync } from 'node:fs';
import rehypeDemoteH1 from './src/plugins/rehype-demote-h1.mjs';

// 記事の更新日(なければ公開日)を frontmatter から拾い、サイトマップの lastmod に使う
const COLLECTIONS = ['blog', 'mobileblog', 'device', 'minecraft_blog', 'minecraft_mod_blog'];
/** @type {Map<string, Date>} */
const lastmods = new Map();
for (const c of COLLECTIONS) {
  /** @type {string[]} */
  let files = [];
  try { files = readdirSync(`./src/content/${c}`).filter((f) => /\.(md|mdx)$/.test(f)); } catch { /* ignore */ }
  for (const f of files) {
    const fm = readFileSync(`./src/content/${c}/${f}`, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    /** @param {string} k */
    const pick = (k) => fm.match(new RegExp(`^${k}:\\s*['"]?([^'"\\r\\n]+)`, 'm'))?.[1]?.trim();
    const d = new Date(pick('updatedDate') ?? pick('pubDate') ?? '');
    if (!Number.isNaN(d.valueOf())) lastmods.set(`/${c}/${f.replace(/\.(md|mdx)$/, '').toLowerCase()}/`, d);
  }
}

// サイトマップに載せないURL: 検索・HTML版サイトマップ・404、新着一覧(/all/)、ページネーション(2ページ目以降)
const EXCLUDE = [/\/search\/$/, /\/sitemap\/$/, /\/404\/?$/, /\/all\//, /\/(blog|device|mobileblog|minecraft_blog)\/[0-9]+\/$/];

// https://astro.build/config
export default defineConfig({
  site: 'https://anygamesjp.com',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !EXCLUDE.some((re) => re.test(new URL(page).pathname)),
      serialize(item) {
        const d = lastmods.get(new URL(item.url).pathname);
        if (d) item.lastmod = d.toISOString();
        return item;
      },
    }),
  ],

  // Vite設定でesbuildのターゲットを指定
  vite: {
    define: {
      'import.meta.env.VITE_API_KEY': JSON.stringify(process.env.VITE_API_KEY)
    },

    esbuild: {
      target: 'es2020'
    },
    // 画像ツールのWorkerがWASMを動的importするため ES モジュール形式にする
    worker: { format: 'es' }
  },
  markdown: {
    // remarkプラグインはimportしたものを配列で指定
    remarkPlugins: [remarkGfm],
    // rehypeプラグインも必要ならここに追加
    rehypePlugins: [rehypeDemoteH1],
    // シンタックスハイライトの設定（shiki or prism）
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    },
    // remark-rehypeの追加設定（必要な場合のみ）
    remarkRehype: {
      footnoteLabel: "脚注"
    }
  }
});