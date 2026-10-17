-- Questie-Octo canonical database facade.
--
-- IMPORTANT:
-- pfDB is not exposed beyond Database/. The rest of Questie-Octo talks only
-- through this API.

QuestieOcto.DatabaseAPI = QuestieOcto.DatabaseAPI or {}
local DB = QuestieOcto.DatabaseAPI

-- Release builds use a private compiled database and deliberately ignore the
-- shared global pfDB name. An explicit developer/source build can opt back into
-- the historical Data/pfDB loader by setting useCompiledRuntime=false.
local pfDB = QuestieOcto.RuntimePFDB
if not pfDB and QuestieOcto.useCompiledRuntime==false then pfDB=_G.pfDB end

DB.ready = false
DB.questIDs = DB.questIDs or nil
DB.questTitleCache = DB.questTitleCache or {}
DB.questSearchTitleCache = DB.questSearchTitleCache or {}
DB.clientMapNameIndex = DB.clientMapNameIndex or nil
DB.packagedMapNameIndex = DB.packagedMapNameIndex or nil

local function RawQuest(id)
  return QuestieOcto.Database:GetRawQuest(id)
end

local function QuestLocale(id)
  return QuestieOcto.Database:GetQuestLocale(id)
end

function DB:IsReady()
  return self.ready and true or false
end

function DB:GetQuestCount()
  -- questIDs is built incrementally before DATABASE_API_READY is published, so
  -- counting it is O(1) and avoids walking the entire pfDB quest table again.
  return self.questIDs and table.getn(self.questIDs) or 0
end

function DB:BuildQuestIDCache()
  local result={}
  if not pfDB or not pfDB.quests or not pfDB.quests.data then
    self.questIDs=result
    return result
  end
  for id in pairs(pfDB.quests.data) do table.insert(result,id) end
  self.questIDs=result
  return result
end

function DB:GetQuestIDs()
  if not self.ready then return {} end
  return self.questIDs or self:BuildQuestIDCache()
end

function DB:GetQuestRaw(id)
  if not self.ready then return nil end
  return RawQuest(id)
end

function DB:GetQuestTitle(id)
  if not self.ready then return nil end
  local cached=self.questTitleCache and self.questTitleCache[id]
  if cached then return cached end
  local loc=QuestLocale(id)
  local title=nil
  if type(loc)=="table" then title=loc["T"] or loc[1]
  elseif type(loc)=="string" then title=loc end
  title=title or ("Quest "..tostring(id))
  self.questTitleCache[id]=title
  self.questSearchTitleCache[id]=string.lower(title)
  return title
end

function DB:GetQuestSearchTitle(id)
  if not self.ready then return nil end
  local cached=self.questSearchTitleCache and self.questSearchTitleCache[id]
  if cached then return cached end
  local title=self:GetQuestTitle(id)
  return title and string.lower(title) or nil
end

function DB:GetQuestSearchIndex()
  if not self.ready then return {} end
  return self.questSearchTitleCache or {}
end

function DB:GetQuestRewards(id)
  if not self.ready then return nil end
  return QuestieOcto.QuestRewardsData and QuestieOcto.QuestRewardsData[tonumber(id)] or nil
end

-- Questie Journey presents the quest's authored objective/description text
-- rather than reconstructing every objective from database entity rows.
-- pfDB's localized quest table stores that objective sentence in field "O".
function DB:GetQuestObjectiveText(id)
  if not self.ready then return nil end
  local loc=QuestLocale(id)
  if type(loc)=="table" then
    local text=loc["O"]
    if type(text)=="string" and text~="" then return text end
  end
  return nil
end

-- pfDB's localized quest table stores the main quest-offer description in
-- field "D". Keep it separate from "O" (the objective summary), matching the
-- way the Vanilla quest dialog presents description and objectives.
function DB:GetQuestDescriptionText(id)
  if not self.ready then return nil end
  local loc=QuestLocale(id)
  if type(loc)=="table" then
    local text=loc["D"]
    if type(text)=="string" and text~="" then return text end
  end
  return nil
end

function DB:GetItemRaw(id)
  if not self.ready then return nil end
  return QuestieOcto.Database:GetRawItem(id)
end

function DB:GetCreatureRaw(id)
  if not self.ready then return nil end
  return QuestieOcto.Database:GetRawUnit(id)
end

function DB:GetObjectRaw(id)
  if not self.ready then return nil end
  return QuestieOcto.Database:GetRawObject(id)
end

function DB:GetItemName(id)
  if pfDB and pfDB.items and pfDB.items.loc then
    local loc=pfDB.items.loc[id]
    if type(loc)=="string" and loc~="" then return loc end
  end

  if C_Item and C_Item.GetItemNameByID then
    local name=C_Item.GetItemNameByID(id)
    if name then return name end
  end

  if GetItemInfo then
    local name=GetItemInfo(id)
    if name then return name end
  end

  return "Item "..tostring(id)
end

function DB:GetCreatureName(id)
  if pfDB and pfDB.units and pfDB.units.loc then
    local loc=pfDB.units.loc[id]
    if type(loc)=="string" then return loc end
  end
  return "Creature "..tostring(id)
end

function DB:GetObjectName(id)
  if pfDB and pfDB.objects and pfDB.objects.loc then
    local loc=pfDB.objects.loc[id]
    if type(loc)=="string" then return loc end
  end
  return "Object "..tostring(id)
end

function DB:GetZoneName(id)
  if not self.ready then return nil end
  id=tonumber(id)
  if not id then return nil end
  if pfDB and pfDB.zones and pfDB.zones.loc then
    local loc=pfDB.zones.loc[id]
    if type(loc)=="string" and loc~="" then return loc end
  end
  return nil
end

function DB:GetItemSources(id)
  local raw=self:GetItemRaw(id)
  if not raw then return nil end

  return {
    Creature=raw["U"],
    GameObject=raw["O"],
    Reference=raw["R"],
    Vendor=raw["V"],
  }
end

function DB:GetReferenceLootRaw(id)
  if not self.ready then return nil end
  if not pfDB or not pfDB.refloot or not pfDB.refloot.data then return nil end
  return pfDB.refloot.data[id]
end

function DB:GetCreatureCoords(id)
  local raw=self:GetCreatureRaw(id)
  return raw and raw["coords"] or nil
end

function DB:GetObjectCoords(id)
  local raw=self:GetObjectRaw(id)
  return raw and raw["coords"] or nil
end

function DB:OnLegacyReady()
  self.ready=false
  self.questTitleCache={}
  self.questSearchTitleCache={}
  self.clientMapNameIndex=nil
  self.packagedMapNameIndex=nil

  -- The compiled release database ships the exact sorted quest-ID list. Avoid
  -- walking all 6,700 quests and lowercasing every title during login; titles
  -- and search strings are cached lazily when a consumer actually asks for them.
  if QuestieOcto.RuntimeQuestIDs then
    self.questIDs=QuestieOcto.RuntimeQuestIDs
    self.ready=true
    QuestieOcto:SendMessage("DATABASE_API_READY")
    return
  end

  -- Source/reference fallback: build incrementally when no compiled index exists.
  self.questIDs={}
  local data=pfDB and pfDB.quests and pfDB.quests.data or {}
  local cursor=nil

  local function Slice()
    local count=0
    while count<100 do
      local key=next(data,cursor)
      if key==nil then
        table.sort(DB.questIDs)
        DB.ready=true
        QuestieOcto:SendMessage("DATABASE_API_READY")
        return
      end
      cursor=key
      table.insert(DB.questIDs,key)
      count=count+1
    end
    QuestieOcto.Scheduler:Enqueue(Slice,"database-quest-id-cache")
  end

  QuestieOcto.Scheduler:Enqueue(Slice,"database-quest-id-cache")
end

QuestieOcto:RegisterMessage("DATABASE_READY",DB,"OnLegacyReady")


function DB:GetQuestItemRequirementRaw(id)
  if not self.ready then return nil end
  if not pfDB or not pfDB["quests-itemreq"] or not pfDB["quests-itemreq"].data then return nil end
  return pfDB["quests-itemreq"].data[id]
end

function DB:GetCreatureType(id)
  local raw=self:GetCreatureRaw(id)
  return raw and raw["type"] or nil
end

function DB:GetCreatureRank(id)
  local raw=self:GetCreatureRaw(id)
  return raw and (raw["rnk"] or raw["rank"]) or nil
end

function DB:GetCreatureLevelRange(id)
  local raw=self:GetCreatureRaw(tonumber(id))
  local level=raw and raw["lvl"]
  if not level then return nil end
  local text=tostring(level)
  local _,_,low,high=string.find(text,"^(%d+)%s*%-%s*(%d+)$")
  low=tonumber(low) or tonumber(text)
  high=tonumber(high) or low
  if not low or low<=0 or high<low then return nil end
  return low,high
end

function DB:GetCreatureFaction(id)
  local raw=self:GetCreatureRaw(id)
  return raw and (raw["fac"] or raw["faction"]) or nil
end

function DB:GetObjectFaction(id)
  local raw=self:GetObjectRaw(id)
  return raw and (raw["fac"] or raw["faction"]) or nil
end

function DB:GetPlayerFactionCode()
  local group=UnitFactionGroup and UnitFactionGroup("player") or nil
  if group=="Alliance" then return "A" end
  if group=="Horde" then return "H" end
  return nil
end

function DB:FactionAllowsPlayer(allowed)
  if type(allowed)~="string" or allowed=="" then return true end
  local code=self:GetPlayerFactionCode()
  if not code then return true end
  return string.find(allowed,code,1,true) and true or false
end

function DB:CreatureAllowsPlayerFaction(id)
  return self:FactionAllowsPlayer(self:GetCreatureFaction(id))
end

function DB:ObjectAllowsPlayerFaction(id)
  return self:FactionAllowsPlayer(self:GetObjectFaction(id))
end


local function AddUniqueMapName(index,name,id)
  if type(name)~="string" or name=="" then return end
  id=tonumber(id)
  if not id then return end
  local previous=index[name]
  if previous==nil then
    index[name]=id
  elseif previous~=id then
    -- A display name can legitimately refer to several current AreaTable rows
    -- (for example custom dungeon parent/wing rows). A name-only lookup cannot
    -- safely choose between them, so mark it ambiguous instead of depending on
    -- nondeterministic pairs() order.
    index[name]=false
  end
end

function DB:BuildMapNameIndexes()
  local client={}
  if QuestieOcto.API and QuestieOcto.API.GetClientAreas then
    local areas=QuestieOcto.API:GetClientAreas()
    for id,zoneName in pairs(areas or {}) do AddUniqueMapName(client,zoneName,id) end
  end
  self.clientMapNameIndex=client

  local packaged={}
  if pfDB and pfDB.zones then
    for id,zoneName in pairs(pfDB.zones.loc or {}) do AddUniqueMapName(packaged,zoneName,id) end
    if pfDB.zones.enUS and pfDB.zones.loc~=pfDB.zones.enUS then
      for id,zoneName in pairs(pfDB.zones.enUS) do AddUniqueMapName(packaged,zoneName,id) end
    end
  end
  self.packagedMapNameIndex=packaged
end

function DB:GetMapIDByName(name)
  if not self.ready or not name then return nil end
  if not self.clientMapNameIndex or not self.packagedMapNameIndex then
    self:BuildMapNameIndexes()
  end

  local client=self.clientMapNameIndex and self.clientMapNameIndex[name]
  if type(client)=="number" then return client end
  -- If the current client says the name is ambiguous, do not override that
  -- knowledge with a guessed packaged ID. Callers with map context should use
  -- the texture/BestMap paths instead.
  if client==false then return nil end

  local packaged=self.packagedMapNameIndex and self.packagedMapNameIndex[name]
  if type(packaged)=="number" then return packaged end
  return nil
end


function DB:GetCreatureLevel(id)
  local raw=self:GetCreatureRaw(id)
  return raw and raw["lvl"] or nil
end

function DB:GetCreatureRespawnSeconds(id)
  local coords=self:GetCreatureCoords(id)
  if not coords then return nil end

  local best=nil
  for _,coord in pairs(coords) do
    if type(coord)=="table" then
      local seconds=tonumber(coord[4])
      if seconds and seconds>0 then
        if not best or seconds>best then best=seconds end
      end
    end
  end

  return best
end

function DB:GetCreatureMapIDs(id)
  local result={}
  local seen={}
  local coords=self:GetCreatureCoords(id)

  if coords then
    for _,coord in pairs(coords) do
      if type(coord)=="table" and tonumber(coord[3]) then
        local mapID=tonumber(coord[3])
        if not seen[mapID] then
          seen[mapID]=true
          table.insert(result,mapID)
        end
      end
    end
  end

  table.sort(result)
  return result
end



function DB:GetProfessionName(id)
  if not self.ready then return nil end
  id=tonumber(id)
  if not id then return nil end
  local loc=pfDB and pfDB.professions and (pfDB.professions.loc or pfDB.professions.enUS)
  return loc and loc[id] or nil
end

function DB:GetTrackingMeta(metaKey)
  if not self.ready or not metaKey or not pfDB then return nil end
  -- Compiled releases contain the already-merged final meta table. Preserve the
  -- old Turtle-first fallback for source/reference builds.
  local turtle=pfDB["meta-turtle"]
  if turtle and turtle[metaKey] then return turtle[metaKey] end
  return pfDB.meta and pfDB.meta[metaKey] or nil
end

function DB:GetMinimapSize(mapID)
  mapID=tonumber(mapID)
  if not self.ready or not mapID then return nil,nil end
  if not pfDB or not pfDB["minimap"] then return nil,nil end

  local size=pfDB["minimap"][mapID]
  if type(size)~="table" then return nil,nil end

  return tonumber(size[1]),tonumber(size[2])
end
