export const fallback = 'assets/poster.svg';
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
export function posterUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : fallback; } catch { return fallback; }
}
export const millis = value => value?.toMillis?.() ?? (value?.seconds ?? 0) * 1000;
export const newest = items => [...items].sort((a,b) => millis(b.createdAt)-millis(a.createdAt));
export const rows = snapshot => snapshot.docs.map(d=>({...d.data(),id:d.id}));
export function uniqueBy(items,key) { const seen=new Set(); return items.filter(x=>x[key]&&!seen.has(x[key])&&seen.add(x[key])); }
export function filterAnime(items,text='',genre='',sort='newest') {
  const term=text.trim().toLocaleLowerCase('ru');
  const result=items.filter(a=>(!term||`${a.title||''} ${a.description||''}`.toLocaleLowerCase('ru').includes(term))&&(!genre||(Array.isArray(a.genres)&&a.genres.includes(genre))));
  if(sort==='title')return result.sort((a,b)=>String(a.title||'').localeCompare(String(b.title||''),'ru'));
  if(sort==='rating')return result.sort((a,b)=>(Number(b.rating)||0)-(Number(a.rating)||0));
  return newest(result);
}
export function reviewSummary(items) {
  const votes=uniqueBy(newest(items),'userId').filter(x=>Number.isInteger(x.rating)&&x.rating>=1&&x.rating<=10);
  return {count:votes.length,rating:votes.length?(votes.reduce((s,x)=>s+x.rating,0)/votes.length).toFixed(1):'—'};
}
export const dateLabel=value=>millis(value)?new Date(millis(value)).toLocaleDateString('ru-RU'):'Сейчас';
export function bindPosters(root=document) { root.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.src=fallback;},{once:true})); }
export function errorText(error) {
  if(error?.code==='permission-denied')return 'Нет доступа к этому действию. Обновите страницу или войдите заново.';
  if(error?.code==='unavailable'||error?.code==='auth/network-request-failed')return 'Нет соединения. Проверьте интернет и повторите попытку.';
  return 'Не удалось выполнить действие. Попробуйте ещё раз.';
}
