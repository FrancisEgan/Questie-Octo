# Questie-Octo — Moonwhisper prerequisite visibility audit

**Audit date:** 2026-09-29  
**Input baseline:** accepted Questie-Octo 1.42  
**Output:** 1.43  
**Trigger:** player report that additional available quests were missing around Narvalis Point, specifically The Light of Elunaris and Serpents Without Heads.

## Result

The reported quests are not missing from the database, starter coordinates, or Moonwhisper map candidate index. The audit found a completion-history repair ordering defect in the generic availability path.

Questie-Octo already has a cached ClassicAPI `IsQuestFlaggedCompleted` fallback for ordinary one-time quests when the bulk completed-quest cache is stale or incomplete. In 1.42 that fallback runs only near the end of the quest's own availability evaluation. A prerequisite quest filtered earlier as low-level therefore never reaches its direct completion check. A higher-level follow-up can then be rejected as `prerequisite` even though the server/client direct flag knows the lower-level prerequisite was rewarded.

## Reported Moonwhisper records

Current compiled 1.42 data and the supplied Tortoise update history agree on the relevant relationships:

| Quest | Level | Current relationship |
|---|---:|---|
| 42086 — Echoes of Nendis | 54 | no completion prerequisite |
| 42087 — The Light of Elunaris | 54 | `PrevQuestId` / runtime `pre` = 42086 |
| 42089 — Scales of the Tideblade | 54 | no completion prerequisite |
| 42090 — Serpents Without Heads | 56 | `PrevQuestId` / runtime `pre` = 42089 |
| 42091 — Word to the High Priestess | 56 | `PrevQuestId` / runtime `pre` = 42090 |

The current Tortoise update `20260604214927_world.sql` explicitly sets 42087 <- 42086, 42090 <- 42089, and 42091 <- 42090.

Moonwhisper map 5642 already contains all five IDs in its compiled candidate bucket. The two Narvalis Point starters are also present with current map coordinates:

- Sentinel Commander Silverstreak (62901): 62.67, 15.86, map 5642.
- Talanis Amberscribe (62907): 62.67, 15.89, map 5642.

Therefore no quest, starter, coordinate, or candidate-index override is justified.

## Deterministic 1.42 reproduction

At player level 60 with the normal `showLowLevelQuests = false` cutoff:

- quest 42089 is level 54 and is hidden because 54 < 60 - 4;
- quest 42090 is level 56 and is not low-level because the comparison is strict (`56 < 56` is false).

With an intentionally incomplete bulk completion cache and the direct per-quest flag for 42089 set to completed:

1. 1.42 evaluates 42089 as `lowLevel` before calling `VerifyOrdinaryCompletionFlag()`;
2. completion history for 42089 therefore remains missing;
3. 1.42 evaluates 42090 and rejects it as `prerequisite`;
4. the prerequisite path itself never asks the direct flag for 42089.

Seeding the exact same state with 42089 present in completion history makes 42090 available, isolating the defect to completion-history repair rather than quest data.

## Wider audit

The current 1.42 graph was scanned using the exact prerequisite semantics implemented by `PrerequisitesSatisfiedRaw`:

- `preActive` overlaps are excluded from completion requirements;
- `preAll` members are included as completion requirements;
- ordinary `pre` entries overlapping `preActive`/`preAll` are not double-counted;
- 1.42 chain-only `NextQuestInChain` predecessors are excluded because they are active-only locks, not completion prerequisites.

There are **971** current level-differential completion-prerequisite edges where the successor has a higher quest level than the predecessor. **970** of those predecessors are ordinary one-time quests eligible for the direct completion fallback, covering **874 unique ordinary predecessor IDs**.

At level 60 specifically, **105** such ordinary edges can place a prerequisite below the default four-level low-level cutoff while leaving its successor level-visible, across **90 unique predecessor IDs**. Moonwhisper includes several examples, including 42089 -> 42090.

## Rejected broad fix

A prototype that directly verified every missing ordinary prerequisite did fix the report, but it expanded ClassicAPI direct completion queries substantially in synthetic full-database scans:

| Synthetic level-60 scan | 1.42 | Broad prototype |
|---|---:|---:|
| low-level quests hidden | 298 | 830 |
| low-level quests shown / All | 1,226 | 2,981 |

That approach was rejected because Questie-Octo deliberately avoids turning availability refreshes into large direct-completion query bursts on the Vanilla client.

## Selected correction

1.43 keeps the existing availability pipeline and direct-completion cache. Only when all of these are true does a missing predecessor receive an on-demand direct verification:

1. the relationship is a real completion prerequisite, not a chain-only active lock;
2. the successor itself is not hidden by the current low-level setting;
3. the predecessor is hidden by the current low-level setting;
4. the predecessor is still absent from completion history;
5. it is an ordinary one-time quest accepted by `VerifyOrdinaryCompletionFlag()`.

The same helper is used for `pre` alternatives and `preAll` groups. Daily/yearly/repeatable semantics remain excluded by the existing completion service.

A synthetic empty-history level-60 scan with low-level quests hidden increases direct calls from **298 to 388** (+90), while showing low-level quests at the full range remains **1,226 to 1,226** (no additional calls). This is deliberately bounded to the failure class instead of globally querying every missing prerequisite.

## Regression coverage

The packaged progression harness now checks:

- exact Moonwhisper 42089 -> 42090 repair with stale bulk history;
- unfinished 42089 still blocks 42090;
- finite low-level-range settings use the same repair behavior;
- all **970** ordinary level-differential prerequisite edges can repair their hidden predecessor completion at the first level where predecessor and successor visibility diverge;
- a predecessor still within the configured visible range is not eagerly direct-queried;
- all existing strict progression, direct-only, chain-only, repeatable/resettable and optional-breadcrumb tests remain intact.

## Boundaries

This release does not claim that every possible stale-completion scenario from every unrelated eligibility filter has been converted to a direct query. The audited defect is specifically the low-level-filter starvation class exposed by the Moonwhisper report. Broader unconditional prerequisite verification was measured and rejected on performance grounds.

No polling, `OnUpdate`, background database scan, quest-data override, coordinate change, starter change, or SavedVariables schema change is introduced.
