import {MODEL,JOBS,HOMES,TRAVEL,WANTS,FIXED,MAX_SAVING} from './data.js';
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
// Annual tax-liability estimate, averaged monthly; not an employer's exact withholding.
// Single NC resident under 65; standard deductions; no credits, dependents or pre-tax deductions.
export function estimateTaxes(annual){
 const federal=progressiveTax(Math.max(0,annual-16100));
 const state=Math.max(0,annual-12750)*.0399;
 const fica=Math.min(annual,184500)*.062+annual*.0145+Math.max(0,annual-200000)*.009;
 return {federal:roundMoney(federal/12),state:roundMoney(state/12),fica:roundMoney(fica/12)};
}
export function calculate(s={}){
 const job=lookup(JOBS,s.job),selectedHome=lookup(HOMES,s.home),selectedTravel=lookup(TRAVEL,s.travel),selectedWant=lookup(WANTS,s.want);
 const rate=job?.rate??null,weekly=rate===null?null:roundMoney(rate*MODEL.hoursPerWeek);
 const annualGross=weekly===null?null:roundMoney(weekly*MODEL.weeksPerYear);
 // Budget only two biweekly checks; annual earnings still use 52 weeks (26 checks).
 const biweekly=weekly===null?null:roundMoney(weekly*2);
 const gross=biweekly===null?null:roundMoney(biweekly*2);
 // Derive a whole-percent blended teaching estimate from the existing 2026 tax model.
 // Benchmark components are averaged over the full year, not the two-check budget month.
 const averageMonthlyGross=annualGross===null?null:annualGross/MODEL.monthsPerYear;
 const referenceTaxDetails=annualGross===null?null:estimateTaxes(annualGross);
 const referenceTaxes=referenceTaxDetails===null?null:Object.values(referenceTaxDetails).reduce((a,n)=>a+n,0);
 const taxRate=referenceTaxes===null?null:Math.floor(referenceTaxes/averageMonthlyGross*100);
 const taxes=gross===null||taxRate===null?null:roundMoney(gross*taxRate/100);
 const income=gross===null?null:roundMoney(gross-taxes);
 const home=selectedHome?.rent??null;
 const utilities=selectedHome?selectedHome.electricity+selectedHome.water+selectedHome.trash:null;
 const travel=selectedTravel?.cost??null,want=selectedWant?.cost??null,saving=dollars(s.saving);
 const fixed=Object.values(FIXED).reduce((a,b)=>a+b,0);
 const housingSubtotal=home===null?null:roundMoney(home+utilities+FIXED.rentersInsurance);
 const transportationSubtotal=travel;
 const housingNeeds=housingSubtotal===null||transportationSubtotal===null?null:roundMoney(housingSubtotal+transportationSubtotal);
 const dailyLiving=fixed-FIXED.rentersInsurance;
 const needs=housingNeeds===null?null:roundMoney(housingNeeds+dailyLiving);
 const extras=saving===null||want===null?null:saving+want;
 const lifestyleTotal=extras===null?null:roundMoney(dailyLiving+extras);
 const planned=housingNeeds===null||lifestyleTotal===null?null:roundMoney(housingNeeds+lifestyleTotal);
 const totalMonthlyExpenses=planned; // Cash-flow allocations, including savings; not purchase spending alone.
 const monthlySpending=housingNeeds===null||want===null?null:roundMoney(housingNeeds+dailyLiving+want);
 const remaining=income===null||totalMonthlyExpenses===null?null:roundMoney(income-totalMonthlyExpenses);
 const afterNeeds=income===null||needs===null?null:roundMoney(income-needs);
 return {rate,weekly,biweekly,annualGross,gross,taxRate,taxes,income,home,utilities,travel,want,saving,needs,extras,planned,remaining,afterNeeds,referenceTaxDetails,housingNeeds,housingSubtotal,transportationSubtotal,totalMonthlyExpenses,monthlySpending,dailyLiving,lifestyleTotal,...FIXED};
}
export const formatMoney=n=>n===null||n===undefined?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0,maximumFractionDigits:0}).format(roundMoney(n));
