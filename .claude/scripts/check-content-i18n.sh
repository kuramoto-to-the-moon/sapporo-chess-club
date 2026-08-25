#!/bin/bash
# CMS コンテンツの ja/en 対応を検証する。
#
# Pages CMS は ja だけ埋めて en を空のまま保存できる。表示側は ja へ
# フォールバックするので英語版から文言が消えることは無いが、日本語が
# 出たままになるので気づけるようにする。
#
# 対象: schedule-meetings / schedule-tournaments の note・eventName

set -e
cd "$(dirname "$0")/../.."

python3 - <<'PY'
import pathlib, re, sys

rc = 0
for d in ["schedule-meetings", "schedule-tournaments"]:
    for f in sorted(pathlib.Path(f"src/content/{d}").glob("*.md")):
        text = f.read_text(encoding="utf-8")
        for field in ["note", "eventName"]:
            m = re.search(rf"^{field}:\s*\n((?:\s+\w+:.*\n?)+)", text, re.M)
            if not m:
                continue
            blk = m.group(1)

            def get(key):
                mm = re.search(rf"^\s+{key}:\s*(.*)$", blk, re.M)
                return mm.group(1).strip().strip('"').strip("'") if mm else ""

            ja, en = get("ja"), get("en")
            if ja and not en:
                print(f"ERROR: {d}/{f.name} の {field}.en が空 (ja: {ja[:30]})")
                rc = 1
            if en and not ja:
                print(f"ERROR: {d}/{f.name} の {field}.ja が空 (en: {en[:30]})")
                rc = 1

print("content: ja/en 揃い" if rc == 0 else "content: 英訳が欠けています")
sys.exit(rc)
PY
