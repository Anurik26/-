import {readFile,writeFile} from 'node:fs/promises';
const env={...process.env};
try{
  const text=await readFile('.env','utf8');
  for(const raw of text.split(/\r?\n/)){
    const line=raw.trim();
    if(!line||line.startsWith('#'))continue;
    const at=line.indexOf('=');
    if(at>0&&!env[line.slice(0,at)])env[line.slice(0,at)]=line.slice(at+1).trim();
  }
}catch(error){if(error.code!=='ENOENT')throw error;}
const names=['FIREBASE_API_KEY','FIREBASE_AUTH_DOMAIN','FIREBASE_PROJECT_ID','FIREBASE_STORAGE_BUCKET','FIREBASE_MESSAGING_SENDER_ID','FIREBASE_APP_ID','FIREBASE_MEASUREMENT_ID'];
const missing=names.filter(name=>!env[name]);
if(missing.length)throw new Error(`Missing environment variables: ${missing.join(', ')}`);
const config={apiKey:env.FIREBASE_API_KEY,authDomain:env.FIREBASE_AUTH_DOMAIN,projectId:env.FIREBASE_PROJECT_ID,storageBucket:env.FIREBASE_STORAGE_BUCKET,messagingSenderId:env.FIREBASE_MESSAGING_SENDER_ID,appId:env.FIREBASE_APP_ID,measurementId:env.FIREBASE_MEASUREMENT_ID};
await writeFile('js/firebase-config.js',`// Generated at build time. Do not edit or commit.\nexport const firebaseConfig=${JSON.stringify(config,null,2)};\n`);
