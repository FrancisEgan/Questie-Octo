# Contributing

Questie-Octo targets Vanilla 1.12. Keep existing runtime behavior and client
compatibility unless the task explicitly changes them.

- Data corrections belong in OctoQuestDatabase. This addon owns its adapter and
  presentation; commit generated outputs. See Docs/SHARED_DATABASE.md.
- Original contributions use the project's MIT notice. Preserve applicable
  upstream copyright, terms, attribution and source comments when changing code.
- Record copied/derived sources in THIRD_PARTY_NOTICES.md. Do not assign unknown
  material a new license or guess its origin.
- For artwork, update Tools/provenance_assets.tsv and Docs/ASSET_PROVENANCE.md.
  Keep per-asset qualifications and verify hashes with python Tools/verify_provenance.py.
- Preserve useful historical evidence or archive it outside the addon repository
  when consolidating documentation. Avoid duplicate license copies for the same terms.

Run node Tools/validate_database.js after database builds. The optional
node Tools/validate_database_migration.js compares against original migration
baselines; intentional later data corrections can differ.
