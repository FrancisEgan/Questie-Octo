// Build-time reader for the data-only OctoQuestDatabase repository.
// Keep in sync with Questie-Octo/Tools/shared-database.js; runtime Lua never loads this.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const repository='https://github.com/FrancisEgan/OctoQuestDatabase.git';
const required=['quests','items','units','objects','refloot','quests-itemreq','zones','areatrigger','minimap','meta','locales','scriptedEncounters','supplemental'];
// JSON arrays represent one-based Lua sequences; sparse/ID maps remain objects.
function expandSequences(value) {
  if(value===null) throw Error('Shared source cannot contain JSON null');
  if(typeof value==='number'&&!Number.isFinite(value)) throw Error('Shared source cannot contain non-finite numbers');
  if(typeof value!=='object') return value;
  const array=Array.isArray(value);
  return Object.fromEntries(Object.entries(value).map(([key,child])=>[array?String(Number(key)+1):key,expandSequences(child)]));
}
function inspectDatabase(sourceRoot) {
  const entries=fs.readdirSync(path.join(sourceRoot,'source'),{withFileTypes:true});
  const files=[],data={},counts={};
  for(const entry of entries) {
    if(!entry.isFile()||!/^[-a-zA-Z0-9]+\.json$/.test(entry.name)) throw Error('Unsupported shared source file: '+entry.name);
    const file='source/'+entry.name,bytes=fs.readFileSync(path.join(sourceRoot,file));
    const records=JSON.parse(bytes.toString('utf8')),kind=path.basename(entry.name,'.json');
    if(!records||typeof records!=='object'||Array.isArray(records)) throw Error('Expected shared source table: '+kind);
    files.push({file,sha256:sha256(bytes)});counts[kind]=Object.keys(records).length;
    data[kind]=expandSequences(records);
  }
  for(const kind of required) if(!data[kind]) throw Error('Missing shared source table: '+kind);
  for(const file of ['LICENSE','NOTICE.md']) files.push({file,sha256:sha256(fs.readFileSync(path.join(sourceRoot,file)))});
  files.sort((a,b)=>a.file<b.file?-1:a.file>b.file?1:0);
  const revision='sha256:'+sha256(JSON.stringify(files));
  return {data,manifest:{schemaVersion:2,profile:'octo',locale:'enUS',revision,files,counts}};
}
function loadDatabase(addonRoot,args=process.argv.slice(2)) {
  const update=args.includes('--update-lock'),paths=args.filter(arg=>!arg.startsWith('--'));
  if(paths.length>1||args.some(arg=>arg.startsWith('--')&&arg!=='--update-lock')) throw Error('Usage: [OctoQuestDatabase path] [--update-lock]');
  const sourceRoot=path.resolve(paths[0]||process.env.OCTO_QUEST_DATABASE||path.join(addonRoot,'../OctoQuestDatabase'));
  const {data,manifest}=inspectDatabase(sourceRoot),revision=manifest.revision;
  const lockFile=path.join(addonRoot,'database-source.json');
  let lock=fs.existsSync(lockFile)?JSON.parse(fs.readFileSync(lockFile,'utf8')):null;
  if(!update&&(!lock||lock.repository!==repository||lock.revision!==revision||lock.schemaVersion!==2)) throw Error('Shared database revision differs from database-source.json. Select the pinned checkout or explicitly pass --update-lock.');
  if(update) {lock={schemaVersion:2,repository,revision};fs.writeFileSync(lockFile,JSON.stringify(lock,null,2)+'\n');}
  return {data,manifest,sourceRoot,lock};
}
function copyNotices(sourceRoot,manifest,destination) {
  fs.mkdirSync(destination,{recursive:true});
  for(const file of ['LICENSE','NOTICE.md']) fs.copyFileSync(path.join(sourceRoot,file),path.join(destination,file));
}
module.exports={loadDatabase,inspectDatabase,expandSequences,copyNotices,sha256};
