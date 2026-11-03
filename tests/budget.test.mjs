import assert from 'node:assert/strict';
import {calculate,dollars,estimateTaxes,roundMoney} from '../budget.js';
import {JOBS,HOMES,TRAVEL,WANTS,FIXED} from '../data.js';
assert.equal(calculate({}).remaining,null);
for(const x of ['',null,undefined,-1,1.5,20001,'bad',Infinity,true,{}])assert.equal(dollars(x),null);
assert.equal(dollars('0'),0);assert.equal(dollars('20000'),20000);
for(const [job,data] of Object.entries(JOBS)){
 const b=calculate({job});assert.equal(b.weekly,roundMoney(data.rate*40));assert.equal(b.gross,roundMoney(data.rate*40*52/12));
 assert.ok(b.taxes>0&&b.income<b.gross);assert.equal(b.income,roundMoney(b.gross-b.taxes));
}
assert.equal(calculate({job:'artist'}).gross,5246.8);
assert.equal(calculate({job:'animal'}).gross,3948.53);
assert.equal(calculate({job:'coder'}).gross,11332.53);
// Federal brackets are progressive, and no tax band applies to income below its floor.
assert.deepEqual(estimateTaxes(0),{federal:0,state:0,fica:0});
const t=estimateTaxes(28500);assert.equal(t.federal,103.33);
assert.equal(calculate({home:'20'}).home,null);assert.equal(calculate({job:'toString'}).gross,null);
for(const [home,data] of Object.entries(HOMES)){
 const b=calculate({home,travel:'bike'});assert.equal(b.home,data.rent);assert.equal(b.utilities,data.electricity+data.water+data.trash);
 assert.equal(b.needs,data.rent+b.utilities+TRAVEL.bike.cost+Object.values(FIXED).reduce((a,n)=>a+n,0));
}
assert.equal(calculate({home:'apartment'}).utilities,185);assert.equal(calculate({home:'townhouse'}).utilities,250);assert.equal(calculate({home:'house'}).utilities,320);
let combos=0;for(const job of Object.keys(JOBS))for(const home of Object.keys(HOMES))for(const travel of Object.keys(TRAVEL))for(const want of Object.keys(WANTS))for(const saving of [0,100,500,10000]){
 const b=calculate({job,home,travel,want,saving});assert.equal(b.planned,b.needs+WANTS[want].cost+saving);assert.equal(b.remaining,roundMoney(b.income-b.planned));combos++;
}
const over=calculate({job:'animal',home:'house',travel:'car',want:'movie',saving:0});assert.ok(over.remaining<0);
const cheap=calculate({job:'animal',home:'apartment',travel:'bus',want:'park',saving:0});assert.ok(cheap.remaining>0);assert.equal(cheap.want,0);
assert.equal(calculate({job:'animal',home:'apartment',travel:'bus',want:'park'}).remaining,null);
console.log('PASS '+combos+' monthly budget combinations: researched pay, 52/12 conversion, tax estimate, separate home utilities, free choices, missing fields and overspending.');

// Each transport total is exactly the sum of its applicable monthly bills.
for(const [key,plan] of Object.entries(TRAVEL)){const sum=Object.values(plan.bills).reduce((total,amount)=>total+(amount??0),0);assert.equal(plan.cost,sum);assert.equal(calculate({travel:key}).travel,sum);}
assert.equal(TRAVEL.bus.name,'Public Transit');assert.equal(TRAVEL.bus.bills.pass,80);assert.equal(TRAVEL.bus.bills.gas,null);assert.equal(TRAVEL.bus.bills.insurance,null);
assert.equal(TRAVEL.car.bills.gas,150);assert.equal(TRAVEL.car.bills.insurance,160);assert.equal(TRAVEL.car.bills.maintenance,100);assert.equal(TRAVEL.car.cost,780);
assert.equal(TRAVEL.bike.cost,20);assert.equal(TRAVEL.bike.bills.payment,null);
console.log('PASS: transport components, N/A costs, and derived totals $20 / $80 / $780.');
