import {auth} from './firebase.js';
import {createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail,updateProfile} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {ensureProfile} from './account.js';
const login=document.querySelector('#loginForm'), registration=document.querySelector('#registerForm'), message=document.querySelector('#message'), email=document.querySelector('#email'), password=document.querySelector('#password'), nameInput=document.querySelector('#name');
let pendingRegistration=null;
function authError(error) {
 const messages={'auth/email-already-in-use':'Этот email уже зарегистрирован. Войдите в аккаунт.','auth/weak-password':'Пароль должен содержать не менее 6 символов.','auth/invalid-email':'Проверьте email.','auth/invalid-credential':'Неверный email или пароль.','auth/too-many-requests':'Слишком много попыток. Попробуйте позже.','auth/network-request-failed':'Проверьте соединение с интернетом.'};
 return messages[error.code]||'Не удалось выполнить действие. Попробуйте ещё раз.';
}
async function submit(form,action) {
 const button=form.querySelector('[type="submit"]'); if(button.disabled)return; button.disabled=true; message.textContent='Подождите…';
 try{await action();}catch(error){console.error(error);message.textContent=authError(error);}finally{button.disabled=false;}
}
login?.addEventListener('submit',event=>{event.preventDefault();void submit(login,async()=>{
 const {user}=await signInWithEmailAndPassword(auth,email.value.trim(),password.value); await ensureProfile(user); location.href='index.html';
});});
registration?.addEventListener('submit',event=>{event.preventDefault();void submit(registration,async()=>{
 const name=nameInput.value.trim(); if(!name||name.length>80){message.textContent='Введите имя от 1 до 80 символов.';return;}
 const enteredEmail=email.value.trim();
 if(!pendingRegistration||pendingRegistration.email!==enteredEmail)pendingRegistration=(await createUserWithEmailAndPassword(auth,enteredEmail,password.value)).user;
 await updateProfile(pendingRegistration,{displayName:name});await ensureProfile(pendingRegistration,name);location.href='profile.html';
});});
document.querySelector('#resetPassword')?.addEventListener('click',async event=>{
 if(!email.value.trim()||!email.checkValidity()){message.textContent='Введите корректный email в поле выше.';email.focus();return;}
 const button=event.currentTarget;button.disabled=true;
 try{auth.languageCode='ru';await sendPasswordResetEmail(auth,email.value.trim());message.textContent='Если аккаунт существует, письмо для восстановления пароля отправлено. Проверьте также папку «Спам».';}catch(error){message.textContent=authError(error);}finally{button.disabled=false;}
});
