#!/bin/bash
# コンポーネント/ページ内にベタ書き日本語文字列がないか検出する
# i18n ファイル・コンテンツ・設定ファイルは除外

TARGET="src/components src/pages src/layouts"
EXCLUDES="--glob=!*.d.ts --glob=!src/i18n/** --glob=!src/content/**"

# .astro/.ts ファイル内でひらがな・カタカナを含む文字列リテラルを検出
# コメント行は除外
FOUND=$(rg --no-heading -n $EXCLUDES \
  '["'"'"'`][^"'"'"'`]*[\p{Hiragana}\p{Katakana}]' \
  $TARGET 2>/dev/null \
  | grep -vE '^\S+:\d+:\s*//' \
  | grep -v 'class=' \
  | grep -v 'import ' \
  | grep -v 'font-family' \
  | grep -v '<!-- ' \
  | grep -v '{/\*' \
  || true)

if [ -z "$FOUND" ]; then
  echo "i18n: ベタ書き日本語なし"
  exit 0
fi

echo "i18n: ベタ書き日本語文字列の可能性があります"
echo "$FOUND"
echo ""
echo "src/i18n/ja.ts / en.ts に移動してください"
# 警告のみ（exit 0）。誤検出があるためブロックはしない
exit 0
