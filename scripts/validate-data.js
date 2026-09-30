#!/usr/bin/env node
// Checks js/data.js for structural problems. No dependencies. Exit code 1 if any check fails.
// Usage: node scripts/validate-data.js
var path = require("path");
var data = require(path.join(__dirname, "..", "js", "data.js"));

var errors = [];
var warnings = [];
var err = function (msg) { errors.push(msg); };

var CONFS = ["H", "M", "L"];
var TAGS = ["D", "A", "I", "U", "S"];
var dimKeys = data.DIMS.map(function (d) { return d.k; });

function isNum(x) { return typeof x === "number" && isFinite(x); }
function isHttp(u) { return typeof u === "string" && /^https?:\/\/\S+$/i.test(u); }
function nonEmpty(x) { return typeof x === "string" && x.trim() !== ""; }

// Dimensions
data.DIMS.forEach(function (d, i) {
  if (!nonEmpty(d.k) || !nonEmpty(d.name) || !nonEmpty(d.lo) || !nonEmpty(d.hi)) err("dimension #" + (i + 1) + ": needs k, name, lo and hi.");
  if (!data.TOPIC[d.k]) err("dimension '" + d.k + "': no entry in TOPIC.");
});

// Leaders
var seen = {};
var uCounts = [];
data.L.forEach(function (l, i) {
  var id = l.id;
  var who = nonEmpty(id) ? "leader '" + id + "'" : "leader #" + (i + 1) + (nonEmpty(l.n) ? " (" + l.n + ")" : "");
  if (!nonEmpty(id)) err(who + ": missing id.");
  else if (seen[id]) err(who + ": duplicate id (also leader #" + seen[id] + ").");
  else seen[id] = i + 1;
  if (nonEmpty(id) && !/^[a-z0-9-]+$/.test(id)) err(who + ": id should be lowercase letters, digits and hyphens (it is used in #leader-<id> links).");
  ["n", "ini", "role", "cls", "suggests"].forEach(function (f) { if (!nonEmpty(l[f])) err(who + ": missing '" + f + "'."); });
  if (l.reviewed != null && l.reviewed !== "" && !(/^\d{4}-\d{2}-\d{2}$/.test(l.reviewed) && !isNaN(Date.parse(l.reviewed)))) {
    err(who + ": 'reviewed' must be empty or a YYYY-MM-DD date, got " + JSON.stringify(l.reviewed) + ".");
  }

  Object.keys(l.dims || {}).forEach(function (k) {
    var d = l.dims[k], at = who + ", dimension '" + k + "': ";
    if (dimKeys.indexOf(k) < 0) { err(at + "unknown dimension."); return; }
    if (!Array.isArray(d)) { err(at + "expected [value, confidence, note, basis?]."); return; }
    if (!isNum(d[0]) || d[0] < -2 || d[0] > 2) err(at + "value must be a number between -2 and 2, got " + JSON.stringify(d[0]) + ".");
    if (CONFS.indexOf(d[1]) < 0) err(at + "confidence must be H, M or L, got " + JSON.stringify(d[1]) + ".");
    if (!nonEmpty(d[2])) err(at + "missing note.");
    if (d[3] != null && d[3] !== "S") err(at + "basis must be omitted or 'S', got " + JSON.stringify(d[3]) + ".");
    if (d[3] === "S" && l.exec) err(at + "stated-position (S) placement on a leader who held executive power; the app would drop it.");
  });

  var u = 0;
  (l.rec || []).forEach(function (r, j) {
    var at = who + ", record line " + (j + 1) + ": ";
    if (TAGS.indexOf(r[0]) < 0) err(at + "tag must be one of D, A, I, U, S, got " + JSON.stringify(r[0]) + ".");
    if (!nonEmpty(r[1])) err(at + "missing text.");
    if (r[0] === "U") u++;
  });
  (l.said || []).forEach(function (p, j) {
    var at = who + ", said/did line " + (j + 1) + ": ";
    if (!nonEmpty(p[0])) err(at + "missing 'said' text.");
    if (p[1] != null && !nonEmpty(p[1])) err(at + "'did' text is empty (use null if there is none).");
    if (TAGS.indexOf(p[2]) < 0) err(at + "tag must be one of D, A, I, U, S, got " + JSON.stringify(p[2]) + ".");
    if (p[1] && p[2] === "U") u++;
  });
  if (!Array.isArray(l.contra) || !l.contra.length) err(who + ": 'contra' needs at least one line (use \"Not assessed.\").");
  if (!Array.isArray(l.src) || !l.src.length) err(who + ": needs at least one source.");
  (l.src || []).forEach(function (s, j) {
    var at = who + ", source " + (j + 1) + ": ";
    if (!nonEmpty(s[0])) err(at + "missing title.");
    if (!isHttp(s[1])) err(at + "URL must start with http:// or https://, got " + JSON.stringify(s[1]) + ".");
  });
  uCounts.push([l.n || id || "#" + (i + 1), u]);
});

// Questions
[["QN (Current climate)", data.QN], ["QA (Every leader)", data.QA]].forEach(function (pair) {
  var name = pair[0], qs = pair[1], per = {};
  qs.forEach(function (q, i) {
    var at = name + " question " + (i + 1) + ": ";
    if (dimKeys.indexOf(q[0]) < 0) { err(at + "unknown dimension " + JSON.stringify(q[0]) + "."); return; }
    if (q[1] !== 1 && q[1] !== -1) err(at + "direction must be 1 or -1, got " + JSON.stringify(q[1]) + ".");
    if (!nonEmpty(q[2])) err(at + "missing text.");
    var p = per[q[0]] = per[q[0]] || { "1": 0, "-1": 0 };
    if (q[1] === 1 || q[1] === -1) p[q[1]]++;
  });
  dimKeys.forEach(function (k) {
    var p = per[k] || { "1": 0, "-1": 0 };
    if (p[1] + p[-1] < 2) err(name + ": dimension '" + k + "' has only " + (p[1] + p[-1]) + " question(s); needs at least 2.");
    else if (!p[1] || !p[-1]) err(name + ": dimension '" + k + "' is only worded in one direction.");
  });
});

// Report
console.log("Checked " + data.L.length + " leaders, " + data.DIMS.length + " dimensions, " + data.QA.length + " + " + data.QN.length + " questions.\n");
console.log("U-tagged (not yet re-checked) lines per leader:");
var width = uCounts.reduce(function (m, c) { return Math.max(m, String(c[0]).length); }, 0);
uCounts.forEach(function (c) { console.log("  " + String(c[0]) + new Array(width - String(c[0]).length + 3).join(" ") + c[1]); });
console.log("  Total: " + uCounts.reduce(function (t, c) { return t + c[1]; }, 0) + "\n");

warnings.forEach(function (w) { console.log("warning: " + w); });
if (errors.length) {
  console.error(errors.length + " problem(s) found:");
  errors.forEach(function (e) { console.error("  - " + e); });
  process.exit(1);
}
console.log("OK: no data problems found.");
