// Restricted migration reader derived from Questline tools/lua-data.js.
// Never evaluates arbitrary Lua code.
const fs = require('node:fs');
const path = require('node:path');
let luaparse;
try { luaparse = require('luaparse'); }
catch (_) { luaparse = require(path.join(__dirname, '../../.test-tools/node_modules/luaparse')); }

function readLua(file, env, bytes = fs.readFileSync(file)) {
  // Lua strings are bytes. Decode UTF-8 after luaparse has processed Lua escapes.
  const ast = luaparse.parse(bytes.toString('latin1').replace(/^\xEF\xBB\xBF/, ''), {
    luaVersion: '5.1', encodingMode: 'pseudo-latin1', comments: false,
  });
  function value(n, scope) {
    if (!n) return undefined;
    switch (n.type) {
      case 'StringLiteral': return Buffer.from(n.value, 'latin1').toString('utf8');
      case 'NumericLiteral': case 'BooleanLiteral': return n.value;
      case 'NilLiteral': return undefined;
      case 'Identifier': return scope[n.name];
      case 'IndexExpression': return value(n.base, scope)?.[value(n.index, scope)];
      case 'MemberExpression': return value(n.base, scope)?.[n.identifier.name];
      case 'UnaryExpression':
        if (n.operator === '-') return -value(n.argument, scope);
        break;
      case 'LogicalExpression': {
        const left=value(n.left,scope),truthy=left!==false&&left!==undefined&&left!==null;
        if(n.operator==='or') return truthy?left:value(n.right,scope);
        if(n.operator==='and') return truthy?value(n.right,scope):left;
        break;
      }
      case 'BinaryExpression':
        if (n.operator === '..') return String(value(n.left, scope)) + String(value(n.right, scope));
        break;
      case 'TableConstructorExpression': {
        const table = {}; let i = 1;
        for (const field of n.fields) {
          const key = field.type === 'TableValue' ? i++ : field.type === 'TableKeyString' ? field.key.name : value(field.key, scope);
          table[key] = value(field.value, scope);
        }
        return table;
      }
    }
    throw Error(`${file}: unsupported data expression ${n.type} ${n.operator || ''}`);
  }
  function block(nodes, scope) {
    for (const n of nodes) {
      if (n.type === 'AssignmentStatement' || n.type === 'LocalStatement') {
        const vals = n.init.map(v => value(v, scope));
        n.variables.forEach((v, i) => {
          if (v.type === 'Identifier') scope[v.name] = vals[i];
          else if (v.type === 'IndexExpression') {
            const base = value(v.base, scope), key = value(v.index, scope);
            if (!base || typeof base !== 'object') throw Error(`${file}: missing table for patch key ${key}`);
            if (vals[i] === undefined) delete base[key]; else base[key] = vals[i];
          } else if (v.type === 'MemberExpression') {
            const base = value(v.base, scope), key = v.identifier.name;
            if (!base || typeof base !== 'object') throw Error(`${file}: missing table for member ${key}`);
            if (vals[i] === undefined) delete base[key]; else base[key] = vals[i];
          } else throw Error(`${file}: unsupported assignment ${v.type}`);
        });
      } else if (n.type === 'DoStatement') block(n.body, Object.create(scope));
      else if (n.type === 'IfStatement') {
        for (const clause of n.clauses) {
          const test = clause.condition ? value(clause.condition, scope) : true;
          if (test !== false && test !== undefined && test !== null) { block(clause.body, Object.create(scope)); break; }
        }
      } else if (n.type === 'ForGenericStatement') {
        const call = n.iterators[0];
        if (call.type !== 'CallExpression' || call.base.name !== 'pairs') throw Error(`${file}: only pairs loops are accepted`);
        for (const [key, val] of Object.entries(value(call.arguments[0], scope))) {
          const child = Object.create(scope);
          child[n.variables[0].name] = /^-?\d+$/.test(key) ? Number(key) : key;
          if (n.variables[1]) child[n.variables[1].name] = val;
          block(n.body, child);
        }
      } else throw Error(`${file}: unsupported statement ${n.type}`);
    }
  }
  block(ast.body, env);
  return env;
}

function lua(value) {
  if (value === null || value === undefined) return 'nil';
  if (typeof value === 'string') return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, c => '\\' + c.charCodeAt(0).toString().padStart(3, '0')) + '"';
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return '{' + value.map(lua).join(',') + '}';
  // Shared JSON preserves one-based Lua sequences as objects. Emit native Lua
  // array constructors again, matching the baseline's allocation behavior.
  const keys=Object.keys(value);
  if(keys.length && keys.every((key,i)=>key===String(i+1))) return '{'+keys.map(key=>lua(value[key])).join(',')+'}';
  return '{' + Object.entries(value).map(([k,v]) => '[' + (/^-?\d+$/.test(k) ? k : lua(k)) + ']=' + lua(v)).join(',') + '}';
}
module.exports = { readLua, lua, luaparse };
