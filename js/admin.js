import {auth,db} from './firebase.js';
import {onAuthStateChanged,signOut} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {collection,addDoc,deleteDoc,doc,getDoc,onSnapshot,serverTimestamp,updateDoc} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {esc,rows,newest,errorText,posterUrl,fallback} from './common.js';
const target=document.querySelector('#adminContent');
let editingId=null,items=[],users=[],reviews=[],stops=[],version=0;
function formMarkup(item={}){return `<form id="animeForm" class="admin-form"><div class="admin-section-title"><h2>${editingId?'Изменить тайтл':'Добавить аниме'}</h2></div><div class="admin-form-grid">
<label>Название<input id="title" maxlength="160" required value="${esc(item.title)}"></label>
<label>Постер URL<input id="poster" type="url" value="${esc(item.poster)}" placeholder="https://..."></label>
<label>Год<input id="year" type="number" min="1900" max="2100" required value="${esc(item.year??'')}"></label>
<label>Статус<select id="status">${['Finished','Ongoing','Announced'].map(s=>`<option value="${s}" ${item.status===s?'selected':''}>${s}</option>`).join('')}</select></label>
<label>Эпизоды<input id="episodes" type="number" min="0" max="100000" required value="${esc(item.episodes??0)}"></label>
<label>Рейтинг каталога<input id="rating" type="number" min="0" max="10" step="0.1" required value="${esc(item.rating??0)}"></label>
<label>Количество оценок каталога<input id="ratingCount" type="number" min="0" max="100000000" required value="${esc(item.ratingCount??0)}"></label>
<label>Жанры через запятую<input id="genres" value="${esc(Array.isArray(item.genres)?item.genres.join(', '):'')}"></label>
</div><label>Описание<textarea id="description" rows="5" maxlength="10000" required>${esc(item.description)}</textarea></label><div class="admin-actions"><button class="button" type="submit">${editingId?'Сохранить изменения':'Добавить аниме'}</button><button id="cancelEdit" class="button secondary" type="button" ${editingId?'':'hidden'}>Отмена</button></div><p id="formMessage" class="form-message" role="status"></p></form>`;}
function mountForm(item){document.querySelector('#editor').innerHTML=formMarkup(item);document.querySelector('#animeForm').addEventListener('submit',saveAnime);document.querySelector('#cancelEdit').onclick=()=>{editingId=null;mountForm();};}
function renderCatalog(){
 document.querySelector('#adminStats').textContent=`Тайтлов: ${items.length}`;
 document.querySelector('#adminList').innerHTML=items.length?items.map(a=>`<article class="admin-item"><div><h3>${esc(a.title)}</h3><p>${esc(a.year)} · ⭐ ${esc(a.rating)} · ${esc(a.status)}</p></div><div class="admin-item-actions"><button class="button small" data-edit="${esc(a.id)}">Изменить</button><button class="button small danger" data-delete="${esc(a.id)}">Удалить</button></div></article>`).join(''):'<p class="muted">Каталог пока пуст.</p>';
}
function renderUsers(){document.querySelector('#adminUsers').innerHTML=users.length?users.map(u=>`<article class="admin-item"><div><h3>${esc(u.name||'Пользователь')}</h3><p>${esc(u.email)} · ${esc(u.role)}</p></div><button class="button small" data-role="${esc(u.id)}" ${u.id===auth.currentUser?.uid?'disabled':''}>${u.role==='admin'?'Сделать user':'Сделать admin'}</button></article>`).join(''):'<p class="muted">Пользователей пока нет.</p>';}
function renderReviews(){document.querySelector('#adminReviews').innerHTML=reviews.length?reviews.map(r=>`<article class="review-card"><div class="review-card-head"><strong>${esc(r.userName||'Пользователь')} · ${esc(r.animeTitle||r.animeId)}</strong><span>⭐ ${esc(r.rating)}/10</span></div><p>${esc(r.text)}</p><button class="text-button" data-review="${esc(r.id)}">Удалить отзыв</button></article>`).join(''):'<p class="muted">Отзывов пока нет.</p>';}
async function saveAnime(event){
 event.preventDefault();const form=event.currentTarget,button=form.querySelector('[type="submit"]'),message=document.querySelector('#formMessage');if(button.disabled)return;
 const value=id=>form.querySelector(`#${id}`).value.trim();
 const data={title:value('title'),description:value('description'),poster:value('poster'),year:Number(value('year')),status:value('status'),episodes:Number(value('episodes')),rating:Number(value('rating')),ratingCount:Number(value('ratingCount')),genres:[...new Set(value('genres').split(',').map(s=>s.trim()).filter(Boolean))]};
 if(!data.title||!data.description||!Number.isInteger(data.year)||data.year<1900||data.year>2100||!Number.isInteger(data.episodes)||data.episodes<0||data.episodes>100000||!Number.isFinite(data.rating)||data.rating<0||data.rating>10||!Number.isInteger(data.ratingCount)||data.ratingCount<0||data.ratingCount>100000000||data.genres.length>20||(data.poster&&posterUrl(data.poster)===fallback)){message.textContent='Проверьте обязательные поля, числовые значения и URL постера.';return;}
 button.disabled=true;message.textContent='Сохраняем…';
 try{if(editingId)await updateDoc(doc(db,'anime',editingId),data);else await addDoc(collection(db,'anime'),{...data,createdAt:serverTimestamp()});editingId=null;mountForm();document.querySelector('#formMessage').textContent='Сохранено ✓';}
 catch(error){console.error(error);message.textContent=errorText(error);button.disabled=false;}
}
target.addEventListener('click',async event=>{
 const button=event.target.closest('button');if(!button||button.disabled)return;
 const notice=document.querySelector('#adminNotice');if(!notice)return;
 if(button.dataset.edit){editingId=button.dataset.edit;mountForm(items.find(a=>a.id===editingId));document.querySelector('#editor').scrollIntoView({behavior:'smooth'});return;}
 let action;
 if(button.dataset.delete){const item=items.find(a=>a.id===button.dataset.delete);if(!item||!confirm(`Удалить «${item.title}» из каталога?`))return;action=()=>deleteDoc(doc(db,'anime',item.id));}
 if(button.dataset.review){if(!confirm('Удалить этот отзыв?'))return;action=()=>deleteDoc(doc(db,'reviews',button.dataset.review));}
 if(button.dataset.role){const user=users.find(u=>u.id===button.dataset.role);if(!user||user.id===auth.currentUser.uid)return;const role=user.role==='admin'?'user':'admin';if(!confirm(`Изменить роль ${user.name||user.email} на ${role}?`))return;action=()=>updateDoc(doc(db,'users',user.id),{role});}
 if(!action)return;button.disabled=true;notice.textContent='';try{await action();notice.textContent='Изменения сохранены.';if(button.dataset.delete===editingId){editingId=null;mountForm();}}catch(error){notice.textContent=errorText(error);button.disabled=false;}
});
onAuthStateChanged(auth,async user=>{
 stops.forEach(stop=>stop());stops=[];const token=++version;
 if(!user){location.href='login.html';return;}
 try{
  const snap=await getDoc(doc(db,'users',user.uid));if(token!==version)return;
  if(snap.data()?.role!=='admin'){target.innerHTML='<section class="profile-card"><h2>Доступ запрещён</h2><p>Эта страница доступна администратору.</p></section>';return;}
  target.innerHTML='<p id="adminStats" class="eyebrow"></p><p id="adminNotice" role="status"></p><div id="editor"></div><section class="admin-catalog"><h2>Каталог</h2><div id="adminList" class="admin-list"></div></section><section class="admin-catalog"><h2>Модерация отзывов</h2><div id="adminReviews"></div></section><section class="admin-catalog"><h2>Пользователи и роли</h2><div id="adminUsers" class="admin-list"></div></section>';
  mountForm();
  for(const [name,id,assign,render] of [['anime','adminList',v=>{items=newest(v);},renderCatalog],['reviews','adminReviews',v=>{reviews=newest(v);},renderReviews],['users','adminUsers',v=>{users=v;},renderUsers]]){
   stops.push(onSnapshot(collection(db,name),snapshot=>{if(token!==version)return;assign(rows(snapshot));render();},error=>{if(token!==version)return;document.querySelector(`#${id}`).innerHTML=`<p class="muted">${esc(errorText(error))}</p>`;}));
  }
 }catch(error){if(token===version)target.innerHTML=`<p class="muted">${esc(errorText(error))}</p>`;}
});
document.querySelector('#logoutButton')?.addEventListener('click',async()=>{try{await signOut(auth);location.href='index.html';}catch(error){document.querySelector('#adminNotice').textContent=errorText(error);}});
addEventListener('pagehide',()=>stops.forEach(stop=>stop()),{once:true});
