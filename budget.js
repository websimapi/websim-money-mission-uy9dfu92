import {MODEL,JOBS,HOMES,TRAVEL,WANTS,FIXED,MAX_SAVING,OPTIONAL_BILLS,FUN_OPTIONS,MAX_FUN_CHOICES,FUN_WEEKS_PER_MONTH,normalizeJobKey} from './data.js';
export {JOBS,HOMES,TRAVEL,WANTS,FIXED,MAX_SAVING} from './data.js';
export const HOURS_PER_WEEK=MODEL.hoursPerWeek;
// Floor each calculated amount, not just its label, so the whole-dollar rows reconcile.
export const roundMoney=n=>Math.floor(n);
export function dollars(raw){
 if(raw===null||raw===undefined||typeof raw==='boolean'||typeof raw==='object'||String(raw).trim()==='')return null;
 const n=Number(raw);return Number.isFinite(n)&&Number.isInteger(n)&&n>=0&&n<=MAX_SAVING?n:null;
}
function lookup(table,key){return typeof key==='string'&&Object.hasOwn(table,key)?table[key]:null;}
function progressiveTax(taxable){
 const bands=[[12400,.10],[50400,.12],[105700,.22],[201775,.24],[256225,.32],[640600,.35],[Infinity,.37]];
 let tax=0,previous=0;
 for(const [ceiling,rate] of bands){tax+=Math.max(0,Math.min(taxable,ceiling)-previous)*rate;if(taxable<=ceiling)break;previous=ceiling;}
 return tax;
}
// Reference-only 2026 tax model retained for comparison; calculate() uses the flat classroom rate.
// Annual tax-liability estimate, averaged monthly; not an employer's exact withholding.
// Single NC resident under 65; standard deductions; no credits, dependents or pre-tax deductions.
export function estimateTaxes(annual){
 const federal=progressiveTax(Math.max(0,annual-16100));
 const state=Math.max(0,annual-12750)*.0399;
 const fica=Math.min(annual,184500)*.062+annual*.0145+Math.max(0,annual-200000)*.009;
 return {federal:roundMoney(federal/12),state:roundMoney(state/12),fica:roundMoney(fica/12)};
}
export function isBillIncluded(s={},key){
 if(!OPTIONAL_BILLS.includes(key))return true;
 const bills=s.bills;
 return !(bills&&typeof bills==='object'&&!Array.isArray(bills)&&Object.hasOwn(bills,key)&&bills[key]===false);
}
export function normalizeFunSelection(s={}){
 const legacy={park:['park'],treat:['lunch'],movie:['movie','books']};
 const raw=Array.isArray(s.fun)?s.fun:(typeof s.want==='string'&&Object.hasOwn(legacy,s.want)?legacy[s.want]:[]);
 return [...new Set(raw.filter(key=>typeof key==='string'&&Object.hasOwn(FUN_OPTIONS,key)))].slice(0,MAX_FUN_CHOICES);
}
export function calculate(s={}){
 const job=lookup(JOBS,normalizeJobKey(s.job)),selectedHome=lookup(HOMES,s.home),selectedTravel=lookup(TRAVEL,s.travel);
 const rate=job?.rate??null,weekly=rate===null?null:roundMoney(rate*MODEL.hoursPerWeek);
 const annualGross=weekly===null?null:roundMoney(weekly*MODEL.weeksPerYear);
 // Budget only two biweekly checks; annual earnings still use 52 weeks (26 checks).
 const biweekly=weekly===null?null:roundMoney(weekly*2);
 const gross=biweekly===null?null:roundMoney(biweekly*2);
 // One flat classroom estimate for every career, not actual statutory tax or withholding.
 const taxRate=MODEL.taxRate;
 const taxes=gross===null?null:roundMoney(gross*taxRate/100);
 const income=gross===null?null:roundMoney(gross-taxes);
 const home=selectedHome?.rent??null;
 const utilities=selectedHome?selectedHome.electricity+selectedHome.water+selectedHome.trash:null;
 const travel=selectedTravel?.cost??null,saving=dollars(s.saving);
 const funChoices=normalizeFunSelection(s);
 const weeklyFun=funChoices.reduce((sum,key)=>sum+FUN_OPTIONS[key].cost,0);
 const want=weeklyFun*FUN_WEEKS_PER_MONTH;
 const billChoices=Object.fromEntries(OPTIONAL_BILLS.map(key=>[key,isBillIncluded(s,key)]));
 const housingSubtotal=home===null?null:roundMoney(home+utilities+FIXED.rentersInsurance);
 const transportationSubtotal=travel;
 const housingNeeds=housingSubtotal===null||transportationSubtotal===null?null:roundMoney(housingSubtotal+transportationSubtotal);
 const dailyLiving=FIXED.food+OPTIONAL_BILLS.reduce((total,key)=>total+(billChoices[key]?FIXED[key]:0),0);
 const needs=housingNeeds===null?null:roundMoney(housingNeeds+dailyLiving);
 const extras=saving===null||want===null?null:saving+want;
 const lifestyleTotal=extras===null?null:roundMoney(dailyLiving+extras);
 const planned=housingNeeds===null||lifestyleTotal===null?null:roundMoney(housingNeeds+lifestyleTotal);
 const totalMonthlyExpenses=planned; // Cash-flow allocations, including savings; not purchase spending alone.
 const monthlySpending=housingNeeds===null||want===null?null:roundMoney(housingNeeds+dailyLiving+want);
 const remaining=income===null||totalMonthlyExpenses===null?null:roundMoney(income-totalMonthlyExpenses);
 const afterNeeds=income===null||needs===null?null:roundMoney(income-needs);
 return {rate,weekly,biweekly,annualGross,gross,taxRate,taxes,income,home,utilities,travel,want,weeklyFun,funChoices,saving,needs,extras,planned,remaining,afterNeeds,housingNeeds,housingSubtotal,transportationSubtotal,totalMonthlyExpenses,monthlySpending,dailyLiving,lifestyleTotal,billChoices,...FIXED};
}
export const formatMoney=n=>n===null||n===undefined?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0,maximumFractionDigits:0}).format(roundMoney(n));
