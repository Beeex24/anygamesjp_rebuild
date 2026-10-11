/** 本文中の h1 を h2 に降格する。h1 はレイアウト側の記事タイトルだけにする（SEO・構造のため）。 */
export default function rehypeDemoteH1() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'h1') node.tagName = 'h2';
      if (node.children) node.children.forEach(walk);
    };
    walk(tree);
  };
}
