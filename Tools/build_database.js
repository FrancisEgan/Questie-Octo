// Questie-Octo's adapter from the pinned OctoQuestDatabase source tables.
const fs=require('node:fs'),path=require('node:path');
const {loadDatabase,copyNotices,sha256}=require('./shared-database');
const {lua}=require('./lua-data');
const root=path.resolve(__dirname,'..');
const sourceNotes=JSON.parse(fs.readFileSync(path.join(__dirname,'database-source-notes.json'),'utf8'));
const {data,manifest,lock,sourceRoot}=loadDatabase(root);
copyNotices(sourceRoot,manifest,path.join(root,'LICENSES/OctoQuestDatabase'));
const out=path.join(root,'Data/runtime');fs.mkdirSync(out,{recursive:true});
const outputs=[];
function write(relative,body,history='') {
  const bytes=(history?'-- Historical source notes (upstream revision recorded in Docs/DATABASE_MIGRATION.json):\n'+history+'\n':'')+body+'\n';
  fs.writeFileSync(path.join(root,relative),bytes);outputs.push({file:relative,sha256:sha256(bytes)});
}
function assignment(relative,target,records) {
  write(relative,target+'={\n'+Object.entries(records).map(([key,value])=>'['+lua(/^-?\d+$/.test(key)?Number(key):key)+']='+lua(value)).join(',\n')+'\n}');
}
const buckets={};
for(const name of ['areatrigger','items','objects','quests','quests-itemreq','refloot','units','zones']) buckets[name]={data:{}};
for(const name of ['items','objects','quests','units','zones','professions']) (buckets[name]||={}).enUS={};
buckets.meta={};buckets.minimap={};
write('Data/runtime/init.lua','QuestieOcto.RuntimeDatabaseSource='+lua(lock)+'\nQuestieOcto.RuntimePFDB='+lua(buckets)+'\nQuestieOcto.RuntimePFDB["octo-compiled-runtime"]=true');
for(const name of ['quests','items','units','objects','refloot','quests-itemreq','zones','areatrigger']) assignment('Data/runtime/'+name+'.lua','QuestieOcto.RuntimePFDB['+lua(name)+']["data"]',data[name]);
for(const name of ['minimap','meta']) assignment('Data/runtime/'+name+'.lua','QuestieOcto.RuntimePFDB['+lua(name)+']',data[name]);
assignment('Data/runtime/enUS.lua','QuestieOcto.RuntimeLocales',data.locales);
assignment('Data/runtime/scripted-encounters.lua','QuestieOcto.RuntimeScriptedEncounters',data.scriptedEncounters);
const ids=Object.keys(data.quests).map(Number).sort((a,b)=>a-b);
write('Data/runtime/quest-ids.lua','QuestieOcto.RuntimeQuestIDs='+lua(ids));
const maps={};
function index(coords,id) {
  for(const coord of Object.values(coords||{})) {
    const map=Number(coord[3]);if(!Number.isFinite(map)) continue;
    (maps[map]||=new Set()).add(id);
  }
}
for(const id of ids) {
  const start=data.quests[id].start||{};
  for(const unit of Object.values(start.U||{})) {
    // Existing Questie map presentation exception; canonical spawn data is unchanged.
    if(id===3861&&Number(unit)===620) {index({1:{1:55.6,2:30.9,3:40,4:300}},id);continue;}
    let coords=data.units[unit]?.coords;
    if(!coords||!Object.keys(coords).length) {
      const scripted=data.scriptedEncounters[unit];
      if(scripted&&(!scripted.roles||scripted.roles.available)) coords=scripted.coords||coords;
    }
    index(coords,id);
  }
  for(const object of Object.values(start.O||{})) index(data.objects[object]?.coords,id);
  for(const item of Object.values(start.I||{})) {
    for(const unit of Object.keys(data.items[item]?.U||{})) index(data.units[unit]?.coords,id);
    for(const object of Object.keys(data.items[item]?.O||{})) index(data.objects[object]?.coords,id);
  }
}
const candidates=Object.fromEntries(Object.entries(maps).map(([map,quests])=>[map,[...quests].sort((a,b)=>a-b)]));
assignment('Data/runtime/map-candidates.lua','QuestieOcto.RuntimeMapCandidateIndex',candidates);
const count=table=>Object.keys(table||{}).length;
const stats={quests:ids.length,maps:count(candidates),links:Object.values(candidates).reduce((sum,list)=>sum+list.length,0),items:count(data.items),units:count(data.units),objects:count(data.objects),refloot:count(data.refloot),itemreq:count(data['quests-itemreq']),itemNames:count(data.locales.items),unitNames:count(data.locales.units),objectNames:count(data.locales.objects),pruned:true};
assignment('Data/runtime/runtime-stats.lua','QuestieOcto.RuntimeDatabaseStats',stats);
write('Data/runtime/finalize.lua',`local db=QuestieOcto.RuntimePFDB
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
QuestieOcto.RuntimeLocales=nil`);
const s=data.supplemental;
const supplementalFiles={
  EventSchedule:{EventScheduleData:s.eventSchedule},CalendarEventRules:{CalendarEventRules:s.calendarRules},QuestRewards:{QuestRewardsData:s.rewards},QuestObjectiveRequirements:{QuestObjectiveRequirements:s.objectiveRequirements},ScriptedEncounters:{ScriptedEncounterData:data.scriptedEncounters},
  QuestProgression:{'Progression.nextByQuest':s.progression.nextByQuest},QuestDirectProgression:{'Progression.directOnlyNextByQuest':s.progression.directOnlyNextByQuest,'Progression.directRepeatableQuest':s.progression.directRepeatableQuest},QuestChainAvailability:{'Progression.chainOnlyPrevByQuest':s.progression.chainOnlyPrevByQuest},PvPQuestTypes:{PvPQuestTypes:s.pvpTypes},EliteQuestTypes:{EliteQuestTypes:s.eliteTypes}
};
for(const [file,fields] of Object.entries(supplementalFiles)) {
  const notes=sourceNotes[file]||'';
  const prefix=file.startsWith('Quest')&&Object.keys(fields).some(key=>key.startsWith('Progression.'))?'QuestieOcto.Progression=QuestieOcto.Progression or {}\n':'';
  write('Data/'+file+'.lua',prefix+Object.entries(fields).map(([field,records])=>'QuestieOcto.'+field+'='+lua(records)).join('\n'),notes);
}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({schemaVersion:1,source:'OctoQuestDatabase',...lock,inputs:manifest.files,outputs,stats},null,2)+'\n');
console.log(JSON.stringify({sourceRevision:lock.revision,...stats},null,2));
