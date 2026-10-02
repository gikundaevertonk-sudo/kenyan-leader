/* Siasa Compass anonymous answer tally. Google Apps Script, pasted into a Google Sheet (Extensions > Apps Script).
   Setup steps are in README.md under "Answer tally".

   The site sends one POST per finished quiz (js/app.js, sendTally) with:
     {quiz:"now"|"all", name:"Current climate", q:[question texts], t:[topics], a:[1..5 per question],
      you:{econ:-2..2,...}, top:["Leader name", ...], retake:0|1}
   Nothing identifies the visitor: Apps Script never sees their IP, and only the date (no time) is stored.

   For each quiz the script keeps two tabs:
     "<quiz name> answers"  one row per finished quiz: date, the answer to every question (1 = strongly disagree
                            to 5 = strongly agree), the visitor's score per dimension, and their top three matches.
     "<quiz name> summary"  live formulas over the answers tab: for every question how many people picked each
                            option and the % who agree, plus how often each leader comes out as the top match.
   If the questions change, the new answers go to a fresh pair of tabs ("... answers 2") so columns never mix. */

var DIMS = ["econ", "redis", "social", "inst", "style", "liberty"];
var DIM_NAMES = { econ: "Economy", redis: "Land and wealth", social: "Values", inst: "Institutions", style: "Political style", liberty: "Rights" };
var OPTS = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

function doPost(e) {
  var d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return out("bad json"); }
  if (!valid(d)) return out("rejected");
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = answersSheet(d);
    var row = [Utilities.formatDate(new Date(), "Africa/Nairobi", "yyyy-MM-dd"), d.retake ? "yes" : "no"]
      .concat(d.a)
      .concat(DIMS.map(function (k) { return Math.round(d.you[k] * 100) / 100; }))
      .concat([0, 1, 2].map(function (i) { return d.top[i] || ""; }));
    sh.appendRow(row);
  } finally {
    lock.releaseLock();
  }
  return out("ok");
}

// Visiting the web app URL in a browser just confirms it is running.
function doGet() { return out("Siasa Compass tally is running."); }

function out(s) { return ContentService.createTextOutput(s); }

// Reject anything that does not look like a real quiz result, so junk cannot pile up in the sheet.
function valid(d) {
  if (!d || (d.quiz !== "now" && d.quiz !== "all") || typeof d.name !== "string" || d.name.length > 60) return false;
  if (!Array.isArray(d.q) || !Array.isArray(d.a) || !Array.isArray(d.t) || d.q.length < 1 || d.q.length > 60) return false;
  if (d.a.length !== d.q.length || d.t.length !== d.q.length) return false;
  for (var i = 0; i < d.q.length; i++) {
    if (typeof d.q[i] !== "string" || d.q[i].length > 300 || typeof d.t[i] !== "string" || d.t[i].length > 40) return false;
    if ([1, 2, 3, 4, 5].indexOf(d.a[i]) < 0) return false;
  }
  if (!d.you) return false;
  for (var k = 0; k < DIMS.length; k++) {
    var v = d.you[DIMS[k]];
    if (typeof v !== "number" || !(v >= -2 && v <= 2)) return false;
  }
  if (!Array.isArray(d.top) || d.top.length > 3) return false;
  for (var j = 0; j < d.top.length; j++) if (typeof d.top[j] !== "string" || d.top[j].length > 80) return false;
  return true;
}

// Finds the answers tab whose header matches these exact questions, or creates a new answers + summary pair.
function answersSheet(d) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var header = ["Date", "Retake"]
    .concat(d.q.map(function (q, i) { return "Q" + (i + 1) + " (" + d.t[i] + "): " + q; }))
    .concat(DIMS.map(function (k) { return "Score: " + DIM_NAMES[k]; }))
    .concat(["Top match", "2nd match", "3rd match"]);
  for (var n = 1; ; n++) {
    var name = d.name + " answers" + (n > 1 ? " " + n : "");
    var sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      sh.appendRow(header);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, header.length).setFontWeight("bold");
      buildSummary(ss, d, name, n);
      return sh;
    }
    var have = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    if (have.join("\u0001") === header.join("\u0001")) return sh;
  }
}

function colLetter(c) {
  var s = "";
  while (c > 0) { var m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = (c - m - 1) / 26; }
  return s;
}

function buildSummary(ss, d, answersName, n) {
  var sh = ss.insertSheet(d.name + " summary" + (n > 1 ? " " + n : ""));
  var src = "'" + answersName.replace(/'/g, "''") + "'!";
  var rows = [["Question", "Topic"].concat(OPTS).concat(["People", "% agree", "% neutral", "% disagree"])];
  d.q.forEach(function (q, i) {
    var col = colLetter(3 + i), r = i + 2, rng = src + col + "2:" + col;
    var counts = [1, 2, 3, 4, 5].map(function (v) { return "=COUNTIF(" + rng + "," + v + ")"; });
    rows.push([q, d.t[i]].concat(counts).concat([
      "=SUM(C" + r + ":G" + r + ")",
      "=IF(H" + r + "=0,\"\",(F" + r + "+G" + r + ")/H" + r + ")",
      "=IF(H" + r + "=0,\"\",E" + r + "/H" + r + ")",
      "=IF(H" + r + "=0,\"\",(C" + r + "+D" + r + ")/H" + r + ")"
    ]));
  });
  sh.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sh.getRange(2, 9, d.q.length, 3).setNumberFormat("0%");
  sh.getRange(1, 1, 1, rows[0].length).setFontWeight("bold");
  sh.setFrozenRows(1);
  sh.setColumnWidth(1, 420);
  sh.getRange(2, 1, d.q.length, 1).setWrap(true);

  // Average score per dimension and the most common top matches.
  var r0 = rows.length + 2;
  sh.getRange(r0, 1).setValue("Average position per dimension (-2 to +2)").setFontWeight("bold");
  DIMS.forEach(function (k, i) {
    var col = colLetter(3 + d.q.length + i);
    sh.getRange(r0 + 1 + i, 1, 1, 2).setValues([[DIM_NAMES[k], "=IFERROR(AVERAGE(" + src + col + "2:" + col + "),\"\")"]]);
  });
  var r1 = r0 + DIMS.length + 2, top = colLetter(3 + d.q.length + DIMS.length);
  sh.getRange(r1, 1).setValue("Top match: how often each leader comes first").setFontWeight("bold");
  sh.getRange(r1 + 1, 1).setFormula("=IFERROR(QUERY({" + src + top + "2:" + top + "},\"select Col1, count(Col1) where Col1 is not null group by Col1 order by count(Col1) desc label Col1 'Leader', count(Col1) 'People'\",0),\"No answers yet\")");
}
