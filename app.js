const jobs={artist:20,animal:25,coder:30};
const fields=['name','date','fourWeeks','needsReason','goal','saving','needWant','savedFour','fits','biggest','surprise','percent'];
let state={};let current=0;let printBackup=null;
try{state=JSON.parse(localStorage.getItem('money-mission-v1')||'{}')||{};}catch{}
const money=n=>Number.isFinite(n)?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n):'—';
function val(key){return state[key]!==undefined&&state[key]!==''&&Number.isFinite(Number(state[key]))?Number(state[key]):null;}
function render(){
 document.querySelectorAll('[data-group]').forEach(b=>{const chosen=String(state[b.dataset.group])===b.dataset.value;b.classList.toggle('selected',chosen);b.setAttribute('aria-pressed',String(chosen));});
 const rate=jobs[state.job]??null, income=rate===null?null:rate*5;
 const home=val('home'),travel=val('travel'),saving=val('saving'),want=val('want');
 const needs=home!==null&&travel!==null?home+travel+30:null;
 const extras=saving!==null&&want!==null?saving+want:null;
 const planned=needs!==null&&extras!==null?needs+extras:null;
 const remaining=income!==null&&planned!==null?income-planned:null;
 const outputs={rate,income,home,travel,needs,saving,want,extras,planned,remaining};
 document.querySelectorAll('[data-output]').forEach(el=>{const n=outputs[el.dataset.output];el.textContent=n===null?'—':money(n);});
 const status=document.querySelector('#budget-status');status.classList.toggle('over',remaining!==null&&remaining<0);
 status.textContent=remaining===null?'Finish your choices on pages 1–3 to see how your plan fits.':remaining<0?'You planned '+money(-remaining)+' more than you earned. Try a lower cost on pages 2 or 3.':remaining===0?'Your plan fits exactly! You have given every dollar a job.':'Your plan fits! You have '+money(remaining)+' left to save or use for a surprise.';
}
function syncInputs(){fields.forEach(key=>{const input=document.querySelector('[data-field="'+key+'"]');input.value=state[key]??'';});}
function save(){try{localStorage.setItem('money-mission-v1',JSON.stringify(state));document.querySelector('#save-state').textContent='Saved on this device';}catch{document.querySelector('#save-state').textContent='Not saved · print to keep your work';}}
function navigate(page,scroll=false){current=Math.max(0,Math.min(3,page));document.querySelectorAll('[data-sheet]').forEach(s=>s.classList.toggle('active',Number(s.dataset.sheet)===current));document.querySelectorAll('[data-page]').forEach(b=>{const active=Number(b.dataset.page)===current;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});document.querySelector('#prev').disabled=current===0;const next=document.querySelector('#next');next.hidden=current===3;next.textContent=['Next: Plan your needs →','Next: Save & spend →','Next: Check your plan →'][current]||'';document.querySelector('#page-count').textContent='Mission '+(current+1)+' of 4';if(scroll)document.querySelector('.steps').scrollIntoView({behavior:'smooth',block:'start'});}
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>navigate(Number(b.dataset.page))));
document.querySelectorAll('[data-group]').forEach(b=>b.addEventListener('click',()=>{state[b.dataset.group]=b.dataset.value;save();render();}));
document.querySelectorAll('[data-field]').forEach(input=>input.addEventListener('input',()=>{if(input.type==='number'){if(input.value!==''&&(!Number.isFinite(Number(input.value))||Number(input.value)<0||Number(input.value)>10000||!Number.isInteger(Number(input.value)))){input.setCustomValidity('Use a whole dollar amount from 0 to 10,000.');delete state[input.dataset.field];save();render();input.reportValidity();return;}input.setCustomValidity('');}state[input.dataset.field]=input.value;save();render();}));
document.querySelector('#prev').addEventListener('click',()=>navigate(current-1,true));document.querySelector('#next').addEventListener('click',()=>navigate(current+1,true));
function restorePrint(){if(printBackup){state=printBackup;printBackup=null;document.body.classList.remove('print-blank');syncInputs();render();}}
document.querySelector('#print-blank').addEventListener('click',()=>{printBackup={...state};state={};document.body.classList.add('print-blank');syncInputs();render();window.print();restorePrint();});
document.querySelector('#print-work').addEventListener('click',()=>{const invalid=document.querySelector('input:invalid');if(invalid){navigate(Number(invalid.closest('[data-sheet]').dataset.sheet));invalid.reportValidity();return;}window.print();});window.addEventListener('afterprint',restorePrint);
syncInputs();render();navigate(0);
