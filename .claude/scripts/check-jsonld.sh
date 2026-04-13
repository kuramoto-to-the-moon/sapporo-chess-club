#!/bin/bash
# ビルド後の dist/ から JSON-LD Event を抽出して検証する
# - 必須フィールドが揃っているか
# - 重複イベント（同名）がないか
# - ja/en で同数のイベントが出力されているか

DIST="dist"

if [ ! -d "$DIST" ]; then
  echo "dist/ が見つかりません。先に pnpm build を実行してください"
  exit 1
fi

JA_FILE="$DIST/schedule/index.html"
EN_FILE="$DIST/en/schedule/index.html"

extract_events() {
  python3 -c "
import sys, re, json
html = open('$1').read()
m = re.search(r'type=\"application/ld\+json\"[^>]*>(\[.*?\])<', html)
if not m:
    print('JSON-LD なし')
    sys.exit(1)
events = json.loads(m.group(1))
for e in events:
    missing = [f for f in ['name','startDate','endDate','description','image','offers','performer','location','organizer'] if f not in e]
    if missing:
        print(f'WARN: {e.get(\"name\",\"?\")} に不足: {missing}')
names = [e['name'] for e in events]
dupes = [n for n in names if names.count(n) > 1]
if dupes:
    print(f'ERROR: 重複イベント: {set(dupes)}')
    sys.exit(1)
print(f'{len(events)} イベント OK')
for e in events:
    print(f'  {e[\"name\"]}: {e[\"startDate\"][:10]} ~ {e[\"endDate\"][:10]}')
" 2>&1
}

echo "--- ja ---"
JA_RESULT=$(extract_events "$JA_FILE")
JA_EXIT=$?
echo "$JA_RESULT"

echo "--- en ---"
EN_RESULT=$(extract_events "$EN_FILE")
EN_EXIT=$?
echo "$EN_RESULT"

# ja/en のイベント数を比較
JA_COUNT=$(echo "$JA_RESULT" | head -1 | grep -oE '^[0-9]+')
EN_COUNT=$(echo "$EN_RESULT" | head -1 | grep -oE '^[0-9]+')

if [ -n "$JA_COUNT" ] && [ -n "$EN_COUNT" ] && [ "$JA_COUNT" != "$EN_COUNT" ]; then
  echo "ERROR: ja ($JA_COUNT) と en ($EN_COUNT) のイベント数が不一致"
  exit 1
fi

if [ $JA_EXIT -ne 0 ] || [ $EN_EXIT -ne 0 ]; then
  exit 1
fi

echo "JSON-LD: ja/en 一致、フィールド OK"
