# Siasa Compass

A static web app (HTML, CSS and vanilla JavaScript, no build step) that matches a visitor's quiz answers to Kenyan politicians based on their documented record. It is a research draft. It does not rank leaders, predict elections or endorse anyone.

There are two quizzes: **Every leader** (independence generation to today) and **Current climate** (people shaping politics now and in the race for 2027). Both use the same six dimensions:

| Key | Dimension | Low end | High end |
| --- | --- | --- | --- |
| `econ` | Role of the state in the economy | Market-led | State-led |
| `redis` | Land, wealth and taxes | Low redistribution | Strong redistribution |
| `social` | Social values | Socially conservative | Socially progressive |
| `inst` | Institutions and power-sharing | Executive-centred | Checks and devolution |
| `style` | Political style | Establishment | Anti-establishment |
| `liberty` | Civil liberties | Order-first | Liberty-first |

## Evidence rules

- **Actions come first.** Where there is action evidence on a dimension (laws signed, votes, decisions, spending, appointments, court cases), it sets the placement.
- **Words can count, with less weight.** Where the record is thin, documented statements (manifestos, rally speeches, interviews reported by the press) may place a leader, tagged `S`. In the overall match an `S` dimension counts 60% as much as an action-based one (`BASIS` in `js/app.js`).
- **Contradicted words are thrown out.** If the record contradicts a promise, it gets no `S` placement. Show it in `said` with a fourth element `"X"` so the gap is visible.
- **Little power of their own? Some grace.** If a leader holds office but with little independent power (the Deputy President), set `limitedPower: 1` next to `inPower: 1`. Their words can then place them, at the usual lower weight.
- **Real power now? Only actions.** Leaders currently holding executive power (`inPower: 1` without `limitedPower`: the President, sitting governors) never get `S` placements. The app drops them.
- **Labels are not evidence.** Self-descriptions and party labels never count.
- **Gaps are shown.** A leader needs placements on at least four dimensions (`MIN_DIMS` in `js/app.js`) to appear in matches. Others stay in Records.

### Tags

| Tag | Meaning |
| --- | --- |
| `D` | Documented: supported by a reliable report, court record or public record. |
| `A` | Attributed: a claim by a named source (journalist, group, rival). Not established fact. |
| `I` | Interpretation: our reading of several actions together. Open to challenge. |
| `U` | Not re-checked: written from general knowledge, needs verification before anyone relies on it. |
| `H` | Hearsay: a report or claim about what a leader did or said, not verified. Lightest weight (40%); never for leaders in power now. Lets MPs and others whose work is mostly words get a profile. |
| `S` | Stated position: what a leader not currently in power says they would do. Not used where the record contradicts it. |

Each placement also has a confidence: `H` (high), `M` (medium) or `L` (low).

### How matching works

Each placement is pulled toward the neutral midpoint by its confidence (`H` x1, `M` x0.8, `L` x0.5), so thin evidence counts for less across leaders. Per dimension, overlap is 100% at the same point and falls linearly to 0% at a gap of 3 points. The overall bar is the average overlap, and the main figure shown is how many dimensions the user is within 1 point on. The code is in `js/app.js` (`compare`) and the plain-language version is on the Method page in `index.html`. Keep the two in step.

## Running it

Open `index.html` in a browser. No server or install needed. Views use hash routes (`#home`, `#quiz-all`, `#quiz-now`, `#result-all`, `#result-now`, `#records`, `#method`, `#leader-<id>`), so each leader has a shareable link such as `index.html#leader-ruto`. Quiz answers are kept in memory only. Visits are counted with [GoatCounter](https://www.goatcounter.com/) (no cookies, no personal data) at siasacompass.goatcounter.com: one page view per hash route, plus events for quiz started, quiz finished and top match (`track()` in `js/app.js`). Finished quizzes also go to the anonymous answer tally (below) unless the visitor unticks the box under the questions.

## Answer tally

Each finished quiz is sent to a Google Sheet as one anonymous row: the date (no time), whether it was a retake in the same visit, the answer to every question (1 = strongly disagree to 5 = strongly agree), the visitor's score per dimension, and their top three matches. No name, IP address or identifier is sent or stored. The sender is `sendTally()` in `js/app.js`; the receiver is `scripts/tally.gs`.

The sheet gets two tabs per quiz. **"<quiz> answers"** has the raw rows (filter it to see, for example, how people whose top match was a given leader answered). **"<quiz> summary"** updates itself: for every question, how many picked each option and the % who agree, neutral and disagree; the average position per dimension; and how often each leader comes out first. If the questions change, new answers go to a fresh pair of tabs so old and new columns never mix.

Setup (once):

1. Go to [sheets.new](https://sheets.new) (signed in to Google) and name the sheet, for example "Siasa Compass tally".
2. **Extensions > Apps Script.** Delete what is in the editor, paste all of `scripts/tally.gs`, and save.
3. **Deploy > New deployment.** Click the gear, choose **Web app**. Set *Execute as*: **Me**, and *Who has access*: **Anyone**. Click **Deploy**, then **Authorize access** and allow it (on the "Google hasn't verified this app" screen, choose *Advanced > Go to … (unsafe)*: it is your own script).
4. Copy the **Web app URL** (ends in `/exec`) and paste it into `var TALLY=""` in `js/app.js`. Bump the `?v=` on `js/app.js` in `index.html`, rebuild `dist` and publish.
5. Take a quiz on the live site. The answers and summary tabs appear after the first finished quiz.

If you edit `tally.gs` later, use **Deploy > Manage deployments > Edit > Version: New version** so the URL stays the same. The URL is public by nature; the script rejects anything that is not a well-formed quiz result, but someone could still post fake results, so treat the numbers as a self-selected sample of visitors, not a poll.

## Layout

```
index.html              page markup and the Method text
css/styles.css          styles
js/data.js              dimensions, questions, quiz sets and leaders (global SIASA)
js/app.js               app logic (routing, quiz, scoring, rendering)
scripts/validate-data.js  checks js/data.js
scripts/build-single.js   builds dist/siasa-compass.html (one shareable file)
scripts/build-leaders.js  builds leaders/ (one crawlable page per leader) and sitemap.xml
scripts/build-share.js    builds r/<id>/ share pages and img/share/<id>.jpg link previews (needs Chrome or Edge, and network)
```

## Adding or editing a leader

Leaders are objects in the `L` array in `js/data.js`:

```js
{id:"example",now:0,exec:0,reviewed:"2026-09-30",n:"Full Name",ini:"FN",
 role:"Office held and dates. Party.",cls:"Clearly identifiable",
 dims:{
  econ:[1,"M","What they did that supports this placement."],
  redis:[1.5,"L","Stated position.","S"]          // "S" never when inPower is 1
 },
 said:[["What they said they would do.","What they did, or null.","D"]],
 rec:[["D","A documented fact."],["A","A claim attributed to a named source."]],
 contra:["A contradiction in the record, or \"Not assessed.\""],
 suggests:"One or two sentences on what they appear to have stood for.",
 src:[["Source title","https://example.org/page"]]}
```

- `id`: unique, lowercase letters, digits and hyphens. It is used in `#leader-<id>` links.
- `now: 1` puts the leader in the Current climate quiz and Records group. `exec: 1` means they have held executive power. `inPower: 1` means they hold it now (words never count for them).
- `dims`: `[value from -2 to 2, confidence H/M/L, note, "S" (optional)]`. Low values are the "low" pole in the table above. Only include dimensions the evidence supports.
- `reviewed`: `YYYY-MM-DD` of the last check against sources, or `""` if unknown. Shown on the profile as "Last reviewed".
- `rec` and `said` lines use the tags above. Every `U` line is counted on the profile as a claim not yet re-checked.
- Do not guess. If a fact is not sourced, tag it `U` or leave it out.

To add quiz questions, edit `QA` (Every leader) or `QN` (Current climate): `[dimension key, direction, text, issue key (optional)]`, where direction `1` means agreeing pushes toward the high end and `-1` toward the low end. Keep at least two questions per dimension, worded in both directions. The optional issue key (from `ISSUES`) is shown next to the topic during the quiz and does not affect scoring. Changing question text starts a fresh pair of tabs in the answer tally.

### Voter issues

`ISSUES` in `js/data.js` lists what Kenyans say decides their vote, in the order and with the shares from Infotrak's December 2025 poll (cost of living 46%, corruption 27%, healthcare 27%, education 26%, youth jobs 25%, leadership integrity 23%, economic management 21%, security 16%, devolution 11%, affordable housing 3%), plus `patronage` (handouts and ethnic appeals; not polled). The Current climate questions are written around these, and the Method page explains how identity and money factors are treated: never matched on, but documented conduct shows in profiles.

A leader's `iss` field records where they stand on those issues: `[issue key, tag, text]`, using the same tags and the same rule (no `S` or `H` for someone in power now). It is research material shown on profiles and leader pages, never used in matching. Add the sources for each line to `src`.

Then run the validator.

## Scripts

Both need Node.js and have no dependencies.

```
node scripts/validate-data.js
```

Fails (exit code 1) with clear messages on: missing or duplicate ids, dimension values outside -2..2, confidence not H/M/L, record tags not D/A/I/U/S, sources without a title or an http(s) URL, questions with an unknown dimension or a direction other than 1 or -1, a malformed `reviewed` date, `S` placements on leaders currently in power, said/did lines marked `"X"` without a "did" side, and dimensions with fewer than two questions or only one direction in a quiz. It also prints the number of `U`-tagged lines per leader.

```
node scripts/build-single.js
```

Inlines the CSS and JavaScript into `dist/siasa-compass.html`, a single file that can be emailed or hosted anywhere. Never edit that file by hand; edit the sources and rebuild.

## Leader pages (search visibility)

The app itself is one page with hash routes, which search engines do not index per leader. `node scripts/build-leaders.js` writes a plain HTML page for every leader (`leaders/<id>/index.html`), a directory (`leaders/index.html`) and `sitemap.xml`, all from `js/data.js`. The pages need no JavaScript and carry their own title, description, canonical link and structured data, so a search for a leader's name can land on them. The generated files are committed, so **rerun the script and commit them whenever `js/data.js` changes**. If you bump the `?v=` on `css/styles.css` in `index.html`, bump `V.css` in the script too. After publishing, submit `https://siasacompass.co.ke/sitemap.xml` in Google Search Console.

## Corrections

The footer's "Send it in" link opens a new issue on the repository (`https://github.com/gikundaevertonk-sudo/kenyan-leader/issues`). Change the URL in `index.html` if corrections should go somewhere else.
