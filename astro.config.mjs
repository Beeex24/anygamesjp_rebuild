// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';
import rehypeDemoteH1 from './src/plugins/rehype-demote-h1.mjs';
import rehypeWebp from './src/plugins/rehype-webp.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://anygamesjp.com',
  integrations: [mdx(), sitemap()],

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
    rehypePlugins: [rehypeDemoteH1, rehypeWebp],
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