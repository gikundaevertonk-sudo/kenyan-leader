/* Leader photos: freely licensed lead images from Wikipedia articles, with author and licence credit.
   Fetched in the browser from the Wikipedia API (CORS via origin=*). Leaders without a free image get initials.
   Exposes one global, SiasaPhotos. */
var SiasaPhotos=(function(){
"use strict";
var WIKI={ruto:"William Ruto",gachagua:"Rigathi Gachagua",kalonzo:"Kalonzo Musyoka",matiangi:"Fred Matiang'i",
  karua:"Martha Karua",sifuna:"Edwin Sifuna",nyoro:"Ndindi Nyoro",babu:"Babu Owino",salasya:"Peter Salasya",
  wanga:"Gladys Wanga",millie:"Millie Odhiambo",nyamu:"Karen Nyamu",omanga:"Millicent Omanga",waiguru:"Anne Waiguru"};
var PHOTOS={}; // id -> {src, page, file, artist, license, licenseUrl}
var API="https://en.wikipedia.org/w/api.php?format=json&formatversion=2&origin=*&action=query";
var KEY="sc-photos-v1", TTL=7*864e5;

function stripTags(h){var d=document.createElement("div");d.innerHTML=h||"";return (d.textContent||"").replace(/\s+/g," ").trim()}
function esc(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function safeUrl(u){return /^https?:\/\//i.test(u)?u:"#"}

function load(){
  try{var c=JSON.parse(localStorage.getItem(KEY)||"null");
    if(c&&Date.now()-c.t<TTL){PHOTOS=c.p;return Promise.resolve(PHOTOS)}}catch(e){}
  var ids=Object.keys(WIKI), titles=ids.map(function(i){return WIKI[i]});
  return fetch(API+"&redirects=1&prop=pageimages&piprop=thumbnail|name&pithumbsize=480&pilicense=free&titles="+encodeURIComponent(titles.join("|")))
  .then(function(r){return r.json()}).then(function(d){
    var q=d.query||{}, alias={};
    (q.normalized||[]).concat(q.redirects||[]).forEach(function(m){alias[m.from]=m.to});
    var byTitle={}; (q.pages||[]).forEach(function(p){if(p.thumbnail&&p.pageimage)byTitle[p.title]=p});
    var found={};
    ids.forEach(function(id){var t=WIKI[id],n=0; while(alias[t]&&n++<4)t=alias[t];
      var p=byTitle[t]; if(p)found[id]={src:p.thumbnail.source,page:"https://en.wikipedia.org/wiki/"+encodeURIComponent(p.title.replace(/ /g,"_")),file:"File:"+p.pageimage.replace(/_/g," ")}});
    var files=Object.keys(found).map(function(id){return found[id].file});
    if(!files.length)return {};
    return fetch(API+"&prop=imageinfo&iiprop=extmetadata|url&iiextmetadatafilter=Artist|LicenseShortName|LicenseUrl&titles="+encodeURIComponent(files.join("|")))
    .then(function(r){return r.json()}).then(function(d2){
      var meta={}; ((d2.query||{}).pages||[]).forEach(function(p){var ii=(p.imageinfo||[])[0];if(ii)meta[p.title]={m:ii.extmetadata||{},url:ii.descriptionurl}});
      var nAlias={}; (((d2.query||{}).normalized)||[]).forEach(function(m){nAlias[m.from]=m.to});
      var out={};
      Object.keys(found).forEach(function(id){var f=found[id],mi=meta[nAlias[f.file]||f.file]; if(!mi)return;
        var lic=stripTags((mi.m.LicenseShortName||{}).value);
        if(!lic||/fair use|non-free/i.test(lic))return; // only freely licensed images
        out[id]={src:f.src,page:f.page,file:mi.url||f.page,artist:stripTags((mi.m.Artist||{}).value)||"Unknown author",
          license:lic,licenseUrl:(mi.m.LicenseUrl||{}).value||""};
      });
      return out;
    });
  }).then(function(out){PHOTOS=out;try{localStorage.setItem(KEY,JSON.stringify({t:Date.now(),p:out}))}catch(e){}return PHOTOS})
  .catch(function(){return PHOTOS});
}

// Small round portrait, or initials when no free photo is available.
function avatar(l){var p=PHOTOS[l.id];
  return p?'<img class="ava" src="'+esc(safeUrl(p.src))+'" alt="" loading="lazy" crossorigin="anonymous">'
    :'<span class="ava ph" aria-hidden="true">'+esc(l.ini)+'</span>';}

function credit(l){var p=PHOTOS[l.id]; if(!p)return "";
  return esc(l.n)+': <a href="'+esc(safeUrl(p.file))+'" target="_blank" rel="noopener noreferrer">photo</a> by '+esc(p.artist)+', '+
    (p.licenseUrl?'<a href="'+esc(safeUrl(p.licenseUrl))+'" target="_blank" rel="noopener noreferrer">'+esc(p.license)+'</a>':esc(p.license))+', via Wikimedia';}

return {load:load,avatar:avatar,credit:credit,get:function(id){return PHOTOS[id]||null}};
})();
