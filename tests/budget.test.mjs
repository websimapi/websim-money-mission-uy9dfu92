// Run with: node --experimental-default-type=module tests/budget.test.mjs
import assert from 'node:assert/strict';
import {calculate,dollars} from '../budget.js';
assert.equal(calculate({}).remaining,null);
assert.equal(dollars(''),null);assert.equal(dollars(null),null);assert.equal(dollars('0'),0);
for(const x of [-1,1.5,1201,'oops',Infinity,true])assert.equal(dollars(x),null);
let b=calculate({job:'artist',home:'300',travel:'0',saving:'0',want:'0'});
assert.deepEqual([b.income,b.needs,b.planned,b.remaining],[800,500,500,300]);
b=calculate({job:'animal',home:'400',travel:'50',saving:'20',want:'50'});
assert.deepEqual([b.income,b.needs,b.extras,b.planned,b.remaining],[1000,650,70,720,280]);
b=calculate({job:'artist',home:'500',travel:'150',saving:'0',want:'0'});assert.equal(b.remaining,-50);
b=calculate({job:'artist',home:'300',travel:'0',saving:'300',want:'0'});assert.equal(b.remaining,0);
assert.equal(calculate({job:'coder',home:'500',travel:'150',saving:'0'}).remaining,null);
assert.equal(calculate({job:'artist',home:'3',travel:'0',saving:'0',want:'0'}).needs,null);
assert.equal(calculate({job:'toString'}).income,null);
let combos=0;for(const job of ['artist','animal','coder'])for(const home of [300,400,500])for(const travel of [0,50,150])for(const saving of [0,50,200,800])for(const want of [0,25,50]){b=calculate({job,home,travel,saving,want});assert.equal(b.remaining,b.income-(home+travel+200+saving+want));combos++;}
console.log('PASS: '+combos+' budget combinations with 40-hour income; empty fields, free choices, exact fit, overspending, and invalid inputs.');
