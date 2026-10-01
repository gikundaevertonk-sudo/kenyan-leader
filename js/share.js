/* Sharing: native share sheet, social links, copy link, and a downloadable story-sized image card of the result.
   Exposes one global, SiasaShare. Needs SiasaPhotos (js/photos.js). */
var SiasaShare=(function(){
"use strict";
var SITE="https://siasacompass.co.ke/";
var $=function(id){return document.getElementById(id)};

// extra: markup for more buttons in the closing row (already escaped by the caller).
function section(extra){
  var ic=function(n){return '<span class="sic" aria-hidden="true">'+n+'</span>'};
  return '<div class="sec share"><h3>Share your result</h3>'+
    '<p class="sub">Post it, or save the image for your story.</p>'+
    '<div class="card-prev"><canvas id="card" width="1080" height="1920" role="img" aria-label="Your result card"></canvas></div>'+
    '<div class="sbtns">'+
      '<button type="button" class="btn" id="sh-native" hidden>Share…</button>'+
      '<button type="button" class="btn" id="sh-img">Save story image</button>'+
      '<a class="sbtn" id="sh-x" target="_blank" rel="noopener noreferrer">'+ic("𝕏")+'X / Twitter</a>'+
      '<a class="sbtn" id="sh-wa" target="_blank" rel="noopener noreferrer">'+ic("W")+'WhatsApp</a>'+
      '<a class="sbtn" id="sh-fb" target="_blank" rel="noopener noreferrer">'+ic("f")+'Facebook</a>'+
      '<a class="sbtn" id="sh-tg" target="_blank" rel="noopener noreferrer">'+ic("T")+'Telegram</a>'+
      '<a class="sbtn" id="sh-li" target="_blank" rel="noopener noreferrer">'+ic("in")+'LinkedIn</a>'+
      '<button type="button" class="sbtn" id="sh-copy">'+ic("⧉")+'<span>Copy link</span></button>'+
    '</div>'+
    '<p class="tip">On stories, add a link sticker: <b>siasacompass.co.ke</b></p>'+
    '<details class="sumbox"><summary>Full text summary</summary><textarea id="sum" readonly></textarea></details>'+
    (extra?'<div class="cta">'+extra+'</div>':'')+'</div>';
}

// o: {text: short post text, summary: full text summary, top: up to three ranked rows, tags: the user's lean labels}
function bind(o){
  var text=o.text, enc=encodeURIComponent, blob=null;
  $("sh-x").href="https://twitter.com/intent/tweet?text="+enc(text)+"&url="+enc(SITE);
  $("sh-wa").href="https://wa.me/?text="+enc(text+" "+SITE);
  $("sh-fb").href="https://www.facebook.com/sharer/sharer.php?u="+enc(SITE)+"&quote="+enc(text);
  $("sh-tg").href="https://t.me/share/url?url="+enc(SITE)+"&text="+enc(text);
  $("sh-li").href="https://www.linkedin.com/sharing/share-offsite/?url="+enc(SITE);
  $("sum").value=o.summary+" "+SITE;
  var showSum=function(){$("sum").parentNode.open=true;$("sum").select()};
  $("sh-copy").addEventListener("click",function(){
    var done=function(){$("sh-copy").lastChild.textContent="Link copied"};
    try{navigator.clipboard.writeText(text+" "+SITE).then(done,showSum)}catch(e){showSum()}
  });
  var cv=$("card");
  drawCard(cv,o.top,o.tags).then(function(){
    try{cv.toBlob(function(b){blob=b},"image/png")}catch(e){} // a tainted canvas cannot be exported
  });
  $("sh-img").addEventListener("click",function(){
    var a=document.createElement("a"); a.download="siasa-compass-result.png";
    try{a.href=cv.toDataURL("image/png")}catch(e){return}
    document.body.appendChild(a); a.click(); a.remove();
  });
  if(navigator.share){
    var nb=$("sh-native"); nb.hidden=false;
    nb.addEventListener("click",function(){
      var data={title:"Siasa Compass",text:text,url:SITE};
      if(blob&&window.File){
        var f=new File([blob],"siasa-compass-result.png",{type:"image/png"});
        if(navigator.canShare&&navigator.canShare({files:[f]}))data={files:[f],title:"Siasa Compass",text:text+" "+SITE};
      }
      navigator.share(data).catch(function(){});
    });
  }
}

// ---- Story card (1080 x 1920) ----
function loadImg(src){return new Promise(function(res){var i=new Image();i.crossOrigin="anonymous";
  i.onload=function(){res(i)};i.onerror=function(){res(null)};i.src=src;})}
function wrap(ctx,text,maxW){var ws=String(text).split(" "),lines=[],cur="";
  ws.forEach(function(w){var t=cur?cur+" "+w:w; if(ctx.measureText(t).width>maxW&&cur){lines.push(cur);cur=w}else cur=t});
  if(cur)lines.push(cur); return lines;}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}

function drawCard(cv,top,tags){
  var ctx=cv.getContext("2d"), W=cv.width, H=cv.height;
  var D='"Bricolage Grotesque", "Segoe UI", system-ui, sans-serif', B='"Instrument Sans", "Segoe UI", system-ui, sans-serif';
  var fontsReady=document.fonts&&document.fonts.load?Promise.all([document.fonts.load('800 80px "Bricolage Grotesque"'),document.fonts.load('600 40px "Instrument Sans"'),document.fonts.load('700 40px "Instrument Sans"')]).catch(function(){}):Promise.resolve();
  var imgs=Promise.all(top.map(function(r){var p=SiasaPhotos.get(r.l.id);return p?loadImg(p.src):Promise.resolve(null)}));
  return Promise.all([fontsReady,imgs]).then(function(res){
    var pics=res[1];
    var g=ctx.createLinearGradient(0,0,W,H); g.addColorStop(0,"#2A1690"); g.addColorStop(1,"#120E26");
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="rgba(161,141,255,.18)"; ctx.beginPath(); ctx.arc(W-80,180,340,0,7); ctx.fill();
    // brand
    ctx.fillStyle="#F2B01E"; ctx.beginPath(); ctx.arc(110,150,18,0,7); ctx.fill();
    ctx.fillStyle="#FFFFFF"; ctx.font="800 50px "+D; ctx.textBaseline="middle"; ctx.fillText("Siasa Compass",146,152);
    // heading
    ctx.textBaseline="alphabetic"; ctx.font="800 104px "+D; ctx.fillStyle="#FFFFFF";
    ctx.fillText("Here is where",88,340); ctx.fillText("I land",88,452);
    ctx.fillStyle="#F2B01E"; ctx.fillRect(88,474,300,14);
    // tags as chips
    var chips=tags.length?tags:["Centrist on most dimensions"], x=88, y=540;
    ctx.font="700 32px "+B;
    chips.forEach(function(t){var w=ctx.measureText(t).width+48;
      if(x+w>W-88){x=88;y+=70}
      ctx.fillStyle="#F2B01E"; rr(ctx,x,y,w,58,29); ctx.fill();
      ctx.fillStyle="#17132B"; ctx.textBaseline="middle"; ctx.fillText(t,x+24,y+31); x+=w+14;});
    y+=130;
    ctx.textBaseline="alphabetic"; ctx.fillStyle="#C9C0FF"; ctx.font="700 34px "+B;
    ctx.fillText("CLOSEST DOCUMENTED RECORDS",88,y); y+=40;
    top.forEach(function(r,i){
      var cy=y+i*186, cx=88+90;
      ctx.fillStyle="rgba(255,255,255,.07)"; rr(ctx,64,cy,W-128,172,32); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx+8,cy+86,76,0,7); ctx.closePath(); ctx.clip();
      if(pics[i]){var im=pics[i],s=Math.max(152/im.width,152/im.height),iw=im.width*s,ih=im.height*s;
        ctx.drawImage(im,cx+8-iw/2,cy+86-76-(ih>iw?(ih-152)*0.1:(ih-152)/2),iw,ih);}
      else{ctx.fillStyle="#3A1FB5";ctx.fillRect(cx-70,cy+8,160,160);ctx.fillStyle="#FFFFFF";ctx.font="800 54px "+D;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(r.l.ini,cx+8,cy+90);ctx.textAlign="left";}
      ctx.restore();
      ctx.strokeStyle=i===0?"#F2B01E":"rgba(255,255,255,.35)"; ctx.lineWidth=6; ctx.beginPath(); ctx.arc(cx+8,cy+86,76,0,7); ctx.stroke();
      var tx=300; ctx.textBaseline="alphabetic";
      ctx.fillStyle="#FFFFFF"; ctx.font="800 54px "+D; ctx.fillText(r.l.n,tx,cy+70);
      ctx.fillStyle="#C9C0FF"; ctx.font="600 32px "+B; ctx.fillText("Close on "+r.close+" of "+r.n+" dimensions",tx,cy+112);
      ctx.fillStyle="rgba(255,255,255,.15)"; rr(ctx,tx,cy+132,W-tx-110,16,8); ctx.fill();
      ctx.fillStyle="#F2B01E"; rr(ctx,tx,cy+132,Math.max(16,(W-tx-110)*r.score),16,8); ctx.fill();
    });
    if(!top.length){ctx.fillStyle="#FFFFFF";ctx.font="600 38px "+B;ctx.fillText("No leader had enough evidence to compare.",88,y+60);}
    // call to action
    var by=Math.max(y+top.length*186+90,H-440);
    ctx.fillStyle="#FFFFFF"; ctx.font="800 64px "+D; ctx.fillText("Where do you land?",88,by);
    ctx.fillStyle="#F2B01E"; ctx.font="800 60px "+D; ctx.fillText("siasacompass.co.ke",88,by+78);
    ctx.fillStyle="#C9C0FF"; ctx.font="500 30px "+B;
    ctx.fillText("Overlap with documented records. Not an endorsement.",88,by+130);
    // photo credits
    var cr=top.filter(function(r){return SiasaPhotos.get(r.l.id)}).map(function(r){var p=SiasaPhotos.get(r.l.id);return r.l.n+": "+p.artist+", "+p.license});
    if(cr.length){ctx.font="400 22px "+B; ctx.fillStyle="rgba(255,255,255,.6)";
      var lines=wrap(ctx,"Photos via Wikipedia / Wikimedia Commons. "+cr.join("; ")+".",W-176).slice(0,Math.max(1,Math.floor((H-24-(by+180))/28)+1));
      lines.forEach(function(l,i){ctx.fillText(l,88,by+180+i*28)});}
  });
}

// ---- Site-wide share row in the footer. About the site itself, never the user's result. ----
function bindSite(){
  if(!$("ss-copy"))return;
  var enc=encodeURIComponent, title="Siasa Compass",
    text="Siasa Compass: answer 18 short questions and see which Kenyan leaders' documented records sit closest to your views. Actions count more than words.";
  $("ss-x").href="https://twitter.com/intent/tweet?text="+enc(text)+"&url="+enc(SITE);
  $("ss-wa").href="https://wa.me/?text="+enc(text+" "+SITE);
  $("ss-fb").href="https://www.facebook.com/sharer/sharer.php?u="+enc(SITE);
  $("ss-tg").href="https://t.me/share/url?url="+enc(SITE)+"&text="+enc(text);
  $("ss-li").href="https://www.linkedin.com/sharing/share-offsite/?url="+enc(SITE);
  $("ss-mail").href="mailto:?subject="+enc(title)+"&body="+enc(text+"\n\n"+SITE);
  $("ss-copy").addEventListener("click",function(){
    var lbl=$("ss-copy").lastChild, done=function(){lbl.textContent="Link copied"};
    var fail=function(){lbl.textContent=SITE}; // show the address so it can be copied by hand
    try{navigator.clipboard.writeText(SITE).then(done,fail)}catch(e){fail()}
  });
  if(navigator.share){
    var nb=$("ss-native"); nb.hidden=false;
    nb.addEventListener("click",function(){navigator.share({title:title,text:text,url:SITE}).catch(function(){})});
  }
}
bindSite();

return {section:section,bind:bind};
})();
