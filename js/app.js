// App logic: navigation, quiz flow, scoring, results and leader profiles.
var $=function(id){return document.getElementById(id)};
var views=["intro","quiz","result","leaders","method"];
var idx=0, answers=[];
function show(v){views.forEach(function(x){$("v-"+x).hidden=(x!==v)});
  var tab=(v==="leaders")?"leaders":(v==="method")?"method":"quiz";
  document.querySelectorAll(".tabs button").forEach(function(b){b.setAttribute("aria-current",b.dataset.tab===tab?"true":"false")});
  window.scrollTo(0,0);}
function words(d,v){var D=DIMS.filter(function(x){return x.k===d})[0];
  if(v<=-1.2)return D.lo; if(v<=-0.4)return "Leans "+D.lo.toLowerCase(); if(v<0.4)return "Mixed"; if(v<1.2)return "Leans "+D.hi.toLowerCase(); return D.hi;}

function renderQ(){
  var q=Q[idx];
  $("q-count").textContent="Question "+(idx+1)+" of "+Q.length;
  $("q-topic").textContent=TOPIC[q[0]];
  $("q-bar").style.width=((idx)/Q.length*100)+"%";
  $("q-text").textContent=q[2];
  var box=$("q-opts"); box.innerHTML="";
  ANS.forEach(function(a,i){
    var b=document.createElement("button"); b.type="button"; b.className="opt"; b.textContent=a;
    b.setAttribute("aria-pressed",answers[idx]===i+1?"true":"false");
    b.addEventListener("click",function(){choose(i+1)});
    box.appendChild(b);
  });
  $("q-back").style.visibility=idx===0?"hidden":"visible";
}
function choose(v){answers[idx]=v;
  if(idx<Q.length-1){setTimeout(function(){idx++;renderQ()},160);renderQ();}
  else{setTimeout(finish,160)}}
document.addEventListener("keydown",function(e){
  if($("v-quiz").hidden)return;
  if(e.key>="1"&&e.key<="5"){choose(parseInt(e.key,10))}
  if(e.key==="ArrowLeft"&&idx>0){idx--;renderQ()}
});

function userScores(){
  var s={},c={};
  DIMS.forEach(function(d){s[d.k]=0;c[d.k]=0});
  Q.forEach(function(q,i){s[q[0]]+=(answers[i]-3)*q[1];c[q[0]]++});
  DIMS.forEach(function(d){s[d.k]=s[d.k]/c[d.k]});
  return s;
}
function compare(u){
  return L.map(function(l){
    var keys=Object.keys(l.dims), num=0, den=0, close=0;
    keys.forEach(function(k){var d=l.dims[k],w=W[d[1]],dist=Math.abs(u[k]-d[0]);
      num+=w*(1-dist/4); den+=w; if(dist<=1)close++;});
    return {l:l,n:keys.length,close:close,score:den?num/den:0};
  });
}

var SEL={};
function finish(){
  // Give photos a moment to arrive, but never hold the result back for long.
  Promise.race([photosReady,new Promise(function(r){setTimeout(r,2500)})]).then(renderResult);
}
function renderResult(){
  var u=userScores(), cmp=compare(u);
  var ranked=cmp.filter(function(r){return r.n>=3}).sort(function(a,b){return b.score-a.score});
  var left=cmp.filter(function(r){return r.n<3});
  var top3={}; ranked.slice(0,3).forEach(function(r){top3[r.l.id]=1});
  var tags=DIMS.filter(function(d){return Math.abs(u[d.k])>=0.6}).map(function(d){return words(d.k,u[d.k])});
  var html='';
  html+='<h2>Here is where you land</h2>';
  html+='<div class="chips">'+(tags.length?tags.map(function(t){return '<span class="chip sun">'+t+'</span>'}).join(''):'<span class="chip sun">Centrist on most dimensions</span>')+'</div>';
  html+='<p class="notice">These are overlaps with documented records, not a recommendation. A close match on some dimensions can sit beside a big gap on others. Check each track below.</p>';
  html+='<div class="sec"><h3>Closest documented records</h3><p class="sub">Ranked by how near each leader\'s evidenced positions are to yours. Only dimensions with enough evidence are compared.</p><div>';
  ranked.forEach(function(r){
    html+='<div class="match">'+avatar(r.l)+'<div class="nm">'+r.l.n+'</div><div class="cl">close on '+r.close+' of '+r.n+' dimensions</div>'+
      '<div class="meter"><span style="width:'+Math.round(r.score*100)+'%"></span></div></div>';
  });
  var credits=ranked.map(function(r){return creditLine(r.l)}).filter(Boolean);
  html+='</div>'+(credits.length?'<details class="credits"><summary>Photo credits</summary><ul><li>'+credits.join('</li><li>')+'</li></ul></details>':'')+'</div>';
  html+='<div class="sec"><h3>Dimension by dimension</h3><p class="sub">Tap a circle to see the evidence behind that placement.</p>'+
    '<div class="legend"><span><i class="y"></i>You</span><span><i class="f"></i>Your closest three</span><span><i></i>Other leaders</span><span><i class="d"></i>Low-confidence placement</span></div><div id="tracks"></div></div>';
  html+='<div class="sec"><h3>Not enough evidence to match yet</h3><p class="sub">These leaders have too few documented, comparable positions in this draft. Read what is on record instead.</p><div class="chips">'+
    left.map(function(r){return '<button type="button" class="chip" data-open="'+r.l.id+'">'+r.l.n+'</button>'}).join('')+'</div></div>';
  html+=shareSection();
  $("v-result").innerHTML=html;
  show("result");
  drawTracks(u,top3);
  bindShare(u,ranked,tags);
  $("retake").addEventListener("click",start);
  document.querySelectorAll("[data-open]").forEach(function(b){b.addEventListener("click",function(){openLeader(b.dataset.open)})});
}

function drawTracks(u,top3){
  var out=$("tracks"); out.innerHTML="";
  DIMS.forEach(function(d){
    var items=[{you:true,v:u[d.k]}];
    L.forEach(function(l){if(l.dims[d.k])items.push({l:l,v:l.dims[d.k][0],conf:l.dims[d.k][1],note:l.dims[d.k][2]})});
    items.sort(function(a,b){return a.v-b.v});
    var rows=[];
    items.forEach(function(it){
      it.left=(it.v+2)/4*100;
      var r=0; for(;;r++){
        var clash=(rows[r]||[]).some(function(o){return Math.abs(o.left-it.left)<(it.you?9:7.5)});
        if(!clash)break;
      }
      (rows[r]=rows[r]||[]).push(it); it.row=r;
    });
    var h=46+(rows.length-1)*32;
    var sec=document.createElement("div"); sec.className="dim";
    var dots=items.map(function(it,i){
      var cls="dot"+(it.you?" you":"")+(it.l&&top3[it.l.id]?" top":"")+(it.conf==="L"?" low":"");
      var label=it.you?"You":it.l.ini;
      var lab=it.you?"You":it.l.n;
      return '<button type="button" class="'+cls+'" style="left:'+it.left+'%;top:'+(it.row*32+(it.you?1:5))+'px" data-i="'+i+'" aria-label="'+lab+'">'+label+'</button>';
    }).join('');
    sec.innerHTML='<h4>'+d.name+'</h4><p class="yours">You: '+words(d.k,u[d.k]).toLowerCase()+'</p>'+
      '<div class="tw"><div class="inner" style="height:'+h+'px"><div class="rail"></div>'+dots+'</div></div>'+
      '<div class="poles"><span>'+d.lo+'</span><span>'+d.hi+'</span></div><p class="dnote">Select a circle for the evidence.</p>';
    out.appendChild(sec);
    sec.querySelectorAll(".dot").forEach(function(b){b.addEventListener("click",function(){
      var it=items[+b.dataset.i];
      sec.querySelectorAll(".dot").forEach(function(x){x.classList.remove("sel")}); b.classList.add("sel");
      sec.querySelector(".dnote").textContent=it.you?("Your answers to the three "+TOPIC[d.k].toLowerCase()+" questions average out to: "+words(d.k,it.v)+"."):(it.l.n+": "+words(d.k,it.v)+" (evidence confidence "+CONF[it.conf]+"). "+it.note);
    })});
  });
}

function renderLeaders(){
  var box=$("leader-list");
  box.innerHTML=L.map(function(l){
    var tend=Object.keys(l.dims).map(function(k){var d=l.dims[k],D=DIMS.filter(function(x){return x.k===k})[0];
      return '<div><b>'+D.name+':</b> '+words(k,d[0])+' <span class="why">('+CONF[d[1]]+' confidence)</span><div class="why">'+d[2]+'</div></div>'}).join('')||'<div class="why">No dimension has enough evidence to place this leader.</div>';
    var rec=l.rec.map(function(r){return '<li><span class="tg '+r[0]+'">'+r[0]+'</span><span>'+r[1]+'</span></li>'}).join('');
    var con=l.contra.map(function(c){return '<li><span class="tg I">I</span><span>'+c+'</span></li>'}).join('');
    var src=l.src.map(function(s){return '<li><a href="'+s[1]+'" target="_blank" rel="noopener noreferrer">'+s[0]+'</a></li>'}).join('');
    return '<details class="lead" id="lead-'+l.id+'"><summary>'+avatar(l)+'<span class="who">'+l.n+'</span><span class="cls">'+l.cls+'</span><span class="role">'+l.role+'</span></summary><div class="body">'+
      '<div><h5>What the record shows</h5><ul class="rec">'+rec+'</ul></div>'+
      '<div><h5>Where the evidence points, by dimension</h5><div class="tend">'+tend+'</div></div>'+
      '<div><h5>Contradictions in the record</h5><ul class="rec">'+con+'</ul></div>'+
      '<div><h5>What they appear to have stood for</h5><p>'+l.suggests+'</p></div>'+
      '<div><h5>Sources</h5><ul class="src">'+src+'</ul></div>'+
      (PHOTOS[l.id]?'<p class="pcredit">'+creditLine(l)+'</p>':'')+'</div></details>';
  }).join('');
}
function openLeader(id){show("leaders");var el=$("lead-"+id);if(el){el.open=true;setTimeout(function(){el.scrollIntoView({block:"start"})},30)}}

$("m-dims").innerHTML=DIMS.map(function(d){return '<li><b>'+d.name+':</b> '+d.lo+' to '+d.hi+'</li>'}).join('');
function start(){idx=0;answers=[];show("quiz");renderQ()}
$("start").addEventListener("click",start);
$("browse").addEventListener("click",function(){show("leaders")});
$("q-back").addEventListener("click",function(){if(idx>0){idx--;renderQ()}});
document.querySelectorAll(".tabs button").forEach(function(b){b.addEventListener("click",function(){
  var t=b.dataset.tab; if(t==="quiz"){ if(!$("v-result").innerHTML||answers.length<Q.length){show(answers.length&&answers.length<Q.length?"quiz":"intro")}else{show("result")} } else show(t);
})});
renderLeaders();
var photosReady=loadPhotos().then(function(){
  var open=[].map.call(document.querySelectorAll(".lead[open]"),function(d){return d.id});
  renderLeaders(); open.forEach(function(id){$(id).open=true});
});
