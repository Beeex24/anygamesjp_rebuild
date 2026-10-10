/** 入力文字列を数値に。空・不正・0以下は null */
export function parsePositive(text: string): number | null {
  const t = text.trim().replace(/,/g, '');
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** 小数の末尾の0を落として表示(最大 maxFrac 桁) */
export function fmt(n: number, maxFrac = 2): string {
  return n.toLocaleString('ja-JP', { maximumFractionDigits: maxFrac, minimumFractionDigits: 0 });
}
