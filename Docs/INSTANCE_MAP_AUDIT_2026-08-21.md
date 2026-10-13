# Questie-Octo current instance / entrance map audit

Audit date: 2026-08-21

## Authority used

This audit compares the actual Questie-Octo 1.0.54 source/runtime state against:

1. the current user-supplied `DBFilesClient.zip` for client `Map.dbc`, `AreaTable.dbc`, `WorldMapArea.dbc`, `AreaTrigger.dbc`, and related DBC facts;
2. the current user-supplied `BlizzardInterfaceCode` extraction for native map/UI behavior;
3. the supplied current Turtle/Tortoise server source for creature/gameobject spawns, quest templates, scripts, and AreaTrigger teleport destinations.

Questie 5/6 and pfQuest remain comparison/reference implementations only.

## Full instance-coordinate audit

The current client exposes 40 dungeon/raid server maps represented by 47 usable instance/floor `WorldMapArea` contexts in the audited set. Questie-Octo already has map/minimap dimensions for those contexts. Existing Vanilla instances and the previously supported Turtle instances were left alone where their merged coordinates were already valid and contained no generic placeholder pattern.

Three newer instance maps formed a clear common failure cluster:

| Instance | Server map | Client area | 1.0.54 creature records | Placeholder state |
| --- | ---: | ---: | ---: | --- |
| Timbermaw Hold | 819 | 5640 | 26 | 26/26 had a `50,50` map point |
| Windhorn Canyon | 820 | 5641 | 27 | 27/27 had a `50,50` map point |
| Frostmane Hollow | 822 | 5734 | 12 | 10/12 had a `50,50` map point |

The current client DBC now supplies authoritative bounds for all three:

```text
Timbermaw Hold   map 819 / area 5640 / WorldMapArea 696
  y1=-2991  y2=-4416  x1=-7195  x2=-8157

Windhorn Canyon  map 820 / area 5641 / WorldMapArea 698
  y1=-3184  y2=-4418  x1=-7163  x2=-7992

Frostmane Hollow map 822 / area 5734 / WorldMapArea 704
  y1=-3157  y2=-4168  x1=-7453  x2=-8106
```

The conversion is the same normal pfQuest-style world-to-map transformation used for healthy maps:

```text
mapX = 100 - (worldY - y1) / ((y2 - y1) / 100)
mapY = 100 - (worldX - x1) / ((x2 - x1) / 100)
```

The formula was cross-checked against already healthy current-instance data before applying corrections.

## Safe 1.0.55 corrections

Only ordinary server-backed static spawns that convert inside the client map rectangle are changed.

- Timbermaw Hold: 24 existing static creature records are rebuilt from 251 current server spawn positions. The two inherited `50,50` records for scripted encounters Peroth'arn (60686) and Ursol (62947) are deliberately not rewritten because current server data has no ordinary map-819 spawn for either entity.
- Windhorn Canyon: all 27 existing creature records are rebuilt from current map-820 server spawns. Two Rocktail Scorpid server points transform beyond the playable map rectangle and are omitted; the remaining server-backed points are retained.
- Frostmane Hollow: all 12 existing creature records are rebuilt from current map-822 server spawns.
- Windhorn Relic (2020320): all 28 current gameobject positions are restored for quests 41976/41977.
- Tablet of Kaz'gan (2020339): the current gameobject position is restored for quest 42040.

No quest template, objective identity, drop relation, faction rule, or completion rule is changed. This is a coordinate/presentation correction.

## Entrance audit

The current client `AreaTrigger.dbc` contains exact physical portal-trigger positions, and current Turtle server `areatrigger_teleport` data maps those triggers to destination maps. Together these can form an authoritative future dungeon-entrance dataset, including current custom instances.

That feature is intentionally **not** enabled in 1.0.55. A raw teleport list is not automatically equivalent to a player-facing quest entrance marker because:

- several dungeons have multiple valid entrances/exits;
- some triggers are one-way, conditioned, or used by internal transitions;
- helper `WorldMapArea` rectangles overlap outdoor zones and must not be projected as ordinary quest zones;
- server data can contain test or deliberately unavailable destinations.

When implemented later, entrance guidance should use verified physical AreaTrigger points rather than projecting the overlapping `*Entrance` WorldMapArea helper rectangles.

## Multi-context / floor identity audit

The client can reuse one area ID in distinct map contexts. A confirmed example is area 3457:

```text
WorldMapArea 657: server map 532, area 3457, Karazhan
WorldMapArea 682: server map 814, area 3457, UpperKarazhan
```

Questie-Octo still has some area-ID-centric map paths, so Lower/Upper Karazhan deserves a separate map-identity audit. Existing behavior is left untouched in 1.0.55 because no regression was demonstrated and an architectural identity change would be unrelated to the safe coordinate repair.

## Deliberately unchanged

- No dungeon entrance helper markers were added.
- No continent projection was added for instance helper maps.
- No scripted encounter position was guessed.
- No working Vanilla/custom dungeon coordinates were regenerated merely for consistency.
- No fullscreen World Map scheduler experiment was mixed into this data pass.
- No minimap movement/performance path was changed.

This keeps 1.0.55 limited to corrections supported simultaneously by current client map geometry and current server spawn data.
## 1.0.60 implementation follow-up

The future entrance-guidance path described by this audit was implemented in
1.0.60 as a conservative active-quest feature. `Map/DungeonEntrances.lua` uses
current physical AreaTrigger positions plus current server teleport destinations;
it does **not** promote the overlapping `*Entrance` WorldMapArea helper rectangles
into quest zones. Multi-entrance selection uses the inside teleport destinations
to choose the entrance nearest the currently actionable internal objective(s).

The first implementation keeps the audit's unsafe/ambiguous cases excluded:
condition-gated entrances/shortcuts, internal-only raid transitions, unavailable
Grim Batol, AQ20's helper-map-only exterior geometry, Lower/Upper Karazhan area
3457 ambiguity, and current custom instances for which the supplied server table
has no authoritative destination teleport. See
`Docs/DUNGEON_ENTRANCE_AUDIT_2026-08-21.md` for the release-specific set.
## 1.0.61 entrance-guidance follow-up

Live testing of 1.0.60 showed the Scarlet Monastery Cathedral synthetic exterior
pin projected to the wrong part of Tirisfal Glades. More broadly, Sandrea chose
not to duplicate dungeon entrances on outdoor quest maps when modern Turtle
addon stacks already commonly provide that information.

Version 1.0.61 therefore removes the runtime entrance table and every synthetic
`dungeonEntrance` node. Normal quest objectives in real pre-instance cave/tunnel
spaces and internal dungeon objectives remain unchanged. The AreaTrigger plus
server teleport reconciliation above is retained only as audit/reference data.

Tracker Show on Map now better recognizes the player's current native dungeon
map (and a dungeon/detail map already displayed by another addon), but the
Interface 11200/ClassicAPI surface has no arbitrary instance-map setter. Questie-
Octo therefore does not fake an outdoor objective or custom dungeon map merely to
make an out-of-instance tracker click appear successful.

## Live Tablet of Kaz'gan correction (2026-10-12)

A player screenshot for A Grave Misunderstanding! (42040) shows the player
standing at the tablet in the northern part of the eastern purple chamber,
while the inherited objective marker sits south of that chamber in blank map
space. This live Octo report supersedes the earlier Turtle spawn-derived point.

OctoQuestDatabase/source/objects.json changes object 2020339 from 48.7/65.4
to approximately 51.0/29.5 in Frostmane Hollow (5734). The estimate uses the
player arrow relative to the old object marker and the native map aspect ratio;
the screenshot is cropped and supplies no numeric player coordinates. Confirm
the exact position in game when available. The 300-second respawn and the
quest/item/object relationships are retained. Both consumers adopt the same
shared content revision and regenerate their data.

## 1.0.62 follow-up

Peroth'arn (60686) and Ursol (62947) no longer retain the inherited generic `50,50` area-5640 points. The current server snapshot still has no ordinary static map-819 spawn for either scripted encounter, so Questie-Octo now publishes no objective map position for them until verified source or live evidence provides one. Their quest relationships and pickup markers remain unchanged.

