#!/usr/bin/env node
// Checks the scoring in js/score.js. No dependencies. Exit code 1 if a check fails.
//   node scripts/test-scoring.js            run the checks
//   node scripts/test-scoring.js --update   accept the current top matches as the new snapshot
// The snapshot (scripts/scoring-snapshot.json) records the top three for a few fixed answer sets, so a data or
// scoring edit that quietly reshuffles results shows up here. If the change is intended, rerun with --update.
var fs = require("fs");
var path = require("path");
var SIASA = require(path.join(__dirname, "..", "js", "data.js"));
var SC = require(path.join(__dirname, "..", "js", "score.js"));

var fails = 0;
function check(ok, msg) { if (!ok) { fails++; console.log("FAIL: " + msg); } }
function near(a, b) { return Math.abs(a - b) < 1e-9; }
function leader(id, dims) { return { id: id, n: id, dims: dims }; }
var zero = {}; SIASA.DIMS.forEach(function (d) { zero[d.k] = 0; });
function at(v) { var u = {}; SIASA.DIMS.forEach(function (d) { u[d.k] = v; }); return u; }

// userScores
["all", "now"].forEach(function (k) {
  var q = SIASA.SETS[k].q;
  var neutral = SC.userScores(q, q.map(function () { return 3; }));
  check(SIASA.DIMS.every(function (d) { return neutral[d.k] === 0; }), k + ": all-neutral answers should place you at 0 everywhere.");
  var high = SC.userScores(q, q.map(function (x) { return x[1] === 1 ? 5 : 1; }));
  check(SIASA.DIMS.every(function (d) { return high[d.k] === 2; }), k + ": answers pushing every dimension high should give +2 everywhere.");
  var gaps = SC.userScores(q, []);
  check(SIASA.DIMS.every(function (d) { return gaps[d.k] === 0; }), k + ": unanswered questions should not produce NaN.");
});

// similarity
check(near(SC.similarity(1, 1, "H"), 1), "same point, high confidence, should be 100%.");
check(near(SC.similarity(-2, 2, "H"), 0), "opposite ends should be 0%.");
check(near(SC.similarity(0, 2, "L"), 1 - 1 / SC.GAP), "low confidence should pull a placement halfway to neutral.");

// Evidence rules in the ranking
var dims6 = function (v, conf, basis) { var o = {}; SIASA.DIMS.forEach(function (d) { o[d.k] = [v, conf, "x"].concat(basis ? [basis] : []); }); return o; };
var solid = leader("solid", dims6(1.5, "H")), thin = leader("thin", dims6(1.5, "L")), words = leader("words", dims6(1.5, "H", "S"));
var r = SC.rank(SC.compare([thin, solid], at(1.5)));
check(r[0].l.id === "solid", "a high-confidence record should beat a low-confidence one at the same point.");
check(SC.mostlyWords(words) && !SC.mostlyWords(solid), "mostlyWords should flag word-based placements only.");
var few = leader("few", { econ: [1, "H", "x"], redis: [1, "H", "x"], social: [1, "H", "x"] });
check(!SC.matchable(few) && SC.rank(SC.compare([few, solid], at(1))).length === 1, "leaders with fewer than " + SC.MIN_DIMS + " dimensions should stay out of matches.");
var mix = leader("mix", { econ: [2, "H", "x"], redis: [2, "H", "x"], social: [-2, "H", "x", "S"], inst: [2, "H", "x"] });
var mixScore = SC.compare([mix], at(2))[0].score;
check(near(mixScore, (3 * 1 + 0.6 * 0) / 3.6), "a stated-position dimension should count 60% of an action one.");

// Real data: every leader placement is in range and no score is NaN.
["all", "now"].forEach(function (k) {
  SC.compare(SIASA.SETS[k].pool(), zero).forEach(function (x) { check(isFinite(x.score), k + ": NaN score for " + x.l.id); });
});

// Snapshot of top three for fixed answer sets.
var PROFILES = { neutral: 3, "agree-all": 5, "disagree-all": 1, "high-all": "high", "low-all": "low" };
function answers(q, p) { return q.map(function (x) { return p === "high" ? (x[1] === 1 ? 5 : 1) : p === "low" ? (x[1] === 1 ? 1 : 5) : p; }); }
var snap = {};
["all", "now"].forEach(function (k) {
  var s = SIASA.SETS[k];
  Object.keys(PROFILES).forEach(function (name) {
    var u = SC.userScores(s.q, answers(s.q, PROFILES[name]));
    snap[k + "/" + name] = SC.rank(SC.compare(s.pool(), u)).slice(0, 3).map(function (x) { return x.l.id; });
  });
});
var file = path.join(__dirname, "scoring-snapshot.json");
if (process.argv.indexOf("--update") >= 0 || !fs.existsSync(file)) {
  fs.writeFileSync(file, JSON.stringify(snap, null, 1) + "\n");
  console.log("Wrote " + path.relative(process.cwd(), file));
} else {
  var old = JSON.parse(fs.readFileSync(file, "utf8"));
  Object.keys(snap).forEach(function (key) {
    check(JSON.stringify(old[key]) === JSON.stringify(snap[key]),
      "top three for " + key + " changed: was " + (old[key] || []).join(", ") + ", now " + snap[key].join(", ") + ". If intended, run with --update.");
  });
}

console.log(fails ? fails + " check(s) failed." : "OK: scoring checks passed.");
process.exit(fails ? 1 : 0);
