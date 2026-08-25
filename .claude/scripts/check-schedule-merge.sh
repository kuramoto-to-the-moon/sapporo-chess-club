#!/bin/bash
# groupScheduleDates の結合規則を検証する。
#
# 結合するのは 4 条件をすべて満たすときだけ:
#   1. どちらも大会 (例会は表示名が全て同じなので結合してはいけない)
#   2. eventName が入力済みで一致 (未入力はフォールバックで同名判定される)
#   3. 日付が連続
#   4. cancelled の状態が一致 (中止日と開催日を 1 行にまとめない)
#
# 前半: ロジックを合成データで直接検証（TS を Node の型ストリップで読む）
# 後半: ビルド済み dist/ で実際の描画結果を確認

set -e
cd "$(dirname "$0")/../.."

echo "--- 結合ロジック ---"
# schedule.ts は @/ エイリアスを使うが、結合ロジック自体は i18n に依存しない。
# import だけ差し替えたコピーを一時ディレクトリに置き、Node の型ストリップで読む。
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

cat > "$TMP/i18n.ts" <<'STUB'
export type Locale = "ja" | "en";
export function t(_locale: Locale): any { return {}; }
STUB

python3 - "$TMP" <<'REWRITE'
import pathlib, sys
tmp = pathlib.Path(sys.argv[1])
src = pathlib.Path("src/lib/schedule.ts").read_text(encoding="utf-8")
src = src.replace('from "@/i18n"', 'from "./i18n.ts"')
src = src.replace('from "@/lib/date"', f'from "{pathlib.Path("src/lib/date.ts").resolve()}"')
(tmp / "schedule.ts").write_text(src, encoding="utf-8")
REWRITE

node --experimental-strip-types --no-warnings --input-type=module -e "
import assert from 'node:assert';
const { groupScheduleDates } = await import('file://$TMP/schedule.ts');

const day = (date, over = {}) => ({
  date, startTime: '09:00', endTime: '16:00', room: '1010',
  type: 'tournament', eventName: { ja: '大会A', en: 'A' }, ...over,
});
const shape = (groups) => groups.map((g) => g.map((d) => d.date));

// 1. 連続日・同名・同状態 → 結合
assert.deepStrictEqual(
  shape(groupScheduleDates([day('2026-10-11'), day('2026-10-12')])),
  [['2026-10-11', '2026-10-12']], '連続日の同一大会は結合される');

// 2. 中止どうしも結合
assert.deepStrictEqual(
  shape(groupScheduleDates([day('2026-10-11', { cancelled: true }), day('2026-10-12', { cancelled: true })])),
  [['2026-10-11', '2026-10-12']], '両日中止は結合される');

// 3. 片方だけ中止 → 結合しない
assert.deepStrictEqual(
  shape(groupScheduleDates([day('2026-10-11', { cancelled: true }), day('2026-10-12')])),
  [['2026-10-11'], ['2026-10-12']], '中止状態が違えば結合しない');

// 4. 日付が飛ぶ → 結合しない
assert.deepStrictEqual(
  shape(groupScheduleDates([day('2026-10-11'), day('2026-10-13')])),
  [['2026-10-11'], ['2026-10-13']], '連続していなければ結合しない');

// 5. eventName 未入力どうし → 結合しない（フォールバック名での誤結合を防ぐ）
assert.deepStrictEqual(
  shape(groupScheduleDates([day('2026-10-11', { eventName: undefined }), day('2026-10-12', { eventName: undefined })])),
  [['2026-10-11'], ['2026-10-12']], 'eventName 未入力は結合しない');

// 6. 例会は結合しない（表示名が全て「例会」で同一になるため）
assert.deepStrictEqual(
  shape(groupScheduleDates([
    day('2026-10-11', { type: 'meeting', eventName: undefined }),
    day('2026-10-12', { type: 'meeting', eventName: undefined }),
  ])),
  [['2026-10-11'], ['2026-10-12']], '例会は結合しない');

// 7. 同じ日に例会が挟まっても大会どうしは結合される（隣接ではなくキーで引くため）
assert.deepStrictEqual(
  shape(groupScheduleDates([
    day('2026-10-11', { type: 'meeting', eventName: undefined }),
    day('2026-10-11'),
    day('2026-10-12', { type: 'meeting', eventName: undefined }),
    day('2026-10-12'),
  ])),
  [['2026-10-11'], ['2026-10-11', '2026-10-12'], ['2026-10-12']],
  '例会が間に挟まっても大会は結合される');

// 8. 別名の大会は結合しない
assert.deepStrictEqual(
  shape(groupScheduleDates([day('2026-10-11'), day('2026-10-12', { eventName: { ja: '大会B', en: 'B' } })])),
  [['2026-10-11'], ['2026-10-12']], '名前が違えば結合しない');

console.log('結合規則 8 ケース OK');
"

echo "--- 描画結果 (dist) ---"
if [ ! -d dist ]; then
  echo "dist/ が見つかりません。先に pnpm build を実行してください"
  exit 1
fi

python3 - <<'PY'
import re, sys, html as H

rc = 0
page = open("dist/schedule/index.html").read()
body = page[page.index('<main'):page.index('</main>')]
# JSON-LD も <main> 内に出力されるので、可視テキストの判定からは除く
visible = re.sub(r"<script.*?</script>", " ", body, flags=re.DOTALL)
text = H.unescape(re.sub(r"<[^>]+>", " ", visible))

def check(cond, msg):
    global rc
    if not cond:
        print(f"ERROR: {msg}")
        rc = 1

# 中止した回は 1 エントリに畳まれ、部屋と時刻を出さない
check(text.count("札幌オータムチェス大会2026") == 1, "中止大会のタイトルが 1 回だけ出ていない（結合されていない）")
check("940" not in text, "中止した回の部屋が出ている")
check("09:00–21:00" not in text, "中止した回の時刻が出ている")
check("中止" in text, "中止バッジが無い")
check("line-through" in visible, "中止タイトルに取り消し線が無い")

# ※ 行は廃止され、部屋変更は部屋の直後にインライン化されている
check("※" not in text, "※ 行が残っている")
# 注意書きは中止理由も部屋・時刻の注記も同じ形式（左罫線つき独立行・括弧なし）
notes = re.findall(r'<p class="([^"]*border-l-2[^"]*)"', visible)
check(len(notes) >= 2, f"注記行が足りない ({len(notes)} 件)")
check(len(set(notes)) == 1, f"注記行の形式が揃っていない: {set(notes)}")
check("（" not in text, "注記に括弧が残っている")

# 月見出しから uppercase が消えている
check("uppercase" not in visible, "月見出しに uppercase が残っている")

# TOP: 次回イベントが重複していない
home = open("dist/index.html").read()
check(home.count("09.06") == 1, f"TOP で次回日程が重複している ({home.count('09.06')} 回)")
check(home.count('<h2') == home.count('class="text-xl font-normal'), "TOP の見出し構造が想定と違う")

print("描画結果 OK" if rc == 0 else "描画結果 (要修正)")
sys.exit(rc)
PY

echo ""
echo "スケジュール結合: ロジック・描画とも OK"
