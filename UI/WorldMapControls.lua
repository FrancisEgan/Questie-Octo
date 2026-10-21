QuestieOcto.WorldMapControls = QuestieOcto.WorldMapControls or {}
local C=QuestieOcto.WorldMapControls
local labels={clustered="Clustered",full="Full Nodes"}
local AceRegistry=LibStub and LibStub("QuestieOcto-AceConfigRegistry-3.0",true)

function C:Refresh()
  if not self.dropdown then return end
  local mode=QuestieOcto.MinimapSettings:Get("objectiveNodeDensity")
  UIDropDownMenu_SetText("Quest Nodes: "..(labels[mode] or labels.clustered),self.dropdown)
end

function C:Position()
  local dropdown=self.dropdown
  if not dropdown then return end
  -- ModernMapMarkers owns Filter Markers / Find Marker. Resolve its frames
  -- when the map opens, after all addons have had time to create controls.
  local anchor=ModernMapMarkersFind_Blizz
  if anchor and not anchor:IsShown() then anchor=nil end
  if not anchor and ModernMapMarkersFilter_Blizz and ModernMapMarkersFilter_Blizz:IsShown() then
    anchor=ModernMapMarkersFilter_Blizz
  end
  if not anchor then anchor=pfQuestMapDropdown end
  local parent=anchor and anchor:GetParent() or WorldMapFrame
  dropdown:SetParent(parent)
  dropdown:SetFrameStrata(parent:GetFrameStrata())
  dropdown:SetFrameLevel(anchor and anchor:GetFrameLevel() or parent:GetFrameLevel()+10)
  local button=getglobal(dropdown:GetName().."Button")
  if button then button:SetFrameLevel(dropdown:GetFrameLevel()+2) end
  dropdown:ClearAllPoints()
  if anchor then
    dropdown:SetPoint("TOPRIGHT",anchor,"BOTTOMRIGHT",0,0)
  else
    dropdown:SetPoint("TOPRIGHT",WorldMapFrame,"TOPRIGHT",-10,-40)
  end
  local middle=anchor and getglobal(anchor:GetName().."Middle")
  local width=middle and middle:GetWidth() or 170
  UIDropDownMenu_SetWidth(width,dropdown)
  UIDropDownMenu_SetButtonWidth(width+5,dropdown)
end

function C:Initialize()
  if self.dropdown or not WorldMapFrame then return end
  local dropdown=CreateFrame("Frame","QuestieOctoNodeModeDropdown",WorldMapFrame,"UIDropDownMenuTemplate")
  self.dropdown=dropdown
  UIDropDownMenu_Initialize(dropdown,function(level)
    for _,value in ipairs({"clustered","full"}) do
      local mode=value
      local info={}
      info.text=labels[mode]
      info.value=mode
      info.checked=QuestieOcto.MinimapSettings:Get("objectiveNodeDensity")==mode
      info.tooltipTitle="Questie-Octo Objective Nodes"
      info.tooltipText="Changes objective nodes on the world map and minimap."
      info.func=function()
        local settings=QuestieOcto.MinimapSettings
        if settings:Get("objectiveNodeDensity")~=mode then
          settings:Set("objectiveNodeDensity",mode)
          if AceRegistry and AceRegistry.NotifyChange then AceRegistry:NotifyChange("Questie Options") end
        end
      end
      UIDropDownMenu_AddButton(info,level)
    end
  end)
  UIDropDownMenu_JustifyText("RIGHT",dropdown)
  dropdown:SetScript("OnShow",function()
    C:Position()
    C:Refresh()
  end)
  self:Position()
  self:Refresh()
end

local events=CreateFrame("Frame")
events:RegisterEvent("PLAYER_LOGIN")
events:SetScript("OnEvent",function()
  C:Initialize()
  events:UnregisterEvent("PLAYER_LOGIN")
end)
