export interface ConvertInput {
  sensitivity: number;
  fromYaw: number;
  toYaw: number;
  /** 省略時は同じDPIとして扱う */
  fromDpi?: number;
  toDpi?: number;
}

/** 360度の振り向き距離が同じになる感度を返す */
export function convertSensitivity({ sensitivity, fromYaw, toYaw, fromDpi = 1, toDpi = 1 }: ConvertInput): number {
  return (sensitivity * fromDpi * fromYaw) / (toDpi * toYaw);
}
