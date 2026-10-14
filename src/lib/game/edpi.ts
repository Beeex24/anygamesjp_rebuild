const CM_PER_INCH = 2.54;

/** eDPI = マウスDPI × ゲーム内感度 */
export function edpi(dpi: number, sensitivity: number): number {
  return dpi * sensitivity;
}

/** 360度振り向くのに必要なマウスの移動距離(インチ) */
export function inchesPer360(dpi: number, sensitivity: number, yaw: number): number {
  return 360 / (dpi * sensitivity * yaw);
}

/** 360度振り向くのに必要なマウスの移動距離(cm) */
export function cmPer360(dpi: number, sensitivity: number, yaw: number): number {
  return inchesPer360(dpi, sensitivity, yaw) * CM_PER_INCH;
}
