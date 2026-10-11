import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * 記事本文の画像(/xxx.png など public 配下)を <picture> にして、同名の .webp があれば優先して配信する。
 * 元のURL(img の src)は変えない。あわせて width/height(レイアウトのずれ防止)と lazy 読み込みを付ける。
 */
export default function rehypeWebp() {
  const dims = new Map();
  const publicPath = (src) => path.join(process.cwd(), 'public', decodeURI(src));
  const dimension = async (src) => {
    if (!dims.has(src)) {
      try {
        const m = await sharp(publicPath(src)).metadata();
        dims.set(src, m.width && m.height ? [m.width, m.height] : null);
      } catch {
        dims.set(src, null);
      }
    }
    return dims.get(src);
  };

  return async (tree) => {
    const targets = [];
    const walk = (node, parent) => {
      if (node.type === 'element' && node.tagName === 'img' && parent?.tagName !== 'picture') targets.push([node, parent]);
      node.children?.forEach((c) => walk(c, node));
    };
    walk(tree, null);

    for (const [img] of targets) {
      const src = img.properties?.src;
      if (typeof src !== 'string' || !src.startsWith('/') || !/\.(png|jpe?g)$/i.test(src)) continue;
      const webp = src.replace(/\.(png|jpe?g)$/i, '.webp');
      const d = await dimension(src);
      if (d) {
        img.properties.width ??= d[0];
        img.properties.height ??= d[1];
      }
      img.properties.loading ??= 'lazy';
      img.properties.decoding ??= 'async';
      if (!fs.existsSync(publicPath(webp))) continue;
      // img 自身を <picture> に作り替え、元の img を子に移す
      const inner = { type: 'element', tagName: 'img', properties: { ...img.properties }, children: [] };
      img.tagName = 'picture';
      img.properties = {};
      img.children = [
        { type: 'element', tagName: 'source', properties: { srcSet: webp, type: 'image/webp' }, children: [] },
        inner,
      ];
    }
  };
}
