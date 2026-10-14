import { zipSync } from 'fflate';

/** 同名ファイルが重なったら -2, -3 … を付けて重複を避ける */
export function uniqueName(name: string, used: Set<string>): string {
  if (!used.has(name)) { used.add(name); return name; }
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}${ext}`;
    if (!used.has(candidate)) { used.add(candidate); return candidate; }
  }
}

/** 画像はすでに圧縮済みのため、ZIPは無圧縮(level 0)でまとめる */
export async function buildZip(entries: { name: string; blob: Blob }[]): Promise<Blob> {
  const files: Record<string, Uint8Array> = {};
  for (const e of entries) files[e.name] = new Uint8Array(await e.blob.arrayBuffer());
  const zipped = zipSync(files, { level: 0 });
  return new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' });
}
