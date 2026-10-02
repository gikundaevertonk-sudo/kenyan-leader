#!/usr/bin/env node
// Inlines css/styles.css, js/data.js and js/app.js into dist/siasa-compass.html
// so the app can be shared as one file. No dependencies.
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var read = function (p) { return fs.readFileSync(path.join(root, p), "utf8"); };
// Asset links in index.html carry a ?v= cache-busting query (bump it after changing css/js); it is dropped here.
// Function replacers stop "$&" style patterns in the inlined code being interpreted.
var html = read("index.html")
  .replace(/<link rel="stylesheet" href="([^"?]+)(?:\?[^"]*)?">/g, function (m, href) {
    return "<style>\n" + read(href).trim() + "\n</style>";
  })
  .replace(/<script src="([^"?]+)(?:\?[^"]*)?"><\/script>/g, function (m, src) {
    // Guard against a literal "</script>" inside the code closing the tag early.
    return "<script>\n" + read(src).trim().replace(/<\/script/gi, "<\/script") + "\n</script>";
  })
  // Site-root icon links do not resolve in a standalone file, so swap them for the SVG icon inlined as a data URI.
  .replace(/(?:<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*>\n)+/, function () {
    var svg = read("favicon.svg").trim();
    return '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,' + encodeURIComponent(svg) + '">\n';
  });

if (/<link rel="stylesheet" href="(?!https?:)/.test(html) || /<script src="(?!https?:)/.test(html)) {
  console.error("build-single: a local stylesheet or script was not inlined.");
  process.exit(1);
}
var out = path.join(root, "dist", "siasa-compass.html");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log("Wrote " + path.relative(root, out) + " (" + Buffer.byteLength(html) + " bytes)");
