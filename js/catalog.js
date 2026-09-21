const poster = title => `https://placehold.co/600x840/17131f/f4f1ec?text=${encodeURIComponent(title)}`;

export const starterAnime = [
  {id:'death-note',title:'Death Note',year:2006,status:'Finished',episodes:37,genres:['Drama','Fantasy'],rating:8.6,ratingCount:1900,description:'Старшеклассник находит тетрадь, способную убить любого человека, чьё имя записано на её страницах.'},
  {id:'fullmetal-alchemist-brotherhood',title:'Fullmetal Alchemist: Brotherhood',year:2009,status:'Finished',episodes:64,genres:['Action','Adventure','Drama'],rating:9.1,ratingCount:2100,description:'Два брата-алхимика ищут философский камень, чтобы вернуть потерянные тела и исправить роковую ошибку.'},
  {id:'demon-slayer',title:'Demon Slayer',year:2019,status:'Ongoing',episodes:63,genres:['Action','Adventure','Fantasy'],rating:8.7,ratingCount:1650,description:'Тандзиро становится охотником на демонов, чтобы спасти сестру и найти виновника гибели своей семьи.'},
  {id:'jujutsu-kaisen',title:'Jujutsu Kaisen',year:2020,status:'Ongoing',episodes:47,genres:['Action','Fantasy'],rating:8.6,ratingCount:1480,description:'Юдзи Итадори вступает в мир магов и проклятий после встречи с опасным древним артефактом.'},
  {id:'one-punch-man',title:'One Punch Man',year:2015,status:'Ongoing',episodes:24,genres:['Action','Comedy'],rating:8.5,ratingCount:1750,description:'Сильнейший герой побеждает любого противника одним ударом, но больше всего страдает от скуки.'},
  {id:'spy-x-family',title:'Spy × Family',year:2022,status:'Ongoing',episodes:37,genres:['Action','Comedy'],rating:8.4,ratingCount:980,description:'Шпион, наёмная убийца и девочка-телепат изображают обычную семью ради секретной миссии.'},
  {id:'frieren',title:'Frieren: Beyond Journey’s End',year:2023,status:'Ongoing',episodes:28,genres:['Adventure','Drama','Fantasy'],rating:9.3,ratingCount:1200,description:'Эльфийка-маг отправляется в новое путешествие, пытаясь понять людей и ценность проведённого вместе времени.'},
  {id:'vinland-saga',title:'Vinland Saga',year:2019,status:'Ongoing',episodes:48,genres:['Action','Adventure','Drama'],rating:8.8,ratingCount:1100,description:'Юный Торфинн взрослеет среди викингов и ищет смысл жизни за пределами мести и войны.'},
  {id:'violet-evergarden',title:'Violet Evergarden',year:2018,status:'Finished',episodes:13,genres:['Drama','Romance'],rating:8.7,ratingCount:930,description:'Бывшая солдатка учится понимать чувства людей, записывая для них письма и узнавая значение любви.'},
  {id:'your-name',title:'Your Name',year:2016,status:'Finished',episodes:1,genres:['Drama','Romance','Fantasy'],rating:8.9,ratingCount:2200,description:'Двое подростков неожиданно начинают меняться телами и пытаются найти друг друга сквозь время.'},
  {id:'haikyuu',title:'Haikyu!!',year:2014,status:'Finished',episodes:85,genres:['Comedy','Drama'],rating:8.7,ratingCount:1350,description:'Невысокий, но невероятно упорный школьник мечтает стать выдающимся волейболистом.'},
  {id:'mob-psycho-100',title:'Mob Psycho 100',year:2016,status:'Finished',episodes:37,genres:['Action','Comedy'],rating:8.8,ratingCount:1050,description:'Скромный подросток с огромной психической силой старается жить обычной жизнью и держать эмоции под контролем.'},
  {id:'chainsaw-man',title:'Chainsaw Man',year:2022,status:'Ongoing',episodes:12,genres:['Action','Fantasy'],rating:8.5,ratingCount:1180,description:'Дэндзи получает силу демона-бензопилы и начинает охоту на чудовищ в обмен на простую человеческую жизнь.'},
  {id:'steins-gate',title:'Steins;Gate',year:2011,status:'Finished',episodes:24,genres:['Drama','Fantasy'],rating:9.0,ratingCount:1600,description:'Группа друзей случайно создаёт способ отправлять сообщения в прошлое и сталкивается с последствиями.'},
  {id:'cowboy-bebop',title:'Cowboy Bebop',year:1998,status:'Finished',episodes:26,genres:['Action','Adventure','Drama'],rating:8.8,ratingCount:1420,description:'Команда охотников за головами путешествует по Солнечной системе, пытаясь заработать и убежать от прошлого.'}
].map((item,index)=>({...item,poster:poster(item.title),createdAt:{seconds:1700000000-index*86400}}));

export const starterById = id => starterAnime.find(item=>item.id===id);
