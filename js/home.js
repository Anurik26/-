import {db} from './firebase.js';
import {collection,query,orderBy,limit,onSnapshot} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {esc,posterUrl,rows,filterAnime,bindPosters} from './common.js';
const grid=document.querySelector('#animeGrid'),more=document.querySelector('#loadMore'),search=document.querySelector('#searchInput'),genre=document.querySelector('#genreFilter'),sort=document.querySelector('#sortSelect'),featured=document.querySelector('#featuredAnime');
const PAGE=10;let items=[],visible=PAGE,unsubscribe,request=0,loading=false,full=false,failed=false;
const status=document.createElement('p');status.className='muted';status.setAttribute('role','status');more.before(status);
function render(){
 const list=filterAnime(items,search.value,genre.value,sort.value),shown=list.slice(0,visible);
 grid.innerHTML=shown.length?shown.map(a=>`<article class="anime-card"><a href="anime.html?id=${encodeURIComponent(a.id)}"><img loading="lazy" src="${esc(posterUrl(a.poster))}" alt="${esc(a.title)}"></a><div class="anime-card-body"><span class="badge">${esc(a.year||'—')} / ${esc(a.status||'UNKNOWN')}</span><h3>${esc(a.title||'Без названия')}</h3><p>${esc(a.description||'Описание отсутствует.')}</p><div class="card-meta"><span>⭐ ${esc(a.rating??'—')}</span><span>${esc((Array.isArray(a.genres)?a.genres:[]).slice(0,2).join(' · '))}</span></div><a class="button small" href="anime.html?id=${encodeURIComponent(a.id)}">Подробнее ↗</a></div></article>`).join(''):'<p class="empty-state">Ничего не найдено. Попробуйте другой запрос.</p>';
 more.hidden=list.length<=visible;more.disabled=loading;more.textContent='Показать ещё ↓';status.textContent=`Показано: ${shown.length}${full?` из ${list.length}`:''}`;
 const a=items[0];featured.innerHTML=a?`<article class="featured"><div class="featured-media"><img src="${esc(posterUrl(a.poster))}" alt="${esc(a.title)}"></div><div class="featured-content"><span class="index">FEATURED / 01</span><h2>${esc(a.title)}</h2><p>${esc(a.description)}</p><div class="feature-stats"><div><strong>${esc(a.rating??'—')}</strong>RATING</div><div><strong>${esc(a.year??'—')}</strong>YEAR</div><div><strong>${esc(a.episodes??'—')}</strong>EPISODES</div></div><a class="button" href="anime.html?id=${encodeURIComponent(a.id)}">Смотреть тайтл ↗</a></div></article>`:'<p class="muted">В каталоге пока нет аниме.</p>';
 bindPosters(grid);bindPosters(featured);
}
function subscribe(){
 unsubscribe?.();const version=++request;full=Boolean(search.value.trim()||genre.value||sort.value!=='newest');loading=true;failed=false;more.disabled=true;status.textContent='Загрузка…';
 // Полный поиск по учебному каталогу; обычный просмотр ограничен размером страницы.
 const constraints=[orderBy('createdAt','desc')];if(!full)constraints.push(limit(visible+1));
 unsubscribe=onSnapshot(query(collection(db,'anime'),...constraints),snapshot=>{if(version!==request)return;items=rows(snapshot);loading=false;render();},error=>{
 if(version!==request)return;console.error(error);loading=false;failed=true;more.hidden=false;more.disabled=false;more.textContent='Повторить загрузку';status.textContent='Не удалось загрузить каталог.';if(!items.length){grid.innerHTML='<p class="empty-state">Проверьте соединение и повторите попытку.</p>';featured.innerHTML='';}
 });
}
let timer;function changed(){clearTimeout(timer);visible=PAGE;timer=setTimeout(subscribe,200);}
search.addEventListener('input',changed);genre.addEventListener('change',changed);sort.addEventListener('change',changed);
more.addEventListener('click',()=>{if(loading)return;if(failed){subscribe();return;}visible+=PAGE;if(full){render();}else{subscribe();}});
addEventListener('pagehide',()=>unsubscribe?.(),{once:true});subscribe();
