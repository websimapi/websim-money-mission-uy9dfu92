import {HOURS_PER_WEEK,MAX_SAVING,HOMES,calculate,dollars,formatMoney as money} from './budget.js';
import {TRAVEL} from './data.js';
document.querySelectorAll('[data-hours]').forEach(el=>el.textContent=HOURS_PER_WEEK);
// Keep the visible comparison and the calculator on the same source of truth.
document.querySelectorAll('[data-home-column]').forEach(cell=>{const home=HOMES[cell.dataset.homeColumn];const bill=cell.closest('[data-home-bill]').dataset.homeBill;cell.textContent=money(bill==='utilities'?home.electricity+home.water+home.trash:home[bill]);});
document.querySelectorAll('[data-travel-column]').forEach(cell=>{
 const plan=TRAVEL[cell.dataset.travelColumn],key=cell.closest('[data-travel-bill]').dataset.travelBill;
 const amount=key==='total'?plan.cost:plan.bills[key];
 cell.textContent=amount===null?'N/A':money(amount);
 if(amount===null)cell.setAttribute('aria-label','Not applicable');
});
document.querySelectorAll('main [data-group="travel"]').forEach(btn=>{
 const plan=TRAVEL[btn.dataset.value];btn.querySelector('strong').textContent=plan.name;
 const price=btn.querySelector('b');price.replaceChildren(document.createTextNode(money(plan.cost)+' '));const unit=document.createElement('small');unit.textContent='/ month';price.append(unit);
});
const fields=['name','date','fourWeeks','needsReason','goal','saving','needWant','savedFour','fits','biggest','surprise','percent'];
const titles=['Earn it','Plan your needs','Save & spend','Check your plan'];
let state={},current=0,blankPrint=false;
const STORAGE_KEY='money-mission-monthly-v2';
try{
 const saved=localStorage.getItem(STORAGE_KEY);
 if(saved){const data=JSON.parse(saved);if(data&&typeof data==='object'&&!Array.isArray(data))state=data;}
 else {
  const old=JSON.parse(localStorage.getItem('money-mission-v1')||'{}');
  if(old&&typeof old==='object'&&Object.keys(old).length){
   for(const key of ['name','date','job','goal','needsReason','needWant'])if(old[key]!==undefined)state[key]=old[key];
   const maps={home:{'20':'apartment','300':'apartment','30':'townhouse','400':'townhouse','40':'house','500':'house'},travel:{'0':'bike','5':'bus','50':'bus','15':'car','150':'car'},want:{'0':'park','5':'treat','25':'treat','10':'movie','50':'movie'}};
   for(const [key,map] of Object.entries(maps))state[key]=map[String(old[key])]??old[key];
   document.querySelector('#migration-note').hidden=false;
   // Retain the complete old workbook under its old key; never convert its weekly savings into monthly dollars silently.
  }
 }
}catch{}
function budgetMessage(b){
 return b.remaining===null?'Finish your career, home, travel, monthly savings amount, and fun allowance on pages 1–3.':b.remaining<0?'Not quite yet! You planned '+money(-b.remaining)+' more than your monthly take-home pay. Change a home, travel choice, or allowance, then check again.':b.remaining===0?'It fits exactly! Every dollar has a job. Your savings are still yours, but there is no extra money left.':'It fits! You have '+money(b.remaining)+' left this month, after setting aside your savings.';
}
function render(){
 const b=calculate(state);
 document.querySelectorAll('[data-home-column]').forEach(cell=>cell.classList.toggle('chosen-column',cell.dataset.homeColumn===state.home));
 document.querySelectorAll('[data-travel-column]').forEach(cell=>cell.classList.toggle('chosen-column',cell.dataset.travelColumn===state.travel));
 document.querySelectorAll('main [data-group]').forEach(btn=>{const chosen=String(state[btn.dataset.group])===btn.dataset.value;btn.classList.toggle('selected',chosen);btn.setAttribute('aria-pressed',String(chosen));});
 document.querySelectorAll('main [data-output]').forEach(el=>el.textContent=money(b[el.dataset.output]));
 const needsHint=document.querySelector('#needs-hint');needsHint.textContent=b.income===null?'Start on page 1 to find out how much you earn.':'Your monthly take-home pay is '+money(b.income)+'. Now plan your monthly needs.';
 const savingHint=document.querySelector('#saving-hint');savingHint.classList.toggle('over',b.remaining!==null&&b.remaining<0);
 savingHint.textContent=b.afterNeeds===null?'Finish pages 1 and 2 to see what you can save and spend.':b.remaining!==null&&b.remaining<0?'Your plan is '+money(-b.remaining)+' over your income. Try saving less or choosing a lower cost.':b.afterNeeds<0?'Your needs alone are '+money(-b.afterNeeds)+' above your take-home pay. Try a different home or travel plan.':'After your needs, you have '+money(b.afterNeeds)+' each month for savings, fun, and leftover money.';
 const status=document.querySelector('#budget-status');status.classList.toggle('over',b.remaining!==null&&b.remaining<0);
 document.querySelector('.balance-box').classList.toggle('over',b.remaining!==null&&b.remaining<0);
 status.textContent=budgetMessage(b);
 const done=[b.income!==null,b.needs!==null,b.extras!==null,b.remaining!==null];
 document.querySelectorAll('[data-page]').forEach((btn,i)=>{btn.classList.toggle('complete',done[i]);btn.setAttribute('aria-label',titles[i]+(done[i]?', choices complete':''));});
 const prompts=[b.income===null?'Choose a job to start your mission.':'Your income is ready. Next, plan your needs!',b.needs===null?'Choose one home and one way to travel.':'Your needs are added up. Next, save and spend!',b.extras===null?'Enter your savings (0 is okay), then pick your fun.':b.remaining!==null&&b.remaining<0?'You can try a different amount, or check your whole plan next.':'Your choices are ready. Let’s check your plan!',b.remaining===null?'You can use the tabs above to finish any missing choices.':'You can change any choice. That’s how budgeting works.'];
 document.querySelector('#page-prompt').textContent=prompts[current];
}
function syncInputs(){fields.forEach(key=>document.querySelector('main [data-field="'+key+'"]').value=state[key]??'');validateSaving();}
function validateSaving(){const input=document.querySelector('main [data-field="saving"]');input.setCustomValidity('');const invalid=input.validity.badInput||(input.value!==''&&dollars(input.value)===null);const message=invalid?'Use a whole dollar amount from 0 to 20,000.':'';input.setCustomValidity(message);input.setAttribute('aria-invalid',String(invalid));document.querySelector('#saving-error').textContent=message;return !invalid;}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));document.querySelector('#save-state').textContent='Saved on this device';}catch{document.querySelector('#save-state').textContent='Not saved · print to keep your work';}}
function navigate(page,focus=false){current=Math.max(0,Math.min(3,page));document.querySelectorAll('main [data-sheet]').forEach(s=>s.classList.toggle('active',Number(s.dataset.sheet)===current));document.querySelectorAll('[data-page]').forEach(btn=>{const active=Number(btn.dataset.page)===current;btn.classList.toggle('active',active);if(active)btn.setAttribute('aria-current','step');else btn.removeAttribute('aria-current');});document.querySelector('#prev').disabled=current===0;const next=document.querySelector('#next');next.hidden=current===3;next.textContent=['Next: Needs →','Next: Save & spend →','Next: Check my plan →'][current]||'';document.querySelector('#page-count').textContent='Mission '+(current+1)+' of 4';render();if(focus){const heading=document.querySelector('main .sheet.active h2');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});document.querySelector('.steps').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}}
document.querySelectorAll('[data-page]').forEach(btn=>btn.addEventListener('click',()=>navigate(Number(btn.dataset.page))));
document.querySelectorAll('main [data-group]').forEach(btn=>btn.addEventListener('click',()=>{state[btn.dataset.group]=btn.dataset.value;save();render();}));
document.querySelectorAll('main [data-field]').forEach(input=>input.addEventListener('input',()=>{state[input.dataset.field]=input.value;if(input.dataset.field==='saving')validateSaving();save();render();}));
document.querySelector('#prev').addEventListener('click',()=>navigate(current-1,true));document.querySelector('#next').addEventListener('click',()=>navigate(current+1,true));
function preparePrint(){
 document.querySelector('.print-workbook')?.remove();
 const root=document.createElement('div');root.className='print-workbook'+(blankPrint?' blank-workbook':'');
 const printState=blankPrint?{}:state,b=calculate(printState);
 document.querySelectorAll('main .sheet').forEach(original=>{
  const sheet=original.cloneNode(true);sheet.classList.remove('active');sheet.removeAttribute('aria-labelledby');sheet.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
  sheet.querySelectorAll('.pocket-hint').forEach(el=>el.remove());
  sheet.querySelectorAll('[data-home-column]').forEach(cell=>cell.classList.toggle('chosen-column',!blankPrint&&cell.dataset.homeColumn===printState.home));
  sheet.querySelectorAll('[data-travel-column]').forEach(cell=>cell.classList.toggle('chosen-column',!blankPrint&&cell.dataset.travelColumn===printState.travel));
  sheet.querySelectorAll('[data-group]').forEach(btn=>{btn.classList.toggle('selected',!blankPrint&&String(printState[btn.dataset.group])===btn.dataset.value);btn.removeAttribute('aria-pressed');});
  sheet.querySelectorAll('[data-output]').forEach(el=>{const value=b[el.dataset.output];el.textContent=value===null?'':money(value);el.classList.toggle('empty-output',value===null);});
  sheet.querySelectorAll('input,textarea').forEach(input=>{
   const span=document.createElement('span');span.className=input.tagName==='TEXTAREA'?'print-answer':'print-field';
   let text=String(printState[input.dataset.field]??'');
   if(input.type==='date'&&text){const [y,m,d]=text.split('-');text=m+'/'+d+'/'+y;}
   span.textContent=text;span.classList.toggle('unanswered',!text.trim());input.replaceWith(span);
  });
  // Screen-only hints are unnecessary on the printed worksheet.
  sheet.querySelectorAll('.saving-box small').forEach(el=>el.remove());
  const budgetStatus=sheet.querySelector('.budget-status');if(budgetStatus){budgetStatus.classList.toggle('over',b.remaining!==null&&b.remaining<0);budgetStatus.textContent=b.remaining===null?'If your answer is below $0, change a choice. If it is $0 or more, your monthly plan fits!':budgetMessage(b);}
  sheet.querySelector('.balance-box')?.classList.toggle('over',b.remaining!==null&&b.remaining<0);
  root.append(sheet);
  // Keep the new rent/utility comparison readable rather than squeezing the whole needs mission onto one page.
  if(original.dataset.sheet==='1'){
   const footer=sheet.querySelector('.sheet-footer');
   const third=sheet.querySelectorAll('.section-heading')[2];
   const continuation=document.createElement('section');continuation.className='sheet needs-supplement';continuation.dataset.sheet='essentials';
   continuation.style.setProperty('--accent','#ffe2a1');continuation.style.setProperty('--accent-light','#fff8e5');
   continuation.append(sheet.querySelector('.sheet-top').cloneNode(true));
   const tag=document.createElement('span');tag.className='mission-label';tag.textContent='MISSION 02 · ADD YOUR NEEDS';continuation.append(tag);
   const heading=document.createElement('h2');heading.textContent='Your monthly essentials.';continuation.append(heading);
   const intro=document.createElement('p');intro.className='intro';intro.textContent='Use the home and travel choices on the previous page. Keep rent and utilities separate, then add every monthly need.';continuation.append(intro);
   while(third.nextElementSibling&&third.nextElementSibling!==footer)continuation.append(third.nextElementSibling);
   third.remove();continuation.append(footer.cloneNode(true));root.append(continuation);
  }
 });
 const pages=[...root.querySelectorAll('.sheet')];pages.forEach((sheet,i)=>{
  const counter=sheet.querySelector('.sheet-top span:last-child');counter.textContent='PAGE '+(i+1)+' / '+pages.length;
  const footer=sheet.querySelector('.sheet-footer');footer.querySelector('b').textContent=(i+1)+' / '+pages.length;
  const name=document.createElement('span');name.className='print-name';name.textContent=printState.name?'Name: '+printState.name:'Name: ____________________';footer.prepend(name);
 });
 document.body.append(root);
}
function finishPrint(){blankPrint=false;document.querySelector('.print-workbook')?.remove();}
window.addEventListener('beforeprint',preparePrint);window.addEventListener('afterprint',finishPrint);
document.querySelector('#print-blank').addEventListener('click',()=>{blankPrint=true;preparePrint();window.print();});
document.querySelector('#print-work').addEventListener('click',()=>{if(!validateSaving()){navigate(2,true);document.querySelector('main [data-field="saving"]').reportValidity();return;}blankPrint=false;preparePrint();window.print();});
syncInputs();navigate(0);
