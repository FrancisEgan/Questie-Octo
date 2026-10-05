# pfQuest-Octo 1.1.5 / Deployed Octo Reconciliation Audit

**Audit date:** 2026-08-21  
**Questie-Octo baseline:** 1.0.66  
**Resulting build:** 1.0.68  
**Reference:** user-supplied `pfQuest-octo-master(3).zip`, SHA-256 `de2441964f4a2125251c668b9ac7e99d56920103d41402ee73e430e206cbd8d7`

## Scope

The uploaded archive identifies itself as pfQuest-octo **1.1.5**. It contains the
1.1.2 placeholder-quest removals plus 1.1.3's Voryn relocation, 1.1.4's completed
relation-scan corrections/Oink quest, and 1.1.5's stale Baron Rivendare coordinate
removal.

Questie-Octo remains implementation truth. Current direct client data remains
client/map authority, current supplied Tortoise/Turtle source remains server-source
authority, and pfQuest-octo remains a reference. This audit additionally records
cases where the deployed Octo realm/database is demonstrably newer or differently
enabled than the supplied source snapshot.

## Permanent audit safeguards

### Partial relation scans are not negative proof

A missing questgiver or quest-ender relation in one extraction is **never enough**
to conclude that a quest is unavailable. pfQuest-octo 1.1.4 documented that its
first extraction looked populated and internally consistent while the relation
scan was still incomplete: a later completed pass contained **562 more questgiver
relations and 607 more quest-ender relations**.

Before suppressing or deleting quest presentation because a relation is absent:

1. compare extraction/row counts across refreshes when possible;
2. inspect the deployed quest-template signature/objectives;
3. inspect scripts/conditions and current source data where relevant;
4. use convincing live evidence when available.

A missing relation by itself is not a live-invalid-quest signal.

### ID-set diffs cannot find coordinate-only changes

An NPC may retain the same ID while moving, or one of several stored coordinates
may be removed. Entity-ID set comparisons cannot detect either case. Coordinate
corrections therefore require current patch notes, authoritative current spawn
data, or live measurement. Voryn Skystrider and Baron Rivendare are the concrete
examples that established this rule.

## Accepted corrections

### 55100 — Join The League!
### 55101 — Help The League?

The complete Turtle/source records exist, but pfQuest-octo's deployed-Octo check
finds the same unimplemented placeholder signature previously established for
40795: placeholder title `- Quests`, level/min level 0, and no objectives.

Questie-Octo retains the underlying records for provenance and future restoration,
but sets `disabled=1` so they are not advertised as available. This follows the
existing reversible 40795 policy rather than deleting source data.

### 80381 — Shellcoins / 80999 — Elodia

The inherited quest contained the Shimmering Shell objective and text explicitly
saying to return to Elodia, but no end relation. Current relationship evidence
identifies Elodia as the finisher. Questie-Octo adds Elodia at Tanaris
**67.6, 26.82** and restores the quest end relation so completed-quest map guidance
has a real destination.

### 93100 — Voryn Skystrider

Current Octo patch notes relocated the Alah'Thalas flight master to the Citadel of
the Sun landing pad. The database extraction still contains the old spawn, so the
1.1.3 reference measured the current position in game. Questie-Octo adopts:

- Alah'Thalas: **27.65, 74.54**
- Thalassian Highlands projection: **50.95, 37.48**

The flight-master meta identity is unchanged.

### 50519 — Baron Rivendare

The old data contains Stormwind 44.4,81.6 and Orgrimmar 74.0,34.9. Current Octo
patch notes removed the bottom-of-Stormwind copy. Questie-Octo removes only the
stale Stormwind coordinate and preserves the valid Orgrimmar position.

## Live-confirmed current content

Update (2026-10-04): the player reports that Pig and Oink, Oink! are absent
from the current game. Quest 700001 is now disabled in the upstream runtime
database and compiler, superseding the earlier availability claim below.
The record is retained for identification, without predicted quest markers.

### 700001 — Oink, Oink! / 900200 — Pig

The completed pfQuest-octo 1.1.4 relation scan identified the level-1 quest, and
live Octo testing subsequently confirmed it. Pig starts and ends the quest, the
objective is **Raw Black Truffle (4608)**, item drop/vendor guidance works, and
the Pig coordinates are:

- Elwynn Forest: **23.72, 58.39**
- Tirisfal Glades: **34.18, 52.10**

Live testing also established a staged lifecycle that the original extraction did
not encode: the first offer is an ordinary quest, while after that character's
first completion the Pig offers it as repeatable. From 1.0.70 onward the source
record therefore carries `repeatableAfterFirstCompletion=1`; the runtime derives
the current state from per-character completion history rather than a global
repeatable observation.

## Deliberately not imported

- Mysterious Stranger (81030): generic lookup value only; its associated quest is
  deprecated and should not be advertised.
- Innkeeper Warmbreeze (62975): no Questie quest-guidance need and conflicting
  service semantics.
- Ozzy service NPC set and quests 42201/42202: appear to be pet-reclaim/service
  plumbing rather than ordinary quest content.

## Maintenance rule

Do not wholesale-copy pfQuest-octo 1.1.5 into Questie-Octo. Preserve the existing
formal-objective/actionable-source distinctions, project-specific corrections, and
current client/server authority order. Use the new reference for individual
source-backed corrections and for audit methodology.

## Runtime impact after 1.0.68 regeneration

- quests: **6701**
- items: **3635**
- units: **14138**
- objects: **1639**
- reference-loot rows: **124**
- quest item requirements: **189**
- map candidate contexts: **108**
- map candidate links: **8675**
- item names: **6395**
- unit names: **14135**
- object names: **1638**
- compiled/pruned runtime: **true**

The +1 quest is Oink, Oink!. Elodia and Pig add two unit records. Raw Black
Truffle becomes quest-reachable in the pruned runtime, producing the +1 item/name.
The two new Pig start locations add two candidate links while the map-context count
remains unchanged.
