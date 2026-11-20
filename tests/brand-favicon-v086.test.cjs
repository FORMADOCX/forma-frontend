const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','src','app');
test('approved FORMA brand favicon assets are valid and correctly sized',()=>{
 const svg=fs.readFileSync(path.join(root,'icon.svg'),'utf8');
 assert.match(svg,/<svg\s/);
 assert.match(svg,/viewBox="0 0 64 64"/);
 assert.match(svg,/#06432a/);
 assert.match(svg,/#75bf57/);
 for(const [name,size] of [['favicon-16.png',16],['favicon-32.png',32],['apple-icon.png',180]]){
  const b=fs.readFileSync(path.join(root,name));
  assert.deepEqual([...b.subarray(0,8)],[137,80,78,71,13,10,26,10]);
  assert.equal(b.readUInt32BE(16),size);
  assert.equal(b.readUInt32BE(20),size);
 }
});
