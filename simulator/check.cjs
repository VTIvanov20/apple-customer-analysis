const fs = require("fs"),
  vm = require("vm"),
  assert = require("assert");
let s = fs.readFileSync("dist/app.js", "utf8").split("function rebuild()")[0];
s += `\nconst aa=build(defaults),bb=build(defaults); if(JSON.stringify(aa)!==JSON.stringify(bb))throw Error('Non-deterministic');if(aa.length!==1801)throw Error('Timeline length');for(const fr of aa){if(fr.agents.filter(a=>a.kind==='staff').length!==33)throw Error('Staff headcount');for(const a of fr.agents){if(!walk(a.f,a.x,a.y))throw Error('Obstacle collision at '+JSON.stringify(a));}} for(let z=0;z<3;z++){const r=defaults.readings[z];if(Math.abs(prediction(defaults,z,r[0])-r[1])>1e-8||Math.abs(prediction(defaults,z,r[2])-r[3])>1e-8)throw Error('Anchor mismatch');}console.log(JSON.stringify({frames:aa.length,staff:33,firstCustomers:aa[0].agents.length-33,finalCustomers:aa.at(-1).agents.length-33,checks:'deterministic, anchors, obstacle clearance, staff counts, timeline'}));`;
vm.runInNewContext(
  s,
  { document: { getElementById: () => ({}) }, console },
  { timeout: 200000 },
);
