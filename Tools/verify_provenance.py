#!/usr/bin/env python3
"""Offline Questie-Octo provenance/integrity checker.

Not loaded by WoW. Verifies the icon manifest, required provenance docs,
absence of bundled ClassicAPI.dll, and selected packaging invariants.
"""
from pathlib import Path
import csv, hashlib, sys
ROOT=Path(__file__).resolve().parents[1]
manifest=ROOT/'Tools/provenance_assets.tsv'
required=[
    ROOT/'LICENSE', ROOT/'THIRD_PARTY_NOTICES.md', ROOT/'PROJECT_IDENTITY.md',
    ROOT/'CONTRIBUTING.md', ROOT/'Docs/SOURCE_PROVENANCE.md',
    ROOT/'Docs/ASSET_PROVENANCE.md', ROOT/'LICENSES/Ace3v-LICENSE.txt',
    ROOT/'LICENSES/GPL-3.0.txt', ROOT/'LICENSES/Tortoise-AGPL-3.0.txt',
    ROOT/'LICENSES/OctoQuestDatabase/LICENSE', ROOT/'LICENSES/OctoQuestDatabase/NOTICE.md',
    ROOT/'UI/Icons/LICENSE.md',
]
errors=[]
for p in required:
    if not p.is_file(): errors.append(f'missing required provenance file: {p.relative_to(ROOT)}')
if manifest.is_file():
    with manifest.open(newline='') as f:
        rows=list(csv.DictReader(f,delimiter='\t'))
    covered=set()
    for row in rows:
        rel=row['path']; covered.add(rel); p=ROOT/rel
        if not p.is_file():
            errors.append(f'manifested asset missing: {rel}'); continue
        h=hashlib.sha256(p.read_bytes()).hexdigest()
        if h.lower()!=row['sha256'].lower():
            errors.append(f'asset hash changed without provenance update: {rel}\n  expected {row["sha256"]}\n  actual   {h}')
    actual={str(p.relative_to(ROOT)).replace('\\','/') for p in (ROOT/'UI/Icons').iterdir() if p.is_file() and p.suffix.lower() in {'.blp','.tga'}}
    for rel in sorted(actual-covered): errors.append(f'icon asset missing from provenance manifest: {rel}')
    for rel in sorted(covered-actual): errors.append(f'provenance manifest references absent/non-icon asset: {rel}')
else:
    errors.append('missing Tools/provenance_assets.tsv')
for p in ROOT.rglob('*'):
    if p.is_file() and p.name.lower()=='classicapi.dll':
        errors.append(f'ClassicAPI.dll must remain external, but is bundled at {p.relative_to(ROOT)}')
attr=ROOT/'.gitattributes'
if not attr.is_file() or attr.read_text().strip()!='* -text': errors.append('.gitattributes must remain exactly: * -text')
if errors:
    print('Questie-Octo provenance check FAILED:')
    for e in errors: print(' - '+e)
    sys.exit(1)
print(f'Questie-Octo provenance check OK: {len(rows)} icon assets verified; required notices present; ClassicAPI.dll absent.')
