/**
 * 公取協(全国家庭電気製品公正取引協議会)の電力料金目安単価。税込。
 * 令和4年(2022年)7月22日改定。出典: https://www.eftc.or.jp/qa/ (確認日 2026-10-11)
 * 実際の単価は契約内容で変わるため、画面では「目安」として案内する。
 */
export const DEFAULT_UNIT_PRICE = 31;
export const UNIT_PRICE_NOTE = '公取協の目安単価(税込・2022年7月改定)';

export interface UsageRow {
  /** 消費電力(W) */
  watts: number;
  /** 1日の使用時間(h) */
  hours: number;
}

export interface ElectricityInput {
  usages: UsageRow[];
  /** 1か月の使用日数 */
  daysPerMonth: number;
  /** 電力量料金単価(円/kWh) */
  unitPrice: number;
}

export interface ElectricityResult {
  kwhPerDay: number;
  kwhPerMonth: number;
  kwhPerYear: number;
  costPerDay: number;
  costPerMonth: number;
  costPerYear: number;
}

/** 1日の使用時間の合計 */
export function totalHours(usages: UsageRow[]): number {
  return usages.reduce((sum, u) => sum + u.hours, 0);
}

/** 電気代 = 消費電力(kW) × 使用時間(h) × 単価。1年は「1か月 × 12」で求める */
export function calcElectricity({ usages, daysPerMonth, unitPrice }: ElectricityInput): ElectricityResult {
  const kwhPerDay = usages.reduce((sum, u) => sum + (u.watts / 1000) * u.hours, 0);
  const kwhPerMonth = kwhPerDay * daysPerMonth;
  const kwhPerYear = kwhPerMonth * 12;
  return {
    kwhPerDay,
    kwhPerMonth,
    kwhPerYear,
    costPerDay: kwhPerDay * unitPrice,
    costPerMonth: kwhPerMonth * unitPrice,
    costPerYear: kwhPerYear * unitPrice,
  };
}
