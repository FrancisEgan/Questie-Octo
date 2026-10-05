// Optional migration evidence check against the recorded original Git baseline.
// Normal source maintenance uses tests/run.js; deliberate future corrections can differ.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {readLua,luaparse}=require('./lua-data');
const root=path.resolve(__dirname,'..');
const questie=path.resolve(process.argv[2]||root);
const questline=path.resolve(process.argv[3]||path.join(root,'../Questline'));
const migration=JSON.parse(fs.readFileSync(path.join(root,'Docs/DATABASE_MIGRATION.json'),'utf8'));
const current={QuestieOcto:{}},baseline={QuestieOcto:{}};
const runtime=['init','quests','items','units','objects','refloot','quests-itemreq','zones','areatrigger','minimap','meta','enUS','scripted-encounters','quest-ids','map-candidates','runtime-stats','finalize'];
const supplements=['EventSchedule','CalendarEventRules','QuestRewards','QuestObjectiveRequirements','ScriptedEncounters','QuestProgression','QuestDirectProgression','QuestChainAvailability','PvPQuestTypes','EliteQuestTypes'];
let checks=0;
function original(file,revision=migration.sourceRevision) {
  return execFileSync('git',['-c','safe.directory='+questie,'show',revision+':'+file],{cwd:questie,maxBuffer:64*1024*1024});
}
function checkKeys(node,file) {
  if(!node||typeof node!=='object') return;
  if(node.type==='TableKey'&&node.key.type==='StringLiteral'&&/^-?\d+$/.test(node.key.value)) throw Error('Numeric-looking string table key requires a typed-key schema: '+file);
  for(const child of Object.values(node)) {
    if(Array.isArray(child)) child.forEach(value=>checkKeys(value,file));else if(child&&typeof child==='object') checkKeys(child,file);
  }
}
for(const file of [...runtime.map(name=>'Data/runtime/'+name+'.lua'),...supplements.map(name=>'Data/'+name+'.lua')]) {
  const bytes=original(file);
  checkKeys(luaparse.parse(bytes.toString('latin1'),{encodingMode:'pseudo-latin1'}),file);
  readLua(file,baseline,bytes);readLua(path.join(questie,file),current);checks++;
}
delete current.QuestieOcto.RuntimeDatabaseSource;
assert.deepEqual(current,baseline,'All Questie runtime tables, supplemental data, indexes and flags retain the baseline values');checks++;
for(const file of fs.readdirSync(path.join(questline,'database')).filter(file=>file.endsWith('.json')&&file!=='manifest.json')) {
  const bytes=execFileSync('git',['-c','safe.directory='+questline,'show',migration.questlineBaseline.revision+':database/'+file],{cwd:questline,maxBuffer:64*1024*1024});
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(questline,'database',file),'utf8')),JSON.parse(bytes.toString('utf8')),file);checks++;
}
for(const file of fs.readdirSync(path.join(questline,'Data')).filter(file=>file.endsWith('.lua')&&file!=='Init.lua')) {
  const bytes=execFileSync('git',['-c','safe.directory='+questline,'show',migration.questlineBaseline.revision+':Data/'+file],{cwd:questline,maxBuffer:64*1024*1024});
  const old={QuestlineDB:{}},now={QuestlineDB:{}};
  for(const field of ['quests','locations','zones','zoneQuests','mobObjectives','objectObjectives','vendorObjectives','mobDropRates','npcQuests','givers','zoneGivers']) {old.QuestlineDB[field]={};now.QuestlineDB[field]={};}
  readLua(file,old,bytes);readLua(path.join(questline,'Data',file),now);
  assert.deepEqual(now,old,'Questline generated payload: '+file);checks++;
}
console.log('Migration: '+checks+' full-table/payload comparisons passed against the original baselines.');
