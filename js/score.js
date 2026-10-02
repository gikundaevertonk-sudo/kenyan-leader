/* Siasa Compass scoring, kept apart from the page code so scripts/test-scoring.js can check it in Node.
   Exposes one global, SiasaScore. Needs SIASA (js/data.js) for the dimensions and confidence weights. */
var SiasaScore=(function(){
"use strict";
var D=typeof SIASA!=="undefined"?SIASA:require("./data.js");
var DIMS=D.DIMS, W=D.W;
// Leaders need placements on at least MIN_DIMS dimensions to appear in matches. Fewer is too thin to compare fairly.
var MIN_DIMS=4;
function matchable(l){return Object.keys(l.dims).length>=MIN_DIMS}
// Half or more of a leader's placements rest on words (S) or reports (H), not actions. Flagged in the match list.
function mostlyWords(l){var k=Object.keys(l.dims);return k.length>0&&k.filter(function(x){return l.dims[x][3]==="S"||l.dims[x][3]==="H"}).length*2>=k.length}
// q: the quiz's questions [dim, direction, text]; a: answers 1-5 by question index. Returns -2..2 per dimension.
function userScores(q,a){
  var s={},c={};
  DIMS.forEach(function(d){s[d.k]=0;c[d.k]=0});
  // Skip unanswered questions so a gap can never turn a score into NaN.
  q.forEach(function(x,i){var v=a[i];if(!(v>=1&&v<=5))return;s[x[0]]+=(v-3)*x[1];c[x[0]]++});
  DIMS.forEach(function(d){s[d.k]=c[d.k]?s[d.k]/c[d.k]:0});
  return s;
}
/* Confidence counts across leaders by shrinking each placement toward the neutral midpoint (0):
   effective = position x W[confidence]  (H 1, M 0.8, L 0.5).
   A thinly evidenced leader therefore reads as less extreme on a dimension, so it cannot beat a solidly
   evidenced leader just by sitting on your exact position. (A plain weighted average would not do this: the weights
   cancel when leaders are compared with each other.)
   Per dimension, similarity = max(0, 1 - |you - effective| / 3), so a gap of 3 points (three quarters of the scale)
   reads as 0% and an exact match as 100%. The overall score is the mean similarity over the leader's dimensions.
   "close" is counted on the raw placement (no shrinking): within 1 point of you. It is the main figure shown.
   "den" (evidence) is the sum of the confidence weights.
   Actions outweigh words: in the overall score a stated-position (S) dimension counts BASIS.S as much as an
   action-based one, and a hearsay (H, reported or attributed) dimension counts BASIS.H, so the mean is weighted by evidence type. */
var GAP=3, BASIS={A:1,S:0.6,H:0.4};
function similarity(you,pos,conf){return Math.max(0,1-Math.abs(you-pos*W[conf])/GAP)}
function compare(pool,u){
  return pool.map(function(l){
    var keys=Object.keys(l.dims), sum=0, wt=0, ev=0, close=0;
    keys.forEach(function(k){var d=l.dims[k], b=BASIS[d[3]]||BASIS.A;
      sum+=b*similarity(u[k],d[0],d[1]); wt+=b; ev+=W[d[1]]; if(Math.abs(u[k]-d[0])<=1)close++;});
    return {l:l,n:keys.length,close:close,den:ev,score:wt?sum/wt:0};
  });
}
// Matchable leaders, best first. The headline match is always ranked[0], so it never disagrees with the list.
function rank(cmp){return cmp.filter(function(r){return matchable(r.l)}).sort(function(a,b){return b.score-a.score||b.close-a.close})}
return {MIN_DIMS:MIN_DIMS,matchable:matchable,mostlyWords:mostlyWords,userScores:userScores,similarity:similarity,compare:compare,rank:rank,GAP:GAP,BASIS:BASIS};
})();
if(typeof module!=="undefined"&&module.exports)module.exports=SiasaScore;
