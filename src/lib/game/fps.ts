/** FPS → 1フレームの時間(ミリ秒) */
export function fpsToMs(fps: number): number {
  return 1000 / fps;
}

/** 1フレームの時間(ミリ秒) → FPS */
export function msToFps(ms: number): number {
  return 1000 / ms;
}

export interface FpsChange {
  fromMs: number;
  toMs: number;
  /** 1フレームあたりの短縮時間(ms)。FPSが下がる場合は負 */
  savedMs: number;
  /** FPS の増減率(%) */
  fpsChangePercent: number;
}

export function compareFps(fromFps: number, toFps: number): FpsChange {
  const fromMs = fpsToMs(fromFps);
  const toMs = fpsToMs(toFps);
  return { fromMs, toMs, savedMs: fromMs - toMs, fpsChangePercent: ((toFps - fromFps) / fromFps) * 100 };
}

/** 一覧表に載せる代表的なFPS(モニターのリフレッシュレートなど) */
export const COMMON_FPS = [30, 60, 75, 120, 144, 165, 180, 240, 360, 480] as const;
