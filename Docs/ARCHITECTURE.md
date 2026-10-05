# Questie-Octo architecture base

Current database ownership: OctoQuestDatabase is the authoritative build source.
See [SHARED_DATABASE.md](SHARED_DATABASE.md) for the pinned Node adapter, generated
outputs, and validation. The Data/pfDB compiler descriptions below are preserved
historical design records; they are no longer the active regeneration pipeline.

## Non-negotiable design

- ClassicAPI is the only required enhanced-client compatibility layer.
- SuperWoW and Nampower may be detected later, but no core feature may depend on them.
- Questie 5.2.3 is the main UI/behavior target.
- Questie 6.0.0 is the architecture bridge.
- Questie 7-9 are bug-fix references.
- Questie 10-11 are references for service separation and mature availability logic.
- Questie 11.34.1 is an edge-case reference, not a runtime base.
- pfQuest/pfQuest-turtle are transitional raw data/reference sources only.
- Tortoise/Turtle server data should become the authoritative offline-generated relationship layer.
- No heavy whole-world calculation may run in one frame.
- Login and zone changes must remain responsive.
- Map nodes will use persistent diff/reuse, never continuous clear/recreate.

## Runtime service order

ClassicAPI contract
  -> build-time compiled runtime database
  -> frame-budgeted Scheduler (nonvisual driver parented to WorldFrame so native full UIPanels cannot pause queued work)
  -> QuestLog cache (ClassicAPI IDs)
  -> Turtle completion history
  -> canonical Quest model
  -> AvailableQuests
  -> Objectives / ItemStarts
  -> persistent Map + Minimap
  -> Tracker / Tooltips / Options

## 1.0.10 runtime database / startup rule

Release packages no longer load pfQuest base + Turtle patch databases and merge
them on the player's client. `Tools/compile_runtime_db.lua` reconstructs the
existing field-by-field merge and Questie-Octo enrichment at build time, then
serializes the final runtime tables under `Data/runtime/`. The original source
data remains in the repository for provenance, audits, and regeneration but is
not referenced by the release TOC.

Runtime invariants:

- every quest row and the complete quest/zone/profession text tables remain
  authoritative and unpruned;
- large item/object/reference-loot tables are build-time reachability
  projections containing every record reachable from quest starts, finishes,
  objectives, item sources, IR targets, service/rare metadata, and reward-name
  presentation;
- the complete creature table/name set remains loaded because `/qo creature`
  and live ClassicAPI objective IDs can legitimately query arbitrary known NPCs;
- `Tools/validate_runtime_db.lua` reconstructs the legacy final database and
  verifies the pruned runtime is recursively identical for every reachable
  record plus all complete quest/global datasets;
- no quest/data semantics may be changed merely to reduce load time;
- the original `Data/pfDB/` source remains packaged for provenance/regeneration
  but is never loaded by the release TOC;
- the sorted quest-ID list and starter/source map candidate index are generated
  offline so login does not rescan all quests for those static indexes;
- AceConfig options are lazy and must not construct a hidden options tree at
  login;
- the scheduler runs a small bounded number of continuation slices per Vanilla
  frame instead of resuming every queued job in one frame.

## 0.1.0 scope

0.1.0 intentionally stops after:
- ClassicAPI verification
- gentle scheduler
- isolated raw DB provider
- ClassicAPI quest-ID quest log cache
- Turtle .queststatus / TWQUEST completion service
- diagnostics

No map, minimap, tracker, availability engine, or tooltip UI yet.


## 0.1.1 milestone

Introduces the public database boundary and canonical quest services:

Legacy/raw data provider
  -> DatabaseAPI
  -> QuestModel
  -> Completion + QuestLog
  -> AvailableQuests

No module outside Database/ should add new direct pfDB dependencies.


## 0.1.3 milestone

Adds the canonical node-generation boundary:

QuestModel
  -> Objectives
  -> ItemStarts
  -> Nodes
  -> future persistent Map/Minimap

Map/Minimap must consume Nodes and must not rediscover quest/item/source
relationships itself.

## Quest-truth publication rules

The runtime quest system is intentionally layered:

pfQuest/Turtle raw DB truth
  -> QuestModel semantic normalization
  -> Completion / EventAvailability / QuestLog runtime truth
  -> AvailableQuests transactional snapshot
  -> Objectives / ItemStarts
  -> Nodes transactional snapshot
  -> PreparedMap
  -> World Map / Minimap / Tracker / Quests browser

Important invariants:

- `lvl` is presentation/difficulty; `min` is the minimum-level availability gate.
- A quest DB `event` value is event membership only. It never means the event is active now.
- Repeatability and event membership are independent flags; rendering must use an explicit precedence instead of assuming one classification excludes the other.
- Completion data must be queried authoritatively before it is published. When `QueryQuestsCompleted` exists, request the cache and wait for `QUEST_QUERY_COMPLETE` before reading `GetQuestsCompleted`; otherwise use the Turtle `.queststatus` / `TWQUEST` fallback.
- Async services never clear a published live snapshot while rebuilding it. Build into a private buffer and atomically swap at the publication boundary. This prevents map/minimap blinking during settings or quest-state refreshes.
- Prepared/map presentation stays valid until a complete replacement node snapshot exists.
