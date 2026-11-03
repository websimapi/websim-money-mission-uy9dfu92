// All values are pretend dollars for one week. Savings is allocated, not spent.
export const HOURS_PER_WEEK=40;
export const JOBS={artist:20,animal:25,coder:30};
const OPTIONS={home:[300,400,500],travel:[0,50,150],want:[0,25,50]};
export function dollars(raw){
 if(raw===null||raw===undefined||typeof raw==='boolean'||String(raw).trim()==='')return null;
 const n=Number(raw);
 return Number.isFinite(n)&&Number.isInteger(n)&&n>=0&&n<=1200?n:null;
}
export function calculate(s={}){
 const rate=Object.hasOwn(JOBS,s.job)?JOBS[s.job]:null;
 const picked=key=>{const n=dollars(s[key]);return OPTIONS[key].includes(n)?n:null;};
 const home=picked('home'),travel=picked('travel'),want=picked('want'),saving=dollars(s.saving);
 const income=rate===null?null:rate*HOURS_PER_WEEK;
 const needs=home===null||travel===null?null:home+travel+150+50;
 const extras=saving===null||want===null?null:saving+want;
 const planned=needs===null||extras===null?null:needs+extras;
 const remaining=income===null||planned===null?null:income-planned;
 const afterNeeds=income===null||needs===null?null:income-needs;
 return {rate,income,home,travel,want,saving,needs,extras,planned,remaining,afterNeeds};
}
export const formatMoney=n=>n===null?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
