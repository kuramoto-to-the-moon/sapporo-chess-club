/**
 * <dialog> 要素まわりのヘルパー。
 * 主に HamburgerMenu (モバイル全画面シート) で使用。
 */

/**
 * 指定セレクタに一致する子要素の CSS アニメーションを再生し直す。
 * CSS アニメーションは一度終了した状態 (100%) から自動で再生されないので、
 * animation-name を一旦剥がし、レイアウトを強制計算させてから元に戻すことでリセットする。
 *
 * `animation` shorthand ではなく `animationName` longhand だけを触るのが肝:
 * shorthand で書き換えると同時に inline の `animation-delay` まで巻き込んで消えて
 * しまい、stagger が消失する。
 */
export function replayAnimations(root: ParentNode, selector: string): void {
  root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    el.style.animationName = "none";
    void el.offsetWidth; // reflow を強制
    el.style.animationName = "";
  });
}
