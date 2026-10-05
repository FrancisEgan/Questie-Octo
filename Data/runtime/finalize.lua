-- GENERATED FILE - DO NOT EDIT BY HAND.
-- Source: OctoQuestDatabase sha256:70cb026880ca6919eb23a7ba28af17fc5224d9bb533eb7ab569f4b5a955b6f2b
-- Adapter: Tools/build_database.js; correct data in OctoQuestDatabase.
local db=QuestieOcto.RuntimePFDB
local L=QuestieOcto.RuntimeLocales or {}
if db then
  for _,name in pairs({"items","quests","objects","units","zones","professions"}) do
    if db[name] then
      db[name].enUS=L[name] or {}
      db[name].loc=db[name].enUS
    end
  end
  db["octo-enrichment-complete"]=true
end
QuestieOcto.RuntimeLocales=nil
