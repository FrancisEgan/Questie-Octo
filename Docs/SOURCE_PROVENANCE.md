> License consolidation (2026-10-05): historical filenames below describe the original audit. Repeated MIT texts are now consolidated in the root LICENSE, reference notes in THIRD_PARTY_NOTICES.md, and the duplicate ClassicAPI GPL text in LICENSES/GPL-3.0.txt. Original duplicate copies are preserved in the workspace cleanup archive.

> Packaging note (2026-08-21): Questie-Octo 1.0.68 was rebuilt fresh from the accepted 1.0.66 Questie-Octo source after the 1.0.67 delivery was rejected as the wrong project artifact. pfQuest-octo 1.1.5 is audit/reference input only; it is not the addon package baseline.

# Questie-Octo source provenance and licensing audit

Audit date: 2026-08-15

## Purpose

This document records the source snapshots available during the GitHub/licensing
pass and preserves provenance for future human and AI-assisted maintenance.
This pass is documentation/licensing-only: no gameplay, Lua logic, TOC entry,
quest data, map behavior, tracker behavior, artwork, settings, or existing
project note was changed or removed.

The baseline addon archive audited here was:

- `Questie-Octo(1).zip`
- SHA-256: `3e0528012df2a0a36cd9185850ec71a330e5feb2abc87dc6b44e8f765e5f2fea`
- 139 regular files before licensing documents were added.

## Source snapshots available for this audit

| Source snapshot | SHA-256 | Role / note |
| --- | --- | --- |
| Questie 5.2.3 | `806a12d894a9d8568b73d86a95aeda79f29bebf90320a5f0007bec8db9803335` | Main historical UI/behavior target; no project-level Questie license found in supplied ZIP. |
| Questie 6.0.0 | `de997f793871b898f6a8f9f6494b79fcd55fc82f8e087b88a026a3dfc99550b9` | Architecture bridge and source of some reference assets/libraries; no project-level Questie license found in supplied ZIP. |
| Ace3v | `0482801133653d0e611e29335b22e77ad3de05a14ab8c35c163eb3f05eaaebeb` | Bundled/adapted Ace3 compatibility libraries. |
| pfQuest-classicAPI-octo | `484553544a30f4031273873c9673b779240339626455aa0e3c05f5c3df577dfb` | pfQuest-family data/runtime heritage and compatibility reference. |
| pfQuest-octo | `f4180ff88fbca25e7c673ab8fb5903c8a94807678b89ca70eefede0a8b3bd7c4` | Octo-specific pfQuest branch/reference. |
| ShaguTweaks | `3d772e41ea576a9b8e3d25017cb3cc2f93347d7ee4da4fa7bb69f2e403bcc007` | Vanilla UI/compatibility reference. |
| ShaguTweaks-extras | `2727f09cbbbdc08b2a06f424758363d0f206fef2ff0485449e03867a41a84357` | Additional Shagu compatibility/reference material. |
| MoveAnything | `452b9d7dc5c74d7f0c4a2f51954bfcaa0b20b951fbf742951a48390dd21cf7fd` | Compatibility/debugging reference; no general license file found in supplied snapshot. |
| Tortoise/Turtle server snapshot | `ed3b3638f26733d30993e0d2a1fac1e31a0738d5f66bd11a23c52509f7d47ee9` | Offline server-data provenance recorded by existing generated-data notes. |
| Calendar reference archive | `f4418d71aaf86fcc1067f3f02b7291aab6f3c37bb4d607a440127879270553a9` | Event/calendar verification material. |

The filenames used for upload can carry duplicate suffixes such as `(2)` or
`(3)`. The SHA-256 values above identify the actual snapshots independently of
those local upload names.

## Later compatibility reference snapshots

The following snapshots were supplied later in the same project and were used
only to cross-check UI compatibility behavior. They are not bundled with
Questie-Octo and this record does not change their licensing or ownership.

| Compatibility reference | SHA-256 | Role / note |
| --- | --- | --- |
| pfUI-classicAPI-octo | `5b4ed17b4ca94712ea7cc35cd86f31dfdc7b5d94a83bb51abb3cfca2e8e4911b` | Tooltip lifecycle, minimap shape, and Vanilla/ClassicAPI UI compatibility reference. |
| DragonflightUI-Reforged | `2c08e1ae203f54d7969262b65056d58d5e9e8c26f3b61f2c935ff0825525ac68` | Replacement ESC/GameMenu behavior and square-minimap compatibility reference. |

## Prior pfQuest reference snapshots (2026-08-17; superseded for current Octo comparison)

The user supplied newer pfQuest reference archives after the original licensing
audit. These newer snapshots supersede the older pfQuest rows above for current
behavior/database comparison; the older hashes remain preserved above as
historical provenance and must not be treated as current truth.

| Reference | SHA-256 | Authority / note |
| --- | --- | --- |
| `pfQuest-classicAPI-octo(5).zip` | `6f516c3d899bade909de1e79ddd55bd6f3eade9017541fdf3e5bb5c58c723d34` | Current pfQuest-family ClassicAPI/runtime reference. Compared with the previously used snapshot, only `slashcmd.lua` and `CHANGES-octo.md` changed; no quest/unit/item/object database payload changed. |
| `pfQuest-octo-master(4).zip` | `91a663eaed749a5a2bbe8404381d4a897fe5583b9f05a765a8d42c2bcdcdec19` | Prior Octo database reference, version 1.1.0; superseded for current comparison by the 1.1.5 upload recorded below. |

Maintenance rule: do **not** wholesale-copy any pfQuest-octo generated database over
Questie-Octo. Questie-Octo intentionally carries later/project-specific map and
data corrections. Treat the new master as a semantic correction/reference
source, verify non-additive changes against current Turtle server truth, and
apply only the final intended state through Questie-Octo's overwrite/enrichment
layers.

### 1.0.68 pfQuest-octo 1.1.5 deployed-live reconciliation

A newer user-supplied `pfQuest-octo-master(3).zip` identifies itself as Octo DB
reference **1.1.5** and has SHA-256
`de2441964f4a2125251c668b9ac7e99d56920103d41402ee73e430e206cbd8d7`. It
supersedes the 1.1.0 snapshot for current pfQuest-octo comparison while the older
hash remains historical provenance. Questie-Octo still does not wholesale-import
the reference database.

The 1.1.5 audit established two maintenance safeguards that must survive future
handoffs:

- a missing questgiver/ender relation in a single extraction is not proof that a
  quest is unavailable; relation scans can be partially populated without an
  obvious failure signal, so compare row counts/refreshes and corroborate with
  deployed quest-template state, scripts/conditions, and live evidence;
- entity-ID set diffs cannot detect relocations or removal of only one coordinate;
  coordinate corrections require current patch notes, current authoritative spawn
  data, or live measurement.

Accepted 1.0.68 reconciliation details are recorded in
`PFQUEST_OCTO_1_1_5_AUDIT_2026-08-21.md`.

### 1.0.58 pfQuest-octo/current-server reconciliation

The 2026-08-21 1.0.58 data pass rechecked the current pfQuest-octo 1.1.0 snapshot
against the supplied current Turtle/Tortoise server source before accepting any
non-additive change. The pass retained Questie-Octo's additive/presentation split
where server completion targets differ from the creatures/items a player must
physically hunt or interact with. Accepted corrections and rejected replacement
candidates are recorded in `PFQUEST_OCTO_DATABASE_AUDIT_2026-08-21.md`.

## Current Octo client-authority snapshots (2026-08-21)

The user supplied direct current-client extractions that supersede older inferred or
reference-addon data whenever the question is about client-side DBC geometry or
native FrameXML behavior. Newer direct extractions supplied later supersede these.

| Current client reference | SHA-256 | Authority / note |
| --- | --- | --- |
| `DBFilesClient.zip` | `5ea0f15b14803b20848f4063f9af4a98bf8088a76a0eb1bd1eb780b56682bd05` | **Primary current client DBC/map-data authority.** Use current `WorldMapArea.dbc`, `Map.dbc`, `AreaTable.dbc`, `AreaTrigger.dbc`, and related DBCs for Octo/Turtle client map identity, map bounds, portal positions, and other client-side database facts. |
| `BlizzardInterfaceCode(2).zip` | `c8b9867f8ffa1dc721bd453af5f8fb0674feec2f4fe6d16163ae6dcbadfd2117` | **Primary current native UI/FrameXML authority.** Use it for the current Octo/Turtle client UI implementation when the relevant Blizzard file is present. |

Authority rule for maintenance: the newest direct Questie-Octo source is current
implementation state; the newest direct DBFilesClient extraction is current client
DBC/map truth; the newest direct BlizzardInterfaceCode extraction is current native
UI truth; current Turtle/Tortoise server source is server-side quest/spawn/script
truth. Questie, pfQuest, pfUI, Atlas and other addons remain comparison/reference
implementations and must not override contradictory current client/server evidence.

The 1.0.55 instance audit is recorded in
`Docs/INSTANCE_MAP_AUDIT_2026-08-21.md`.

## LevelRange references (1.0.56-1.0.57)

The user-supplied `LevelRange-Turtle-main.zip` (upstream version 2.2.0) and
`LevelRange-Octo-main.zip` (upstream version 2.0.4) are behavior/data references
for Questie-Octo's optional continent-hover zone level range panel. Questie-Octo
reimplements the feature by current client AreaTable/WorldMapArea identity rather
than bundling LevelRange's XML/options/SavedVariables system. Version 1.0.57
restores the references' Friendly/Hostile/Contested presentation while sourcing
zone ownership from the current Octo AreaTable faction-group mask.

The upstream license notice is preserved in `LICENSES/LevelRange-LICENSE.txt`
and summarized in `THIRD_PARTY_NOTICES.md`. Current Octo `DBFilesClient.zip`
remains authoritative for map identity and faction ownership; current Turtle
release/source material is preferred for newer zone ranges such as Moonwhisper
Coast.

## Dungeon entrance audit (1.0.60; runtime guidance removed in 1.0.61)

The historical 1.0.60 entrance audit was derived from two current authoritative
inputs supplied by Sandrea:

- `DBFilesClient(1).zip`: `AreaTrigger.dbc` and `WorldMapArea.dbc`;
- `tortoise-wow-main(7).zip`: current server
  `sql/base/tw_world_areatrigger_teleport.sql`.

Version 1.0.60 temporarily materialized that research as
`Map/DungeonEntrances.lua`. Live map evidence then showed that exterior
projection was not reliable enough for player-facing quest guidance in every
context, and the extra outdoor entrance pins were judged redundant with common
Turtle map addons. Version 1.0.61 removes the runtime table/module completely.
The source-backed research and rejected/ambiguous cases remain documented in
`Docs/DUNGEON_ENTRANCE_AUDIT_2026-08-21.md` for future auditing only.

Reference addons remain non-authoritative for entrance coordinates.

## Historical sources no longer available as exact archives

Existing Questie-Octo comments and README history establish that Questie 3.3.5,
7.0.0, and 8.0.0 were used during the earlier backport work. Those exact source
archives are no longer available in the current workspace, so they cannot be
re-hashed during this licensing pass.

Do not delete their references from source comments or documentation. Those
references are the remaining provenance record for the earlier work.

Later `Docs/ARCHITECTURE.md` records additional Questie generations as reference
material, including Questie 7-9, Questie 10-11, and Questie 11.34.1 as an
edge-case reference. Earlier README sections saying Questie 9/10/11 were not
used are historical stage-specific notes and intentionally remain intact.

## Exact-match audit observations

The baseline Questie-Octo archive contained many files that are byte-identical
to supplied source snapshots, especially under `Libs/` and `Data/`. Exact hash
matches are only one kind of provenance: adapted code, generated tables,
converted artwork, copied behavior, and compatibility patterns can remain
third-party-derived even when a whole-file hash no longer matches.

For this reason future audits must consult both hashes and the retained source
comments/documentation.

## License findings

### Questie-Octo original contributions

Original portions first authored for Questie-Octo are offered under the MIT
License. See `../LICENSE` and `../LICENSES/Questie-Octo-MIT.txt`.

### Ace3v

The supplied Ace3v snapshot includes the Ace3 Development Team license. Its
verbatim text is preserved at `../LICENSES/Ace3v-LICENSE.txt`.

### pfQuest / Shagu

The supplied pfQuest and Shagu snapshots contain MIT license files. Their exact
texts are preserved individually in `../LICENSES/` so their original copyright
years and notices are not collapsed into a generic replacement.

### Questie

No project-level Questie license file was found in the supplied Questie 5.2.3
or 6.0.0 snapshots. The `Questie/Libs/LICENSE.txt` file in those snapshots is
Ace3's license and is not treated as Questie's project license. Questie-derived
material is therefore excluded from the scope of the Questie-Octo MIT grant in
this repository notice.

### ClassicAPI

ClassicAPI.dll is an external dependency and is not bundled. Upstream states
GPL v3 or later. The upstream GPLv3 license document is included at
`../LICENSES/ClassicAPI-GPL-3.0.txt` for reference and compliance clarity.

## Packaging invariant

The GitHub/licensing package must preserve every pre-existing archive member's
uncompressed bytes. Licensing/provenance files are additions only. A future AI
or human contributor should not use a licensing cleanup as a reason to rewrite
source, change gameplay, strip comments, remove historical notes, or normalize
third-party files.

## Compiled runtime database (1.0.10+)

`Data/runtime/` is generated Questie-Octo release data, not a new independent
data source. It is a build-time serialization of the same packaged pfQuest base,
Turtle/Octo overwrite, and Questie-Octo enrichment layers documented above.
`Tools/compile_runtime_db.lua` performs the historical runtime merge offline.
Starting with 1.0.11 it also emits a conservative reachability projection for
the large item/object/reference-loot tables: every record reachable through quest
starts, finishes, objectives, item-drop/reference/vendor sources, IR interaction
targets, tracking/service/rare metadata, and quest-browser reward names is
retained. The complete creature table/name set remains loaded because the manual
creature diagnostic and live ClassicAPI objective IDs may query arbitrary known
NPCs. Quest rows and the small global zone/AreaTrigger/minimap/meta tables remain
complete.

`Tools/validate_runtime_db.lua` independently reconstructs the old final state,
derives the runtime reachability contract, recursively compares every retained
record/localized name, and verifies that the complete quest/global tables and
precomputed map candidate index are unchanged.

The original `Data/pfDB/` source material remains in the repository with its
existing provenance and licensing scope. Release TOCs intentionally load only
`Data/runtime/` so the Vanilla client does not parse duplicate or unreachable
records during every login and `/reload`. Compilation/pruning changes runtime
representation and startup cost only; it does not transfer ownership or alter
the provenance/license of the underlying data.

## Atlas-CFM reference audit (2026-08-17)

The user-supplied Atlas-CFM snapshot was inspected as a reference-only source for current dungeon layout/quest presentation during the 1.0.41 dungeon-map audit. Questie-Octo does not import Atlas-CFM code, map artwork, or quest-template data. Wailing Caverns scripted-encounter guidance is derived from current Turtle/Tortoise server script coordinates and cross-checked against the Atlas presentation.

### 1.0.70 staged-repeatability rule

Live verification of Oink, Oink! established a quest state that should not be flattened into the ordinary static `repeatable` flag: the first offer is an ordinary quest, while later offers are repeatable after that character completes it once. Questie-Octo records that semantic explicitly as `repeatableAfterFirstCompletion` and derives the active state from per-character completion history.

This distinction is important because `QuestieOctoGlobalDB.observedRepeatableQuests` is shared across characters. A global observation must not turn another character's first offer blue. Future audits should use the staged semantic whenever current data/live behavior proves the same ordinary-first / repeatable-afterward lifecycle. The first offer follows ordinary quest visibility/automation; after the first completion, normal repeatable visibility and `Include Repeatable Quests` automation rules apply.
## 2026-08-29 licensing/provenance hardening pass

This pass was performed against accepted Questie-Octo 1.0.84 and is
documentation/offline-tooling only. All TOC-loaded runtime files, all quest/map
data, and all binary artwork remain byte-for-byte unchanged.

Additional source facts recorded:

- canonical project repository verified at
  `https://github.com/SandreaSub/Questie-Octo`; downstream mirrors/forks are
  documented as independent in `PROJECT_IDENTITY.md`;
- current CurseForge metadata identifies Questie as GPLv3, and the Questie
  v6.0.0 CurseForge file page also displays GPLv3 project metadata; the supplied
  5.2.3/6.0.0 ZIPs still contain no project-level Questie license file, so both
  facts are retained rather than silently reconciling them;
- the supplied Tortoise/Turtle server-source snapshot carries AGPLv3 at its
  repository root; the exact text is preserved in
  `LICENSES/Tortoise-AGPL-3.0.txt`;
- every binary under `UI/Icons/` now has a SHA-256 provenance row in
  `Docs/ASSET_PROVENANCE.md` and `Tools/provenance_assets.tsv`; exact matches,
  historical attributions, project-supplied conversions, and unresolved files
  are distinguished explicitly;
- `Tools/verify_provenance.py` is an optional offline checker and is not loaded
  by WoW or wired into addon startup.

Current supplied reference hashes used for this pass:

- Questie-Octo 1.0.84: `3f26872c887709099c03e180690c11e223b27219754d627342260f9671719c6d`
- Questie 5.2.3: `806a12d894a9d8568b73d86a95aeda79f29bebf90320a5f0007bec8db9803335`
- Questie 6.0.0: `de997f793871b898f6a8f9f6494b79fcd55fc82f8e087b88a026a3dfc99550b9`
- Ace3v: `0482801133653d0e611e29335b22e77ad3de05a14ab8c35c163eb3f05eaaebeb`
- pfQuest-classicAPI-octo: `6f516c3d899bade909de1e79ddd55bd6f3eade9017541fdf3e5bb5c58c723d34`
- pfQuest-octo 1.1.6: `674deb7b811af17f23641327d9ac5d83991060c3752a97654bca66e548daf679`
- Tortoise/Turtle server source: `ed3b3638f26733d30993e0d2a1fac1e31a0738d5f66bd11a23c52509f7d47ee9`
- BlizzardInterfaceCode: `c8b9867f8ffa1dc721bd453af5f8fb0674feec2f4fe6d16163ae6dcbadfd2117`
- DBFilesClient: `5ea0f15b14803b20848f4063f9af4a98bf8088a76a0eb1bd1eb780b56682bd05`
- pfUI-classicAPI-octo: `5b4ed17b4ca94712ea7cc35cd86f31dfdc7b5d94a83bb51abb3cfca2e8e4911b`
- DragonflightUI-Reforged: `2c08e1ae203f54d7969262b65056d58d5e9e8c26f3b61f2c935ff0825525ac68`
- Calendar reference: `f4418d71aaf86fcc1067f3f02b7291aab6f3c37bb4d607a440127879270553a9`

This documentation does not assert that the project's licensing questions are
legally foolproof. In particular, whether historical code/artwork constitutes a
derivative/covered work and whether particular game-derived artwork was
licensable by an upstream project can require rights-holder evidence or legal
advice beyond source-provenance auditing.

