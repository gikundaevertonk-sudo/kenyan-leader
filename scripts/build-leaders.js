#!/usr/bin/env node
// Builds a plain, crawlable page for every leader in js/data.js, so a search for a name can land on the site.
//   leaders/index.html          directory of all leaders
//   leaders/<id>/index.html     one page per leader (record, said/did, sources)
//   compare/index.html          directory of side-by-side comparisons
//   compare/<a>-vs-<b>/         one page per pair (PAIRS below): both records, dimension by dimension
//   sitemap.xml                 lists the home page, the directories, every leader page and every comparison
// The pages need no JavaScript. Run it after editing js/data.js, then commit the generated files:
//   node scripts/build-leaders.js
// No dependencies.
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var SIASA = require(path.join(root, "js", "data.js"));
var DIMS = SIASA.DIMS, CONF = SIASA.CONF, L = SIASA.L;
var SITE = "https://siasacompass.co.ke";
var TODAY = new Date().toISOString().slice(0, 10);
var V = { css: "12" }; // keep in step with the ?v= on css/styles.css in index.html

// Wikipedia page and Wikidata ID for each leader, so search engines can tie the page to the right person.
// Omtatah and Salasya have no English Wikipedia page yet, so they have no entry.
var IDENT = {
  "ruto":["William_Ruto","Q195725"],
  "kindiki":["Kithure_Kindiki","Q47514805"],
  "gachagua":["Rigathi_Gachagua","Q47494765"],
  "kalonzo":["Kalonzo_Musyoka","Q1395018"],
  "matiangi":["Fred_Matiang%27i","Q16866738"],
  "karua":["Martha_Karua","Q3295164"],
  "maraga":["David_Maraga","Q27825245"],
  "bmwangi":["Boniface_Mwangi","Q2411298"],
  "sifuna":["Edwin_Sifuna","Q114753735"],
  "nyoro":["Ndindi_Nyoro","Q47494428"],
  "babu":["Babu_Owino","Q47494255"],
  "wanga":["Gladys_Wanga","Q47489052"],
  "millie":["Millie_Odhiambo","Q47495077"],
  "nyamu":["Karen_Nyamu","Q123670350"],
  "omanga":["Millicent_Omanga","Q47516275"],
  "waiguru":["Anne_Waiguru","Q16886393"],
  "jomo":["Jomo_Kenyatta","Q173563"],
  "moi":["Daniel_arap_Moi","Q193492"],
  "kibaki":["Mwai_Kibaki","Q57291"],
  "uhuru":["Uhuru_Kenyatta","Q196070"],
  "raila":["Raila_Odinga","Q57657"],
  "jaramogi":["Jaramogi_Oginga_Odinga","Q645228"],
  "mboya":["Tom_Mboya","Q733180"],
  "saitoti":["George_Saitoti","Q733817"],
  "ngala":["Ronald_Ngala","Q7365142"],
  "matiba":["Kenneth_Matiba","Q6390454"],
  "kaggia":["Bildad_Kaggia","Q860562"],
  "jmk":["Josiah_Mwangi_Kariuki","Q1708650"],
  "pinto":["Pio_Gama_Pinto","Q3388887"],
  "maathai":["Wangar%C4%A9_Maathai","Q46795"]
};

function esc(x) {
  return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function safeUrl(u) { return /^https?:\/\//i.test(u) ? u : "#"; }
function dimOf(k) { return DIMS.filter(function (x) { return x.k === k; })[0]; }
// Same wording as words() in js/app.js.
function words(k, v) {
  var D = dimOf(k);
  if (v <= -1.2) return D.lo;
  if (v <= -0.4) return "Leans " + D.lo.toLowerCase();
  if (v < 0.4) return "Mixed";
  if (v < 1.2) return "Leans " + D.hi.toLowerCase();
  return D.hi;
}
function basisLine(l) {
  if (l.inPower && l.limitedPower) return "In office, with limited power of their own. Actions first; words and reports count less.";
  if (l.inPower) return "In power now. Judged on actions only.";
  if (l.exec) return "Held power before. Actions first; uncontradicted words and reports count less.";
  return "Never held executive power. Actions first; stated positions and reports count less.";
}
function trim(s, n) {
  s = String(s).replace(/\s+/g, " ").trim();
  if (s.length <= n) return s;
  var cut = s.slice(0, n - 1), i = cut.lastIndexOf(" ");
  return (i > 40 ? cut.slice(0, i) : cut).replace(/[ ,;:.]+$/, "") + "…";
}
function write(rel, text) {
  var f = path.join(root, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, text);
}

var ICONS =
  '<link rel="icon" href="/favicon.ico" sizes="any">\n' +
  '<link rel="icon" type="image/svg+xml" href="/favicon.svg">\n' +
  '<link rel="icon" type="image/png" sizes="48x48" href="/img/favicon-48.png">\n' +
  '<link rel="icon" type="image/png" sizes="96x96" href="/img/favicon-96.png">\n' +
  '<link rel="icon" type="image/png" sizes="192x192" href="/img/icon-192.png">\n' +
  '<link rel="apple-touch-icon" sizes="180x180" href="/img/apple-touch-icon.png">\n' +
  '<link rel="manifest" href="/site.webmanifest">\n';

var COMPASS =
  '<svg class="compass" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M16 5.5v2.5M16 24v2.5M5.5 16H8M24 16h2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><g transform="rotate(35 16 16)"><path class="n" d="M16 7l3.6 9h-7.2z"/><path d="M16 25l3.6-9h-7.2z" fill="currentColor"/></g><circle class="hub" cx="16" cy="16" r="1.5"/></svg>';

function head(o) {
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
    "<title>" + esc(o.title) + "</title>\n" +
    '<meta name="description" content="' + esc(o.desc) + '">\n' +
    '<link rel="canonical" href="' + SITE + o.path + '">\n' +
    '<meta property="og:type" content="website">\n<meta property="og:site_name" content="Siasa Compass">\n<meta property="og:locale" content="en_KE">\n' +
    '<meta property="og:title" content="' + esc(o.title) + '">\n<meta property="og:description" content="' + esc(o.desc) + '">\n' +
    '<meta property="og:url" content="' + SITE + o.path + '">\n' +
    '<meta property="og:image" content="' + SITE + '/img/og-image.png">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n' +
    '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="' + esc(o.title) + '">\n' +
    '<meta name="twitter:description" content="' + esc(o.desc) + '">\n<meta name="twitter:image" content="' + SITE + '/img/og-image.png">\n' +
    '<script type="application/ld+json">\n' + JSON.stringify(o.ld, null, 1).replace(/</g, "\\u003c") + "\n</script>\n" +
    ICONS +
    '<meta name="theme-color" content="#17132B">\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">\n' +
    '<link rel="stylesheet" href="/css/styles.css?v=' + V.css + '">\n</head>\n<body>\n' +
    '<header class="top">\n  <div class="nav">\n    <a class="brand" href="/">' + COMPASS + 'Siasa Compass</a>\n' +
    '    <nav class="tabs" aria-label="Sections">\n' +
    '      <a href="/#quiz-now">Quiz</a>\n' +
    '      <a href="/leaders/"' + (o.isIndex ? ' aria-current="true"' : "") + '>Leaders</a>\n' +
    '      <a href="/#records">Records</a>\n      <a href="/#method">Method</a>\n    </nav>\n  </div>\n</header>\n';
}
function foot() {
  return '<footer class="wrap site-foot">\n  <div class="flag-band" aria-hidden="true"><span></span><span></span><span></span></div>\n' +
    '  <span class="brand">' + COMPASS + 'Siasa Compass</span>\n' +
    '  <p class="foot">A research draft. It does not rank, predict or endorse. Spotted an error? <a href="https://github.com/gikundaevertonk-sudo/kenyan-leader/issues/new?title=Siasa%20Compass%20correction" target="_blank" rel="noopener noreferrer">Send it in</a>.</p>\n' +
    '  <p class="copy"><span>&copy; 2026 Siasa Compass. Made in Kenya. No cookies.</span></p>\n</footer>\n' +
    '<script data-goatcounter="https://siasacompass.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>\n</body>\n</html>\n';
}

function personNode(l, url) {
  var p = { "@type": "Person", "@id": SITE + url + "#person", name: l.n, description: l.role, nationality: { "@type": "Country", name: "Kenya" } };
  var w = IDENT[l.id];
  if (w) p.sameAs = ["https://en.wikipedia.org/wiki/" + w[0], "https://www.wikidata.org/wiki/" + w[1]];
  return p;
}

function issueIdx(k) { return SIASA.ISSUES.map(function (x) { return x.k; }).indexOf(k); }

// Side-by-side pages answer searches such as "Ruto vs Gachagua". Every pair of current leaders with enough evidence
// to be matched (four or more dimensions, as MIN_DIMS in js/app.js), plus a few much-searched pairs from the past.
var byId = {};
L.forEach(function (l) { byId[l.id] = l; });
var MIN_DIMS = 4;
var HISTORIC = [["ruto", "raila"], ["ruto", "uhuru"], ["uhuru", "raila"], ["kibaki", "raila"], ["kibaki", "moi"], ["jomo", "moi"], ["jomo", "jaramogi"], ["uhuru", "kibaki"]];
var PAIRS = (function () {
  var cur = L.filter(function (l) { return l.now && Object.keys(l.dims).length >= MIN_DIMS; }), out = [];
  cur.forEach(function (a, i) { cur.slice(i + 1).forEach(function (b) { out.push([a.id, b.id]); }); });
  return out.concat(HISTORIC.filter(function (p) { return byId[p[0]] && byId[p[1]]; }));
})();
function pairPath(p) { return "/compare/" + p[0] + "-vs-" + p[1] + "/"; }
function pairsOf(id) { return PAIRS.filter(function (p) { return p[0] === id || p[1] === id; }); }
function shortName(l) { return l.n.split(" ").slice(-1)[0]; }

function comparePage(p) {
  var a = byId[p[0]], b = byId[p[1]], url = pairPath(p);
  var keys = DIMS.map(function (d) { return d.k; }).filter(function (k) { return a.dims[k] || b.dims[k]; });
  var cell = function (l, k) {
    var d = l.dims[k];
    if (!d) return '<td class="none">No record</td>';
    return "<td><b>" + esc(words(k, d[0])) + "</b>" + (d[3] === "S" || d[3] === "H" ? ' <span class="tg ' + d[3] + '">' + d[3] + "</span>" : "") +
      '<details><summary>Why</summary><p>' + esc(d[2]) + " <i>(" + esc(CONF[d[1]]).toLowerCase() + " confidence)</i></p></details></td>";
  };
  var rows = keys.map(function (k) {
    return '<tr><th scope="row">' + esc(dimOf(k).name) + "</th>" + cell(a, k) + cell(b, k) + "</tr>";
  }).join("");
  // Plain-language summary: where both are placed, which dimensions are a point or more apart.
  var both = keys.filter(function (k) { return a.dims[k] && b.dims[k]; });
  var apart = both.filter(function (k) { return Math.abs(a.dims[k][0] - b.dims[k][0]) >= 1; });
  var close = both.filter(function (k) { return Math.abs(a.dims[k][0] - b.dims[k][0]) < 1; });
  var list = function (ks) { return ks.map(function (k) { return dimOf(k).name.toLowerCase(); }).join(", "); };
  var sum = !both.length ? "Their records do not overlap on any dimension yet." :
    (apart.length ? "They differ most on " + list(apart) + "." : "Their records point the same way on every dimension both are placed on.") +
    (close.length && apart.length ? " They sit close on " + list(close) + "." : "");
  var iss = SIASA.ISSUES.filter(function (x) {
    return (a.iss || []).some(function (y) { return y[0] === x.k; }) && (b.iss || []).some(function (y) { return y[0] === x.k; });
  }).map(function (x) {
    var line = function (l) { var y = l.iss.filter(function (z) { return z[0] === x.k; })[0]; return '<p><b>' + esc(shortName(l)) + ':</b> <span class="tg ' + esc(y[1]) + '">' + esc(y[1]) + "</span> " + esc(y[2]) + "</p>"; };
    return "<li><h3>" + esc(x.name) + "</h3>" + line(a) + line(b) + "</li>";
  }).join("");
  var title = a.n + " vs " + b.n + ": Records Compared";
  var desc = trim(a.n + " vs " + b.n + ": where their records agree and differ on the economy, land, social values, institutions, style and civil liberties. " + sum, 158);
  var ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": SITE + url, url: SITE + url, name: title, description: desc, inLanguage: "en-KE",
        dateModified: [a.reviewed, b.reviewed].filter(Boolean).sort().pop() || TODAY, isPartOf: { "@id": SITE + "/#website" },
        about: [{ "@id": SITE + "/leaders/" + a.id + "/#person" }, { "@id": SITE + "/leaders/" + b.id + "/#person" }] },
      personNode(a, "/leaders/" + a.id + "/"), personNode(b, "/leaders/" + b.id + "/"),
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Siasa Compass", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Compare", item: SITE + "/compare/" },
        { "@type": "ListItem", position: 3, name: a.n + " vs " + b.n, item: SITE + url }
      ] }
    ]
  };
  var more = pairsOf(a.id).concat(pairsOf(b.id)).filter(function (q) { return q !== p; }).slice(0, 8).map(function (q) {
    return '<li><a href="' + pairPath(q) + '">' + esc(byId[q[0]].n) + " vs " + esc(byId[q[1]].n) + "</a></li>";
  }).join("");
  return head({ title: trim(title + " | Siasa Compass", 70), desc: desc, path: url, ld: ld }) +
    '<main class="wrap lp">\n' +
    '<nav class="crumbs" aria-label="Breadcrumb"><a href="/compare/">Compare</a> / <span>' + esc(shortName(a)) + " vs " + esc(shortName(b)) + "</span></nav>\n" +
    "<h1>" + esc(a.n) + " vs " + esc(b.n) + "</h1>\n" +
    '<p class="lede">' + esc(sum) + "</p>\n" +
    '<div class="cta"><a class="btn" href="/#quiz-' + (a.now && b.now ? "now" : "all") + '">Where do you land?</a></div>\n' +
    '<section><h2>Dimension by dimension</h2><div class="tw2"><table class="cmpt"><thead><tr><th></th><th scope="col"><a href="/leaders/' + esc(a.id) + '/">' + esc(shortName(a)) + '</a></th><th scope="col"><a href="/leaders/' + esc(b.id) + '/">' + esc(shortName(b)) + "</a></th></tr></thead><tbody>" + rows + "</tbody></table></div>" +
    '<p class="iss-note">Placed mainly from what each did; <span class="tg S">S</span> marks stated positions and <span class="tg H">H</span> hearsay, which count less. <a href="/#method">Method</a>.</p></section>\n' +
    (iss ? '<details class="lfold"><summary>On the issues voters rank highest</summary><ul class="vsi">' + iss + "</ul></details>\n" : "") +
    '<details class="lfold"><summary>Who they are</summary><p><b>' + esc(a.n) + ":</b> " + esc(a.role) + " " + esc(a.suggests) + "</p><p><b>" + esc(b.n) + ":</b> " + esc(b.role) + " " + esc(b.suggests) + "</p></details>\n" +
    '<section><h2>Full records</h2><ul class="olist"><li><a href="/leaders/' + esc(a.id) + '/">' + esc(a.n) + '</a></li><li><a href="/leaders/' + esc(b.id) + '/">' + esc(b.n) + "</a></li></ul></section>\n" +
    (more ? '<details class="lfold"><summary>More comparisons</summary><ul class="olist">' + more + '</ul><p><a href="/compare/">All comparisons</a></p></details>\n' : "") +
    "</main>\n" + foot();
}

function compareIndex() {
  var ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", "@id": SITE + "/compare/", url: SITE + "/compare/", name: "Compare Kenyan leaders side by side", inLanguage: "en-KE", isPartOf: { "@id": SITE + "/#website" } },
    { "@type": "ItemList", itemListElement: PAIRS.map(function (p, i) { return { "@type": "ListItem", position: i + 1, name: byId[p[0]].n + " vs " + byId[p[1]].n, url: SITE + pairPath(p) }; }) }
  ] };
  var groups = L.filter(function (l) { return PAIRS.some(function (p) { return p[0] === l.id; }); }).map(function (l) {
    var ps = PAIRS.filter(function (p) { return p[0] === l.id; });
    return "<details class=\"lfold\"><summary>" + esc(l.n) + " vs …</summary><ul class=\"olist\">" + ps.map(function (p) {
      return '<li><a href="' + pairPath(p) + '">' + esc(byId[p[1]].n) + "</a></li>";
    }).join("") + "</ul></details>";
  }).join("\n");
  return head({ title: "Compare Kenyan Leaders Side by Side | Siasa Compass", desc: "Ruto vs Gachagua, Kalonzo vs Matiang'i, Ruto vs Raila and more: Kenyan leaders' records compared side by side, with sources.", path: "/compare/", ld: ld }) +
    '<main class="wrap lp">\n<h1>Compare leaders</h1>\n<p class="lede">Two records, side by side. Pick a leader.</p>\n' + groups + "\n</main>\n" + foot();
}

function leaderPage(l) {
  var nu = SIASA.uCount(l);
  var dimKeys = Object.keys(l.dims);
  var url = "/leaders/" + l.id + "/";
  var desc = trim(l.n + ": promises next to the record, tagged by evidence, with sources. " + l.role, 158);
  var modified = l.reviewed || TODAY;
  var ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage", "@id": SITE + url, url: SITE + url, name: l.n + ": record, positions and sources",
        inLanguage: "en-KE", dateModified: modified, isPartOf: { "@id": SITE + "/#website" },
        mainEntity: { "@id": SITE + url + "#person" }
      },
      personNode(l, url),
      {
        "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Siasa Compass", item: SITE + "/" },
          { "@type": "ListItem", position: 2, name: "Leaders", item: SITE + "/leaders/" },
          { "@type": "ListItem", position: 3, name: l.n, item: SITE + url }
        ]
      }
    ]
  };

  var tend = dimKeys.map(function (k) {
    var d = l.dims[k], b = d[3];
    return "<div><b>" + esc(dimOf(k).name) + ":</b> " + esc(words(k, d[0])) +
      ' <span class="why">(' + esc(CONF[d[1]]) + " confidence" + (b === "S" ? ", stated position" : b === "H" ? ", hearsay" : "") + ')</span>' +
      '<div class="why">' + (b === "S" || b === "H" ? '<span class="tg ' + b + '">' + b + "</span> " : "") + esc(d[2]) + "</div></div>";
  }).join("") || '<div class="why">No dimension has enough evidence to place this leader yet.</div>';

  var rec = (l.rec || []).map(function (r) {
    return '<li><span class="tg ' + esc(r[0]) + '">' + esc(r[0]) + "</span><span>" + esc(r[1]) + "</span></li>";
  }).join("");

  var said = (l.said || []).map(function (p) {
    var note = p[3] === "X" ? '<p class="xnote">Contradicted by the record. Not counted.</p>' :
      (l.inPower && !l.limitedPower ? '<p class="xnote">Made in power, so not counted.</p>' : "");
    return '<li><div class="said"><span class="lbl">Said they would</span>' + esc(p[0]) + "</div>" +
      '<div><span class="lbl">' + (l.exec ? "What they did" : "Record so far") + '</span><div class="did">' +
      (p[1] ? '<span class="tg ' + esc(p[2]) + '">' + esc(p[2]) + "</span><span>" + esc(p[1]) + "</span>" :
        '<span class="tg S">S</span><span>No record in office yet. Counts as a stated position.</span>') +
      "</div>" + note + "</div></li>";
  }).join("");

  // Where they stand on the issues voters rank highest, in poll order (ISSUES in js/data.js). Not used in matching.
  var iss = (l.iss || []).slice().sort(function (a, b) { return issueIdx(a[0]) - issueIdx(b[0]); }).map(function (x) {
    return '<li><span class="tg ' + esc(x[1]) + '">' + esc(x[1]) + "</span><span><b>" + esc(SIASA.ISSUES[issueIdx(x[0])].name) + ":</b> " + esc(x[2]) + "</span></li>";
  }).join("");

  var contra = (l.contra || []).map(function (c) {
    return '<li><span class="tg I">I</span><span>' + esc(c) + "</span></li>";
  }).join("");
  var src = (l.src || []).map(function (s) {
    return '<li><a href="' + esc(safeUrl(s[1])) + '" target="_blank" rel="noopener noreferrer">' + esc(s[0]) + "</a></li>";
  }).join("");

  var group = L.filter(function (x) { return x.id !== l.id && !!x.now === !!l.now; });
  var others = group.map(function (x) { return '<li><a href="/leaders/' + esc(x.id) + '/">' + esc(x.n) + "</a></li>"; }).join("");

  // Only what the reader needs: when it was last checked, and any claims still unchecked.
  var meta = [l.reviewed ? "Reviewed " + esc(l.reviewed) : "", nu ? nu + " claim" + (nu === 1 ? "" : "s") + " not yet re-checked" : ""].filter(Boolean).join(" · ");

  var vs = pairsOf(l.id).map(function (p) {
    var o = p[0] === l.id ? p[1] : p[0];
    return '<li><a href="' + pairPath(p) + '">vs ' + esc(byId[o].n) + "</a></li>";
  }).join("");
  return head({ title: trim(l.n + ": Promises vs Record | Siasa Compass", 70), desc: desc, path: url, ld: ld }) +
    '<main class="wrap lp">\n' +
    '<nav class="crumbs" aria-label="Breadcrumb"><a href="/leaders/">Leaders</a> / <span>' + esc(l.n) + "</span></nav>\n" +
    '<p class="kicker">' + esc(l.cls) + "</p>\n<h1>" + esc(l.n) + "</h1>\n" +
    '<p class="lede">' + esc(l.role) + "</p>\n" +
    '<p class="basis">' + basisLine(l).replace(/^([^.]*\.)/, "<b>$1</b>") + "</p>\n" +
    (meta ? '<p class="meta">' + meta + "</p>\n" : "") +
    '<div class="cta"><a class="btn" href="/#quiz-' + (l.now ? "now" : "all") + '">See how your views compare</a><a class="btn ghost" href="/#leader-' + esc(encodeURIComponent(l.id)) + '">Open in the compass</a></div>\n' +
    '<section><h2>What the record shows</h2><ul class="rec">' + rec + "</ul></section>\n" +
    (iss ? '<section><h2>On the issues voters rank highest</h2><ul class="rec">' + iss + '</ul><p class="iss-note">In the order voters ranked them in Infotrak&#39;s December 2025 poll. Shown for reference; not used in matching.</p></section>\n' : "") +
    (said ? "<section><h2>" + (l.exec ? "What they said, and what they did" : "What they say they would do") + '</h2><ul class="pd">' + said + "</ul></section>\n" : "") +
    "<section><h2>Where the evidence points, by dimension</h2><div class=\"tend\">" + tend + "</div></section>\n" +
    "<section><h2>What they appear to have stood for</h2><p>" + esc(l.suggests) + "</p></section>\n" +
    (vs ? '<section><h2>Compare side by side</h2><ul class="olist">' + vs + "</ul></section>\n" : "") +
    '<details class="lfold"><summary>Contradictions in the record</summary><ul class="rec">' + contra + "</ul></details>\n" +
    '<details class="lfold"><summary>Sources (' + (l.src || []).length + ')</summary><ul class="src">' + src + "</ul></details>\n" +
    '<details class="lfold how"><summary>How to read this page</summary>' +
    "<p>Actions come first: laws, votes, decisions, court cases. Words count less, and only where the record is thin and not contradicted. A leader with real power now is judged on actions only. " +
    'Tags: <span class="tg D">D</span> documented, <span class="tg A">A</span> attributed to a named source, <span class="tg I">I</span> our interpretation, <span class="tg U">U</span> not yet re-checked, <span class="tg S">S</span> stated position, <span class="tg H">H</span> hearsay. ' +
    'An allegation is not a finding. This is a research draft, not voting advice. <a href="/#method">Read the full method</a>.</p></details>\n' +
    '<details class="lfold"><summary>Other leaders</summary><ul class="olist">' + others + '</ul><p><a href="/leaders/">All leaders</a></p></details>\n' +
    "</main>\n" + foot();
}

function indexPage() {
  var now = L.filter(function (l) { return l.now; }), past = L.filter(function (l) { return !l.now; });
  var item = function (l) {
    return '<li><a href="/leaders/' + esc(l.id) + '/"><b>' + esc(l.n) + "</b></a><span>" + esc(l.role) + "</span></li>";
  };
  var ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage", "@id": SITE + "/leaders/", url: SITE + "/leaders/", name: "Kenyan leaders and 2027 contenders: records and positions",
        inLanguage: "en-KE", isPartOf: { "@id": SITE + "/#website" }
      },
      {
        "@type": "ItemList", itemListElement: L.map(function (l, i) {
          return { "@type": "ListItem", position: i + 1, name: l.n, url: SITE + "/leaders/" + l.id + "/" };
        })
      }
    ]
  };
  return head({
    title: "Kenyan Leaders and 2027 Contenders: Records and Positions | Siasa Compass",
    desc: "Profiles of " + L.length + " Kenyan leaders, from independence to the 2027 election race: what each said and did, tagged by evidence, with sources.",
    path: "/leaders/", ld: ld, isIndex: true
  }) +
    '<main class="wrap lp">\n<p class="kicker">Research draft · records up to 30 September 2026</p>\n<h1>Kenyan leaders and 2027 contenders</h1>\n' +
    '<p class="lede">What each leader said and what they did, with sources. Actions count most. This is not voting advice.</p>\n' +
    '<div class="cta"><a class="btn" href="/#quiz-now">Take the Current climate quiz</a><a class="btn ghost" href="/compare/">Compare two leaders</a></div>\n' +
    "<section><h2>Government, opposition and the 2027 race</h2><ul class=\"dir\">" + now.map(item).join("") + "</ul></section>\n" +
    "<section><h2>Earlier leaders</h2><ul class=\"dir\">" + past.map(item).join("") + "</ul></section>\n" +
    "</main>\n" + foot();
}

write("leaders/index.html", indexPage());
L.forEach(function (l) { write("leaders/" + l.id + "/index.html", leaderPage(l)); });
// Clear old comparison pages first, so a pair that drops out of PAIRS does not linger.
fs.rmSync(path.join(root, "compare"), { recursive: true, force: true });
write("compare/index.html", compareIndex());
PAIRS.forEach(function (p) { write(pairPath(p).slice(1) + "index.html", comparePage(p)); });

var urls = [["/", TODAY], ["/leaders/", TODAY], ["/compare/", TODAY]]
  .concat(L.map(function (l) { return ["/leaders/" + l.id + "/", l.reviewed || TODAY]; }))
  .concat(PAIRS.map(function (p) { return [pairPath(p), [byId[p[0]].reviewed, byId[p[1]].reviewed].filter(Boolean).sort().pop() || TODAY]; }));
write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(function (u) { return "  <url>\n    <loc>" + SITE + u[0] + "</loc>\n    <lastmod>" + u[1] + "</lastmod>\n  </url>\n"; }).join("") + "</urlset>\n");



// llms.txt: a plain summary with links, read by AI assistants and AI search tools (llmstxt.org).
write("llms.txt", "# Siasa Compass\n\n" +
  "> A free Kenya politics quiz (siasacompass.co.ke). It compares a visitor's answers on six policy dimensions with the documented records of " +
  L.length + " Kenyan leaders, from independence to the 2027 election race. Actions (laws, votes, decisions, court cases) count most; " +
  "stated positions count less; every claim is tagged by evidence and linked to sources. It does not rank, predict or endorse anyone.\n\n" +
  "## Main pages\n\n- [Quiz](" + SITE + "/): Current climate and Every leader quizzes\n- [Leader profiles](" + SITE + "/leaders/): what each leader said and did, with sources\n" +
  "- [Compare leaders](" + SITE + "/compare/): two records side by side\n\n" +
  "## Leaders\n\n" + L.map(function (l) { return "- [" + l.n + "](" + SITE + "/leaders/" + l.id + "/): " + l.role; }).join("\n") + "\n");
console.log("Wrote leaders/index.html, " + L.length + " leader pages, " + PAIRS.length + " comparisons, sitemap.xml and llms.txt");
