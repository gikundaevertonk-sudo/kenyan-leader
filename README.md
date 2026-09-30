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

- **Power is judged by action.** Anyone who has held executive power (`exec: 1`) is placed only on what they did: laws signed, decisions, spending, appointments. Promises are shown beside the record but never move a placement. The app drops any stated-position (`S`) placement for these leaders.
- **No power yet? Words can count.** Leaders who have never held executive power (`exec: 0`) are placed on actions first. Where those are thin, stated positions and manifestos may be used and are tagged `S`.
- **Labels are not evidence.** Self-descriptions and party labels never count.
- **Gaps are shown.** A leader needs placements on at least three dimensions to appear in matches. Others stay in Records.

### Tags

| Tag | Meaning |
| --- | --- |
| `D` | Documented: supported by a reliable report, court record or public record. |
| `A` | Attributed: a claim by a named source (journalist, group, rival). Not established fact. |
| `I` | Interpretation: our reading of several actions together. Open to challenge. |
| `U` | Not re-checked: written from general knowledge, needs verification before anyone relies on it. |
| `S` | Stated position: what someone who has not held executive power says they would do. |

Each placement also has a confidence: `H` (high), `M` (medium) or `L` (low).

### How matching works

Each placement is pulled toward the neutral midpoint by its confidence (`H` x1, `M` x0.8, `L` x0.5), so thin evidence counts for less across leaders. Per dimension, overlap is 100% at the same point and falls linearly to 0% at a gap of 3 points. The overall bar is the average overlap, and the main figure shown is how many dimensions the user is within 1 point on. The code is in `js/app.js` (`compare`) and the plain-language version is on the Method page in `index.html`. Keep the two in step.

## Running it

Open `index.html` in a browser. No server or install needed. Views use hash routes (`#home`, `#quiz-all`, `#quiz-now`, `#result-all`, `#result-now`, `#records`, `#method`, `#leader-<id>`), so each leader has a shareable link such as `index.html#leader-ruto`. Quiz answers are kept in memory only.

## Layout

```
index.html              page markup and the Method text
css/styles.css          styles
js/data.js              dimensions, questions, quiz sets and leaders (global SIASA)
js/app.js               app logic (routing, quiz, scoring, rendering)
scripts/validate-data.js  checks js/data.js
scripts/build-single.js   builds dist/siasa-compass.html (one shareable file)
```

## Adding or editing a leader

Leaders are objects in the `L` array in `js/data.js`:

```js
{id:"example",now:0,exec:0,reviewed:"2026-09-30",n:"Full Name",ini:"FN",
 role:"Office held and dates. Party.",cls:"Clearly identifiable",
 dims:{
  econ:[1,"M","What they did that supports this placement."],
  redis:[1.5,"L","Stated position.","S"]          // "S" only when exec is 0
 },
 said:[["What they said they would do.","What they did, or null.","D"]],
 rec:[["D","A documented fact."],["A","A claim attributed to a named source."]],
 contra:["A contradiction in the record, or \"Not assessed.\""],
 suggests:"One or two sentences on what they appear to have stood for.",
 src:[["Source title","https://example.org/page"]]}
```

- `id`: unique, lowercase letters, digits and hyphens. It is used in `#leader-<id>` links.
- `now: 1` puts the leader in the Current climate quiz and Records group. `exec: 1` means they have held executive power.
- `dims`: `[value from -2 to 2, confidence H/M/L, note, "S" (optional)]`. Low values are the "low" pole in the table above. Only include dimensions the evidence supports.
- `reviewed`: `YYYY-MM-DD` of the last check against sources, or `""` if unknown. Shown on the profile as "Last reviewed".
- `rec` and `said` lines use the tags above. Every `U` line is counted on the profile as a claim not yet re-checked.
- Do not guess. If a fact is not sourced, tag it `U` or leave it out.

To add quiz questions, edit `QA` (Every leader) or `QN` (Current climate): `[dimension key, direction, text]`, where direction `1` means agreeing pushes toward the high end and `-1` toward the low end. Keep at least two questions per dimension, worded in both directions.

Then run the validator.

## Scripts

Both need Node.js and have no dependencies.

```
node scripts/validate-data.js
```

Fails (exit code 1) with clear messages on: missing or duplicate ids, dimension values outside -2..2, confidence not H/M/L, record tags not D/A/I/U/S, sources without a title or an http(s) URL, questions with an unknown dimension or a direction other than 1 or -1, a malformed `reviewed` date, `S` placements on executive-power holders, and dimensions with fewer than two questions or only one direction in a quiz. It also prints the number of `U`-tagged lines per leader.

```
node scripts/build-single.js
```

Inlines the CSS and JavaScript into `dist/siasa-compass.html`, a single file that can be emailed or hosted anywhere. Never edit that file by hand; edit the sources and rebuild.

## Corrections

The footer's "Send it in" link currently points to the placeholder `mailto:CORRECTIONS_EMAIL` (see the TODO comment in `index.html`). Replace it with a real address or the repository's issues URL before publishing.
