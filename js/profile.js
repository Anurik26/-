import {auth,db} from './firebase.js';
import {onAuthStateChanged,signOut} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {doc,collection,query,where,onSnapshot,deleteDoc,getDoc} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {ensureProfile} from './account.js';
import {esc,posterUrl,rows,newest,uniqueBy,dateLabel,bindPosters,errorText} from './common.js';
const profile=document.querySelector('#profile'),favorites=document.querySelector('#favorites'),history=document.querySelector('#history'),ownReviews=document.querySelector('#myReviews'),notice=document.querySelector('#profileMessage');
let stops=[],favoriteDocs=[],version=0,revision=0;
const cache=new Map();
async function animeInfo(id){if(!id||id.includes('/'))return null;if(!cache.has(id))cache.set(id,getDoc(doc(db,'anime',id)).then(s=>s.exists()?s.data():null).catch(()=>null));return cache.get(id);}
onAuthStateChanged(auth,async user=>{
 stops.forEach(stop=>stop());stops=[];const token=++version;
 if(!user){location.href='login.html';return;}
 try{const data=await ensureProfile(user);if(token!==version)return;profile.innerHTML=`<p class="eyebrow">MEMBER</p><p class="name">${esc(data.name||'Anime fan')}</p><p class="email">${esc(user.email)}</p><p class="profile-role">ROLE / ${esc(data.role||'user')}</p>`;}
 catch(error){profile.innerHTML=`<p class="name">${esc(user.displayName||'Anime fan')}</p><p class="email">${esc(user.email)}</p><p class="muted">Профиль временно недоступен.</p>`;console.error(error);}
 if(token!==version)return;
 function watch(name,target,render){stops.push(onSnapshot(query(collection(db,name),where('userId','==',user.uid)),snapshot=>{if(token===version)void render(newest(rows(snapshot)));},error=>{if(token===version)target.innerHTML=`<p class="muted">${esc(errorText(error))}</p>`;}));}
 watch('favorites',favorites,async items=>{
  favoriteDocs=items;const current=++revision;
  const grouped=uniqueBy(items,'animeId');const enriched=await Promise.all(grouped.map(async item=>({...item,current:await animeInfo(item.animeId)})));
  if(token!==version||current!==revision)return;
  favorites.innerHTML=enriched.length?enriched.map(item=>{
   const a=item.current||{title:item.title||item.animeTitle,poster:item.poster||item.animePoster,year:item.year};
   return `<article class="favorite-row"><img src="${esc(posterUrl(a.poster))}" alt="${esc(a.title)}"><div><h3>${esc(a.title||'Без названия')}</h3><p>${esc(a.year||'—')} · SAVED TO YOUR ARCHIVE</p></div><div class="row-actions"><a href="anime.html?id=${encodeURIComponent(item.animeId)}">OPEN ↗</a><button class="text-button" type="button" data-remove-favorite="${esc(item.animeId)}">Убрать</button></div></article>`;
  }).join(''):'<p class="muted empty-state">Пока ничего не сохранено. Добавьте аниме из каталога.</p>';bindPosters(favorites);
 });
 watch('history',history,items=>{const unique=uniqueBy(items,'animeId');history.innerHTML=unique.length?unique.map((item,i)=>`<article class="history-row"><div class="history-number">${String(i+1).padStart(2,'0')}</div><div><h3>${esc(item.animeTitle||'Без названия')}</h3><p>VIEWED / ${esc(dateLabel(item.createdAt))}</p></div><a href="anime.html?id=${encodeURIComponent(item.animeId)}">OPEN ↗</a></article>`).join(''):'<p class="muted empty-state">История просмотров пока пуста.</p>';});
 watch('reviews',ownReviews,items=>{ownReviews.innerHTML=items.length?items.map(item=>`<article class="review-card"><div class="review-card-head"><strong>${esc(item.animeTitle||'Отзыв об аниме')}</strong><span>⭐ ${esc(item.rating)}/10</span></div><p>${esc(item.text)}</p><div class="review-actions"><a href="anime.html?id=${encodeURIComponent(item.animeId)}&review=${encodeURIComponent(item.id)}">Изменить ↗</a><button type="button" class="text-button" data-remove-review="${esc(item.id)}">Удалить</button></div></article>`).join(''):'<p class="muted">Вы пока не оставили отзывов.</p>';});
});
favorites.addEventListener('click',async event=>{const button=event.target.closest('[data-remove-favorite]');if(!button||button.disabled)return;button.disabled=true;notice.textContent='';try{await Promise.all(favoriteDocs.filter(d=>d.animeId===button.dataset.removeFavorite).map(d=>deleteDoc(doc(db,'favorites',d.id))));}catch(error){notice.textContent=errorText(error);button.disabled=false;}});
ownReviews.addEventListener('click',async event=>{const button=event.target.closest('[data-remove-review]');if(!button||button.disabled||!confirm('Удалить этот отзыв?'))return;button.disabled=true;try{await deleteDoc(doc(db,'reviews',button.dataset.removeReview));}catch(error){notice.textContent=errorText(error);button.disabled=false;}});
document.querySelector('#logout')?.addEventListener('click',async()=>{try{await signOut(auth);location.href='index.html';}catch(error){notice.textContent=errorText(error);}});
addEventListener('pagehide',()=>stops.forEach(stop=>stop()),{once:true});
