// Research notes, source dates, and scenario assumptions are documented in sources.html.
export const MODEL={location:'Raleigh, North Carolina',household:'One adult, no children',taxYear:2026,taxRate:20,hoursPerWeek:40,weeksPerYear:52,monthsPerYear:12};
// O*NET 2025 national medians, floored for this whole-dollar workbook.
// benchmarkRate preserves a published wage or the explicitly documented trades average.
// rate is the whole-dollar rate used in every calculation.
// Typical qualifications are not universal hiring requirements; see sources.html.
export const JOBS={
 artist:{name:'Graphic designer',image:'artist',description:'Create visual designs',qualification:'Bachelor’s degree',rate:30,benchmarkRate:30.27,annualMedian:62960},
 animal:{name:'Veterinary technician',image:'animal',description:'Help care for animals',qualification:'Associate degree + state credential',rate:22,benchmarkRate:22.78,annualMedian:47380},
 coder:{name:'Software developer',image:'coder',description:'Build apps and programs',qualification:'Bachelor’s degree',rate:65,benchmarkRate:65.38,annualMedian:135980},
 // A representative classroom category, not one occupation or a combined license.
 trades:{name:'Skilled trades',image:'plumber',description:'Electrical, plumbing or HVAC work',qualification:'Trade-school path + hands-on training',rate:30,benchmarkRate:(30.38+30.67+29.33)/3,annualMedian:null},
 office:{name:'Office assistant',image:'office',description:'Handle emails, records and office tasks',qualification:'No degree or trade certificate; employer training',rate:21,benchmarkRate:21.64,annualMedian:45010},
 restaurant:{name:'Restaurant team member',image:'restaurant',description:'Take orders and prepare or serve meals',qualification:'No degree or trade certificate; employer training',rate:15,benchmarkRate:15,annualMedian:31200},
 retail:{name:'Retail sales associate',image:'retail',description:'Help shoppers and handle sales',qualification:'No degree or trade certificate; employer training',rate:17,benchmarkRate:17.03,annualMedian:35410}
};
export const normalizeJobKey=key=>['electrician','plumber','hvac'].includes(key)?'trades':key;
// Illustrative rental-only prices, not measured averages for these property types.
// All-electric homes: 700/1,000/1,400 kWh per month at an assumed $0.15/kWh.
export const HOMES={
 apartment:{name:'Cozy apartment',description:'1 bedroom · about 750 sq ft',rent:1300,electricity:105,water:60,trash:20},
 townhouse:{name:'Townhouse',description:'2 bedrooms · about 1,200 sq ft',rent:1900,electricity:150,water:75,trash:25},
 house:{name:'House',description:'3 bedrooms · about 1,800 sq ft',rent:2300,electricity:210,water:80,trash:30}
};
// Component costs are monthly planning allowances; null means no applicable bill.
export const TRANSPORT_ROWS=[
 {key:'payment',label:'Car payment'},
 {key:'gas',label:'Gas / fuel'},
 {key:'insurance',label:'Vehicle insurance'},
 {key:'pass',label:'Public Transit pass'},
 {key:'maintenance',label:'Maintenance & repairs'},
 {key:'registration',label:'Registration & vehicle taxes'}
];
const travelPlans={
 bike:{name:'Walk or bike',description:'Already-owned bicycle. $20 per month set aside for upkeep.',bills:{payment:null,gas:null,insurance:null,pass:null,maintenance:20,registration:null}},
 bus:{name:'Public Transit',description:'GoTriangle adult fare cap: up to $80 per month.',bills:{payment:null,gas:null,insurance:null,pass:80,maintenance:null,registration:null}},
 car:{name:'Car',description:'Financed car; about 1,000 miles per month. Includes payment, fuel, insurance, upkeep and registration.',bills:{payment:350,gas:150,insurance:160,pass:null,maintenance:100,registration:20}}
};
// Derive the price from its bills so cards, breakdowns, and budget totals cannot disagree.
export const TRAVEL=Object.fromEntries(Object.entries(travelPlans).map(([key,plan])=>[key,{...plan,cost:Object.values(plan.bills).reduce((total,value)=>total+(value??0),0)}]));
export const WANTS={park:{name:'Free outings',cost:0},treat:{name:'Dining out & treats',cost:50},movie:{name:'Movies & hobbies',cost:100}};
// One adult's monthly allowances. Not every item is a monthly invoice.
export const FIXED={food:400,internet:70,phone:55,medical:280,essentials:150,rentersInsurance:20,subscriptions:30};
export const OPTIONAL_BILLS=['internet','phone','medical','essentials','subscriptions'];
export const MAX_SAVING=20000;
