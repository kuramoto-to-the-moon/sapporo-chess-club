#!/bin/bash
# ja.ts と en.ts のキー構造が一致しているか検証する
# 差分があれば exit 1 で hook をブロック

JA="src/i18n/ja.ts"
EN="src/i18n/en.ts"

if [ ! -f "$JA" ] || [ ! -f "$EN" ]; then
  echo "i18n files not found"
  exit 1
fi

# オブジェクトのキー行だけ抽出して比較（値は無視、構造だけ見る）
# - "key:" や "key(" のパターンを抽出
extract_keys() {
  grep -oE '^\s+\w+[:(\[]' "$1" | sed 's/[[:space:]]//g' | sort
}

JA_KEYS=$(extract_keys "$JA")
EN_KEYS=$(extract_keys "$EN")

if [ "$JA_KEYS" = "$EN_KEYS" ]; then
  echo "i18n: ja/en キー構造一致"
  exit 0
fi

echo "i18n: ja/en キー構造が不一致です"
echo ""
echo "--- ja.ts にあって en.ts にないキー ---"
diff <(echo "$JA_KEYS") <(echo "$EN_KEYS") | grep "^<" | sed 's/^< /  /'
echo ""
echo "--- en.ts にあって ja.ts にないキー ---"
diff <(echo "$JA_KEYS") <(echo "$EN_KEYS") | grep "^>" | sed 's/^> /  /'
exit 1
