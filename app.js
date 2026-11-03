import {HOURS_PER_WEEK,calculate,dollars,formatMoney as money} from './budget.js';
document.querySelectorAll('[data-hours]').forEach(el=>el.textContent=HOURS_PER_WEEK);
const fields=['name','date','fourWeeks','needsReason','goal','saving','needWant','savedFour','fits','biggest','surprise','percent'];
const titles=['Earn it','Plan your needs','Save & spend','Check your plan'];
let state={},current=0,blankPrint=false;
try{const data=JSON.parse(localStorage.getItem('money-mission-v1')||'{}');if(data&&typeof data==='object'&&!Array.isArray(data))state=data;}catch{}
// Bring forward choices saved by the previous, smaller-number version of the workbook.
for(const [key,map] of Object.entries({home:{'20':'300','30':'400','40':'500'},travel:{'5':'50','15':'150'},want:{'5':'25','10':'50'}})){if(Object.hasOwn(map,String(state[key])))state[key]=map[String(state[key])];}
function render(){
 const b=calculate(state);
 document.querySelectorAll('main [data-group]').forEach(btn=>{const chosen=String(state[btn.dataset.group])===btn.dataset.value;btn.classList.toggle('selected',chosen);btn.setAttribute('aria-pressed',String(chosen));});
 document.querySelectorAll('main [data-output]').forEach(el=>el.textContent=money(b[el.dataset.output]));
 const needsHint=document.querySelector('#needs-hint');needsHint.textContent=b.income===null?'Start on page 1 to find out how much you earn.':'You earned '+money(b.income)+' this week. Now choose your needs.';
 const savingHint=document.querySelector('#saving-hint');savingHint.classList.toggle('over',b.remaining!==null&&b.remaining<0);
 savingHint.textContent=b.afterNeeds===null?'Finish pages 1 and 2 to see what you can save and spend.':b.remaining!==null&&b.remaining<0?'Your plan is '+money(-b.remaining)+' over your income. Try saving less or choosing a lower cost.':'After your needs, you have '+money(b.afterNeeds)+' for savings, fun, and leftover money.';
 const status=document.querySelector('#budget-status');status.classList.toggle('over',b.remaining!==null&&b.remaining<0);
 document.querySelector('.balance-box').classList.toggle('over',b.remaining!==null&&b.remaining<0);
 status.textContent=b.remaining===null?'Finish your job, home, travel, savings amount, and fun choice on pages 1–3.':b.remaining<0?'Not quite yet! You planned '+money(-b.remaining)+' more than you earned. Change a choice on page 2 or 3, then check again.':b.remaining===0?'It fits exactly! Every dollar has a job. Your savings are still yours, but there is no extra money left.':'It fits! You have '+money(b.remaining)+' left over. This is extra money after your savings are set aside.';
 const done=[b.income!==null,b.needs!==null,b.extras!==null,b.remaining!==null];
 document.querySelectorAll('[data-page]').forEach((btn,i)=>{btn.classList.toggle('complete',done[i]);btn.setAttribute('aria-label',titles[i]+(done[i]?', choices complete':''));});
 const prompts=[b.income===null?'Choose a job to start your mission.':'Your income is ready. Next, plan your needs!',b.needs===null?'Choose one home and one way to travel.':'Your needs are added up. Next, save and spend!',b.extras===null?'Enter your savings (0 is okay), then pick your fun.':b.remaining!==null&&b.remaining<0?'You can try a different amount, or check your whole plan next.':'Your choices are ready. Let’s check your plan!',b.remaining===null?'You can use the tabs above to finish any missing choices.':'You can change any choice. That’s how budgeting works.'];
 document.querySelector('#page-prompt').textContent=prompts[current];
}
function syncInputs(){fields.forEach(key=>document.querySelector('main [data-field="'+key+'"]').value=state[key]??'');validateSaving();}
function validateSaving(){const input=document.querySelector('main [data-field="saving"]');input.setCustomValidity('');const invalid=input.validity.badInput||(input.value!==''&&dollars(input.value)===null);const message=invalid?'Use a whole dollar amount from 0 to 1,200.':'';input.setCustomValidity(message);input.setAttribute('aria-invalid',String(invalid));document.querySelector('#saving-error').textContent=message;return !invalid;}
function save(){try{localStorage.setItem('money-mission-v1',JSON.stringify(state));document.querySelector('#save-state').textContent='Saved on this device';}catch{document.querySelector('#save-state').textContent='Not saved · print to keep your work';}}
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
  const budgetStatus=sheet.querySelector('.budget-status');if(budgetStatus){budgetStatus.classList.toggle('over',b.remaining!==null&&b.remaining<0);if(b.remaining===null)budgetStatus.textContent='If your answer is below $0, change a choice. If it is $0 or more, your plan fits!';}
  sheet.querySelector('.balance-box')?.classList.toggle('over',b.remaining!==null&&b.remaining<0);
  const footer=sheet.querySelector('.sheet-footer');const name=document.createElement('span');name.className='print-name';name.textContent=printState.name?'Name: '+printState.name:'Name: ____________________';footer.prepend(name);
  root.append(sheet);
 });
 document.body.append(root);
}
function finishPrint(){blankPrint=false;document.querySelector('.print-workbook')?.remove();}
window.addEventListener('beforeprint',preparePrint);window.addEventListener('afterprint',finishPrint);
document.querySelector('#print-blank').addEventListener('click',()=>{blankPrint=true;preparePrint();window.print();});
document.querySelector('#print-work').addEventListener('click',()=>{if(!validateSaving()){navigate(2,true);document.querySelector('main [data-field="saving"]').reportValidity();return;}blankPrint=false;preparePrint();window.print();});
syncInputs();navigate(0);
