# Licensing and provenance of files in this directory

This directory contains mixed-source artwork. No single blanket license is
asserted for every file here. Exact hashes and the current provenance status of
every `.blp` and `.tga` file are recorded in:

- `Docs/ASSET_PROVENANCE.md`
- `Tools/provenance_assets.tsv`

## Exact pfQuest matches

The current audit verifies byte-for-byte matches for `pfquest_node.tga` and the
pfQuest tracking/service icons listed in the asset manifest. The supplied
pfQuest-classicAPI-octo snapshot carries the MIT license preserved at
the root `LICENSE`.

## Exact Questie matches

The current audit verifies byte-for-byte matches to supplied Questie 5.2.3/6.0.0
assets for `event.blp`, `glow.blp`, `loot.blp`, `object.blp`, `repeatable.blp`,
and `slay.blp`. Project history also records additional Questie-derived artwork
whose exact historical source snapshot is no longer available for hash
verification.

Current CurseForge project metadata identifies Questie as GPLv3, including the
Questie v6.0.0 file page. The supplied 5.2.3/6.0.0 ZIPs themselves contain no
project-level Questie license file. See
`THIRD_PARTY_NOTICES.md` and `LICENSES/GPL-3.0.txt`. This project does not claim that a
project-level license necessarily establishes ownership or relicensing rights
for every individual artwork an upstream project may have distributed.

## Project-supplied conversions

`pvp_available.tga`, `pvp_complete.tga`, and `available_gray.tga` retain the
project-supplied conversion provenance described in the asset manifest.

## Unresolved artwork

Files for which the available source set establishes neither an exact hash
match nor a sufficiently specific historical attribution are explicitly marked
`unresolved-in-current-reference-set` in the manifest. They are preserved
unchanged and are not silently assigned a license or origin by this audit.
