/**
 * 感度変換用のゲーム別係数(ヨー値: 感度1・マウス1カウントあたりに回る角度[度])。
 * 参照: https://csdb.gg/sensitivity-converter/ (確認日 2026-10-11)。ゲームの更新で変わる場合がある。
 */
export interface Game {
  id: string;
  name: string;
  yaw: number;
  /** 感度の入力に関する補足 */
  note?: string;
}

export const GAMES_CHECKED_AT = '2026年10月11日';

export const GAMES: Game[] = [
  { id: 'valorant', name: 'VALORANT', yaw: 0.07 },
  { id: 'cs2', name: 'CS2', yaw: 0.022 },
  { id: 'apex', name: 'Apex Legends', yaw: 0.022 },
  { id: 'ow2', name: 'Overwatch 2', yaw: 0.0066 },
  { id: 'cod', name: 'Call of Duty(Warzone / MW / BO)', yaw: 0.0066 },
  { id: 'r6s', name: 'Rainbow Six Siege', yaw: 0.00572957795, note: 'マウス感度(ADS倍率は別設定)' },
  { id: 'fortnite', name: 'Fortnite', yaw: 0.005555, note: 'X軸感度(%)の数値' },
];

export function findGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}
