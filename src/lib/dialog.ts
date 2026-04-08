/**
 * <dialog> 要素まわりのヘルパー。
 * 主に HamburgerMenu (モバイル全画面シート) で使っているが、将来
 * 他のモーダル UI を足すときも流用できるよう汎用にしてある。
 */

/**
 * Safari 15.3 以下など <dialog> 非対応環境だけ polyfill を動的にロードする。
 * モダンブラウザでは import() が実行されないので bundle には乗らない。
 */
export async function ensureDialogSupport(dialog: HTMLDialogElement): Promise<void> {
  if (typeof HTMLDialogElement !== "undefined" && HTMLDialogElement.prototype.showModal) return;
  const { default: dialogPolyfill } = await import("dialog-polyfill");
  dialogPolyfill.registerDialog(dialog);
}

/**
 * body スクロールを「見た目はそのまま、絶対に動けない」状態にロックする。
 * iOS Safari で <dialog> を開いた上でも背景がスクロールしてしまう問題の対策。
 * overflow:hidden だけでは不十分なので position:fixed で物理的に固定する。
 *
 * 多重呼び出しに対応するためロック数を参照カウントで管理する。
 * 同じページで複数のモーダル (将来の追加含む) を同時に開いても、
 * 全部閉じ終わるまで lock が外れない。
 * 戻り値は解除関数 (1 回だけ有効)。
 */
let lockCount = 0;
let savedScrollY = 0;

export function lockBodyScroll(): () => void {
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${savedScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
  }
  lockCount++;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount--;
    if (lockCount === 0) {
      const body = document.body;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      window.scrollTo(0, savedScrollY);
    }
  };
}

/**
 * 指定セレクタに一致する子要素の CSS アニメーションを再生し直す。
 * CSS アニメーションは一度終了した状態 (100%) から自動で再生されないので、
 * animation を一旦剥がし、レイアウトを強制計算させてから元に戻すことでリセットする。
 */
export function replayAnimations(root: ParentNode, selector: string): void {
  root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    el.style.animation = "none";
    void el.offsetWidth; // reflow を強制
    el.style.animation = "";
  });
}
