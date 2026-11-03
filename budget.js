import {MODEL,JOBS,HOMES,TRAVEL,WANTS,FIXED,MAX_SAVING} from './data.js';
export {JOBS,HOMES,TRAVEL,WANTS,FIXED,MAX_SAVING} from './data.js';
export const HOURS_PER_WEEK=MODEL.hoursPerWeek;
export const roundMoney=n=>Math.round((n+Number.EPSILON)*100)/100;
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
 const gross=annualGross===null?null:roundMoney(annualGross/MODEL.monthsPerYear);
 const taxDetails=annualGross===null?null:estimateTaxes(annualGross);
 const taxes=taxDetails===null?null:roundMoney(taxDetails.federal+taxDetails.state+taxDetails.fica);
 const income=gross===null?null:roundMoney(gross-taxes);
 const home=selectedHome?.rent??null;
 const utilities=selectedHome?selectedHome.electricity+selectedHome.water+selectedHome.trash:null;
 const travel=selectedTravel?.cost??null,want=selectedWant?.cost??null,saving=dollars(s.saving);
 const fixed=Object.values(FIXED).reduce((a,b)=>a+b,0);
 const housingNeeds=home===null||travel===null?null:roundMoney(home+utilities+travel+FIXED.rentersInsurance);
 const dailyLiving=fixed-FIXED.rentersInsurance;
 const needs=housingNeeds===null?null:roundMoney(housingNeeds+dailyLiving);
 const extras=saving===null||want===null?null:saving+want;
 const lifestyleTotal=extras===null?null:roundMoney(dailyLiving+extras);
 const planned=housingNeeds===null||lifestyleTotal===null?null:roundMoney(housingNeeds+lifestyleTotal);
 const remaining=income===null||planned===null?null:roundMoney(income-planned);
 const afterNeeds=income===null||needs===null?null:roundMoney(income-needs);
 return {rate,weekly,annualGross,gross,taxes,income,home,utilities,travel,want,saving,needs,extras,planned,remaining,afterNeeds,taxDetails,housingNeeds,dailyLiving,lifestyleTotal,...FIXED};
}
export const formatMoney=n=>n===null||n===undefined?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0,maximumFractionDigits:2}).format(n);
