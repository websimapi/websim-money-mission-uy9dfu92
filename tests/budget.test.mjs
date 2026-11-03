// Run with: node --experimental-default-type=module tests/budget.test.mjs
import assert from 'node:assert/strict';
import {calculate,dollars} from '../budget.js';
assert.equal(calculate({}).remaining,null);
assert.equal(dollars(''),null);assert.equal(dollars(null),null);assert.equal(dollars('0'),0);
for(const x of [-1,1.5,1000,'oops',Infinity,true])assert.equal(dollars(x),null);
let b=calculate({job:'artist',home:'20',travel:'0',saving:'0',want:'0'});
assert.deepEqual([b.income,b.needs,b.planned,b.remaining],[100,50,50,50]);
b=calculate({job:'animal',home:'30',travel:'5',saving:'20',want:'10'});
assert.deepEqual([b.income,b.needs,b.extras,b.planned,b.remaining],[125,65,30,95,30]);
b=calculate({job:'artist',home:'40',travel:'15',saving:'20',want:'10'});assert.equal(b.remaining,-15);
b=calculate({job:'artist',home:'40',travel:'15',saving:'15',want:'0'});assert.equal(b.remaining,0);
assert.equal(calculate({job:'coder',home:'40',travel:'15',saving:'0'}).remaining,null);
assert.equal(calculate({job:'artist',home:'3',travel:'0',saving:'0',want:'0'}).needs,null);
assert.equal(calculate({job:'toString'}).income,null);
let combos=0;for(const job of ['artist','animal','coder'])for(const home of [20,30,40])for(const travel of [0,5,15])for(const saving of [0,5,20,100])for(const want of [0,5,10]){b=calculate({job,home,travel,saving,want});assert.equal(b.remaining,b.income-(home+travel+30+saving+want));combos++;}
console.log('PASS: '+combos+' budget combinations, empty fields, free choices, exact fit, overspending, and invalid inputs.');
