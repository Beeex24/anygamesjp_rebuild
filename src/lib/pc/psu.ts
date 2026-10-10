/** 市販の電源ユニットで一般的な容量(W) */
export const STANDARD_PSU_WATTS = [300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 850, 1000, 1200, 1300, 1600] as const;

/**
 * パーツ別の消費電力の目安(W)。メーカー公表値ではなく、一般的な見積もり用の概算。
 * 画面ではこの値を初期値として表示し、ユーザーが書き換えられるようにする。
 */
export const PART_DEFAULTS = {
  motherboard: 40,
  memoryPerStick: 5,
  ssdPerUnit: 5,
  hddPerUnit: 10,
  fanPerUnit: 3,
} as const;

export interface PsuInput {
  /** CPUの最大消費電力(W) */
  cpu: number;
  /** グラフィックボードの消費電力(W)。TGP/TBP */
  gpu: number;
  motherboard: number;
  memorySticks: number;
  memoryPerStick: number;
  ssdCount: number;
  ssdPerUnit: number;
  hddCount: number;
  hddPerUnit: number;
  fanCount: number;
  fanPerUnit: number;
  /** その他(USB機器・RGB・水冷ポンプなど)の合計(W) */
  other: number;
}

export interface PsuResult {
  /** パーツの消費電力の合計(W) */
  total: number;
  /** 電源の負荷率(%)から逆算した、必要な容量(W) */
  required: number;
  /** required 以上で最も近い市販容量。該当なしは null */
  recommended: number | null;
}

export function totalPower(i: PsuInput): number {
  return (
    i.cpu + i.gpu + i.motherboard + i.other +
    i.memorySticks * i.memoryPerStick +
    i.ssdCount * i.ssdPerUnit +
    i.hddCount * i.hddPerUnit +
    i.fanCount * i.fanPerUnit
  );
}

/** loadPercent: 最大消費時に電源容量の何%まで使う想定か(例: 60) */
export function recommendPsu(input: PsuInput, loadPercent: number): PsuResult {
  const total = totalPower(input);
  const required = total / (loadPercent / 100);
  const recommended = STANDARD_PSU_WATTS.find((w) => w >= required) ?? null;
  return { total, required, recommended };
}
