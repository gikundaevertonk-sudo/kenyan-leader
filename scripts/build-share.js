#!/usr/bin/env node
// Builds the link a result is shared with, so a post on WhatsApp, X or Facebook shows the sharer's closest match
// rather than the generic site preview. The site is static, so there is one page and one image per leader:
//   r/<id>/index.html      share page: preview tags for link crawlers, then sends people on to the quiz
//   img/share/<id>.jpg     1200 x 630 preview image: "My closest documented record: <name>", with photo
// Photos come from Wikipedia (free licences only, credited on the image), the same as js/photos.js.
// Images are drawn in headless Chrome or Edge. Needs network access. Run after editing js/data.js or js/photos.js:
//   node scripts/build-share.js
// Set CHROME=<path to chrome or msedge> if neither is found. No npm dependencies.
var fs = require("fs");
var path = require("path");
var os = require("os");
var execFileSync = require("child_process").execFileSync;

var root = path.join(__dirname, "..");
var SIASA = require(path.join(root, "js", "data.js"));
var PH = require(path.join(root, "js", "photos.js"));
var L = SIASA.L;
var SITE = "https://siasacompass.co.ke";

function esc(x) {
  return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function stripTags(h) { return String(h || "").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim(); }
function write(rel, data) {
  var f = path.join(root, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
}
function getJSON(u) {
  return fetch(u, { headers: { "User-Agent": "SiasaCompassBuild/1.0 (https://siasacompass.co.ke)" } }).then(function (r) { return r.json(); });
}

// Same lookup as load() in js/photos.js: lead image of each Wikipedia article, kept only if freely licensed.
function photos() {
  var ids = Object.keys(PH.WIKI), titles = ids.map(function (i) { return PH.WIKI[i]; });
  return getJSON(PH.API + "&redirects=1&prop=pageimages&piprop=thumbnail|name&pithumbsize=480&pilicense=free&titles=" + encodeURIComponent(titles.join("|")))
    .then(function (d) {
      var q = d.query || {}, alias = {}, byTitle = {}, found = {};
      (q.normalized || []).concat(q.redirects || []).forEach(function (m) { alias[m.from] = m.to; });
      (q.pages || []).forEach(function (p) { if (p.thumbnail && p.pageimage) byTitle[p.title] = p; });
      ids.forEach(function (id) {
        var t = PH.WIKI[id], n = 0; while (alias[t] && n++ < 4) t = alias[t];
        var p = byTitle[t]; if (p) found[id] = { src: p.thumbnail.source, file: "File:" + p.pageimage.replace(/_/g, " ") };
      });
      var files = Object.keys(found).map(function (id) { return found[id].file; });
      return getJSON(PH.API + "&prop=imageinfo&iiprop=extmetadata|url&iiextmetadatafilter=Artist|LicenseShortName&titles=" + encodeURIComponent(files.join("|")))
        .then(function (d2) {
          var meta = {}, nAlias = {};
          ((d2.query || {}).pages || []).forEach(function (p) { var ii = (p.imageinfo || [])[0]; if (ii) meta[p.title] = ii.extmetadata || {}; });
          (((d2.query || {}).normalized) || []).forEach(function (m) { nAlias[m.from] = m.to; });
          var out = {};
          return Promise.all(Object.keys(found).map(function (id) {
            var f = found[id], m = meta[nAlias[f.file] || f.file]; if (!m) return;
            var lic = stripTags((m.LicenseShortName || {}).value);
            if (!lic || /fair use|non-free/i.test(lic)) return;
            return fetch(f.src, { headers: { "User-Agent": "SiasaCompassBuild/1.0 (https://siasacompass.co.ke)" } })
              .then(function (r) { if (!r.ok) throw new Error(r.status); return Promise.all([r.headers.get("content-type"), r.arrayBuffer()]); })
              .then(function (x) {
                out[id] = { data: "data:" + (x[0] || "image/jpeg") + ";base64," + Buffer.from(x[1]).toString("base64"),
                  credit: "Photo: " + (stripTags((m.Artist || {}).value) || "Unknown author") + ", " + lic + ", via Wikimedia Commons" };
              })
              .catch(function (e) { console.warn("No photo for " + id + ": " + e.message); });
          })).then(function () { return out; });
        });
    });
}

// The page headless Chrome loads. It draws every card on a canvas and prints them as JPEG data URLs.
function renderPage(cards) {
  return '<!doctype html><html><head><meta charset="utf-8">' +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Instrument+Sans:wght@500;600;700&display=block">' +
    '</head><body><pre id="out"></pre><script>\n' +
    "var CARDS=" + JSON.stringify(cards).replace(/</g, "\\u003c") + ";\n" + "(" + drawAll.toString() + ")();\n" +
    "</script></body></html>";
}

// Runs in the browser, not in Node.
function drawAll() {
  var D = '"Bricolage Grotesque", "Segoe UI", sans-serif', B = '"Instrument Sans", "Segoe UI", sans-serif';
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function wrap(ctx, text, maxW) {
    var ws = String(text).split(" "), lines = [], cur = "";
    ws.forEach(function (w) { var t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); return lines;
  }
  function img(src) { return new Promise(function (res) { if (!src) return res(null); var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { res(null); }; i.src = src; }); }
  function fit(ctx, text, font, size, maxW) { do { ctx.font = font.replace("%", size); } while (ctx.measureText(text).width > maxW && (size -= 4) > 40); return size; }
  function card(c, pic) {
    var cv = document.createElement("canvas"); cv.width = 1200; cv.height = 630;
    var ctx = cv.getContext("2d"), W = 1200, H = 630, PX = 940, PY = 290, PR = 190;
    var g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#2A1690"); g.addColorStop(1, "#120E26");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(161,141,255,.16)"; ctx.beginPath(); ctx.arc(PX, PY, 290, 0, 7); ctx.fill();
    // brand
    ctx.fillStyle = "#F2B01E"; ctx.beginPath(); ctx.arc(76, 78, 13, 0, 7); ctx.fill();
    ctx.fillStyle = "#FFFFFF"; ctx.font = "800 36px " + D; ctx.textBaseline = "middle"; ctx.fillText("Siasa Compass", 102, 80);
    // headline
    ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#C9C0FF"; ctx.font = "700 28px " + B;
    ctx.fillText("MY CLOSEST DOCUMENTED RECORD", 64, 200);
    var maxW = PX - PR - 64 - 40, size = fit(ctx, c.n, "800 %px " + D, 84, maxW);
    var nameLines = size > 40 ? [c.n] : wrap(ctx, c.n, maxW);
    ctx.fillStyle = "#FFFFFF";
    nameLines.forEach(function (l, i) { ctx.fillText(l, 64, 200 + size * 1.1 * (i + 1)); });
    var y = 200 + size * 1.1 * nameLines.length + 30;
    ctx.fillStyle = "#F2B01E"; ctx.fillRect(64, y - 8, 200, 10);
    ctx.fillStyle = "#C9C0FF"; ctx.font = "600 26px " + B;
    wrap(ctx, c.role, maxW).slice(0, 2).forEach(function (l, i) { ctx.fillText(l, 64, y + 44 + i * 34); });
    // call to action
    ctx.fillStyle = "#FFFFFF"; ctx.font = "800 46px " + D; ctx.fillText("Where do you land?", 64, 520);
    ctx.fillStyle = "#F2B01E"; ctx.font = "800 34px " + D; ctx.fillText("siasacompass.co.ke", 64, 568);
    // portrait
    ctx.save(); ctx.beginPath(); ctx.arc(PX, PY, PR, 0, 7); ctx.closePath(); ctx.clip();
    if (pic) {
      var s = Math.max(2 * PR / pic.width, 2 * PR / pic.height), iw = pic.width * s, ih = pic.height * s;
      // portraits are cropped near the top so faces are not cut off
      ctx.drawImage(pic, PX - iw / 2, PY - PR - (ih > iw ? (ih - 2 * PR) * 0.1 : (ih - 2 * PR) / 2), iw, ih);
    } else {
      ctx.fillStyle = "#3A1FB5"; ctx.fillRect(PX - PR, PY - PR, 2 * PR, 2 * PR);
      ctx.fillStyle = "#FFFFFF"; ctx.font = "800 130px " + D; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(c.ini, PX, PY + 8);
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    }
    ctx.restore();
    ctx.strokeStyle = "#F2B01E"; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(PX, PY, PR, 0, 7); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.font = "400 16px " + B; ctx.textAlign = "center";
    wrap(ctx, c.credit || "Overlap with documented records. Not an endorsement.", 2 * PR + 80).slice(0, 2)
      .forEach(function (l, i) { ctx.fillText(l, PX, PY + PR + 46 + i * 21); });
    ctx.textAlign = "left";
    return cv.toDataURL("image/jpeg", 0.86);
  }
  var fonts = document.fonts ? Promise.all([document.fonts.load('800 80px "Bricolage Grotesque"'), document.fonts.load('600 26px "Instrument Sans"'), document.fonts.load('700 26px "Instrument Sans"')]).catch(function () {}) : Promise.resolve();
  fonts.then(function () { return Promise.all(CARDS.map(function (c) { return img(c.photo); })); }).then(function (pics) {
    var out = {}; CARDS.forEach(function (c, i) { out[c.id] = card(c, pics[i]); });
    document.getElementById("out").textContent = JSON.stringify(out);
  });
}

function findChrome() {
  var c = [process.env.CHROME,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"];
  for (var i = 0; i < c.length; i++) if (c[i] && fs.existsSync(c[i])) return c[i];
  throw new Error("Chrome or Edge not found. Set CHROME to its path.");
}

function sharePage(l) {
  var url = SITE + "/r/" + l.id + "/", img = SITE + "/img/share/" + l.id + ".jpg";
  var title = "My closest documented record: " + l.n + " | Siasa Compass";
  var desc = "I took the Siasa Compass quiz and " + l.n + "'s record sits closest to my views. Answer 18 short questions and see where you land.";
  // Humans go straight on to the home page, which names the match and offers the quiz. Crawlers read the tags.
  var next = "/?from=" + encodeURIComponent(l.id) + "#home";
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    "<title>" + esc(title) + "</title>\n" +
    '<meta name="description" content="' + esc(desc) + '">\n' +
    '<meta name="robots" content="noindex, follow">\n' +
    '<meta property="og:type" content="website">\n<meta property="og:site_name" content="Siasa Compass">\n<meta property="og:locale" content="en_KE">\n' +
    '<meta property="og:title" content="' + esc(title) + '">\n<meta property="og:description" content="' + esc(desc) + '">\n' +
    '<meta property="og:url" content="' + url + '">\n' +
    '<meta property="og:image" content="' + img + '">\n<meta property="og:image:secure_url" content="' + img + '">\n' +
    '<meta property="og:image:type" content="image/jpeg">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n' +
    '<meta property="og:image:alt" content="' + esc("Siasa Compass result card: closest documented record, " + l.n + ". Where do you land?") + '">\n' +
    '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="' + esc(title) + '">\n' +
    '<meta name="twitter:description" content="' + esc(desc) + '">\n<meta name="twitter:image" content="' + img + '">\n' +
    '<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" type="image/svg+xml" href="/favicon.svg">\n' +
    '<meta http-equiv="refresh" content="0; url=' + esc(next) + '">\n' +
    "<script>location.replace(" + JSON.stringify(next) + ")</script>\n" +
    '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#17132B;color:#fff;font:16px/1.5 system-ui,sans-serif;text-align:center;padding:16px}a{color:#F2B01E}</style>\n' +
    "</head>\n<body>\n<p>Closest documented record: <b>" + esc(l.n) + "</b>.<br><a href=\"" + esc(next) + "\">Take the Siasa Compass quiz</a> and see where you land.</p>\n</body>\n</html>\n";
}

photos().then(function (ph) {
  var cards = L.map(function (l) {
    var p = ph[l.id];
    return { id: l.id, n: l.n, ini: l.ini, role: l.role, photo: p ? p.data : null, credit: p ? p.credit : "" };
  });
  var tmp = fs.mkdtempSync(path.join(os.tmpdir(), "siasa-share-"));
  var page = path.join(tmp, "render.html");
  fs.writeFileSync(page, renderPage(cards));
  var dom = execFileSync(findChrome(), ["--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars",
    "--user-data-dir=" + path.join(tmp, "profile"), "--virtual-time-budget=60000", "--dump-dom", "file:///" + page.replace(/\\/g, "/")],
    { maxBuffer: 256 * 1024 * 1024, encoding: "utf8" });
  var m = /<pre id="out">([\s\S]*?)<\/pre>/.exec(dom);
  if (!m || !m[1]) throw new Error("The browser did not finish drawing the cards.");
  var imgs = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
  var big = [];
  L.forEach(function (l) {
    var buf = Buffer.from(imgs[l.id].split(",")[1], "base64");
    if (buf.length > 300 * 1024) big.push(l.id + " (" + Math.round(buf.length / 1024) + " KB)"); // WhatsApp skips large previews
    write("img/share/" + l.id + ".jpg", buf);
    write("r/" + l.id + "/index.html", sharePage(l));
  });
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log("Wrote " + L.length + " share pages in r/ and images in img/share/ (" + Object.keys(ph).length + " with photos)");
  if (big.length) console.warn("Over 300 KB, may not preview on WhatsApp: " + big.join(", "));
}).catch(function (e) { console.error(e.message || e); process.exit(1); });
