/**
 * shadcn-svelte の Select 相当をネイティブ要素だけで実装した軽量リストボックス。
 *
 * - `<button>` トリガー + `<ul role="listbox">` + 各項目 `role="option"` の DOM 構造を前提とする
 * - 開閉・外側クリック・スクロール・ESC・Tab 外し・矢印キー移動・位置計算をまとめて扱う
 * - 項目選択時は onSelect(element) を呼ぶだけ。値の解釈と state 同期は呼び出し側に委譲する
 */
export interface ListboxConfig {
  /** トリガー + listbox をまとめたルート要素 (外側クリック判定に使う) */
  root: HTMLElement;
  trigger: HTMLButtonElement;
  listbox: HTMLElement;
  /** 選択肢の DOM 要素 (role="option" のボタン) */
  options: HTMLButtonElement[];
  /** 開閉時に回転させる chevron アイコン (任意) */
  chevron?: Element | null;
  /** 項目が選択されたときに呼ばれる。value の読み取り方は呼び出し側が決める */
  onSelect: (option: HTMLButtonElement) => void;
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
      const selected = options.find((el) => el.getAttribute("aria-selected") === "true");
      (selected ?? options[0])?.focus();
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
    // キーボードで開いた時だけ項目にフォーカスを当てる (ポインタ操作ではフォーカス
    // リングを光らせたくないため)。
    open({ focusSelected: isKeyboardClick(e) });
  });

  options.forEach((element) => {
    element.addEventListener("click", () => {
      onSelect(element);
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

  // ESC で閉じる / 矢印キーで項目移動 / Home・End で先頭・末尾へジャンプ
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      trigger.focus();
      return;
    }
    const nextIdx = nextFocusIndex(e.key, options);
    if (nextIdx !== null) {
      e.preventDefault();
      options[nextIdx]?.focus();
    }
  });
}

/**
 * Enter / Space キーで button を活性化すると、ブラウザは `detail: 0` の
 * 合成 click イベントを発火する。ポインタ由来の click は `detail` が 1 以上に
 * なるので、この数値で両者を区別できる。
 */
function isKeyboardClick(e: MouseEvent): boolean {
  return e.detail === 0;
}

/**
 * listbox 内キーボード操作で次にフォーカスすべき option のインデックスを返す。
 * 該当しないキーなら null。
 */
function nextFocusIndex(key: string, options: HTMLButtonElement[]): number | null {
  if (options.length === 0) return null;
  const last = options.length - 1;
  if (key === "Home") return 0;
  if (key === "End") return last;
  if (key !== "ArrowDown" && key !== "ArrowUp") return null;
  const idx = options.indexOf(document.activeElement as HTMLButtonElement);
  const delta = key === "ArrowDown" ? 1 : -1;
  return (idx + delta + options.length) % options.length;
}
