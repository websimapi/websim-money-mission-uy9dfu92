// Research notes, source dates, and scenario assumptions are documented in sources.html.
export const MODEL={location:'Raleigh, North Carolina',household:'One adult, no children',taxYear:2026,hoursPerWeek:40,weeksPerYear:52,monthsPerYear:12};
// O*NET 2025 national medians, floored for this whole-dollar workbook.
// publishedRate preserves the source benchmark; rate is the rate actually used in all calculations.
// Typical qualifications are not universal hiring requirements; see sources.html.
export const JOBS={
 artist:{name:'Graphic designer',description:'Create visual designs',qualification:'Bachelor’s degree',rate:30,publishedRate:30.27,annualMedian:62960},
 animal:{name:'Veterinary technician',description:'Help care for animals',qualification:'Associate degree + state credential',rate:22,publishedRate:22.78,annualMedian:47380},
 coder:{name:'Software developer',description:'Build apps and programs',qualification:'Bachelor’s degree',rate:65,publishedRate:65.38,annualMedian:135980},
 electrician:{name:'Electrician',description:'Install and repair electrical systems',qualification:'High school + apprenticeship',rate:30,publishedRate:30.38,annualMedian:63190},
 plumber:{name:'Plumber',description:'Install and repair water pipes',qualification:'High school + apprenticeship',rate:30,publishedRate:30.67,annualMedian:63800},
 hvac:{name:'HVAC technician',description:'Service heating and cooling systems',qualification:'Trade training; EPA certification for refrigerant work',rate:29,publishedRate:29.33,annualMedian:61010}
};
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
export const MAX_SAVING=20000;
