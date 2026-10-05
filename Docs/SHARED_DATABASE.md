# Shared database maintenance

OctoQuestDatabase owns effective source data. Tools/build_database.js is this
addon's adapter. Generated Data/runtime/ and supplemental Data/*.lua are committed
and shipped; players need neither the shared checkout nor Questline. Existing
client requirements, including ClassicAPI, remain unchanged.

From the addon root:

```powershell
node Tools/build_database.js
node Tools/validate_database.js
# Deliberately adopt a changed shared revision:
node Tools/build_database.js ../OctoQuestDatabase --update-lock
```

The adapter accepts a checkout path or OCTO_QUEST_DATABASE, defaulting to the
sibling repository. database-source.json pins an exact SHA-256 content revision
of source files plus LICENSE/NOTICE.md. Shared JSON arrays are one-based Lua
sequences; the reader restores their original keys. Builds generate private Lua
tables, quest IDs, candidate indexes and stats without applying gameplay patches.
Headers, RuntimeDatabaseSource and Data/runtime/manifest.json record the revision.

Corrections belong in the shared data; geometry, appearance and existing map
exceptions belong in the adapter. Package the compact shared notices under
LICENSES/OctoQuestDatabase/. Node packages are development dependencies only.

Docs/DATABASE_MIGRATION.json records original input hashes and Git baselines.
Tools/database-source-notes.json retains the original supplemental source notes.
Historical duplicates are archived outside this repository in the workspace
.backup/Questie-Octo-licensing-cleanup-2026-10-05 directory; builds need no archive.
The optional node Tools/validate_database_migration.js compares full payloads
with the original recorded Git baselines. Deliberate later corrections can differ.
Validation is offline evidence and does not prove live-client behavior. The larger
succession package and accepted ZIPs were not supplied; no audit of them is claimed.
