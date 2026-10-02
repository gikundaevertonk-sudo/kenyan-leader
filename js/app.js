/* Siasa Compass app logic. Data lives in js/data.js (global SIASA). Wrapped in an IIFE so nothing leaks into the global scope. */
(function(){
"use strict";
var P=SiasaPhotos,SC=SiasaScore,DIMS=SIASA.DIMS,TOPIC=SIASA.TOPIC,ISSUES=SIASA.ISSUES,ANS=SIASA.ANS,W=SIASA.W,CONF=SIASA.CONF,L=SIASA.L,SETS=SIASA.SETS,uCount=SIASA.uCount;
var $=function(id){return document.getElementById(id)};
// Every data string that goes into innerHTML or an attribute passes through esc(). Text set via textContent does not need it.
// The only unescaped markup is the set headline/lede in data.js, which is authored HTML.
function esc(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
// Only http(s) links are allowed in href attributes.
function safeUrl(u){return /^https?:\/\//i.test(u)?u:"#"}
var views=["home","intro","quiz","result","records","method"];
var cur="now", rset="now";
// Quiz answers live in memory only, so they survive moving between views but not a page reload.
// A finished quiz is also sent, anonymously, to the answer tally (a Google Sheet; see sendTally) unless the visitor opts out.
var ST={all:{idx:0,answers:[],done:false,started:false},now:{idx:0,answers:[],done:false,started:false}};
// Progress is also kept in sessionStorage, so a reload (common on phones) does not lose a half-finished quiz.
// It lasts for this tab only. Storage can be blocked (private mode, file://), so every access is guarded.
var SKEY="siasa-quiz-v1";
function save(){try{sessionStorage.setItem(SKEY,JSON.stringify(ST))}catch(e){}}
(function(){try{var o=JSON.parse(sessionStorage.getItem(SKEY)||"null");
  ["all","now"].forEach(function(k){var t=o&&o[k];
    // Only restore progress that still fits the current question set.
    if(t&&Array.isArray(t.answers)&&t.answers.length<=SETS[k].q.length&&t.idx>=0&&t.idx<SETS[k].q.length&&(!t.done||t.answers.length===SETS[k].q.length))ST[k]=t;
  });
}catch(e){}})();
function S(){return SETS[cur]}
function st(){return ST[cur]}
function dimOf(k){return DIMS.filter(function(x){return x.k===k})[0]}
function issueOf(k){return ISSUES.filter(function(x){return x.k===k})[0]}
function show(v){clearPending();views.forEach(function(x){$("v-"+x).hidden=(x!==v)});
  document.querySelector(".site-share").hidden=(v==="result"); // the result page has its own share section
  $("about").hidden=(v!=="home"); // the static About text sits under home only, so quiz views stay focused
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
// Visitor counts (GoatCounter, loaded async in index.html). Each hash view counts as its own page.
// Calls made before the script arrives retry for a few seconds; if it never loads (offline, blocked, file://) nothing happens.
function track(path,title,event){
  var tries=0;
  (function send(){
    var gc=window.goatcounter;
    if(gc&&gc.count){try{gc.count({path:path,title:title,event:!!event})}catch(e){}return}
    if(++tries<20)setTimeout(send,500);
  })();
}
// Anonymous answer tally: the Google Apps Script web app URL from scripts/tally.gs (README, "Answer tally").
// Left empty, nothing is sent. Only the answers, the resulting scores and the top three matches go; no name, no id.
var TALLY="https://script.google.com/macros/s/AKfycbzIpWTzaYLU31JLY2pUDvoCyq1G6GPr4WhCigcpov17U1ur_8RVEFFmRywNn4Ni0rXj1g/exec";
var finished={all:0,now:0};
function sendTally(u,ranked){
  if(!TALLY||!$("q-tally").checked)return;
  var s=S(), a=st().answers;
  var body={quiz:s.key,name:s.name,q:s.q.map(function(x){return x[2]}),t:s.q.map(function(x){return TOPIC[x[0]]}),
    a:s.q.map(function(x,i){return a[i]}),you:u,top:ranked.slice(0,3).map(function(r){return r.l.n}),retake:finished[cur]++?1:0};
  // text/plain and no-cors keep this a "simple" request, which Apps Script accepts without a CORS preflight.
  try{fetch(TALLY,{method:"POST",mode:"no-cors",keepalive:true,headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(body)}).catch(function(){})}catch(e){}
}
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
    show(v); window.scrollTo(0,0); track("/leader/"+id,l.n);
    // A leader link puts focus on that leader's summary, which is their name, rather than the page heading.
    el.scrollIntoView({block:"start"}); el.querySelector("summary").focus({preventScroll:true});
    firstRoute=false; return;
  }else if(h==="home"){v="home"}
  else{go("#home",true);return}
  show(v); window.scrollTo(0,0); track(h==="home"?"/":"/"+h,document.title);
  if(!firstRoute)focusHeading(v);
  firstRoute=false;
}
function words(d,v){var D=dimOf(d);
  if(v<=-1.2)return D.lo; if(v<=-0.4)return "Leans "+D.lo.toLowerCase(); if(v<0.4)return "Mixed"; if(v<1.2)return "Leans "+D.hi.toLowerCase(); return D.hi;}
var matchable=SC.matchable, mostlyWords=SC.mostlyWords;

function renderHome(){
  $("paths").innerHTML=["now","all"].map(function(k){var s=SETS[k],p=s.pool();
    return '<div class="path"><span class="k">'+p.length+' leaders · '+s.q.length+' questions · about 4 minutes</span><h2>'+esc(s.name)+'</h2><p>'+s.lede+'</p>'+
      '<div class="cta"><button type="button" class="btn" data-go="'+esc(k)+'">Start the quiz</button><button type="button" class="btn ghost" data-rec="'+esc(k)+'">Read the records</button></div></div>';
  }).join('');
  bindGo($("paths"));
}
function bindGo(root){
  root.querySelectorAll("[data-go]").forEach(function(b){b.addEventListener("click",function(){cur=b.dataset.go;start()})});
  root.querySelectorAll("[data-rec]").forEach(function(b){b.addEventListener("click",function(){rset=b.dataset.rec;go("#records")})});
}
function renderIntro(){
  var s=S(),p=s.pool(),o=SETS[s.key==="all"?"now":"all"];
  $("v-intro").innerHTML='<p class="kicker">'+esc(s.name)+' quiz</p><h1 tabindex="-1">'+s.h1+'</h1><p class="lede">'+s.lede+'</p>'+
    '<div class="cta"><button type="button" class="btn" data-go="'+esc(s.key)+'">Start the quiz</button><button type="button" class="btn ghost" data-rec="'+esc(s.key)+'">Read the records first</button></div>'+
    '<p class="alt">Or take the other quiz: <a class="btn sm ghost" href="'+setHash(o.key)+'">'+esc(o.name)+'</a></p>'+
    '<div class="facts"><span><b>'+s.q.length+'</b> questions</span><span><b>'+DIMS.length+'</b> dimensions</span><span><b>'+p.length+'</b> leaders</span><span><b>4</b> minutes</span></div>';
  bindGo($("v-intro"));
}
function renderQ(){
  var s=S(),t=st(),q=s.q[t.idx];
  $("quiz-h").textContent=s.name+" quiz";
  $("q-count").textContent="Question "+(t.idx+1)+" of "+s.q.length;
  $("q-topic").textContent=TOPIC[q[0]]+(q[3]?" · "+issueOf(q[3]).name:"");
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
    if(last){if(t.done)return;t.done=true;save();go("#result-"+cur,true)} // results are built once
    else{t.idx++;save();renderQ()}
  },160);
}
function back(){if(pending||st().idx<=0)return;st().idx--;save();renderQ()}
document.addEventListener("keydown",function(e){
  if($("v-quiz").hidden||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
  if(e.key>="1"&&e.key<="5")choose(parseInt(e.key,10));
  else if(e.key==="ArrowLeft")back();
});

// Scoring lives in js/score.js (SiasaScore); these bind it to the quiz on screen.
function userScores(){return SC.userScores(S().q,st().answers)}
function compare(u){return SC.compare(S().pool(),u)}

function renderResult(){
  var s=S(), u=userScores(), cmp=compare(u);
  var ranked=SC.rank(cmp);
  var left=cmp.filter(function(r){return !matchable(r.l)});
  var top3={}; ranked.slice(0,3).forEach(function(r){top3[r.l.id]=1});
  var tags=DIMS.filter(function(d){return Math.abs(u[d.k])>=0.6}).map(function(d){return words(d.k,u[d.k])});
  // The headline match is always the top of the ranked list, so it never disagrees with the list below it.
  var b=ranked[0], html='';
  // Count each finished quiz once, with its top match, so the dashboard shows completions and who people land on.
  if(!st().counted){st().counted=true;save();track("quiz-finished-"+cur,"Finished: "+s.name,true);if(b)track("top-match-"+cur+"/"+b.l.id,"Top match ("+s.name+"): "+b.l.n,true);sendTally(u,ranked)}
  html+='<h2 tabindex="-1">Here is where you land</h2>';
  html+='<div class="chips">'+(tags.length?tags.map(function(t){return '<span class="chip sun">'+esc(t)+'</span>'}).join(''):'<span class="chip sun">Centrist on most dimensions</span>')+'</div>';
  if(b){
    html+='<div class="best"><span class="k">'+esc(s.name)+' · your closest match</span><div class="head">'+P.avatar(b.l)+'<div><h3>'+esc(b.l.n)+'</h3><p class="role">'+esc(b.l.role)+'</p></div></div>'+
      '<p class="why">'+esc(b.l.suggests)+'</p>'+

      '<div class="cmp"><div class="h"><span>Dimension</span><span>You</span><span>'+esc(b.l.n.split(" ").slice(-1)[0])+'</span></div>'+
      Object.keys(b.l.dims).map(function(k){return '<div><span>'+esc(dimOf(k).name)+'</span><span>'+esc(words(k,u[k]))+'</span><span>'+esc(words(k,b.l.dims[k][0]))+'</span></div>'}).join('')+'</div>'+
      '<button type="button" class="btn" data-open="'+esc(b.l.id)+'">Read what they did</button></div>';
  }
  // Offer sharing straight after the headline result, before the ranked list and the detail below it.
  html+=SiasaShare.section();
  html+='<p class="notice">Overlaps with records, not a recommendation.</p>';
  html+='<div class="sec"><h3>Closest documented records</h3><p class="sub">Overlap, from 0% (opposite) to 100% (same).</p><div>';
  var SHOW=5;
  ranked.forEach(function(r,i){
    var miss=DIMS.length-r.n;
    html+='<div class="match"'+(i>=SHOW?' data-more hidden':'')+'>'+P.avatar(r.l)+'<div class="nm">'+esc(r.l.n)+(cur==="all"?'<small>'+(r.l.now?'current':'earlier')+'</small>':'')+'</div><div class="cl"><b>Close on '+r.close+'/'+DIMS.length+'</b> · '+Math.round(r.score*100)+'%'+(miss?' <small>· '+miss+' no record</small>':'')+(mostlyWords(r.l)?' <small class="w">· mostly words</small>':'')+'</div>'+
      '<div class="meter"><span style="width:'+Math.round(r.score*100)+'%"></span></div></div>';
  });
  if(ranked.length>SHOW)html+='<button type="button" class="btn ghost" id="show-more">Show all '+ranked.length+' leaders</button>';
  var credits=ranked.map(function(r){return P.credit(r.l)}).filter(Boolean);
  html+='</div>'+(credits.length?'<details class="credits"><summary>Photo credits</summary><ul><li>'+credits.join('</li><li>')+'</li></ul></details>':'')+'</div>';
  html+='<details class="sec fold"><summary><h3>Dimension by dimension</h3></summary><p class="sub">Tap a circle for the evidence.</p>'+
    '<div class="legend"><span><i class="y"></i>You</span><span><i class="f"></i>Your closest three</span><span><i></i>Other leaders</span><span><i class="d"></i>Low confidence</span><span><i class="s"></i>Based on stated positions</span><span><i class="h"></i>Based on hearsay</span></div><div id="tracks"></div></details>';
  if(left.length)html+='<div class="sec"><h3>Not enough evidence to match yet</h3><p class="sub">Too little evidence to compare. Read their records instead.</p><div class="chips">'+
    left.map(function(r){return '<button type="button" class="chip" data-open="'+esc(r.l.id)+'">'+esc(r.l.n)+'</button>'}).join('')+'</div></div>';
  html+='<div class="cta"><button type="button" class="btn ghost" id="retake">Retake this quiz</button><button type="button" class="btn ghost" id="other">Try '+esc(SETS[cur==="all"?"now":"all"].name)+'</button></div>';
  $("v-result").innerHTML=html;
  drawTracks(u,top3);
  var close=b?" Closest documented record: "+b.l.n+".":"";
  SiasaShare.bind({
    text:"My Siasa Compass result"+(tags.length?": "+tags.slice(0,3).join(", "):": centrist on most dimensions")+"."+close+" Where do you land?",
    summary:"My Siasa Compass result ("+s.name+"): "+DIMS.map(function(d){return d.name+": "+words(d.k,u[d.k])}).join("; ")+"."+close,
    top:ranked.slice(0,3),tags:tags});
  var sm=$("show-more");
  if(sm)sm.addEventListener("click",function(){$("v-result").querySelectorAll(".match[data-more]").forEach(function(x){x.hidden=false});sm.remove()});
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
    pool.forEach(function(l){var x=l.dims[d.k];if(x)items.push({l:l,v:x[0],conf:x[1],note:x[2],st:x[3]==="S",hs:x[3]==="H"})});
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
      var cls="dot"+(it.you?" you":"")+(it.l&&top3[it.l.id]?" top":"")+(it.conf==="L"?" low":"")+(it.st?" st":"")+(it.hs?" hs":"");
      var label=it.you?"You":it.l.ini;
      var lab=it.you?"You":it.l.n;
      return '<button type="button" class="'+cls+'" style="left:'+it.left+'%;top:'+(it.row*32+(it.you?1:5))+'px" data-i="'+i+'" aria-label="'+esc(lab)+'" title="'+esc(lab)+'" aria-pressed="false">'+esc(label)+'</button>';
    }).join('');
    sec.innerHTML='<h4>'+esc(d.name)+'</h4><p class="yours">You: '+esc(words(d.k,u[d.k]).toLowerCase())+'</p>'+
      '<div class="tw"><div class="inner" style="height:'+h+'px"><div class="rail"></div>'+dots+'</div></div>'+
      '<div class="poles"><span>'+esc(d.lo)+'</span><span>'+esc(d.hi)+'</span></div><p class="dnote" aria-live="polite">Tap a circle for the evidence.</p>';
    out.appendChild(sec);
    sec.querySelectorAll(".dot").forEach(function(b){b.addEventListener("click",function(){
      var it=items[+b.dataset.i];
      sec.querySelectorAll(".dot").forEach(function(x){x.classList.remove("sel");x.setAttribute("aria-pressed","false")}); b.classList.add("sel"); b.setAttribute("aria-pressed","true");
      sec.querySelector(".dnote").textContent=it.you?("Your answers to the "+nq[d.k]+" "+TOPIC[d.k].toLowerCase()+" questions average out to: "+words(d.k,it.v)+"."):(it.l.n+": "+words(d.k,it.v)+" (evidence confidence "+CONF[it.conf]+(it.st?", based on stated positions":it.hs?", based on hearsay (reports, lightest weight)":", based on actions")+"). "+it.note);
    })});
  });
}

// How a leader's words are treated: in power, words never count; otherwise they count (tagged S, weighted below
// actions) unless the record contradicts them.
function basisLine(l){
  if(l.inPower&&l.limitedPower)return 'In office, with limited power of their own. Actions first; words and reports count less.';
  if(l.inPower)return 'In power now. Judged on actions only.';
  if(l.exec)return 'Held power before. Actions first; uncontradicted words and reports count less.';
  return 'Never held executive power. Actions first; stated positions and reports count less.';
}
function leaderHTML(l){
  var tend=Object.keys(l.dims).map(function(k){var d=l.dims[k];
    return '<div><b>'+esc(dimOf(k).name)+':</b> '+esc(words(k,d[0]))+' <span class="why">('+esc(CONF[d[1]])+' confidence'+(d[3]==="S"?', stated position':d[3]==="H"?', hearsay':'')+')</span><div class="why">'+(d[3]==="S"||d[3]==="H"?'<span class="tg '+d[3]+'">'+d[3]+'</span> ':'')+esc(d[2])+'</div></div>'}).join('')||'<div class="why">No dimension has enough evidence to place this leader.</div>';
  var rec=l.rec.map(function(r){return '<li><span class="tg '+esc(r[0])+'">'+esc(r[0])+'</span><span>'+esc(r[1])+'</span></li>'}).join('');
  var said=(l.said||[]).map(function(p){
    var note=p[3]==="X"?'<p class="xnote">Contradicted by the record. Not counted.</p>':
      (l.inPower&&!l.limitedPower?'<p class="xnote">Made in power, so not counted.</p>':'');
    return '<li><div class="said"><span class="lbl">Said they would</span>'+esc(p[0])+'</div>'+
      '<div><span class="lbl">'+(l.exec?'What they did':'Record so far')+'</span><div class="did">'+(p[1]?'<span class="tg '+esc(p[2])+'">'+esc(p[2])+'</span><span>'+esc(p[1])+'</span>':'<span class="tg S">S</span><span>No record in office yet. Counts as a stated position.</span>')+'</div>'+note+'</div></li>'}).join('');
  var nu=uCount(l);
  // Where they stand on the issues voters rank highest, in poll order. Research material only; not used in matching.
  var iss=(l.iss||[]).slice().sort(function(a,b){return ISSUES.indexOf(issueOf(a[0]))-ISSUES.indexOf(issueOf(b[0]))}).map(function(x){
    return '<li><span class="tg '+esc(x[1])+'">'+esc(x[1])+'</span><span><b>'+esc(issueOf(x[0]).name)+':</b> '+esc(x[2])+'</span></li>'}).join('');
  var con=l.contra.map(function(c){return '<li><span class="tg I">I</span><span>'+esc(c)+'</span></li>'}).join('');
  var src=l.src.map(function(s){return '<li><a href="'+esc(safeUrl(s[1]))+'" target="_blank" rel="noopener noreferrer">'+esc(s[0])+'</a></li>'}).join('');
  return '<details class="lead" id="lead-'+esc(l.id)+'"><summary>'+P.avatar(l)+'<span class="who">'+esc(l.n)+'</span><span class="cls">'+esc(l.cls)+'</span><span class="role">'+esc(l.role)+'</span></summary><div class="body">'+
    '<p class="basis">'+basisLine(l).replace(/^([^.]*\.)/,'<b>$1</b>')+'</p>'+
    '<p class="meta">'+(l.reviewed?'Reviewed '+esc(l.reviewed)+' · ':'')+(nu?nu+' claim'+(nu===1?'':'s')+' not yet re-checked · ':'')+'<a href="/leaders/'+esc(l.id)+'/">Full page</a></p>'+
    '<div><h5>What the record shows</h5><ul class="rec">'+rec+'</ul></div>'+
    (iss?'<div><h5>On the issues voters rank highest</h5><ul class="rec">'+iss+'</ul><p class="iss-note">Issues in the order voters ranked them (Infotrak, December 2025). Shown for reference; not used in matching. <a href="#method">Why</a></p></div>':'')+
    (said?'<div><h5>'+(l.exec?'What they said, and what they did':'What they say they would do')+'</h5><ul class="pd">'+said+'</ul></div>':'')+
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
function start(){ST[cur]={idx:0,answers:[],done:false,started:true};save();track("quiz-started-"+cur,"Started: "+S().name,true);go("#quiz-"+cur,/^#result/.test(location.hash))} // a retake replaces the result entry so Back does not bounce
$("home").addEventListener("click",function(){go("#home")});
$("q-back").addEventListener("click",back);
document.querySelectorAll(".nav .tabs button").forEach(function(b){b.addEventListener("click",function(){
  var t=b.dataset.tab; go(t==="all"||t==="now"?setHash(t):"#"+t);
})});
document.querySelectorAll("#rtoggle button").forEach(function(b){b.addEventListener("click",function(){rset=b.dataset.r;renderRecords()})});
window.addEventListener("hashchange",route);
renderHome();
// Arriving from a shared result (r/<id>/ sends people to /?from=<id>): say whose record it was and offer the matching quiz.
(function(){
  var m=/[?&]from=([^&#]+)/.exec(location.search), id=m&&decodeURIComponent(m[1]), l=L.filter(function(x){return x.id===id})[0];
  if(!l)return;
  var k=l.now?"now":"all", p=document.createElement("p");
  p.className="notice from";
  p.innerHTML='A friend shared their result: their closest documented record is <b>'+esc(l.n)+'</b>. <a href="#quiz-'+k+'">Take the '+esc(SETS[k].name)+' quiz</a> and see where you land.';
  $("v-home").insertBefore(p,$("v-home").firstChild);
  track("from-share-"+id,"Arrived from shared result: "+l.n,true);
})();
route();
// Photos arrive after the first render. Redraw the view on screen so it picks them up, keeping open profiles open.
P.load().then(function(){
  if(!$("v-records").hidden){
    var open=[].map.call(document.querySelectorAll(".lead[open]"),function(d){return d.id});
    renderRecords(); open.forEach(function(id){$(id).open=true});
  }else if(!$("v-result").hidden)renderResult();
});
})();
