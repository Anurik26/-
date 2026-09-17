import {auth,db} from './firebase.js';
import {onAuthStateChanged,signOut} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {doc,getDoc} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav');
menu?.setAttribute('aria-label','Открыть меню');menu?.setAttribute('aria-expanded','false');
menu?.addEventListener('click',()=>{const open=nav?.classList.toggle('open');menu.setAttribute('aria-expanded',String(Boolean(open)));});
nav?.addEventListener('click',event=>{if(event.target.closest('a')){nav.classList.remove('open');menu?.setAttribute('aria-expanded','false');}});
const adminLink=nav?.querySelector('[href="admin.html"]'),loginLink=nav?.querySelector('[href="login.html"]');
if(adminLink)adminLink.hidden=true;
let authVersion=0;
onAuthStateChanged(auth,async user=>{
 const token=++authVersion;if(adminLink)adminLink.hidden=true;
 if(loginLink){loginLink.textContent=user?'Выйти':'Войти';loginLink.href=user?'#':'login.html';loginLink.onclick=user?async event=>{event.preventDefault();try{await signOut(auth);location.href='index.html';}catch{loginLink.textContent='Ошибка выхода. Повторить';}}:null;}
 if(user&&adminLink){try{const s=await getDoc(doc(db,'users',user.uid));if(token===authVersion)adminLink.hidden=s.data()?.role!=='admin';}catch{adminLink.hidden=true;}}
});
const dot=document.querySelector('.cursor-dot'),ring=document.querySelector('.cursor-ring');
if(dot&&ring&&matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 let x=0,y=0,rx=0,ry=0;addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;dot.style.left=x+'px';dot.style.top=y+'px';});
 function tick(){rx+=(x-rx)*.16;ry+=(y-ry)*.16;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(tick);}tick();
 document.addEventListener('mouseover',e=>ring.classList.toggle('hover',Boolean(e.target.closest('a,button,input,select'))));
}else{dot?.remove();ring?.remove();}
