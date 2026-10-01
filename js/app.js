/* Siasa Compass app logic. Data lives in js/data.js (global SIASA). Wrapped in an IIFE so nothing leaks into the global scope. */
(function(){
"use strict";
var P=SiasaPhotos,DIMS=SIASA.DIMS,TOPIC=SIASA.TOPIC,ANS=SIASA.ANS,W=SIASA.W,CONF=SIASA.CONF,L=SIASA.L,SETS=SIASA.SETS,uCount=SIASA.uCount;
var $=function(id){return document.getElementById(id)};
// Every data string that goes into innerHTML or an attribute passes through esc(). Text set via textContent does not need it.
// The only unescaped markup is the set headline/lede in data.js, which is authored HTML.
function esc(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
// Only http(s) links are allowed in href attributes.
function safeUrl(u){return /^https?:\/\//i.test(u)?u:"#"}
var views=["home","intro","quiz","result","records","method"];
var cur="all", rset="all";
// Quiz answers live in memory only, so they survive moving between views but not a page reload.
var ST={all:{idx:0,answers:[],done:false,started:false},now:{idx:0,answers:[],done:false,started:false}};
function S(){return SETS[cur]}
function st(){return ST[cur]}
function dimOf(k){return DIMS.filter(function(x){return x.k===k})[0]}
function show(v){clearPending();views.forEach(function(x){$("v-"+x).hidden=(x!==v)});
  var tab=(v==="records"||v==="method")?v:(v==="home")?"":cur;
  document.querySelectorAll(".nav .tabs button").forEach(function(b){b.setAttribute("aria-current",b.dataset.tab===tab?"true":"false")});
}
// Hash routing: #home, #quiz-all, #quiz-now, #result-all, #result-now, #records, #method, #leader-<id>.
// go() changes the route; replace=true swaps the current history entry so Back never lands on a redirect.
function go(hash,replace){
  if(location.hash===hash){route();return}
  if(replace)location.replace(hash);else location.hash=hash;
}
function setHash(k){return ST[k].done?"#result-"+k:"#quiz-"+k}
var firstRoute=true;
function focusHeading(v){
  var h=$("v-"+v).querySelector('[tabindex="-1"]');
  if(h)h.focus({preventScroll:true});
}
function route(){
  var h=(location.hash||"#home").slice(1), m, v;
  if(m=/^(quiz|result)-(all|now)$/.exec(h)){
    cur=m[2]; var t=st();
    if(m[1]==="quiz"){
      if(t.done){go("#result-"+cur,true);return}
      if(t.started){v="quiz";renderQ()} else {v="intro";renderIntro()}
    }else{
      if(!t.done){go("#quiz-"+cur,true);return}
      v="result";renderResult();
    }
  }else if(h==="records"){v="records";renderRecords()}
  else if(h==="method"){v="method"}
  else if(m=/^leader-(.+)$/.exec(h)){
    var id=decodeURIComponent(m[1]), l=L.filter(function(x){return x.id===id})[0];
    if(!l){go("#records",true);return}
    if(!l.now)rset="all"; else if(rset!=="all")rset=cur;
    v="records";renderRecords();
    var el=$("lead-"+id); el.open=true;
    show(v); window.scrollTo(0,0);
    // A leader link puts focus on that leader's summary, which is their name, rather than the page heading.
    el.scrollIntoView({block:"start"}); el.querySelector("summary").focus({preventScroll:true});
    firstRoute=false; return;
  }else if(h==="home"){v="home"}
  else{go("#home",true);return}
  show(v); window.scrollTo(0,0);
  if(!firstRoute)focusHeading(v);
  firstRoute=false;
}
function words(d,v){var D=dimOf(d);
  if(v<=-1.2)return D.lo; if(v<=-0.4)return "Leans "+D.lo.toLowerCase(); if(v<0.4)return "Mixed"; if(v<1.2)return "Leans "+D.hi.toLowerCase(); return D.hi;}
function matchable(l){return Object.keys(l.dims).length>=3}

function renderHome(){
  $("paths").innerHTML=["all","now"].map(function(k){var s=SETS[k],p=s.pool();
    var exec=p.filter(function(l){return l.exec}).length;
    return '<div class="path"><span class="k">'+p.length+' leaders · '+exec+' judged on actions in power</span><h2>'+esc(s.name)+'</h2><p>'+s.lede+'</p>'+
      '<div class="cta"><button type="button" class="btn" data-go="'+esc(k)+'">Start the quiz</button><button type="button" class="btn ghost" data-rec="'+esc(k)+'">Read the records</button></div></div>';
  }).join('');
  bindGo($("paths"));
}
function bindGo(root){
  root.querySelectorAll("[data-go]").forEach(function(b){b.addEventListener("click",function(){cur=b.dataset.go;start()})});
  root.querySelectorAll("[data-rec]").forEach(function(b){b.addEventListener("click",function(){rset=b.dataset.rec;go("#records")})});
}
function renderIntro(){
  var s=S(),p=s.pool();
  $("v-intro").innerHTML='<p class="kicker">'+esc(s.name)+' quiz</p><h1 tabindex="-1">'+s.h1+'</h1><p class="lede">'+s.lede+'</p>'+
    '<div class="cta"><button type="button" class="btn" data-go="'+esc(s.key)+'">Start the quiz</button><button type="button" class="btn ghost" data-rec="'+esc(s.key)+'">Read the records first</button></div>'+
    '<div class="facts"><span><b>'+s.q.length+'</b> questions</span><span><b>'+DIMS.length+'</b> dimensions</span><span><b>'+p.length+'</b> leaders</span><span><b>'+p.filter(matchable).length+'</b> with enough evidence to match</span><span>About 4 minutes</span></div>';
  bindGo($("v-intro"));
}
function renderQ(){
  var s=S(),t=st(),q=s.q[t.idx];
  $("quiz-h").textContent=s.name+" quiz";
  $("q-count").textContent=s.name+" · Question "+(t.idx+1)+" of "+s.q.length;
  $("q-topic").textContent=TOPIC[q[0]];
  $("q-bar").style.width=(t.idx/s.q.length*100)+"%";
  $("q-text").textContent=q[2];
  var box=$("q-opts"); box.innerHTML="";
  ANS.forEach(function(a,i){
    var b=document.createElement("button"); b.type="button"; b.className="opt"; b.textContent=a;
    b.setAttribute("aria-pressed",t.answers[t.idx]===i+1?"true":"false");
    b.addEventListener("click",function(){choose(i+1)});
    box.appendChild(b);
  });
  $("q-back").style.visibility=t.idx===0?"hidden":"visible";
}
// Input lock: while a move to the next question (or to the results) is pending, quiz input is ignored.
// This stops two quick presses writing to the same question and leaving another one unanswered.
var pending=null;
function clearPending(){if(pending){clearTimeout(pending);pending=null}}
function choose(v){
  var t=st(),last=t.idx>=S().q.length-1;
  if(pending||t.done)return;
  t.answers[t.idx]=v;
  renderQ();
  pending=setTimeout(function(){
    pending=null;
    if(last){if(t.done)return;t.done=true;go("#result-"+cur,true)} // results are built once
    else{t.idx++;renderQ()}
  },160);
}
function back(){if(pending||st().idx<=0)return;st().idx--;renderQ()}
document.addEventListener("keydown",function(e){
  if($("v-quiz").hidden||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
  if(e.key>="1"&&e.key<="5")choose(parseInt(e.key,10));
  else if(e.key==="ArrowLeft")back();
});

function userScores(){
  var s={},c={},q=S().q,a=st().answers;
  DIMS.forEach(function(d){s[d.k]=0;c[d.k]=0});
  // Skip unanswered questions so a gap can never turn a score into NaN.
  q.forEach(function(x,i){var v=a[i];if(!(v>=1&&v<=5))return;s[x[0]]+=(v-3)*x[1];c[x[0]]++});
  DIMS.forEach(function(d){s[d.k]=c[d.k]?s[d.k]/c[d.k]:0});
  return s;
}
/* Scoring. Confidence counts across leaders by shrinking each placement toward the neutral midpoint (0):
   effective = position x W[confidence]  (H 1, M 0.8, L 0.5).
   A thinly evidenced leader therefore reads as less extreme on a dimension, so it cannot beat a solidly
   evidenced leader just by sitting on your exact position. (A plain weighted average would not do this: the weights
   cancel when leaders are compared with each other.)
   Per dimension, similarity = max(0, 1 - |you - effective| / 3), so a gap of 3 points (three quarters of the scale)
   reads as 0% and an exact match as 100%. The overall score is the mean similarity over the leader's dimensions.
   "close" is counted on the raw placement (no shrinking): within 1 point of you. It is the main figure shown.
   "den" (evidence) is the sum of the confidence weights and gates the headline match. */
var GAP=3;
function similarity(you,pos,conf){return Math.max(0,1-Math.abs(you-pos*W[conf])/GAP)}
function compare(u){
  return S().pool().map(function(l){
    var keys=Object.keys(l.dims), sum=0, ev=0, close=0;
    keys.forEach(function(k){var d=l.dims[k];
      sum+=similarity(u[k],d[0],d[1]); ev+=W[d[1]]; if(Math.abs(u[k]-d[0])<=1)close++;});
    return {l:l,n:keys.length,close:close,den:ev,score:keys.length?sum/keys.length:0};
  });
}

function renderResult(){
  var s=S(), u=userScores(), cmp=compare(u);
  var ranked=cmp.filter(function(r){return r.n>=3}).sort(function(a,b){return b.score-a.score||b.close-a.close});
  var left=cmp.filter(function(r){return r.n<3});
  var top3={}; ranked.slice(0,3).forEach(function(r){top3[r.l.id]=1});
  var tags=DIMS.filter(function(d){return Math.abs(u[d.k])>=0.6}).map(function(d){return words(d.k,u[d.k])});
  // The headline match needs solid evidence (roughly three medium-confidence dimensions); thin records still appear in the list.
  var b=ranked.filter(function(r){return r.den>=2.4})[0]||ranked[0], html='';
  html+='<h2 tabindex="-1">Here is where you land</h2>';
  html+='<div class="chips">'+(tags.length?tags.map(function(t){return '<span class="chip sun">'+esc(t)+'</span>'}).join(''):'<span class="chip sun">Centrist on most dimensions</span>')+'</div>';
  if(b){
    html+='<div class="best"><span class="k">'+esc(s.name)+' · closest well-evidenced record</span><div class="head">'+P.avatar(b.l)+'<div><h3>'+esc(b.l.n)+'</h3><p class="role">'+esc(b.l.role)+'</p></div></div>'+
      '<p class="why">'+esc(b.l.suggests)+'</p>'+
      '<p class="role">'+(b.l.exec?'Placed on what they did in power. Their promises are not counted.':'Has not held executive power, so stated positions can count where tagged.')+'</p>'+
      '<div class="cmp"><div class="h"><span>Dimension</span><span>You</span><span>'+esc(b.l.n.split(" ").slice(-1)[0])+'</span></div>'+
      Object.keys(b.l.dims).map(function(k){return '<div><span>'+esc(dimOf(k).name)+'</span><span>'+esc(words(k,u[k]))+'</span><span>'+esc(words(k,b.l.dims[k][0]))+'</span></div>'}).join('')+'</div>'+
      '<button type="button" class="btn" data-open="'+esc(b.l.id)+'">Read what they did</button></div>';
  }
  html+='<p class="notice">These are overlaps with documented records, not a recommendation. A close match on some dimensions can sit beside a big gap on others. Check each track below.</p>';
  html+='<div class="sec"><h3>Closest documented records</h3><p class="sub">Ranked by how near each leader\'s evidenced positions are to yours, with thinly evidenced placements counting for less. Only dimensions with enough evidence are compared. The bar is the overall overlap: 0% means opposite positions, 100% means the same.</p><div>';
  ranked.forEach(function(r){
    html+='<div class="match">'+P.avatar(r.l)+'<div class="nm">'+esc(r.l.n)+(cur==="all"?'<small>'+(r.l.now?'current':'earlier')+'</small>':'')+'</div><div class="cl"><b>Close on '+r.close+' of '+r.n+'</b> dimensions <small>('+Math.round(r.score*100)+'% overlap)</small></div>'+
      '<div class="meter"><span style="width:'+Math.round(r.score*100)+'%"></span></div></div>';
  });
  var credits=ranked.map(function(r){return P.credit(r.l)}).filter(Boolean);
  html+='</div>'+(credits.length?'<details class="credits"><summary>Photo credits</summary><ul><li>'+credits.join('</li><li>')+'</li></ul></details>':'')+'</div>';
  html+='<div class="sec"><h3>Dimension by dimension</h3><p class="sub">Tap a circle to see the evidence behind that placement.</p>'+
    '<div class="legend"><span><i class="y"></i>You</span><span><i class="f"></i>Your closest three</span><span><i></i>Other leaders</span><span><i class="d"></i>Low confidence</span><span><i class="s"></i>Based on stated positions</span></div><div id="tracks"></div></div>';
  if(left.length)html+='<div class="sec"><h3>Not enough evidence to match yet</h3><p class="sub">These leaders have too few comparable positions in this draft. For those who held power, words are not allowed to fill the gap. Read what is on record instead.</p><div class="chips">'+
    left.map(function(r){return '<button type="button" class="chip" data-open="'+esc(r.l.id)+'">'+esc(r.l.n)+'</button>'}).join('')+'</div></div>';
  html+=SiasaShare.section('<button type="button" class="btn ghost" id="retake">Retake this quiz</button><button type="button" class="btn ghost" id="other">Try '+esc(SETS[cur==="all"?"now":"all"].name)+'</button>');
  $("v-result").innerHTML=html;
  drawTracks(u,top3);
  var close=b?" Closest documented record: "+b.l.n+".":"";
  SiasaShare.bind({
    text:"My Siasa Compass result"+(tags.length?": "+tags.slice(0,3).join(", "):": centrist on most dimensions")+"."+close+" Where do you land?",
    summary:"My Siasa Compass result ("+s.name+"): "+DIMS.map(function(d){return d.name+": "+words(d.k,u[d.k])}).join("; ")+"."+close,
    top:ranked.slice(0,3),tags:tags});
  $("retake").addEventListener("click",start);
  $("other").addEventListener("click",function(){go(setHash(cur==="all"?"now":"all"))});
  $("v-result").querySelectorAll("[data-open]").forEach(function(x){x.addEventListener("click",function(){go("#leader-"+encodeURIComponent(x.dataset.open))})});
}

function drawTracks(u,top3){
  var out=$("tracks"), pool=S().pool(), nq={};
  S().q.forEach(function(q){nq[q[0]]=(nq[q[0]]||0)+1});
  out.innerHTML="";
  DIMS.forEach(function(d){
    var items=[{you:true,v:u[d.k]}];
    pool.forEach(function(l){var x=l.dims[d.k];if(x)items.push({l:l,v:x[0],conf:x[1],note:x[2],st:x[3]==="S"})});
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
      var cls="dot"+(it.you?" you":"")+(it.l&&top3[it.l.id]?" top":"")+(it.conf==="L"?" low":"")+(it.st?" st":"");
      var label=it.you?"You":it.l.ini;
      var lab=it.you?"You":it.l.n;
      return '<button type="button" class="'+cls+'" style="left:'+it.left+'%;top:'+(it.row*32+(it.you?1:5))+'px" data-i="'+i+'" aria-label="'+esc(lab)+'" title="'+esc(lab)+'" aria-pressed="false">'+esc(label)+'</button>';
    }).join('');
    sec.innerHTML='<h4>'+esc(d.name)+'</h4><p class="yours">You: '+esc(words(d.k,u[d.k]).toLowerCase())+'</p>'+
      '<div class="tw"><div class="inner" style="height:'+h+'px"><div class="rail"></div>'+dots+'</div></div>'+
      '<div class="poles"><span>'+esc(d.lo)+'</span><span>'+esc(d.hi)+'</span></div><p class="dnote" aria-live="polite">Select a circle for the evidence.</p>';
    out.appendChild(sec);
    sec.querySelectorAll(".dot").forEach(function(b){b.addEventListener("click",function(){
      var it=items[+b.dataset.i];
      sec.querySelectorAll(".dot").forEach(function(x){x.classList.remove("sel");x.setAttribute("aria-pressed","false")}); b.classList.add("sel"); b.setAttribute("aria-pressed","true");
      sec.querySelector(".dnote").textContent=it.you?("Your answers to the "+nq[d.k]+" "+TOPIC[d.k].toLowerCase()+" questions average out to: "+words(d.k,it.v)+"."):(it.l.n+": "+words(d.k,it.v)+" (evidence confidence "+CONF[it.conf]+(it.st?", based on stated positions":", based on actions")+"). "+it.note);
    })});
  });
}

function leaderHTML(l){
  var tend=Object.keys(l.dims).map(function(k){var d=l.dims[k];
    return '<div><b>'+esc(dimOf(k).name)+':</b> '+esc(words(k,d[0]))+' <span class="why">('+esc(CONF[d[1]])+' confidence'+(d[3]==="S"?', stated position':'')+')</span><div class="why">'+(d[3]==="S"?'<span class="tg S">S</span> ':'')+esc(d[2])+'</div></div>'}).join('')||'<div class="why">No dimension has enough evidence to place this leader.</div>';
  var rec=l.rec.map(function(r){return '<li><span class="tg '+esc(r[0])+'">'+esc(r[0])+'</span><span>'+esc(r[1])+'</span></li>'}).join('');
  var said=(l.said||[]).map(function(p){
    return '<li><div class="said"><span class="lbl">'+(l.exec?'Said they would':'Says they would')+'</span>'+esc(p[0])+'</div>'+
      '<div><span class="lbl">'+(l.exec?'What they did':'Record so far')+'</span><div class="did">'+(p[1]?'<span class="tg '+esc(p[2])+'">'+esc(p[2])+'</span><span>'+esc(p[1])+'</span>':'<span class="tg S">S</span><span>Has not held executive power, so there is no delivery record yet. This stated position can count.</span>')+'</div></div></li>'}).join('');
  var nu=uCount(l);
  var con=l.contra.map(function(c){return '<li><span class="tg I">I</span><span>'+esc(c)+'</span></li>'}).join('');
  var src=l.src.map(function(s){return '<li><a href="'+esc(safeUrl(s[1]))+'" target="_blank" rel="noopener noreferrer">'+esc(s[0])+'</a></li>'}).join('');
  return '<details class="lead" id="lead-'+esc(l.id)+'"><summary>'+P.avatar(l)+'<span class="who">'+esc(l.n)+'</span><span class="cls">'+esc(l.cls)+'</span><span class="role">'+esc(l.role)+'</span></summary><div class="body">'+
    '<p class="basis">'+(l.exec?'<b>Held executive power.</b> Placed only on what they did. Promises are shown next to the record, not counted.':'<b>Has not held executive power.</b> Actions come first. Stated positions can count where the record is thin and are tagged S.')+'</p>'+
    '<p class="meta">Last reviewed: '+(l.reviewed?esc(l.reviewed):'not recorded')+' · '+nu+' claim'+(nu===1?'':'s')+' not yet re-checked · <a href="#leader-'+esc(encodeURIComponent(l.id))+'">Link to this profile</a></p>'+
    '<div><h5>What the record shows</h5><ul class="rec">'+rec+'</ul></div>'+
    (said?'<div><h5>'+(l.exec?'What they said they would do, and what they did':'What they say they would do')+'</h5><ul class="pd">'+said+'</ul></div>':'')+
    '<div><h5>Where the evidence points, by dimension</h5><div class="tend">'+tend+'</div></div>'+
    '<div><h5>Contradictions in the record</h5><ul class="rec">'+con+'</ul></div>'+
    '<div><h5>What they appear to have stood for</h5><p>'+esc(l.suggests)+'</p></div>'+
    '<div><h5>Sources</h5><ul class="src">'+src+'</ul></div>'+
    (P.get(l.id)?'<p class="pcredit">'+P.credit(l)+'</p>':'')+'</div></details>';
}
function renderRecords(){
  document.querySelectorAll("#rtoggle button").forEach(function(b){b.setAttribute("aria-current",b.dataset.r===rset?"true":"false")});
  var box=$("leader-list"), now=L.filter(function(l){return l.now}), past=L.filter(function(l){return !l.now});
  box.innerHTML=rset==="now"?'<div>'+now.map(leaderHTML).join('')+'</div>':
    '<p class="grp">In today\'s political climate</p><div>'+now.map(leaderHTML).join('')+'</div><p class="grp">Earlier leaders</p><div>'+past.map(leaderHTML).join('')+'</div>';
}
$("m-dims").innerHTML=DIMS.map(function(d){return '<li><b>'+esc(d.name)+':</b> '+esc(d.lo)+' to '+esc(d.hi)+'</li>'}).join('');
function start(){ST[cur]={idx:0,answers:[],done:false,started:true};go("#quiz-"+cur,/^#result/.test(location.hash))} // a retake replaces the result entry so Back does not bounce
$("home").addEventListener("click",function(){go("#home")});
$("q-back").addEventListener("click",back);
document.querySelectorAll(".nav .tabs button").forEach(function(b){b.addEventListener("click",function(){
  var t=b.dataset.tab; go(t==="all"||t==="now"?setHash(t):"#"+t);
})});
document.querySelectorAll("#rtoggle button").forEach(function(b){b.addEventListener("click",function(){rset=b.dataset.r;renderRecords()})});
window.addEventListener("hashchange",route);
renderHome();
route();
// Photos arrive after the first render. Redraw the view on screen so it picks them up, keeping open profiles open.
P.load().then(function(){
  if(!$("v-records").hidden){
    var open=[].map.call(document.querySelectorAll(".lead[open]"),function(d){return d.id});
    renderRecords(); open.forEach(function(id){$(id).open=true});
  }else if(!$("v-result").hidden)renderResult();
});
})();
