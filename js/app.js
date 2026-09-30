var DIMS=SIASA.DIMS,TOPIC=SIASA.TOPIC,ANS=SIASA.ANS,W=SIASA.W,CONF=SIASA.CONF,L=SIASA.L,SETS=SIASA.SETS;
var $=function(id){return document.getElementById(id)};
var views=["home","intro","quiz","result","records","method"];
var cur="all", rset="all";
var ST={all:{idx:0,answers:[],done:false},now:{idx:0,answers:[],done:false}};
function S(){return SETS[cur]}
function st(){return ST[cur]}
function dimOf(k){return DIMS.filter(function(x){return x.k===k})[0]}
function show(v){views.forEach(function(x){$("v-"+x).hidden=(x!==v)});
  var tab=(v==="records"||v==="method")?v:(v==="home")?"":cur;
  document.querySelectorAll(".nav .tabs button").forEach(function(b){b.setAttribute("aria-current",b.dataset.tab===tab?"true":"false")});
  window.scrollTo(0,0);}
function words(d,v){var D=dimOf(d);
  if(v<=-1.2)return D.lo; if(v<=-0.4)return "Leans "+D.lo.toLowerCase(); if(v<0.4)return "Mixed"; if(v<1.2)return "Leans "+D.hi.toLowerCase(); return D.hi;}
function matchable(l){return Object.keys(l.dims).length>=3}

function renderHome(){
  $("paths").innerHTML=["all","now"].map(function(k){var s=SETS[k],p=s.pool();
    var exec=p.filter(function(l){return l.exec}).length;
    return '<div class="path"><span class="k">'+p.length+' leaders · '+exec+' judged on actions in power</span><h2>'+s.name+'</h2><p>'+s.lede+'</p>'+
      '<div class="cta"><button type="button" class="btn" data-go="'+k+'">Start the quiz</button><button type="button" class="btn ghost" data-rec="'+k+'">Read the records</button></div></div>';
  }).join('');
  bindGo($("paths"));
}
function bindGo(root){
  root.querySelectorAll("[data-go]").forEach(function(b){b.addEventListener("click",function(){cur=b.dataset.go;start()})});
  root.querySelectorAll("[data-rec]").forEach(function(b){b.addEventListener("click",function(){rset=b.dataset.rec;renderRecords();show("records")})});
}
function renderIntro(){
  var s=S(),p=s.pool();
  $("v-intro").innerHTML='<h1>'+s.h1+'</h1><p class="lede">'+s.lede+'</p>'+
    '<div class="cta"><button type="button" class="btn" data-go="'+s.key+'">Start the quiz</button><button type="button" class="btn ghost" data-rec="'+s.key+'">Read the records first</button></div>'+
    '<div class="facts"><span><b>'+s.q.length+'</b> questions</span><span><b>'+DIMS.length+'</b> dimensions</span><span><b>'+p.length+'</b> leaders</span><span><b>'+p.filter(matchable).length+'</b> with enough evidence to match</span><span>About 4 minutes</span></div>';
  bindGo($("v-intro"));
}
function openSet(k){cur=k;var t=ST[k];
  if(t.done){renderResult();show("result")}
  else if(t.answers.length){show("quiz");renderQ()}
  else{renderIntro();show("intro")}}

function renderQ(){
  var s=S(),t=st(),q=s.q[t.idx];
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
function choose(v){var t=st(),n=S().q.length;t.answers[t.idx]=v;
  if(t.idx<n-1){renderQ();setTimeout(function(){t.idx++;renderQ()},160)}
  else{setTimeout(function(){t.done=true;renderResult();show("result")},160)}}
document.addEventListener("keydown",function(e){
  if($("v-quiz").hidden)return;
  if(e.key>="1"&&e.key<="5"){choose(parseInt(e.key,10))}
  if(e.key==="ArrowLeft"&&st().idx>0){st().idx--;renderQ()}
});

function userScores(){
  var s={},c={},q=S().q,a=st().answers;
  DIMS.forEach(function(d){s[d.k]=0;c[d.k]=0});
  q.forEach(function(x,i){s[x[0]]+=(a[i]-3)*x[1];c[x[0]]++});
  DIMS.forEach(function(d){s[d.k]=c[d.k]?s[d.k]/c[d.k]:0});
  return s;
}
function compare(u){
  return S().pool().map(function(l){
    var keys=Object.keys(l.dims), num=0, den=0, close=0;
    keys.forEach(function(k){var d=l.dims[k],w=W[d[1]],dist=Math.abs(u[k]-d[0]);
      num+=w*(1-dist/4); den+=w; if(dist<=1)close++;});
    return {l:l,n:keys.length,close:close,den:den,score:den?num/den:0};
  });
}

function renderResult(){
  var s=S(), u=userScores(), cmp=compare(u);
  var ranked=cmp.filter(function(r){return r.n>=3}).sort(function(a,b){return b.score-a.score});
  var left=cmp.filter(function(r){return r.n<3});
  var top3={}; ranked.slice(0,3).forEach(function(r){top3[r.l.id]=1});
  var tags=DIMS.filter(function(d){return Math.abs(u[d.k])>=0.6}).map(function(d){return words(d.k,u[d.k])});
  // The headline match needs solid evidence (roughly three medium-confidence dimensions); thin records still appear in the list.
  var b=ranked.filter(function(r){return r.den>=2.4})[0]||ranked[0], html='';
  html+='<h2>Here is where you land</h2>';
  html+='<div class="chips">'+(tags.length?tags.map(function(t){return '<span class="chip sun">'+t+'</span>'}).join(''):'<span class="chip sun">Centrist on most dimensions</span>')+'</div>';
  if(b){
    html+='<div class="best"><span class="k">'+s.name+' · closest well-evidenced record</span><h3>'+b.l.n+'</h3><p class="role">'+b.l.role+'</p>'+
      '<p class="why">'+b.l.suggests+'</p>'+
      '<p class="role">'+(b.l.exec?'Placed on what they did in power. Their promises are not counted.':'Has not held executive power, so stated positions can count where tagged.')+'</p>'+
      '<div class="cmp"><div class="h"><span>Dimension</span><span>You</span><span>'+b.l.n.split(" ").slice(-1)[0]+'</span></div>'+
      Object.keys(b.l.dims).map(function(k){return '<div><span>'+dimOf(k).name+'</span><span>'+words(k,u[k])+'</span><span>'+words(k,b.l.dims[k][0])+'</span></div>'}).join('')+'</div>'+
      '<button type="button" class="btn" data-open="'+b.l.id+'">Read what they did</button></div>';
  }
  html+='<p class="notice">These are overlaps with documented records, not a recommendation. A close match on some dimensions can sit beside a big gap on others. Check each track below.</p>';
  html+='<div class="sec"><h3>Closest documented records</h3><p class="sub">Ranked by how near each leader\'s evidenced positions are to yours. Only dimensions with enough evidence are compared.</p><div>';
  ranked.forEach(function(r){
    html+='<div class="match"><div class="nm">'+r.l.n+(cur==="all"?'<small>'+(r.l.now?'current':'earlier')+'</small>':'')+'</div><div class="cl">close on '+r.close+' of '+r.n+' dimensions</div>'+
      '<div class="meter"><span style="width:'+Math.round(r.score*100)+'%"></span></div></div>';
  });
  html+='</div></div>';
  html+='<div class="sec"><h3>Dimension by dimension</h3><p class="sub">Tap a circle to see the evidence behind that placement.</p>'+
    '<div class="legend"><span><i class="y"></i>You</span><span><i class="f"></i>Your closest three</span><span><i></i>Other leaders</span><span><i class="d"></i>Low confidence</span><span><i class="s"></i>Based on stated positions</span></div><div id="tracks"></div></div>';
  if(left.length)html+='<div class="sec"><h3>Not enough evidence to match yet</h3><p class="sub">These leaders have too few comparable positions in this draft. For those who held power, words are not allowed to fill the gap. Read what is on record instead.</p><div class="chips">'+
    left.map(function(r){return '<button type="button" class="chip" data-open="'+r.l.id+'">'+r.l.n+'</button>'}).join('')+'</div></div>';
  html+='<div class="sec share"><h3>Share your result</h3><p class="sub">Copy this summary. It contains only your dimension positions and closest match.</p><textarea id="sum" readonly></textarea><div class="cta"><button type="button" class="btn" id="copy">Copy summary</button><button type="button" class="btn ghost" id="retake">Retake this quiz</button><button type="button" class="btn ghost" id="other">Try '+SETS[cur==="all"?"now":"all"].name+'</button></div></div>';
  $("v-result").innerHTML=html;
  drawTracks(u,top3);
  var sm="My Siasa Compass result ("+s.name+"): "+DIMS.map(function(d){return d.name+": "+words(d.k,u[d.k])}).join("; ")+"."+(b?" Closest documented record: "+b.l.n+".":"");
  $("sum").value=sm;
  $("copy").addEventListener("click",function(){
    var done=function(){$("copy").textContent="Copied"};
    try{navigator.clipboard.writeText(sm).then(done,function(){$("sum").select()})}catch(e){$("sum").select()}
  });
  $("retake").addEventListener("click",start);
  $("other").addEventListener("click",function(){openSet(cur==="all"?"now":"all")});
  $("v-result").querySelectorAll("[data-open]").forEach(function(x){x.addEventListener("click",function(){openLeader(x.dataset.open)})});
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
      return '<button type="button" class="'+cls+'" style="left:'+it.left+'%;top:'+(it.row*32+(it.you?1:5))+'px" data-i="'+i+'" aria-label="'+lab+'">'+label+'</button>';
    }).join('');
    sec.innerHTML='<h4>'+d.name+'</h4><p class="yours">You: '+words(d.k,u[d.k]).toLowerCase()+'</p>'+
      '<div class="tw"><div class="inner" style="height:'+h+'px"><div class="rail"></div>'+dots+'</div></div>'+
      '<div class="poles"><span>'+d.lo+'</span><span>'+d.hi+'</span></div><p class="dnote">Select a circle for the evidence.</p>';
    out.appendChild(sec);
    sec.querySelectorAll(".dot").forEach(function(b){b.addEventListener("click",function(){
      var it=items[+b.dataset.i];
      sec.querySelectorAll(".dot").forEach(function(x){x.classList.remove("sel")}); b.classList.add("sel");
      sec.querySelector(".dnote").textContent=it.you?("Your answers to the "+nq[d.k]+" "+TOPIC[d.k].toLowerCase()+" questions average out to: "+words(d.k,it.v)+"."):(it.l.n+": "+words(d.k,it.v)+" (evidence confidence "+CONF[it.conf]+(it.st?", based on stated positions":", based on actions")+"). "+it.note);
    })});
  });
}

function leaderHTML(l){
  var tend=Object.keys(l.dims).map(function(k){var d=l.dims[k];
    return '<div><b>'+dimOf(k).name+':</b> '+words(k,d[0])+' <span class="why">('+CONF[d[1]]+' confidence'+(d[3]==="S"?', stated position':'')+')</span><div class="why">'+(d[3]==="S"?'<span class="tg S">S</span> ':'')+d[2]+'</div></div>'}).join('')||'<div class="why">No dimension has enough evidence to place this leader.</div>';
  var rec=l.rec.map(function(r){return '<li><span class="tg '+r[0]+'">'+r[0]+'</span><span>'+r[1]+'</span></li>'}).join('');
  var said=(l.said||[]).map(function(p){
    return '<li><div class="said"><span class="lbl">'+(l.exec?'Said they would':'Says they would')+'</span>'+p[0]+'</div>'+
      '<div><span class="lbl">'+(l.exec?'What they did':'Record so far')+'</span><div class="did">'+(p[1]?'<span class="tg '+p[2]+'">'+p[2]+'</span><span>'+p[1]+'</span>':'<span class="tg S">S</span><span>Has not held executive power, so there is no delivery record yet. This stated position can count.</span>')+'</div></div></li>'}).join('');
  var con=l.contra.map(function(c){return '<li><span class="tg I">I</span><span>'+c+'</span></li>'}).join('');
  var src=l.src.map(function(s){return '<li><a href="'+s[1]+'" target="_blank" rel="noopener noreferrer">'+s[0]+'</a></li>'}).join('');
  return '<details class="lead" id="lead-'+l.id+'"><summary><span class="who">'+l.n+'</span><span class="cls">'+l.cls+'</span><span class="role">'+l.role+'</span></summary><div class="body">'+
    '<p class="basis">'+(l.exec?'<b>Held executive power.</b> Placed only on what they did. Promises are shown next to the record, not counted.':'<b>Has not held executive power.</b> Actions come first. Stated positions can count where the record is thin and are tagged S.')+'</p>'+
    '<div><h5>What the record shows</h5><ul class="rec">'+rec+'</ul></div>'+
    (said?'<div><h5>'+(l.exec?'What they said they would do, and what they did':'What they say they would do')+'</h5><ul class="pd">'+said+'</ul></div>':'')+
    '<div><h5>Where the evidence points, by dimension</h5><div class="tend">'+tend+'</div></div>'+
    '<div><h5>Contradictions in the record</h5><ul class="rec">'+con+'</ul></div>'+
    '<div><h5>What they appear to have stood for</h5><p>'+l.suggests+'</p></div>'+
    '<div><h5>Sources</h5><ul class="src">'+src+'</ul></div></div></details>';
}
function renderRecords(){
  document.querySelectorAll("#rtoggle button").forEach(function(b){b.setAttribute("aria-current",b.dataset.r===rset?"true":"false")});
  var box=$("leader-list"), now=L.filter(function(l){return l.now}), past=L.filter(function(l){return !l.now});
  box.innerHTML=rset==="now"?'<div>'+now.map(leaderHTML).join('')+'</div>':
    '<p class="grp">In today\'s political climate</p><div>'+now.map(leaderHTML).join('')+'</div><p class="grp">Earlier leaders</p><div>'+past.map(leaderHTML).join('')+'</div>';
}
function openLeader(id){var l=L.filter(function(x){return x.id===id})[0];
  if(l&&!l.now)rset="all"; else if(rset!=="all")rset=cur;
  renderRecords();show("records");var el=$("lead-"+id);if(el){el.open=true;setTimeout(function(){el.scrollIntoView({block:"start"})},30)}}

$("m-dims").innerHTML=DIMS.map(function(d){return '<li><b>'+d.name+':</b> '+d.lo+' to '+d.hi+'</li>'}).join('');
function start(){ST[cur]={idx:0,answers:[],done:false};show("quiz");renderQ()}
$("home").addEventListener("click",function(){show("home")});
$("q-back").addEventListener("click",function(){if(st().idx>0){st().idx--;renderQ()}});
document.querySelectorAll(".nav .tabs button").forEach(function(b){b.addEventListener("click",function(){
  var t=b.dataset.tab; if(t==="all"||t==="now")openSet(t); else{if(t==="records")renderRecords();show(t)}
})});
document.querySelectorAll("#rtoggle button").forEach(function(b){b.addEventListener("click",function(){rset=b.dataset.r;renderRecords()})});
renderHome();
show("home");
