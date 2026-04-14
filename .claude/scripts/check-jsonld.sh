#!/bin/bash
# ビルド後の dist/ から各種 JSON-LD を抽出して検証する。
# Google Rich Results 要件を満たしているか確認し、
# Search Console で警告が出る前に検知する。
#
# 対象:
# - Event (schedule ページ) … offers サブフィールドまで
# - SportsClub (home ページ)
# - NewsArticle (お知らせ詳細サンプル)

set -e
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
rc = 0
for e in events:
    missing = [f for f in ['name','startDate','endDate','description','image','offers','performer','location','organizer','eventAttendanceMode','eventStatus'] if f not in e]
    if missing:
        print(f'ERROR: {e.get(\"name\",\"?\")} に不足: {missing}')
        rc = 1
    offer = e.get('offers')
    if offer:
        offer_missing = [f for f in ['price','priceCurrency','availability','url','validFrom'] if f not in offer]
        if offer_missing:
            print(f'ERROR: {e.get(\"name\",\"?\")} の offers に不足: {offer_missing}')
            rc = 1
names = [e['name'] for e in events]
dupes = [n for n in names if names.count(n) > 1]
if dupes:
    print(f'ERROR: 重複イベント: {set(dupes)}')
    rc = 1
print(f'{len(events)} イベント{\" OK\" if rc == 0 else \" (要修正)\"}')
for e in events:
    print(f'  {e[\"name\"]}: {e[\"startDate\"][:10]} ~ {e[\"endDate\"][:10]}')
sys.exit(rc)
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

# --- SportsClub (home page) ---
echo "--- SportsClub (home) ---"
SPORTSCLUB_RESULT=$(python3 -c "
import sys, re, json
html = open('$DIST/index.html').read()
matches = re.findall(r'type=\"application/ld\+json\"[^>]*>(\{.*?\})<', html, re.DOTALL)
rc = 0
found = False
for m in matches:
    try:
        d = json.loads(m)
        if d.get('@type') == 'SportsClub':
            found = True
            missing = [f for f in ['name','description','url','logo','address','foundingDate','sport'] if f not in d]
            if missing:
                print(f'ERROR: SportsClub に不足: {missing}')
                rc = 1
            else:
                print('OK: name, description, url, logo, address, foundingDate, sport 揃い')
    except: pass
if not found:
    print('ERROR: SportsClub JSON-LD が見つかりません')
    rc = 1
sys.exit(rc)
" 2>&1)
SPORTSCLUB_EXIT=$?
echo "$SPORTSCLUB_RESULT"

# --- NewsArticle (お知らせ詳細サンプル) ---
# 最新1件だけサンプリング
SAMPLE_ARTICLE=$(ls -t $DIST/announcements/*/index.html 2>/dev/null | grep -v archive | head -1)
if [ -n "$SAMPLE_ARTICLE" ]; then
  echo "--- NewsArticle サンプル: $SAMPLE_ARTICLE ---"
  ARTICLE_RESULT=$(python3 -c "
import sys, re, json
html = open('$SAMPLE_ARTICLE').read()
matches = re.findall(r'type=\"application/ld\+json\"[^>]*>(\{.*?\})<', html, re.DOTALL)
rc = 0
found = False
for m in matches:
    try:
        d = json.loads(m)
        if d.get('@type') == 'NewsArticle':
            found = True
            missing = [f for f in ['headline','datePublished','dateModified','image','author','publisher','inLanguage','mainEntityOfPage'] if f not in d]
            if missing:
                print(f'ERROR: NewsArticle に不足: {missing}')
                rc = 1
            pub_logo = d.get('publisher',{}).get('logo')
            if not pub_logo:
                print('ERROR: NewsArticle.publisher.logo が欠落')
                rc = 1
            if rc == 0:
                print('OK: 必須フィールド揃い')
    except: pass
if not found:
    print('ERROR: NewsArticle JSON-LD が見つかりません')
    rc = 1
sys.exit(rc)
" 2>&1)
  ARTICLE_EXIT=$?
  echo "$ARTICLE_RESULT"
fi

if [ $SPORTSCLUB_EXIT -ne 0 ] || [ ${ARTICLE_EXIT:-0} -ne 0 ]; then
  exit 1
fi

echo ""
echo "JSON-LD: ja/en 一致、Event/SportsClub/NewsArticle 全フィールド OK"
