/**
 * スクロール方向と位置を観測する。iOS Safari の URL バー開閉による
 * 偽スクロールイベントは visualViewport の高さ変化を検知して無視する。
 */

type ScrollState = {
  /** 現在のスクロール位置 (>= 0 にクランプ済) */
  y: number;
  /** 直前との差分が delta 以上の場合の方向。delta 未満なら "idle" */
  direction: "up" | "down" | "idle";
  /** ビューポート高 (visualViewport 優先) */
  viewportHeight: number;
  /** スクロール可能な最大 Y */
  maxY: number;
};

// 方向判定に必要な最小ピクセル変化量
const DELTA = 8;

export function observeScroll(callback: (state: ScrollState) => void): () => void {
  const vv = typeof window !== "undefined" ? window.visualViewport : null;

  let lastY = window.scrollY;
  let lastVH = vv?.height ?? window.innerHeight;
  let ticking = false;

  function update() {
    const vh = vv?.height ?? window.innerHeight;
    // iOS URL バー開閉でビューポート高が変わるフレームは
    // ユーザー操作ではないので基準値だけ更新して通知しない
    if (vh !== lastVH) {
      lastVH = vh;
      lastY = window.scrollY;
      return;
    }
    const y = Math.max(0, window.scrollY);
    const moved = Math.abs(y - lastY) >= DELTA;
    const direction: ScrollState["direction"] = !moved
      ? "idle"
      : y > lastY
        ? "down"
        : "up";
    const maxY = document.documentElement.scrollHeight - vh;
    callback({ y, direction, viewportHeight: vh, maxY });
    if (moved) lastY = y;
  }

  function onScroll() {
    if (ticking) return;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
    ticking = true;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  vv?.addEventListener("resize", onScroll);

  // 初期状態を 1 度通知
  update();

  return () => {
    window.removeEventListener("scroll", onScroll);
    vv?.removeEventListener("resize", onScroll);
  };
}
