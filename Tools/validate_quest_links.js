// Execute the shipped hyperlink handler with Vanilla-compatible API fixtures.
const fs=require('node:fs'),path=require('node:path');
const {luaparse}=require('./lua-data');
let fengari;
try {fengari=require('fengari');} catch (_) {fengari=require('../../.test-tools/node_modules/fengari');}
const {lua,lauxlib,lualib,to_luastring,to_jsstring}=fengari;
const L=lauxlib.luaL_newstate();
lualib.luaL_openlibs(L);
function execute(source,name) {
  let status=lauxlib.luaL_loadbuffer(L,to_luastring(source),null,to_luastring(name));
  if(status===0) status=lua.lua_pcall(L,0,0,0);
  if(status!==0) throw Error(name+': '+to_jsstring(lua.lua_tostring(L,-1)));
}
execute(`
table.getn=function(t) return #t end
QuestieOcto={RegisterMessage=function() end}
local titles={[706]='Fiery Blaze Enchantments',[100]='Shared title',[101]='Shared title'}
local ready=true
QuestieOcto.DatabaseAPI={
  IsReady=function() return ready end,
  GetQuestIDs=function() return {100,706,101} end,
  GetQuestTitle=function(_,id) return titles[id] end
}
function SetDatabaseReady(value) ready=value end
`, 'fixtures');
const source=fs.readFileSync(path.join(__dirname,'../UI/QuestLinkTooltip.lua'),'utf8');
luaparse.parse(source,{luaVersion:'5.1'});
execute(source,'QuestLinkTooltip.lua');
execute(`
local Q=QuestieOcto.QuestLinkTooltip
local shown,unavailable,inserted
Q.ShowQuest=function(_,id) shown=id return id==706 end
Q.ShowUnavailableQuest=function() unavailable=true end
local function check(link,title,expected)
  shown=nil unavailable=nil
  local text='|cffffff00|H'..link..'|h['..title..']|h|r'
  assert(Q:HandleSetItemRef(link,text,'LeftButton')==true)
  assert(shown==expected,link..' resolved to '..tostring(shown))
  assert((unavailable==true)==(expected~=706),link..' unavailable status')
end
check('quest:0:45','Fiery Blaze Enchantments',706)
check('quest:706:45','Fiery Blaze Enchantments',706)
check('quest2:legacy','Fiery Blaze Enchantments',706)
check('quest:0:45','Unknown title',nil)
check('quest:0:45','Shared title',nil)
check('quest2:legacy','Shared title',nil)
check('quest:999999:45','Fiery Blaze Enchantments',999999)
check('quest:invalid','Fiery Blaze Enchantments',nil)
SetDatabaseReady(false)
check('quest:0:45','Fiery Blaze Enchantments',nil)
check('quest:706:45','Fiery Blaze Enchantments',706)
SetDatabaseReady(true)
shown=nil unavailable=nil
assert(Q:HandleSetItemRef('item:4612','item','LeftButton')==false)
assert(shown==nil and unavailable==nil)
IsShiftKeyDown=function() return true end
ChatFrameEditBox={IsVisible=function() return true end,Insert=function(_,text) inserted=text end}
assert(Q:HandleSetItemRef('quest:0:45','original link','LeftButton')==true)
assert(inserted=='original link' and shown==nil and unavailable==nil)
IsShiftKeyDown=function() return false end
IsControlKeyDown=function() return true end
assert(Q:HandleSetItemRef('quest:0:45','original link','LeftButton')==true)
assert(shown==nil and unavailable==nil)
`, 'resolution cases');
console.log('Quest link validation passed (13 cases; Lua syntax checked).');
