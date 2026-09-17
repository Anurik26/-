import {db} from './firebase.js';
import {doc,getDoc,setDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
export async function ensureProfile(user,name) {
  const ref=doc(db,'users',user.uid), snapshot=await getDoc(ref);
  if(snapshot.exists())return snapshot.data();
  const data={name:name||user.displayName||'Anime fan',email:user.email||'',role:'user',createdAt:serverTimestamp()};
  await setDoc(ref,data); return data;
}
