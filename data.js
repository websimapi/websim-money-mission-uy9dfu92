// Research notes, source dates, and scenario assumptions are documented in sources.html.
export const MODEL={location:'Raleigh, North Carolina',household:'One adult, no children',taxYear:2026,hoursPerWeek:40,weeksPerYear:52,monthsPerYear:12};
// O*NET OnLine: 2025 U.S. median hourly wages (not entry-level or Raleigh-specific wages).
export const JOBS={
 artist:{name:'Graphic designer',rate:30.27,annualMedian:62960},
 animal:{name:'Veterinary technician',rate:22.78,annualMedian:47380},
 coder:{name:'Software developer',rate:65.38,annualMedian:135980}
};
// Illustrative rental-only prices, not measured averages for these property types.
// All-electric homes: 700/1,000/1,400 kWh per month at an assumed $0.15/kWh.
export const HOMES={
 apartment:{name:'Cozy apartment',description:'1 bedroom · about 750 sq ft',rent:1300,electricity:105,water:60,trash:20},
 townhouse:{name:'Townhouse',description:'2 bedrooms · about 1,200 sq ft',rent:1900,electricity:150,water:75,trash:25},
 house:{name:'House',description:'3 bedrooms · about 1,800 sq ft',rent:2300,electricity:210,water:80,trash:30}
};
export const TRAVEL={
 bike:{name:'Walk or bike',cost:20,description:'Bike upkeep; bike already owned'},
 bus:{name:'Public transit',cost:80,description:'GoTriangle full-fare monthly cap'},
 car:{name:'Used car',cost:760,description:'Payment $350 + insurance $160 + gas $150 + upkeep $80 + registration $20'}
};
export const WANTS={park:{name:'Free outings',cost:0},treat:{name:'Treats & streaming',cost:50},movie:{name:'Movies & hobbies',cost:100}};
// One adult's monthly allowances. Not every item is a monthly invoice.
export const FIXED={food:400,connectivity:125,medical:280,essentials:150,rentersInsurance:20};
export const MAX_SAVING=20000;
