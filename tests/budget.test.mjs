import assert from 'node:assert/strict';
import {calculate,dollars,estimateTaxes,roundMoney,formatMoney} from '../budget.js';
import {JOBS,HOMES,TRAVEL,WANTS,FIXED} from '../data.js';
assert.equal(calculate({}).remaining,null);
for(const x of ['',null,undefined,-1,1.5,20001,'bad',Infinity,true,{}])assert.equal(dollars(x),null);
assert.equal(dollars('0'),0);assert.equal(dollars('20000'),20000);
for(const [job,data] of Object.entries(JOBS)){
 const b=calculate({job});assert.equal(b.weekly,roundMoney(data.rate*40));assert.equal(b.gross,roundMoney(data.rate*40*4));
 assert.ok(b.taxes>0&&b.income<b.gross);assert.equal(b.income,roundMoney(b.gross-b.taxes));
}
assert.equal(calculate({job:'artist'}).gross,4800);
assert.equal(calculate({job:'animal'}).gross,3520);
assert.equal(calculate({job:'coder'}).gross,10400);
// Federal brackets are progressive, and no tax band applies to income below its floor.
assert.deepEqual(estimateTaxes(0),{federal:0,state:0,fica:0});
const t=estimateTaxes(28500);assert.equal(t.federal,103);
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
console.log('PASS '+combos+' monthly budget combinations: researched pay, two-biweekly-check monthly budget, tax estimate, separate home utilities, free choices, missing fields and overspending.');

// Each transport total is exactly the sum of its applicable monthly bills.
for(const [key,plan] of Object.entries(TRAVEL)){const sum=Object.values(plan.bills).reduce((total,amount)=>total+(amount??0),0);assert.equal(plan.cost,sum);assert.equal(calculate({travel:key}).travel,sum);}
assert.equal(TRAVEL.bus.name,'Public Transit');assert.equal(TRAVEL.bus.bills.pass,80);assert.equal(TRAVEL.bus.bills.gas,null);assert.equal(TRAVEL.bus.bills.insurance,null);
assert.equal(TRAVEL.car.bills.gas,150);assert.equal(TRAVEL.car.bills.insurance,160);assert.equal(TRAVEL.car.bills.maintenance,100);assert.equal(TRAVEL.car.cost,780);
assert.equal(TRAVEL.bike.cost,20);assert.equal(TRAVEL.bike.bills.payment,null);
console.log('PASS: transport components, N/A costs, and derived totals $20 / $80 / $780.');

// Living costs appear in Step 3 only: the Step 2 subtotal includes no groceries or subscriptions.
for(const home of Object.keys(HOMES)){const b=calculate({home,travel:'bus',want:'park',saving:100});assert.equal(b.housingNeeds,HOMES[home].rent+b.utilities+80+20);assert.equal(b.dailyLiving,985);assert.equal(b.lifestyleTotal,1085);assert.equal(b.planned,b.housingNeeds+b.lifestyleTotal);}
assert.equal(calculate({want:'treat',saving:200}).lifestyleTotal,1235);assert.equal(FIXED.subscriptions,30);
console.log('PASS: Step 2/3 split, $985 living bills, and lifestyle totals without duplicate bills.');

// Summary categories are independent and add up exactly once.
const separateHousing=calculate({home:'apartment'});assert.equal(separateHousing.housingSubtotal,1505);assert.equal(separateHousing.transportationSubtotal,null);
const separateTransit=calculate({travel:'bus'});assert.equal(separateTransit.transportationSubtotal,80);assert.equal(separateTransit.housingSubtotal,null);
for(const home of Object.keys(HOMES))for(const travel of Object.keys(TRAVEL)){const b=calculate({job:'artist',home,travel,want:'treat',saving:200});assert.equal(b.totalMonthlyExpenses,b.housingSubtotal+b.transportationSubtotal+b.lifestyleTotal);assert.equal(b.monthlySpending+200,b.totalMonthlyExpenses);assert.equal(b.remaining,roundMoney(b.income-b.totalMonthlyExpenses));}
console.log('PASS: housing/transportation/lifestyle subtotals, expenses B, and remaining cash A minus B.');

assert.equal(Object.keys(JOBS).length,6);for(const [key,job] of Object.entries(JOBS)){assert.equal(job.rate,Math.floor(job.publishedRate));assert.ok(job.qualification);const b=calculate({job:key,home:'apartment',travel:'bus',want:'park',saving:200});for(const n of Object.values(b)){if(typeof n==='number')assert.ok(Number.isInteger(n),key+' has an integer amount');}assert.ok(Number.isInteger(b.taxRate));assert.equal(b.biweekly,b.weekly*2);assert.equal(b.gross,b.biweekly*2);assert.equal(b.taxes,Math.floor(b.gross*b.taxRate/100));assert.equal(b.annualGross,b.biweekly*26);assert.equal(b.income+b.taxes,b.gross);assert.equal(b.remaining+b.totalMonthlyExpenses,b.income);}
assert.equal(roundMoney(25.99),25);assert.equal(roundMoney(-25.01),-26);assert.equal(formatMoney(25.99),'$25');assert.equal(formatMoney(-25.01),'-$26');assert.equal(formatMoney(null),'—');
console.log('PASS: six career qualifications, floor rounding, integer tax components, and reconciling whole-dollar totals.');

assert.equal(calculate({}).biweekly,null);assert.equal(calculate({}).taxRate,null);assert.equal(calculate({}).taxes,null);
const pay=calculate({job:'artist'});assert.equal(pay.weekly,1200);assert.equal(pay.biweekly,2400);assert.equal(pay.gross,4800);assert.equal(pay.taxRate,19);assert.equal(pay.taxes,912);assert.equal(pay.income,3888);assert.equal(pay.annualGross,62400);assert.notEqual(pay.gross,pay.annualGross/12);
console.log('PASS: weekly, biweekly, two-check monthly gross, whole-percent tax equation, and net pay.');
