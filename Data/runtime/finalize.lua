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
