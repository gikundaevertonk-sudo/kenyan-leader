#!/usr/bin/env node
// Tells Bing, Yandex, Seznam, Naver and Yep (through IndexNow) that the site's pages changed, so they recrawl
// within hours instead of weeks. Bing's index also feeds DuckDuckGo, Ecosia and ChatGPT search.
// Run it after the site is published (the key file must be live): node scripts/indexnow.js
// It submits every URL in sitemap.xml. Needs Node 18+ (global fetch). No dependencies.
var fs = require("fs");
var path = require("path");

var HOST = "siasacompass.co.ke";
var KEY = "cef6021f15ec780e59844a617a87a392"; // served at https://siasacompass.co.ke/cef6021f15ec780e59844a617a87a392.txt, which proves we own the site
var sitemap = fs.readFileSync(path.join(__dirname, "..", "sitemap.xml"), "utf8");
var urls = (sitemap.match(/<loc>[^<]+<\/loc>/g) || []).map(function (m) { return m.slice(5, -6); });

fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: "https://" + HOST + "/" + KEY + ".txt", urlList: urls })
}).then(function (r) {
  // 200 and 202 both mean accepted.
  console.log("IndexNow: " + r.status + " " + r.statusText + " for " + urls.length + " URLs");
  if (r.status >= 300) process.exit(1);
}).catch(function (e) { console.error("IndexNow: " + e.message); process.exit(1); });
