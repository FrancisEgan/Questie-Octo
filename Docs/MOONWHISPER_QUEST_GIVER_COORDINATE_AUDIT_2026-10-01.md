# Questie-Octo — Moonwhisper Quest-Giver Coordinate Audit

**Date:** 2026-10-01  
**Input baseline:** accepted 1.43  
**Trigger:** live screenshots showing available quest markers around Tyrandas while the quests/NPCs belong at their current Moonwhisper locations, including Serpents Without Heads and Keeper of the Broken Grove.

## Result

The reported quests are not absent from the map candidate system. Their quest-giver coordinates are stale. Seven current single-spawn Moonwhisper quest NPCs retained old map points that disagree sharply with the current server spawn snapshot.

The correction changes only those seven unit coordinates.

## Current map geometry

The supplied current Octo `WorldMapArea.dbc` contains Moonwhisper Coast as:

- WorldMapArea row: 699
- server map: 1
- AreaTable/map identifier used by Questie-Octo: 5642
- texture: `Moonwhisper`
- left: -1354
- right: -9210
- top: 10204
- bottom: 4963

Current server world positions were projected with the ordinary WorldMapArea conversion:

```text
mapX = (worldY - left) / (right - left) * 100
mapY = (worldX - top) / (bottom - top) * 100
```

## Corrected NPCs

| NPC | ID | 1.43 coordinate | Current server/client projection |
|---|---:|---:|---:|
| Arch Druid Renethra Moonwater | 62900 | 62.70, 15.84 | 59.24, 24.61 |
| Sentinel Commander Silverstreak | 62901 | 62.67, 15.86 | 59.08, 24.68 |
| Zarazar Sagewind | 62902 | 62.32, 16.62 | 57.46, 28.26 |
| Irea Dawncaller | 62904 | 62.66, 15.96 | 59.08, 25.16 |
| Elendon Truebough | 62906 | 62.61, 15.81 | 58.83, 24.48 |
| Talanis Amberscribe | 62907 | 62.67, 15.89 | 59.10, 24.85 |
| Sister Mirallun | 62914 | 64.53, 15.29 | 67.79, 22.05 |

These NPCs drive multiple current Moonwhisper quest markers. In particular:

- 62901 starts/ends **Serpents Without Heads (42090)**.
- 62907 starts/ends **The Light of Elunaris (42087)**.
- 62914 starts/ends **Keeper of the Broken Grove (42097)**.

## Wider audit

Questie-Octo contains 200 unit IDs with map-5642 coordinates. 183 of those IDs are present in the current supplied Moonwhisper creature snapshot.

For the cleanest static comparison, 88 entries have exactly one addon map point and exactly one current static server spawn. Of those:

- 81 agree with the current server/client projection within 0.2 map percentage points.
- exactly 7 are large outliers, ranging from roughly 7.5 to 12.6 map percentage points.
- those seven are precisely the quest NPCs corrected above.

Restricting the audit to current quest starter/finisher units gives the same separation: the seven stale NPCs are the only large single-spawn outliers; all other comparable current quest givers remain within 0.2 points.

This shows the failure is a stale-NPC cluster, not a broken Moonwhisper coordinate transform.

## Relationship to 1.43

The 1.43 low-level prerequisite completion repair remains a valid generic availability correction. However, the live screenshots show that the original player report also contained a coordinate problem. The 1.43 audit statement that the relevant Moonwhisper starter coordinates were fully consistent is therefore superseded by this audit.

No quest prerequisite, chain, objective, completion, candidate-index, polling, OnUpdate, or SavedVariables rule changes in 1.44.

## Offline regression and release checks

The focused coordinate harness loads the actual compiled runtime unit table and asserts the seven corrected unit records exactly: **35 assertions PASS**.

The existing progression/availability regression remains unchanged in behavior and passes **25,623 assertions**, confirming that 1.44 does not disturb the 1.43 prerequisite/chain work.

Additional source-tree checks before packaging:

- pruned runtime database validator: PASS;
- provenance checker: PASS, including `ClassicAPI.dll` absent;
- Lua syntax/load parse: **136/136** Lua files PASS;
- clean compiler run: all **16** generated runtime files reproduce byte-for-byte;
- compared with 1.43, the only generated runtime file that changes is `Data/runtime/units.lua`;
- exactly the seven audited unit rows change inside that generated runtime file; map candidates, quests, objects, items, objectives, locales, and runtime stats remain byte-identical.

## Release disposition

This audit supersedes the coordinate conclusion in the 1.43 Moonwhisper prerequisite audit. The 1.43 low-level prerequisite repair remains valid and retained, but current live evidence plus current server/client geometry proves a separate stale-coordinate defect.

Package-level validation also succeeded:

- Full/source ZIP integrity: PASS; one safe `Questie-Octo/` root; 281 files; 73/73 TOC entries present; no bundled ClassicAPI DLL.
- Full/source packaged regressions: Moonwhisper coordinate harness **35 assertions PASS**; quest progression harness **25,623 assertions PASS**; runtime DB validation PASS; provenance PASS; Lua parse **136/136 PASS**.
- GitHub/runtime ZIP integrity: PASS; one safe `Questie-Octo/` root; 224 files; 73/73 TOC entries present; no bundled ClassicAPI DLL.
- GitHub/runtime common-file parity with Full/source: PASS; Lua parse **98/98 PASS**; provenance PASS.
- GitHub/runtime intentionally omits the source DB required by the source-only runtime validator, so that validator is run from the Full/source package rather than misrepresented as runnable in the pruned package.

**Questie-Octo 1.44 is therefore the corrected accepted engineering baseline.**
