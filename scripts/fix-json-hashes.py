#!/usr/bin/env python3
"""
Rename and merge block editor translation JSON files into descriptive filenames.

wp i18n make-json produces files named by md5(source_file_path).
We merge them into mapthread-{locale}-map-gpx.json and mapthread-{locale}-map-marker.json,
which are loaded by the pre_load_script_translations filter in class-mapthread.php.

Run after: php -d error_reporting=0 $(which wp) i18n make-json languages/ --no-purge
"""

import json
import os

LANG_DIR = os.path.join(os.path.dirname(__file__), '..', 'languages')
LANG_DIR = os.path.normpath(LANG_DIR)

LOCALES = ['de_DE', 'es_ES', 'fr_FR', 'it_IT', 'ja', 'nb_NO', 'nl_NL', 'pt_BR', 'sv_SE', 'zh_TW']

# Hashes that wp i18n make-json produces (md5 of source file paths as they appear in .po #: comments)
GPX_SRC_HASH  = 'e27b369fac8277ba57b43aa7b75b0229'  # includes/blocks/map-gpx/edit.js
MKR_EDIT_HASH = 'c707f5d6aff00dc74d8e87ee33a8d2fb'  # includes/blocks/map-marker/edit.js
MKR_ADDR_HASH = '343d057faaa53950e11035e134f94b7a'  # includes/blocks/map-marker/components/AddressSearch.js
MKR_EMOJ_HASH = '793b40c27723d000f9ae8501026a1dd2'  # includes/blocks/map-marker/components/EmojiGrid.js

created = 0

for locale in LOCALES:
    # --- map-gpx: rename to descriptive name ---
    old = os.path.join(LANG_DIR, f'mapthread-{locale}-{GPX_SRC_HASH}.json')
    new = os.path.join(LANG_DIR, f'mapthread-{locale}-map-gpx.json')
    if os.path.exists(old):
        with open(old, encoding='utf-8') as f:
            data = json.load(f)
        data['source'] = 'plugins/mapthread/build/blocks/map-gpx/index.js'
        with open(new, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)
        os.remove(old)
        n = len([k for k in data['locale_data']['messages'] if k])
        print(f'  {os.path.basename(new)}  ({n} strings)')
        created += 1

    # --- map-marker: merge 3 source files → 1 descriptive file ---
    merged = {}
    meta = None
    for sh in [MKR_EDIT_HASH, MKR_ADDR_HASH, MKR_EMOJ_HASH]:
        src = os.path.join(LANG_DIR, f'mapthread-{locale}-{sh}.json')
        if os.path.exists(src):
            with open(src, encoding='utf-8') as f:
                d = json.load(f)
            msgs = d['locale_data']['messages']
            if meta is None:
                meta = msgs['']
            merged.update({k: v for k, v in msgs.items() if k})
            os.remove(src)

    if meta and merged:
        out = {
            'translation-revision-date': '2026-02-21 12:00+0000',
            'generator': 'WP-CLI/2.12.0',
            'source': 'plugins/mapthread/build/blocks/map-marker/index.js',
            'domain': 'messages',
            'locale_data': {'messages': {'': meta, **merged}},
        }
        new = os.path.join(LANG_DIR, f'mapthread-{locale}-map-marker.json')
        with open(new, 'w', encoding='utf-8') as f:
            json.dump(out, f, ensure_ascii=False)
        print(f'  {os.path.basename(new)}  ({len(merged)} strings)')
        created += 1

print(f'\n{created} JSON files ready (2 per locale × {len(LOCALES)} locales = {len(LOCALES) * 2} expected)')
