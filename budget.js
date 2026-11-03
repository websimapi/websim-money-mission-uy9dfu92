// All values are pretend dollars for one week. Savings is allocated, not spent.
export const JOBS={artist:20,animal:25,coder:30};
const OPTIONS={home:[20,30,40],travel:[0,5,15],want:[0,5,10]};
export function dollars(raw){
 if(raw===null||raw===undefined||typeof raw==='boolean'||String(raw).trim()==='')return null;
 const n=Number(raw);
 return Number.isFinite(n)&&Number.isInteger(n)&&n>=0&&n<=999?n:null;
}
export function calculate(s={}){
 const rate=Object.hasOwn(JOBS,s.job)?JOBS[s.job]:null;
 const picked=key=>{const n=dollars(s[key]);return OPTIONS[key].includes(n)?n:null;};
 const home=picked('home'),travel=picked('travel'),want=picked('want'),saving=dollars(s.saving);
 const income=rate===null?null:rate*5;
 const needs=home===null||travel===null?null:home+travel+20+10;
 const extras=saving===null||want===null?null:saving+want;
 const planned=needs===null||extras===null?null:needs+extras;
 const remaining=income===null||planned===null?null:income-planned;
 const afterNeeds=income===null||needs===null?null:income-needs;
 return {rate,income,home,travel,want,saving,needs,extras,planned,remaining,afterNeeds};
}
export const formatMoney=n=>n===null?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
