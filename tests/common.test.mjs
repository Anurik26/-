import test from 'node:test';import assert from 'node:assert/strict';
import {esc,posterUrl,fallback,filterAnime,newest,uniqueBy,reviewSummary} from '../js/common.js';
const items=Array.from({length:25},(_,i)=>({id:String(i),title:i===24?'Последний тайтл':`Anime ${i}`,description:'Описание',genres:i===24?['Drama']:['Action'],rating:i%11,createdAt:{seconds:100-i}}));
test('search and genre find an entry beyond the first page',()=>{assert.equal(filterAnime(items,'последний')[0].id,'24');assert.equal(filterAnime(items,'','Drama')[0].id,'24');});
test('rating sort uses the whole result set',()=>{assert.equal(filterAnime(items,'','','rating')[0].rating,10);});
test('history keeps the newest visit per anime',()=>{const a=uniqueBy(newest([{animeId:'a',createdAt:{seconds:2}},{animeId:'a',createdAt:{seconds:7}},{animeId:'b',createdAt:{seconds:4}},{createdAt:{seconds:9}}]),'animeId');assert.deepEqual(a.map(x=>[x.animeId,x.createdAt.seconds]),[['a',7],['b',4]]);});
test('community rating uses one latest vote per person',()=>{assert.deepEqual(reviewSummary([{userId:'a',rating:2,createdAt:{seconds:1}},{userId:'a',rating:10,createdAt:{seconds:3}},{userId:'b',rating:8,createdAt:{seconds:2}}]),{count:2,rating:'9.0'});});
test('unsafe markup and image URLs are neutralized',()=>{assert.equal(esc('<img src="x">'), '&lt;img src=&quot;x&quot;&gt;');assert.equal(posterUrl('javascript:alert(1)'),fallback);assert.equal(posterUrl(''),fallback);assert.equal(posterUrl('https://example.com/a.jpg'),'https://example.com/a.jpg');});
