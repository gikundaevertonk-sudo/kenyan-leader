#!/usr/bin/env node
// One command for everything that must be rerun after editing js/data.js, js/*.js, css or index.html:
// checks the data, checks the scoring, rebuilds the leader and comparison pages, sitemap and dist file.
//   node scripts/build-all.js
// Share images (scripts/build-share.js) need a browser and network, so run that one separately when leaders change.
var execFileSync = require("child_process").execFileSync;
var path = require("path");
["validate-data.js", "test-scoring.js", "build-leaders.js", "build-single.js"].forEach(function (f) {
  console.log("\n> " + f);
  try { execFileSync(process.execPath, [path.join(__dirname, f)], { stdio: "inherit" }); }
  catch (e) { console.error("\nStopped: " + f + " failed."); process.exit(1); }
});
console.log("\nAll done. Commit the changes, publish, then run: node scripts/indexnow.js");
