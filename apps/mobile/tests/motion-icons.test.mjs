import test from 'node:test';
import assert from 'node:assert/strict';
import { resampleIcon, buildPlan, allocOutputs, interpPolar, serialize } from 'morphicons';
import { motionIcons } from '../src/services/motion-icons.ts';
test('every installed morph pair produces a finite SVG at endpoints and during transition', () => {
 for (const [name, [from,to]] of Object.entries(motionIcons)) {
  const plan=buildPlan(resampleIcon(from),resampleIcon(to));
  const out=allocOutputs(plan);
  for(const t of [0,0.25,0.5,0.75,1]) {
   interpPolar(plan,t,out);
   const path=serialize(out,plan.items.map(item=>item.closed));
   assert.ok(path.length>10,name);
   assert.doesNotMatch(path,/NaN|Infinity|undefined/,name);
  }
 }
});
