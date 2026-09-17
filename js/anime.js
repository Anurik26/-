import {db,auth} from './firebase.js';
import {doc,getDoc,collection,addDoc,setDoc,updateDoc,deleteDoc,query,where,getDocs,serverTimestamp,onSnapshot} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {ensureProfile} from './account.js';
import {esc,posterUrl,rows,newest,reviewSummary,dateLabel,bindPosters,errorText} from './common.js';
const params=new URLSearchParams(location.search),id=params.get('id');
const box=document.querySelector('#animeDetails'),form=document.querySelector('#review-form'),rating=document.querySelector('#review-rating'),text=document.querySelector('#review-text'),message=document.querySelector('#review-message'),list=document.querySelector('#reviews-list');
let anime=null,user=null,role='user',reviews=[],editing=null,version=0,unsubscribe;
const recorded=new Set();
function renderReviews(){
 const stats=reviewSummary(reviews), summary=document.querySelector('#communityRating');
 if(summary)summary.textContent=`Оценка сообщества: ${stats.rating} / 10 · ${stats.count} голосов`;
 list.innerHTML=reviews.length?reviews.map(r=>`<article class="review-card"><div class="review-card-head"><strong>${esc(r.userName||'Пользователь')}</strong><span>⭐ ${esc(r.rating)}/10 · ${esc(dateLabel(r.createdAt))}</span></div><p>${esc(r.text)}</p>${user&&(r.userId===user.uid||role==='admin')?`<div class="review-actions">${r.userId===user.uid?`<button type="button" class="text-button" data-edit="${esc(r.id)}">Изменить</button>`:''}<button type="button" class="text-button" data-delete="${esc(r.id)}">Удалить</button></div>`:''}</article>`).join(''):'<p class="muted">Отзывов пока нет. Поделитесь первым впечатлением.</p>';
}
function editReview(r){editing=r.id;rating.value=String(r.rating);text.value=r.text;form.querySelector('[type="submit"]').textContent='Сохранить отзыв';message.textContent='Редактирование вашего отзыва';form.scrollIntoView({behavior:'smooth',block:'center'});}
function renderDetails(){
 box.innerHTML=`<section class="detail"><div class="detail-media"><img src="${esc(posterUrl(anime.poster))}" alt="${esc(anime.title)}"><span class="detail-index">ANIME / DETAIL</span></div><div><span class="badge">${esc(anime.year||'—')} · ${esc(anime.status||'UNKNOWN')}</span><h1>${esc(anime.title)}<span>.</span></h1><p class="detail-description">${esc(anime.description||'Описание отсутствует.')}</p><div class="detail-tags">${(Array.isArray(anime.genres)?anime.genres:[]).map(g=>`<span class="tag">${esc(g)}</span>`).join('')}</div><div class="detail-stats"><div><span>РЕЙТИНГ КАТАЛОГА</span><strong>⭐ ${esc(anime.rating??'—')}</strong></div><div><span>ЭПИЗОДЫ</span><strong>${esc(anime.episodes??'—')}</strong></div><div><span>ОЦЕНКИ КАТАЛОГА</span><strong>${esc(anime.ratingCount??0)}</strong></div></div><p id="communityRating" class="muted"></p><div class="detail-actions"><button id="favorite" class="button" disabled>Загрузка избранного…</button><a class="button secondary" href="index.html">← Каталог</a></div><p id="favoriteMessage" role="status" class="muted"></p></div></section>`;
 bindPosters(box);renderReviews();
}
async function setupFavorite(currentUser,token){
 const button=document.querySelector('#favorite'),status=document.querySelector('#favoriteMessage');
 if(!currentUser){button.disabled=false;button.textContent='Войти и сохранить';button.onclick=()=>{location.href='login.html';};return;}
 const request=query(collection(db,'favorites'),where('userId','==',currentUser.uid),where('animeId','==',id));
 let saved=[];
 async function refresh(){const snap=await getDocs(request);if(token!==version)return;saved=snap.docs;button.disabled=false;button.textContent=saved.length?'✓ Убрать из избранного':'＋ В избранное';}
 button.onclick=async()=>{
  if(button.disabled||token!==version)return;button.disabled=true;status.textContent='';
  try{
   if(saved.length)await Promise.all(saved.map(d=>deleteDoc(d.ref)));
   else await setDoc(doc(db,'favorites',`${currentUser.uid}__${id}`),{userId:currentUser.uid,animeId:id,title:anime.title,poster:anime.poster||'',year:anime.year??null,createdAt:serverTimestamp()});
   await refresh();
  }catch(error){console.error(error);status.textContent=errorText(error);button.disabled=false;}
 };
 try{await refresh();}catch(error){status.textContent=errorText(error);button.disabled=false;button.textContent='Повторить загрузку избранного';button.onclick=()=>{void setupFavorite(currentUser,token);};}
}
async function load(currentUser){
 const token=++version;user=currentUser;role='user';editing=null;form.reset();form.querySelector('[type="submit"]').textContent='Опубликовать отзыв';
 form.querySelectorAll('input,textarea,select,button').forEach(el=>el.disabled=true);
 if(!id||id.includes('/')){box.innerHTML='<p class="muted">Аниме не найдено.</p>';list.innerHTML='';return;}
 try{
  const snap=await getDoc(doc(db,'anime',id));if(token!==version)return;
  if(!snap.exists()){anime=null;box.innerHTML='<p class="muted">Аниме удалено или не существует.</p>';list.innerHTML='';return;}
  anime=snap.data();document.title=`${anime.title} — Anime Hub`;renderDetails();void setupFavorite(currentUser,token);
  form.querySelectorAll('input,textarea,select,button').forEach(el=>el.disabled=!currentUser);
  message.textContent=currentUser?'':'Войдите в аккаунт, чтобы оставить отзыв.';
  if(currentUser){
   ensureProfile(currentUser).then(data=>{if(token===version){role=data.role;renderReviews();}}).catch(console.error);
   if(!recorded.has(currentUser.uid)){
    recorded.add(currentUser.uid);
    void addDoc(collection(db,'history'),{userId:currentUser.uid,animeId:id,animeTitle:anime.title||'Без названия',action:'view',createdAt:serverTimestamp()}).catch(error=>{recorded.delete(currentUser.uid);console.error('Не удалось сохранить просмотр',error);});
   }
  }
  unsubscribe?.();
  unsubscribe=onSnapshot(query(collection(db,'reviews'),where('animeId','==',id)),snapshot=>{
   if(token!==version)return;reviews=newest(rows(snapshot));renderReviews();
   const requested=reviews.find(r=>r.id===params.get('review')&&r.userId===user?.uid);if(requested&&!editing)editReview(requested);
  },error=>{if(token!==version)return;console.error(error);list.innerHTML='<p class="muted">Отзывы не загрузились. Обновите страницу, чтобы повторить.</p>';});
 }catch(error){if(token!==version)return;console.error(error);box.innerHTML=`<p class="muted">${esc(errorText(error))}</p><button class="button" id="retryDetails">Повторить</button>`;document.querySelector('#retryDetails').onclick=()=>{void load(auth.currentUser);};}
}
form.addEventListener('submit',async event=>{
 event.preventDefault();const currentUser=auth.currentUser,button=form.querySelector('[type="submit"]');if(!currentUser||!anime||button.disabled)return;
 const value=Number(rating.value),body=text.value.trim();
 if(!Number.isInteger(value)||value<1||value>10||!body||body.length>3000){message.textContent='Выберите оценку от 1 до 10 и напишите отзыв до 3000 символов.';return;}
 button.disabled=true;
 try{
  const profile=await ensureProfile(currentUser);
  const data={userId:currentUser.uid,animeId:id,animeTitle:anime.title||'',userName:profile.name||currentUser.displayName||'Пользователь',rating:value,text:body,createdAt:serverTimestamp()};
  const own=reviews.find(r=>r.id===editing&&r.userId===currentUser.uid)||reviews.find(r=>r.userId===currentUser.uid);
  if(own)await updateDoc(doc(db,'reviews',own.id),data);else await setDoc(doc(db,'reviews',`${currentUser.uid}__${id}`),data);
  form.reset();editing=null;button.textContent='Опубликовать отзыв';message.textContent='Отзыв сохранён ✓';
 }catch(error){console.error(error);message.textContent=errorText(error);}finally{button.disabled=false;}
});
list.addEventListener('click',async event=>{
 const edit=event.target.closest('[data-edit]');if(edit){const r=reviews.find(r=>r.id===edit.dataset.edit&&r.userId===user?.uid);if(r)editReview(r);return;}
 const button=event.target.closest('[data-delete]');if(!button||button.disabled)return;
 const review=reviews.find(r=>r.id===button.dataset.delete);if(!review||!user||(review.userId!==user.uid&&role!=='admin'))return;
 if(!confirm('Удалить этот отзыв?'))return;button.disabled=true;
 try{await deleteDoc(doc(db,'reviews',review.id));if(editing===review.id){editing=null;form.reset();form.querySelector('[type="submit"]').textContent='Опубликовать отзыв';}}catch(error){message.textContent=errorText(error);button.disabled=false;}
});
onAuthStateChanged(auth,currentUser=>{unsubscribe?.();void load(currentUser);});
addEventListener('pagehide',()=>unsubscribe?.(),{once:true});
