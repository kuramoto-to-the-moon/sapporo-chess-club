/**
 * shadcn-svelte の Select 相当をネイティブ要素だけで実装した軽量リストボックス。
 *
 * - `<button>` トリガー + `<ul role="listbox">` + 各項目 `role="option"` の DOM 構造を前提とする
 * - 開閉・外側クリック・スクロール・ESC・Tab 外し・矢印キー移動・位置計算をまとめて扱う
 * - 項目選択時は onSelect(value) を呼ぶだけ。実際の state 同期は呼び出し側に委譲する
 */
export interface ListboxConfig {
  /** トリガー + listbox をまとめたルート要素 (外側クリック判定に使う) */
  root: HTMLElement;
  trigger: HTMLButtonElement;
  listbox: HTMLElement;
  /** 各選択肢の DOM と value のペア */
  options: { element: HTMLButtonElement; value: string }[];
  /** 開閉時に回転させる chevron アイコン (任意) */
  chevron?: Element | null;
  /** 項目が選択されたときに呼ばれる。呼び出し側で aria-selected などを更新する */
  onSelect: (value: string) => void;
  /** ドロップダウンの最大高さ (rem)。デフォルト 20 */
  maxHeightRem?: number;
  /** 画面下端から空けるマージン (rem)。デフォルト 1 */
  bottomMarginRem?: number;
}

export function initListbox(config: ListboxConfig): void {
  const { root, trigger, listbox, options, chevron, onSelect } = config;
  const maxHeightRem = config.maxHeightRem ?? 20;
  const bottomMarginRem = config.bottomMarginRem ?? 1;

  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const optionEls = options.map((o) => o.element);
  const isOpen = () => !listbox.hidden;

  function open(opts: { focusSelected: boolean } = { focusSelected: false }) {
    // ドロップダウンが画面下を突き抜けないよう max-height を動的計算
    const rect = trigger.getBoundingClientRect();
    const available = window.innerHeight - rect.bottom - bottomMarginRem * rem;
    listbox.style.maxHeight = `${Math.min(maxHeightRem * rem, available)}px`;
    listbox.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    if (chevron instanceof HTMLElement || chevron instanceof SVGElement) {
      chevron.style.transform = "rotate(180deg)";
    }
    // キーボードで開いた時だけ選択中の項目にフォーカスを移す。
    // ポインタ操作の場合はタップで直接選ぶのでフォーカスを動かさない
    // (フォーカスリングが一瞬光るノイズを避けるため)。
    if (opts.focusSelected) {
      const selected = optionEls.find((el) => el.getAttribute("aria-selected") === "true");
      (selected ?? optionEls[0])?.focus();
    }
  }

  function close() {
    listbox.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (chevron instanceof HTMLElement || chevron instanceof SVGElement) {
      chevron.style.transform = "";
    }
  }

  trigger.addEventListener("click", (e) => {
    if (isOpen()) {
      close();
      return;
    }
    // MouseEvent.detail === 0 はキーボード (Enter/Space) による click。
    // その場合だけ項目にフォーカスを移して矢印キー操作に繋げる。
    open({ focusSelected: e.detail === 0 });
  });

  options.forEach(({ element, value }) => {
    element.addEventListener("click", () => {
      onSelect(value);
      close();
      trigger.focus();
    });
  });

  // 外側クリックで閉じる
  document.addEventListener("click", (e) => {
    if (isOpen() && !root.contains(e.target as Node)) close();
  });

  // スクロールでトリガーから浮いてしまうのを防ぐ
  window.addEventListener("scroll", () => isOpen() && close(), { passive: true });

  // Tab でフォーカスが外に出たら閉じる
  root.addEventListener("focusout", (e) => {
    const next = e.relatedTarget as Node | null;
    if (isOpen() && next && !root.contains(next)) close();
  });

  // ESC で閉じる / 矢印キーで項目移動
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      trigger.focus();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const idx = optionEls.indexOf(document.activeElement as HTMLButtonElement);
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const nextIdx = (idx + delta + optionEls.length) % optionEls.length;
      optionEls[nextIdx]?.focus();
    }
  });
}
