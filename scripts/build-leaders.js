#!/usr/bin/env node
// Builds a plain, crawlable page for every leader in js/data.js, so a search for a name can land on the site.
//   leaders/index.html          directory of all leaders
//   leaders/<id>/index.html     one page per leader (record, said/did, sources)
//   sitemap.xml                 lists the home page, the directory and every leader page
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
var V = { css: "10" }; // keep in step with the ?v= on css/styles.css in index.html

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

function leaderPage(l) {
  var nu = SIASA.uCount(l);
  var dimKeys = Object.keys(l.dims);
  var url = "/leaders/" + l.id + "/";
  var desc = trim(l.n + "'s record and positions: what they said, what they did, with sources. " + l.role, 158);
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

  var contra = (l.contra || []).map(function (c) {
    return '<li><span class="tg I">I</span><span>' + esc(c) + "</span></li>";
  }).join("");
  var src = (l.src || []).map(function (s) {
    return '<li><a href="' + esc(safeUrl(s[1])) + '" target="_blank" rel="noopener noreferrer">' + esc(s[0]) + "</a></li>";
  }).join("");

  var group = L.filter(function (x) { return x.id !== l.id && !!x.now === !!l.now; });
  var others = group.map(function (x) { return '<li><a href="/leaders/' + esc(x.id) + '/">' + esc(x.n) + "</a></li>"; }).join("");

  var meta = "Last reviewed: " + (l.reviewed ? esc(l.reviewed) : "not yet recorded") + " · " + nu + " claim" + (nu === 1 ? "" : "s") + " not yet re-checked";

  return head({ title: trim(l.n + ": Record, Positions and Sources | Siasa Compass", 70), desc: desc, path: url, ld: ld }) +
    '<main class="wrap lp">\n' +
    '<nav class="crumbs" aria-label="Breadcrumb"><a href="/leaders/">Leaders</a> / <span>' + esc(l.n) + "</span></nav>\n" +
    '<p class="kicker">' + esc(l.cls) + "</p>\n<h1>" + esc(l.n) + "</h1>\n" +
    '<p class="lede">' + esc(l.role) + "</p>\n" +
    '<p class="basis">' + basisLine(l).replace(/^([^.]*\.)/, "<b>$1</b>") + "</p>\n" +
    '<p class="meta">' + meta + "</p>\n" +
    '<div class="cta"><a class="btn" href="/#quiz-' + (l.now ? "now" : "all") + '">See how your views compare</a><a class="btn ghost" href="/#leader-' + esc(encodeURIComponent(l.id)) + '">Open in the compass</a></div>\n' +
    '<section><h2>What the record shows</h2><ul class="rec">' + rec + "</ul></section>\n" +
    (said ? "<section><h2>" + (l.exec ? "What they said, and what they did" : "What they say they would do") + '</h2><ul class="pd">' + said + "</ul></section>\n" : "") +
    "<section><h2>Where the evidence points, by dimension</h2><div class=\"tend\">" + tend + "</div></section>\n" +
    "<section><h2>Contradictions in the record</h2><ul class=\"rec\">" + contra + "</ul></section>\n" +
    "<section><h2>What they appear to have stood for</h2><p>" + esc(l.suggests) + "</p></section>\n" +
    "<section><h2>Sources</h2><ul class=\"src\">" + src + "</ul></section>\n" +
    '<section class="how"><h2>How to read this page</h2>' +
    "<p>Actions come first: laws, votes, decisions, court cases. Words count less, and only where the record is thin and not contradicted. A leader with real power now is judged on actions only. " +
    'Tags: <span class="tg D">D</span> documented, <span class="tg A">A</span> attributed to a named source, <span class="tg I">I</span> our interpretation, <span class="tg U">U</span> not yet re-checked, <span class="tg S">S</span> stated position, <span class="tg H">H</span> hearsay. ' +
    'An allegation is not a finding. This is a research draft, not voting advice. <a href="/#method">Read the full method</a>.</p></section>\n' +
    '<section><h2>Other leaders</h2><ul class="olist">' + others + '</ul><p><a href="/leaders/">All leaders</a></p></section>\n' +
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
    '<div class="cta"><a class="btn" href="/#quiz-now">Take the Current climate quiz</a><a class="btn ghost" href="/#quiz-all">Every leader quiz</a></div>\n' +
    "<section><h2>Government, opposition and the 2027 race</h2><ul class=\"dir\">" + now.map(item).join("") + "</ul></section>\n" +
    "<section><h2>Earlier leaders</h2><ul class=\"dir\">" + past.map(item).join("") + "</ul></section>\n" +
    "</main>\n" + foot();
}

write("leaders/index.html", indexPage());
L.forEach(function (l) { write("leaders/" + l.id + "/index.html", leaderPage(l)); });

var urls = [["/", TODAY], ["/leaders/", TODAY]].concat(L.map(function (l) { return ["/leaders/" + l.id + "/", l.reviewed || TODAY]; }));
write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(function (u) { return "  <url>\n    <loc>" + SITE + u[0] + "</loc>\n    <lastmod>" + u[1] + "</lastmod>\n  </url>\n"; }).join("") + "</urlset>\n");

console.log("Wrote leaders/index.html, " + L.length + " leader pages and sitemap.xml");
