// Validate generated files and source parity; execute only packaged Lua in a fresh VM.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {readLua,luaparse}=require('./lua-data');
const {loadDatabase,sha256}=require('./shared-database');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'Data/runtime/manifest.json'),'utf8'));
const lock=JSON.parse(fs.readFileSync(path.join(root,'database-source.json'),'utf8'));
assert.equal(manifest.revision,lock.revision);
let checks=0;
const env={QuestieOcto:{},pfDB:{sentinel:true}};
for(const entry of manifest.outputs) {
  const file=path.join(root,entry.file),bytes=fs.readFileSync(file);
  assert.equal(sha256(bytes),entry.sha256,'Generated output changed: '+entry.file);
  luaparse.parse(bytes.toString('utf8'),{luaVersion:'5.1'});
  readLua(file,env);checks++;
}
const db=env.QuestieOcto.RuntimePFDB;
assert.equal(db['octo-compiled-runtime'],true);assert.equal(db['octo-enrichment-complete'],true);
assert.deepEqual(env.pfDB,{sentinel:true});
assert.equal(env.QuestieOcto.RuntimeDatabaseSource.revision,lock.revision);
assert.deepEqual(env.QuestieOcto.RuntimeQuestIDs,Object.fromEntries(Object.keys(db.quests.data).map(Number).sort((a,b)=>a-b).map((id,i)=>[i+1,id])));
checks+=5;
const sourceRoot=process.argv[2]||path.join(root,'../OctoQuestDatabase');
if(fs.existsSync(sourceRoot)) {
  const {data}=loadDatabase(root,[sourceRoot]);
  for(const name of ['quests','items','units','objects','refloot','quests-itemreq','zones','areatrigger']) {assert.deepEqual(db[name].data,data[name],name);checks++;}
  for(const name of ['minimap','meta']) {assert.deepEqual(db[name],data[name],name);checks++;}
  for(const [name,records] of Object.entries(data.locales)) {assert.deepEqual(db[name].enUS,records);assert.equal(db[name].loc,db[name].enUS);checks++;}
  assert.deepEqual(env.QuestieOcto.RuntimeScriptedEncounters,data.scriptedEncounters);
  assert.deepEqual(env.QuestieOcto.ScriptedEncounterData,data.scriptedEncounters);
  const expected={EventScheduleData:data.supplemental.eventSchedule,CalendarEventRules:data.supplemental.calendarRules,QuestRewardsData:data.supplemental.rewards,QuestObjectiveRequirements:data.supplemental.objectiveRequirements,Progression:data.supplemental.progression,PvPQuestTypes:data.supplemental.pvpTypes,EliteQuestTypes:data.supplemental.eliteTypes};
  for(const [name,records] of Object.entries(expected)) {assert.deepEqual(env.QuestieOcto[name],records,name);checks++;}
  checks+=2;
}
let fengari;
try {fengari=require('fengari');}catch(_){fengari=require(path.join(root,'../.test-tools/node_modules/fengari'));}
const {lua,lauxlib,lualib,to_luastring,to_jsstring}=fengari;
const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);
function execute(source,name) {
  let status=lauxlib.luaL_loadbuffer(L,to_luastring(source),null,to_luastring(name));
  if(status===0) status=lua.lua_pcall(L,0,0,0);
  if(status!==0) throw Error(name+': '+to_jsstring(lua.lua_tostring(L,-1)));
}
execute('QuestieOcto={} pfDB={sentinel=true}','fixture');
// Match TOC order, without loading the other addon or the source repository.
const toc=fs.readFileSync(path.join(root,'Questie-Octo.toc'),'utf8').split(/\r?\n/);
for(const line of toc) {
  const file=line.trim().replace(/\\/g,'/');
  if(manifest.outputs.some(entry=>entry.file===file)) {execute(fs.readFileSync(path.join(root,file),'utf8'),file);checks++;}
}
execute(`assert(pfDB.sentinel==true and next(pfDB,"sentinel")==nil)
assert(QuestieOcto.RuntimePFDB["octo-enrichment-complete"]==true)
assert(QuestieOcto.RuntimePFDB.quests.loc==QuestieOcto.RuntimePFDB.quests.enUS)
assert(QuestieOcto.RuntimeLocales==nil)
assert(QuestieOcto.RuntimeQuestIDs[1]==2)
assert(QuestieOcto.ScriptedEncounterData[1946].anchorObject==1557)
assert(QuestieOcto.RuntimePFDB.quests.data[80300].disabled==1)
assert(QuestieOcto.RuntimePFDB.quests.data[700001].disabled==1)`, 'standalone assertions');
execute(`local q=QuestieOcto.RuntimePFDB.quests.data[786]
assert(q.pre==nil)
assert(q.start.U[1]==3140 and q.min==5 and q.race==434)
assert(q.obj.O[1]==3189 and q.obj.O[2]==3190 and q.obj.O[3]==3192)`, 'Thwarting Kolkar Aggression regression');
lua.lua_close(L);
console.log('Questie-Octo database: '+checks+' checks passed; TOC database files executed standalone.');
