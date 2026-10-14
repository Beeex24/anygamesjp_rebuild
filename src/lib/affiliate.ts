export interface AffiliateItem {
  name: string;
  summary: string;
  /** 表示用の価格。Amazonの価格は変動するため目安として扱う */
  price: string;
  image: string;
  href: string;
}

/** トップ「おすすめのデバイス」。リンク・商品は旧トップから移行。 */
export const AFFILIATE_ITEMS: AffiliateItem[] = [
  { name: 'Logicool G PRO 2 LIGHTSPEED', summary: '軽量で高性能なゲーミングマウス', price: '¥17,600', image: '/affiliate/mouse1.png', href: 'https://amzn.to/3Tt0xfd' },
  { name: 'Razer Pro Type Ultra JP', summary: '快適なタイピングが可能なメカニカルキーボード', price: '¥24,200', image: '/affiliate/ultra.png', href: 'https://amzn.to/3Ihjv5V' },
  { name: 'MSI MAG 274QF', summary: '180Hz対応のゲーミングモニター', price: '¥33,800', image: '/affiliate/monita1.png', href: 'https://amzn.to/4nGurds' },
  { name: 'Logicool G ゲーミングマウスパッド', summary: '滑らかな操作感のマウスパッド', price: '¥1,700', image: '/affiliate/pad.png', href: 'https://amzn.to/4nDooGI' },
];
