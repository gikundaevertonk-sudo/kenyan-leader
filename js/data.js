/* Siasa Compass data: dimensions, questions, quiz sets and leader records. Edit here; see README.md. */
var SIASA=(function(){
var DIMS=[
 {k:"econ",name:"Role of the state in the economy",lo:"Market-led",hi:"State-led"},
 {k:"redis",name:"Land, wealth and taxes",lo:"Low redistribution",hi:"Strong redistribution"},
 {k:"social",name:"Social values",lo:"Socially conservative",hi:"Socially progressive"},
 {k:"inst",name:"Institutions and power-sharing",lo:"Executive-centred",hi:"Checks and devolution"},
 {k:"style",name:"Political style",lo:"Establishment",hi:"Anti-establishment"},
 {k:"liberty",name:"Civil liberties",lo:"Order-first",hi:"Liberty-first"}
];
var TOPIC={econ:"Economy",redis:"Land and wealth",social:"Values",inst:"Institutions",style:"Political style",liberty:"Rights"};

// Question coverage check (step 3): every dimension has 3 questions in each quiz, and each dimension has both
// directions (+1 and -1) in both quizzes. No gaps found, so no questions were added. scripts/validate-data.js re-checks this.
// Current-climate questions
var QN=[
 ["econ",-1,"Private business, not government, should lead job creation and growth."],
 ["redis",1,"The wealthy and large companies should pay noticeably more tax to fund public services."],
 ["social",-1,"Religious values should guide national laws on family and morality."],
 ["inst",1,"County governments should control a larger share of national revenue."],
 ["style",1,"Kenya's political families and dynasties have held power for too long."],
 ["liberty",-1,"Police should be able to use strong measures to end protests that turn disruptive."],
 ["econ",1,"Government should own or directly run key services such as housing, health insurance and fertiliser supply."],
 ["redis",-1,"Cutting government spending matters more than expanding cash transfers and subsidies."],
 ["social",1,"Women should hold at least a third of elected seats, enforced by law."],
 ["inst",-1,"A president should be able to act quickly without waiting for Parliament and the courts."],
 ["style",-1,"Working closely with the sitting government is the best way to deliver for your region."],
 ["liberty",1,"Bloggers and ordinary citizens should be free to criticise leaders without fear of arrest."],
 ["econ",-1,"State-owned companies should be privatised to cut public spending."],
 ["redis",-1,"Broad taxes such as VAT and levies on mobile money are a fair way to raise revenue."],
 ["social",1,"Sexual minorities deserve legal protection from discrimination."],
 ["inst",1,"Court rulings against the government must be obeyed even when they are inconvenient."],
 ["style",1,"Kenya needs outsiders who challenge the political establishment more than experienced insiders."],
 ["liberty",-1,"Security agencies need wider surveillance powers to fight crime."]
];
// Every-leader questions: the same six dimensions, framed across Kenya's history
var QA=[
 ["econ",1,"Government should own and run major industries, farms and services rather than leave them to private business."],
 ["redis",1,"Land taken during colonial rule should have gone free to the landless, not been sold to whoever could pay."],
 ["inst",-1,"A one-party state can be justified if it keeps the country united."],
 ["liberty",-1,"Detention without trial is acceptable to protect national stability."],
 ["style",-1,"Change is best won from inside government, not by confronting it."],
 ["social",-1,"Religious and traditional values should guide national laws."],
 ["econ",-1,"Private investors, including foreign ones, should drive Kenya's development."],
 ["redis",-1,"Title deeds must be respected even when the land was acquired through political connections."],
 ["inst",1,"Power should be shared with regions or counties to protect smaller communities."],
 ["liberty",-1,"Government should be able to shut down newspapers or TV stations it believes are inciting unrest."],
 ["style",1,"A leader should quit a government that betrays its promises, even at great personal cost."],
 ["social",1,"Women should hold far more political power than they do, guaranteed by law."],
 ["econ",-1,"Following IMF advice to cut state spending and free up prices is worth the short-term pain."],
 ["redis",1,"The rich should pay much more so that ordinary Kenyans get free education and health care."],
 ["inst",-1,"A strong president who can overrule Parliament and the courts gets more done."],
 ["liberty",1,"Citizens have the right to protest even when the government has banned the gathering."],
 ["style",-1,"Joining a rival's government is a reasonable way to deliver for your people."],
 ["social",1,"Sexual minorities deserve legal protection from discrimination."]
];
var ANS=["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"];
var W={H:1,M:.8,L:.5};
var CONF={H:"high",M:"medium",L:"low"};

/* Leader fields:
   now: part of the current political climate. exec: has held executive power.
   reviewed: date (YYYY-MM-DD) the profile was last checked against sources; "" where unknown.
   dims: {k:[value -2..2, confidence, note, basis]}. basis "S" = stated position, only allowed when exec is false.
   said: [what they said they would do, what they did (or null), tag for the second part].
   rec: [tag, text] lines, tag one of D A I U S. A U line has not been re-checked. */
var L=[
// ---------- Current climate ----------
{id:"ruto",now:1,exec:1,reviewed:"",n:"William Ruto",ini:"WR",role:"President since 2022. Deputy President 2013 to 2022. Party: UDA.",cls:"Mixed / contradictory",
 dims:{
  econ:[0,"M","Finance Acts and levies raised the tax take, while the state also funds or runs housing, health cover (SHA) and input subsidies. The record points both ways."],
  redis:[-1,"L","Signed Finance Acts whose levies were criticised as falling on consumers and payrolls. The Hustler Fund and subsidies point the other way. Contested."],
  inst:[-1,"L","Rights groups and critics allege executive overreach. Supporters point to laws passing through Parliament. Not court-settled in this pass."],
  style:[-1,"M","Governs in a broad-based arrangement with ODM and is moving toward a formal 2027 coalition with it."],
  liberty:[-1,"M","Rights organisations documented deaths and abductions around the 2024 protests. The government disputes parts of this."]},
 said:[
  ["A 'bottom-up' economy for 'hustlers' (2022 campaign).","Launched the Hustler Fund in late 2022. Also signed Finance Acts whose consumer and payroll levies drove the 2024 protests.","D"],
  ["Affordable housing and universal health cover.","Introduced a housing levy in 2023 and replaced NHIF with the Social Health Authority in 2024.","D"],
  ["Campaigned against political dynasties.","Now governs with ODM, the party of the Odinga family.","D"]],
 rec:[
  ["D","Signed the Finance Bill 2026 into law on 23 June 2026, after the National Assembly passed it 122 to 40 on 18 June."],
  ["D","The 2024 Finance Bill was withdrawn after nationwide protests in June 2024, and the Cabinet was dissolved and rebuilt in July 2024 with opposition-linked appointees."],
  ["D","ODM and UDA have moved from informal cooperation to preparing formal 2027 coalition talks."],
  ["A","Leads 2027 polls: 32% in Infotrak's June 2026 survey (3,000 adults, 47 counties) and 38.7% in Mizani Africa's September 2026 poll."],
  ["A","Rights groups such as KNCHR and Amnesty Kenya attributed killings and abductions to security agencies during the 2024 protest period. The government disputes parts of that."]],
 contra:["Campaigned as an anti-dynasty outsider, now in alliance with the party of the country's best-known political family.","Pledged to ease the cost of living while signing successive Finance Acts whose levies were contested as raising it."],
 suggests:"Pragmatic, executive-centred developmentalism with IMF-aligned fiscal consolidation, adjusting to coalition needs. Confidence is high that the record is large, and only medium that any single label fits.",
 src:[["Kenyans.co.ke: Ruto signs 2026 Finance Bill","https://www.kenyans.co.ke/news/124557-ruto-signs-2026-finance-bill-law"],["Nation: ODM, UDA joint talks team","https://nation.africa/kenya/news/politics/odm-uda-to-form-joint-talks-team-as-oburu-signals-start-of-2027-coalition-negotiations-5323202"],["Kenyans.co.ke: Infotrak poll, June 2026","https://www.kenyans.co.ke/news/125200-ruto-maintains-lead-among-presidential-aspirants-2027-race-kalonzo-2nd-infotrak-poll"],["Capital FM: Mizani Africa poll, September 2026","https://capitalfm.africa/mizani-poll-ruto-leads-kalonzo-sifuna-in-presidential-preference-survey/"]]},

{id:"kindiki",now:1,exec:1,reviewed:"2026-10-01",n:"Kithure Kindiki",ini:"KK",role:"Deputy President since 1 November 2024. Interior CS 2022 to 2024. Tharaka-Nithi Senator 2013 to 2022. UDA.",cls:"Moderately identifiable",
 dims:{
  econ:[0,"L","As Deputy President he is a principal of the government whose mixed economic record is set out under William Ruto. No separate economic record of his own was found."],
  style:[-2,"M","A career insider: Senate Majority Leader, Senate Deputy Speaker, Interior CS and now Deputy President, all within the governing camp."],
  liberty:[-2,"M","As Interior CS he declared in July 2023 that no more opposition protests would be allowed 'with or without notice', and he was in charge of policing during the 2023 and 2024 protests in which rights groups recorded dozens of deaths. He denies police brutality and abductions."]},
 said:[["Said in July 2024 that the government would investigate police brutality during the Finance Bill protests.","The Kenya Human Rights Commission later said he had justified excessive force before a parliamentary committee and called on him to resign. No outcome of the promised investigations was compiled in this pass.","A"]],
 rec:[
  ["D","Interior Cabinet Secretary from October 2022 to October 2024. Sworn in as Deputy President on 1 November 2024 after Rigathi Gachagua was impeached."],
  ["D","Warned Azimio in July 2023: 'No more protests, with or without notice.'"],
  ["A","In August 2026 Gachagua claimed Kindiki refused to oppose orders to deal harshly with 2024 protesters. Kindiki called the claims 'petty lies'. Neither account is proven."],
  ["D","Removed as Senate Deputy Speaker in 2020 for siding with then Deputy President Ruto against President Kenyatta."]],
 contra:["Has dismissed allegations of police abuses that rights groups documented while he oversaw the police (interpretation)."],
 suggests:"On his record in office: an order-first security minister who became the President's deputy. His economic record is the government's, not his own.",
 src:[["Citizen: 'No more protests, with or without notice'","https://www.citizen.digital/news/no-more-protests-with-or-without-notice-interior-cs-kindiki-now-warns-azimio-n317081"],["Capital FM: Kindiki denies abductions, promises probe (July 2024)","https://www.capitalfm.co.ke/news/2024/07/govt-to-investigate-police-brutality-during-anti-finance-bill-protests-as-cs-kindiki-denies-abductions/"],["Nation: KHRC tells Kindiki to resign","https://nation.africa/kenya/news/khrc-tells-dp-kindiki-murkomen-to-resign-over-abductions-4880690"],["allAfrica: Kindiki replies to Gachagua (Aug 2026)","https://allafrica.com/stories/202608250085.html"],["Wikipedia: Kithure Kindiki (overview)","https://en.wikipedia.org/wiki/Kithure_Kindiki"]]},

{id:"gachagua",now:1,exec:1,reviewed:"2026-10-01",n:"Rigathi Gachagua",ini:"RG",role:"Deputy President 2022 to Oct 2024 (impeached). Former Mathira MP. Leader of DCP.",cls:"Partial record",
 dims:{
  econ:[1,"L","As Deputy President he led state-driven coffee-sector reform efforts (verify specific measures)."],
  redis:[-1,"L","As Deputy President in 2023 he campaigned for the Finance Bill, telling MPs who opposed it not to ask for roads, and defended the Housing Levy."],
  inst:[-1,"L","After the High Court struck down the Housing Levy in November 2023 he publicly pleaded with judges not to 'sabotage' it."],
  style:[1,"M","Former second-in-command now leads an opposition party."]},
 said:[["Now pledges to scrap the Housing Levy.","As Deputy President he championed the Finance Act 2023 that created it and urged the courts not to block it.","D"]],
 rec:[
  ["D","In July 2022 the Anti-Corruption Court ordered forfeiture of Sh202 million, finding he could not prove how the money was raised."],
  ["D","In January 2023 the forfeiture order was set aside by consent between the parties and the State agreed to pay his costs. That was a settlement, not a ruling on the merits."],
  ["D","Impeached and removed as Deputy President in October 2024."],
  ["D","On 8 June 2026 the High Court upheld the impeachment but found his fair-hearing rights were violated in the Senate and awarded him Sh50 million. He said he would appeal."],
  ["A","Polled 4% in Infotrak's June 2026 survey and 18% in TIFA's mid-2026 survey. The polls differ widely."],
  ["D","One of the United Opposition principals working on a single-candidate coalition formula for 2027."]],
 contra:["Helped form the administration he now campaigns against (interpretation).","The forfeiture finding and its later consent settlement point in different directions and should not be read as a verdict either way."],
 suggests:"A partial placement on what he did as Deputy President, where he championed the government's tax measures. His faith-based and regional messaging is not counted, because he has held executive power. The clearest documented pattern is a shift from government insider to opposition leader.",
 src:[["Standard: court orders Gachagua to surrender Sh202m","https://www.standardmedia.co.ke/national/article/2001451803/corruption-court-orders-rigathi-gachagua-to-surrender-sh202m"],["Standard: Gachagua gets back seized millions","https://www.standardmedia.co.ke/health/politics/article/2001466359/dp-gachagua-gets-back-his-seized-millions"],["Nation: opposition principals meet","https://nation.africa/kenya/news/politics/karua-kalonzo-matiangi-gachagua-shape-2027-opposition-5021222"],["Standard: Finance Bill will pass with or without you, Gachagua tells opposition","https://www.standardmedia.co.ke/politics/article/2001474378/finance-bill-will-pass-with-or-without-your-support-gachagua-tells-opposition"],["Capital FM: Gachagua pleads with judges over Housing Levy","https://www.capitalfm.co.ke/news/2023/11/dp-gachagua-pleads-with-judges-to-exercise-judicial-discretion-not-to-sabotage-housing-levy/"],["Standard: Gachagua to appeal ruling upholding impeachment","https://www.standardmedia.co.ke/national/article/2001549926/gachagua-to-appeal-high-court-ruling-upholding-impeachment"],["Kenyans.co.ke: Infotrak poll, June 2026","https://www.kenyans.co.ke/news/125200-ruto-maintains-lead-among-presidential-aspirants-2027-race-kalonzo-2nd-infotrak-poll"],["allAfrica: TIFA poll, May 2026","https://allafrica.com/stories/202605140338.html"]]},

{id:"kalonzo",now:1,exec:1,reviewed:"2026-10-01",n:"Kalonzo Musyoka",ini:"KM",role:"Vice President 2008 to 2013. Former minister. Wiper leader. United Opposition principal.",cls:"Partial record",
 dims:{
  inst:[0,"L","Opposed the government's draft constitution in the 2005 referendum and was sacked from Cabinet, but in January 2008 accepted the vice presidency while the election result was disputed. The record points both ways."],
  style:[0,"M","A career insider, in and out of government across administrations."],
  liberty:[1,"L","Called and led the 25 June 2026 march to Parliament commemorating victims of the 2024 protests, held despite police roadblocks."]},
 said:[],
 rec:[
  ["D","Vice President from 2008 to 2013 under the Grand Coalition. Appointed in January 2008, during the post-election crisis."],
  ["D","Sacked as Environment Minister in November 2005 after campaigning against the government's draft constitution."],
  ["D","Led opposition leaders, including Martha Karua and Boniface Mwangi, in the 25 June 2026 commemorative march to Parliament."],
  ["A","Second in recent polls: 13% in Infotrak's June 2026 survey and 27.5% in Mizani Africa's September 2026 poll, where he also topped the opposition flag-bearer question."],
  ["D","Among the United Opposition principals working toward a single 2027 candidate."],
  ["U","Held several ministries under Moi and Kibaki. Dates and decisions need compiling."]],
 contra:["No contradictions assessed. His ministerial record has not been compiled in this pass."],
 suggests:"A long-serving establishment figure now leading street-level opposition. His words on the 2026 Finance Bill are not counted, because he has held executive power. His ministerial decisions are the next thing to compile.",
 src:[["Star: Kalonzo edges Matiang'i as top opposition pick (July 2026)","https://www.the-star.co.ke/news/2026-07-13-kalonzo-edges-matiangi-as-oppositions-top-pick"],["Nation: Kalonzo's rise to VP","https://nation.africa/kenya/news/politics/kalonzo-musyoka-how-rise-to-vp-earned-him-watermelon-moniker--4792974"],["Star: Nairobi lockdown a symbol of resistance, say Kalonzo, Karua (June 2026)","https://www.the-star.co.ke/news/2026-06-25-nairobi-lockdown-a-symbol-of-resistance-say-kalonzo-karua"],["Kenyans.co.ke: Infotrak poll, June 2026","https://www.kenyans.co.ke/news/125200-ruto-maintains-lead-among-presidential-aspirants-2027-race-kalonzo-2nd-infotrak-poll"],["Capital FM: Mizani Africa poll, September 2026","https://capitalfm.africa/mizani-poll-ruto-leads-kalonzo-sifuna-in-presidential-preference-survey/"]]},

{id:"matiangi",now:1,exec:1,reviewed:"",n:"Fred Matiang'i",ini:"FM",role:"Education CS 2015 to 2018. Interior CS 2018 to 2022. Jubilee leader.",cls:"Insufficient (partial)",
 dims:{
  econ:[1,"L","Led state-driven delivery programmes such as the exam overhaul and school-transition policy (interpretation; verify)."],
  inst:[-1,"L","A 2018 dispute over compliance with court orders happened under his Interior docket. Outcome not verified here."],
  style:[-1,"M","Senior member of the Jubilee cabinet across two terms, now presenting as an opposition candidate."],
  liberty:[-1,"L","Oversaw police and security agencies from 2018 to 2022. Specific findings not compiled in this pass."]},
 said:[],
 rec:[
  ["D","Held two of the most senior cabinet posts in the Kenyatta government."],
  ["D","Now Jubilee party leader and among the United Opposition principals."],
  ["A","Polled 12% in Infotrak's June 2026 survey and 7.7% in Mizani Africa's September 2026 poll. TIFA reported his support falling from 32% in August 2025 to 14% in June 2026."],
  ["U","The Huduma Namba national ID registration drive he led was challenged in court in 2019 to 2020."]],
 contra:["Senior insider in the previous government now positioned as its alternative (interpretation)."],
 suggests:"A technocratic, state-delivery style of governing. Most placements here are low confidence.",
 src:[["Star: opposition pick (July 2026)","https://www.the-star.co.ke/news/2026-07-13-kalonzo-edges-matiangi-as-oppositions-top-pick"],["Nation: opposition principals meet","https://nation.africa/kenya/news/politics/karua-kalonzo-matiangi-gachagua-shape-2027-opposition-5021222"],["Kenyans.co.ke: Infotrak poll, June 2026","https://www.kenyans.co.ke/news/125200-ruto-maintains-lead-among-presidential-aspirants-2027-race-kalonzo-2nd-infotrak-poll"],["Capital FM: Mizani Africa poll, September 2026","https://capitalfm.africa/mizani-poll-ruto-leads-kalonzo-sifuna-in-presidential-preference-survey/"]]},

{id:"karua",now:1,exec:1,reviewed:"",n:"Martha Karua",ini:"MK",role:"Justice Minister 2005 to 2009 (and earlier Water Minister). Former Gichugu MP. Leader of PLP.",cls:"Moderately identifiable",
 dims:{
  inst:[1,"M","Resigned as Justice Minister in April 2009, citing judicial appointments made without her. During the 2007 to 2008 crisis she was a leading defender of the disputed PNU result (attributed). Mixed, but leans towards checks."],
  liberty:[1,"M","Has acted as defence lawyer for opposition figures in the region, including Kizza Besigye in Uganda. Tanzania deported her in May 2025 when she arrived to represent Tundu Lissu."],
  style:[1,"L","Left government and now leads a small opposition party."]},
 said:[
  ["Rejects Finance Bill 2026 levies and has published a PLP alternative budget.","Not counted. She has held executive power, but never over the economy, so there is no economic record to set against it.","I"],
  ["Long public advocacy for judicial independence.","Resigned her ministry in 2009 over judicial appointments, which is an action consistent with it.","D"]],
 rec:[
  ["D","Resigned as Minister for Justice in April 2009."],
  ["D","Rejected key Finance Bill 2026 proposals and unveiled the PLP alternative budget plan."],
  ["D","Deported from Tanzania in May 2025 while travelling to represent opposition leader Tundu Lissu."]],
 contra:["Served in a government whose record includes the Anglo Leasing scandals. Her own role was not examined in this pass.","Champions limits on the executive from outside government. Her record inside it deserves the same scrutiny."],
 suggests:"On what she did in and after office: a constitutionalist with a rights-first bent. Her economic positions are words only and are not counted.",
 src:[["Standard: Karua's alternative budget","https://www.standardmedia.co.ke/national/article/2001549877/karua-rejects-key-finance-bill-proposals-unveils-plps-alternative-budget-plan"],["Kenyans.co.ke: Finance Bill 2026 claim","https://www.kenyans.co.ke/news/123960-karua-accuses-govt-reintroducing-2024-finance-bill-through-finance-bill-2026"],["France 24: Karua deported from Tanzania","https://www.france24.com/en/live-news/20250518-kenyan-politician-lawyer-for-tanzania"],["Wikipedia: Martha Karua (overview)","https://en.wikipedia.org/wiki/Martha_Karua"]]},

{id:"maraga",now:1,exec:0,reviewed:"2026-10-01",n:"David Maraga",ini:"DMa",role:"Chief Justice 2016 to 2021. United Green Movement (UGM) presidential candidate for 2027.",cls:"Clearly identifiable (institutions, rights)",
 dims:{
  inst:[2,"H","As Chief Justice he led the Supreme Court majority that annulled the August 2017 presidential election, and in September 2020 advised the President to dissolve Parliament for failing to pass the two-thirds gender law. In June 2026 a five-judge High Court bench ruled that advisory premature and procedurally unconstitutional."],
  liberty:[2,"M","Marched with families of protest victims in July 2025 and was tear-gassed. Arrested on 8 June 2026 at a protest against excising Nairobi National Park land, and refused to leave the police station until the others held were released."],
  social:[1,"M","His 2020 advisory sought to enforce the constitutional rule that no more than two-thirds of Parliament be of one gender. His personal faith (Seventh-day Adventist) is not counted."],
  style:[1,"M","Left the bench for opposition politics on a small party outside the main coalitions. As a former head of the Judiciary he is not an outsider in the usual sense."],
  redis:[1,"L","Says the tax burden falls on low- and middle-income earners while revenue is lost to graft, and called the government's tax policy 'economic terrorism' (April 2026).","S"],
  econ:[1,"L","UGM petitioned Parliament for a state-funded Sh300 billion youth jobs and cash-for-work programme.","S"]},
 said:[
  ["'Reset, restore and rebuild' Kenya: constitutionalism, dignity and an end to police violence against protesters.",null,"S"],
  ["A Sh300 billion programme to put three million unemployed young people to work.",null,"S"]],
 rec:[
  ["D","Led the Supreme Court's 2017 decision annulling the presidential election, the first such ruling in Africa."],
  ["D","Advised President Kenyatta in September 2020 to dissolve Parliament over the gender rule. The advisory was never acted on, and the High Court ruled it unconstitutional in June 2026."],
  ["D","Declared his presidential bid on the UGM ticket on 2 October 2025."],
  ["D","Arrested and released on 8 June 2026 during a Nairobi National Park protest."],
  ["D","Began a three-week campaign tour of the United States on 17 September 2026."],
  ["A","Polled 2% in Infotrak's June 2026 survey and 2.2% as preferred opposition flag-bearer in Mizani Africa's September 2026 poll."],
  ["A","Petitions for his removal as Chief Justice alleged ethnic bias in hiring and attendance at Jubilee events. None succeeded."]],
 contra:["Built his name on strict procedure, yet his best-known act after 2017, the dissolution advisory, was found procedurally defective by the High Court (interpretation)."],
 suggests:"A constitutionalist and rights-first reformer whose record is strongest on institutions and civil liberties. His economic positions are stated plans, not a record.",
 src:[["Nation: Maraga, 'This is my promise to change Kenya'","https://nation.africa/kenya/news/politics/maraga-this-is-my-promise-to-change-kenya--5214898"],["Star: High Court rules Maraga advisory unconstitutional","https://www.the-star.co.ke/news/2026-06-05-court-maraga-push-to-dissolve-parliament-unconstitutional"],["Capital FM: Maraga asks Kenyatta to dissolve Parliament (2020)","https://www.capitalfm.co.ke/news/2020/09/cj-maraga-asks-president-kenyatta-to-dissolve-parliament-over-unmet-gender-rule/"],["Nation: Maraga arrested over Nairobi National Park protest","https://nation.africa/kenya/news/former-chief-justice-david-maraga-arrested--5488732"],["People Daily: Maraga demands justice for slain protesters","https://peopledaily.digital/news/maraga-demands-justice-for-slain-gen-z-protesters"],["Capital FM: Maraga on tax and housing policy (April 2026)","https://capitalfm.africa/maraga-warns-of-deepening-inequality-under-rutos-tax-and-housing-policies/"],["Eastleigh Voice: UGM's Sh300bn youth jobs petition","https://eastleighvoice.co.ke/news/372572/maragas-ugm-party-petitions-national-assembly-for-sh300-billion-youth-employment-programme"],["Mwakilishi: Maraga's US tour","https://mwakilishi.com/news/2026-09-17/maraga-takes-2027-presidential-campaign-to-kenyans-in-the-us"],["Kenyans.co.ke: Infotrak poll, June 2026","https://www.kenyans.co.ke/news/125200-ruto-maintains-lead-among-presidential-aspirants-2027-race-kalonzo-2nd-infotrak-poll"],["Capital FM: Mizani Africa poll, September 2026","https://capitalfm.africa/mizani-poll-ruto-leads-kalonzo-sifuna-in-presidential-preference-survey/"],["Wikipedia: David Maraga (overview)","https://en.wikipedia.org/wiki/David_Maraga"]]},

{id:"omtatah",now:1,exec:0,reviewed:"2026-10-01",n:"Okiya Omtatah",ini:"OO",role:"Busia Senator since 2022. Public-interest litigant. Leader of the National Reconstruction Alliance. Weighing a 2027 presidential run.",cls:"Moderately identifiable",
 dims:{
  inst:[2,"H","Has brought many constitutional petitions against government actions. His challenge to the Finance Act 2023, with others, led the High Court to strike down the Housing Levy in November 2023. The levy was later re-enacted under a separate housing law."],
  econ:[1,"M","Went to court to stop the sale of Kenya Pipeline Company, arguing the privatisation was driven by IMF pressure. The High Court declined interim orders in February 2026."],
  style:[2,"M","An independent-minded senator who says he will run even as a 'lone ranger' and faults the opposition for having no agenda beyond removing Ruto."],
  liberty:[1,"L","Publicly condemned the arrest of MP Peter Salasya and vowed to fight it."]},
 said:[["Says leadership must protect Kenyans' interests, not just remove the current president (June 2026).",null,"S"]],
 rec:[
  ["D","Co-petitioner in the case in which the High Court declared the Housing Levy in the Finance Act 2023 unconstitutional in November 2023."],
  ["D","Filed petitions against the privatisation of Kenya Pipeline Company. Interim orders were refused in February 2026 and the case continues."],
  ["D","Gazetted a presidential exploratory committee in November 2024. Said in June 2026 he would announce his decision after receiving its report in early July. A formal declaration was not confirmed in this pass."],
  ["A","Polled 0.4% as preferred opposition flag-bearer in Mizani Africa's September 2026 poll."]],
 contra:["Not assessed."],
 suggests:"A checks-and-balances litigant who uses the courts against the executive and resists the sale of state assets.",
 src:[["Kenyans.co.ke: court ruling on Finance Act 2023","https://www.kenyans.co.ke/news/95083-court-issues-final-ruling-finance-act-2023"],["The EastAfrican: High Court quashes housing levy","https://www.theeastafrican.co.ke/tea/news/east-africa/kenya-high-court-quashes-housing-levy-4448000"],["Citizen: court declines to stop Kenya Pipeline privatisation","https://www.citizen.digital/article/high-court-declines-to-issue-orders-stopping-planned-privatisation-of-kenya-pipeline-n377946"],["Nation: Omtatah on his presidential decision (June 2026)","https://nation.africa/kenya/news/politics/-omtatah-i-ll-make-pronouncement-on-my-presidential-bid-next-month-5496264"],["Star: inside Omtatah's bid","https://www.the-star.co.ke/news/2024-11-29-inside-senator-omtatahs-bid-to-unseat-ruto-in-2027"],["People Daily: Omtatah on the Salasya arrest","https://peopledaily.digital/news/omtatah-condemns-dramatic-arrest-of-salasya-vows-to-fight-for-justice"],["Capital FM: Mizani Africa poll, September 2026","https://capitalfm.africa/mizani-poll-ruto-leads-kalonzo-sifuna-in-presidential-preference-survey/"]]},

{id:"bmwangi",now:1,exec:0,reviewed:"2026-10-01",n:"Boniface Mwangi",ini:"BMw",role:"Photojournalist and human rights activist. 2027 presidential aspirant.",cls:"Clearly identifiable (rights, style)",
 dims:{
  liberty:[2,"H","Years documenting police killings and leading protests. Detained in Tanzania in May 2025, where Amnesty International reports he was tortured. Charged in Kenya in July 2025 with possessing a blank round after terrorism accusations were dropped. He pleaded not guilty."],
  style:[2,"M","An activist outside party politics who says he will campaign door to door and refuse alliances with ethnic power brokers."],
  redis:[2,"M","Campaigns on free education, health care and water, plus recovery of stolen public money.","S"],
  econ:[1,"L","Free public services imply a bigger state role. He has not set out a policy on ownership or markets.","S"]},
 said:[
  ["Free education, health care and water, and a 'third liberation' from corruption, poverty and misrule (August 2025).",null,"S"],
  ["Justice for victims of police brutality and prosecution of leaders accused of looting.",null,"S"]],
 rec:[
  ["D","Declared his presidential bid on 27 August 2025 at Ufungamano House."],
  ["D","Detained and held incommunicado in Tanzania in May 2025 after travelling to observe Tundu Lissu's trial, then left at the border."],
  ["D","Arrested on 19 July 2025 and charged with possessing ammunition. Released on a Sh1 million personal bond. KHRC called the charge trumped up."],
  ["D","Marched with Kalonzo Musyoka and Martha Karua in the 25 June 2026 commemoration."]],
 contra:["Not assessed."],
 suggests:"A liberty-first, anti-establishment activist with a strongly redistributive programme. His economic plans are words only, because he has not held office.",
 src:[["Kenyans.co.ke: Mwangi unveils bid","https://www.kenyans.co.ke/news/115694-boniface-mwangi-unveils-2027-presidential-bid-centred-free-education-health-water"],["Nation: Mwangi pledges 'third liberation'","https://nation.africa/kenya/news/politics/boniface-mwangi-declares-2027-presidential-bid-pledges-third-liberation--5169282"],["Amnesty International: torture in Tanzania","https://www.amnesty.org/en/latest/news/2025/05/tanzania-torture-and-forcible-deportation-of-kenyan-and-ugandan-activists-must-be-urgently-investigated/"],["Nation: Mwangi charged, released on bond","https://nation.africa/kenya/news/boniface-mwangi-charged-released-on-sh1-million-personal-bond--5125960"],["Star: Kalonzo, Karua at June 25 march","https://www.the-star.co.ke/news/2026-06-25-nairobi-lockdown-a-symbol-of-resistance-say-kalonzo-karua"]]},

{id:"sifuna",now:1,exec:0,reviewed:"",n:"Edwin Sifuna",ini:"ES",role:"Nairobi Senator since 2017. Removed as ODM Secretary-General. Linda Mwananchi presidential candidate.",cls:"Moderately identifiable (style)",
 dims:{
  inst:[1,"L","Has used the Senate seat and party platform to challenge party and government positions (interpretation)."],
  style:[2,"M","Removed from ODM's secretary-general post twice, upheld by the Political Parties Disputes Tribunal, and now heads a rival movement."],
  liberty:[1,"L","Publicly sided with protesters on rights issues.","S"]},
 said:[["Sided with protesters and against the ODM–UDA arrangement.",null,"S"]],
 rec:[
  ["D","ODM's National Executive Committee removed him as Secretary-General a second time, and the Registrar ratified it."],
  ["D","The Political Parties Disputes Tribunal upheld the removal in September 2026, dismissing his third challenge."],
  ["D","The Linda Mwananchi movement named him its presidential candidate for 2027."],
  ["A","A TIFA survey reported him as the most preferred ODM flag bearer among respondents."],
  ["A","Polled 12% in Infotrak's June 2026 survey and 13.2% in Mizani Africa's September 2026 poll. TIFA called him the fastest riser among opposition figures."]],
 contra:["Rose through ODM's own structures as Senator and Secretary-General before turning against its leadership (interpretation)."],
 suggests:"The documented pattern is a clear anti-establishment turn within party politics. Policy placements are thin.",
 src:[["Nation: Linda Mwananchi on Sifuna's second expulsion","https://nation.africa/kenya/news/politics/linda-mwananchi-to-fight-odm-over-sifuna-s-second-expulsion--5505924"],["The Online Kenyan: tribunal upholds removal","https://www.theonlinekenyan.com/daily/2026-09-10/tribunal-upholds-sifuna-s-removal-as-odm-secretary-general"],["The Online Kenyan: nomination","https://www.theonlinekenyan.com/daily/2026-09-28/sifuna-secures-linda-mwananchi-presidential-nomination"],["Kenyans.co.ke: TIFA survey","https://www.kenyans.co.ke/news/125558-tifa-survey-ranks-sifuna-most-preferred-odm-flag-bearer-ahead-2027-polls"],["Kenyans.co.ke: Infotrak poll, June 2026","https://www.kenyans.co.ke/news/125200-ruto-maintains-lead-among-presidential-aspirants-2027-race-kalonzo-2nd-infotrak-poll"],["Capital FM: Mizani Africa poll, September 2026","https://capitalfm.africa/mizani-poll-ruto-leads-kalonzo-sifuna-in-presidential-preference-survey/"]]},

{id:"nyoro",now:1,exec:0,reviewed:"2026-10-01",n:"Ndindi Nyoro",ini:"NN",role:"Kiharu MP. Former Budget Committee chair. Leader of the People's Party since Aug 2026.",cls:"Partial record",
 dims:{
  econ:[-1,"L","Fiscal-discipline messaging: warns against off-book borrowing and securitising the fuel levy.","S"],
  redis:[-1,"M","Voted yes on the Finance Bill 2024 at second reading while chairing the Budget Committee. Missed the June 2026 Finance Bill vote and apologised for it."],
  style:[1,"M","Left UDA on 17 August 2026 and aligned with the opposition."]},
 said:[["Fiscal discipline and scrutiny of public debt.",null,"S"]],
 rec:[
  ["D","Announced his exit from UDA on 17 August 2026 and took over the People's Party."],
  ["D","On 22 September unveiled the first party officials, including a 24-year-old secretary general."],
  ["D","Removed as Budget Committee chair in March 2025."],
  ["D","Apologised on 27 June 2026 for being absent when the Finance Bill 2026 passed: 'No amount of explanation... should absolve me of the blame.'"],
  ["D","Touring counties with Matiang'i and Siaya Governor James Orengo ahead of 2027."]],
 contra:["Long a Ruto ally and UDA insider, now campaigning against the president (interpretation)."],
 suggests:"A partial placement: he voted for the 2024 tax measures inside government and now campaigns on fiscal discipline from the opposition.",
 src:[["Nation: Nyoro joins United Opposition after UDA exit","https://nation.africa/kenya/news/politics/ndindi-nyoro-joins-united-opposition-after-uda-exit-5561664"],["People Daily: Nyoro joins People's Party","https://peopledaily.digital/inside-politics/ndindi-nyoro-joins-peoples-party-of-kenya"],["KBC: how MPs voted on the Finance Bill 2024 (second reading)","https://www.kbc.co.ke/how-mps-voted-for-the-finance-bill-2024/"],["Nation: Nyoro apologises over Finance Bill vote","https://nation.africa/kenya/news/politics/mp-ndindi-nyoro-apologises-over-finance-bill-vote-skip-seeks-four-weeks-to-decide-political-future-5511278"],["Star: Nyoro removed as Budget chair","https://www.the-star.co.ke/news/realtime/2025-03-18-nyoro-i-dont-know-why-i-was-removed-as-budget-chair"],["Citizen: Nyoro on fuel prices and off-book borrowing","https://www.citizen.digital/news/mp-ndindi-nyoro-sounds-alarm-over-rising-fuel-prices-alleged-off-book-borrowing-n366338"]]},

{id:"babu",now:1,exec:0,reviewed:"",n:"Babu Owino",ini:"BO",role:"Embakasi East MP since 2017. Nairobi governor aspirant.",cls:"Insufficient (partial)",
 dims:{
  redis:[1,"M","Voted no on the Finance Bill 2024 at second reading in June 2024."],
  style:[1,"M","Left ODM to run for Nairobi governor under The Mwananchi Party within the Linda Mwananchi formation."],
  liberty:[1,"L","Youth-facing, rights-forward public messaging.","S"]},
 said:[["Wants to be Nairobi governor in 2027 and president in 2032, running on his MP record.",null,"S"]],
 rec:[
  ["D","Announced a 2027 Nairobi governorship bid and said he would seek the presidency in 2032."],
  ["D","Voted no on the Finance Bill 2024 at second reading."],
  ["A","Polled 3% for president in Infotrak's June 2026 survey, though he is running for Nairobi governor."],
  ["A","A survey reported in July 2026 placed him first among MPs at 80% approval. Methodology not reviewed."],
  ["A","A High Court ruling nullifying an Embakasi East win has been reported. Appeal status and date not verified in this pass."]],
 contra:["Campaigns on his MP record while moving between political vehicles (interpretation)."],
 suggests:"Insufficient evidence for a policy placement. Documented pattern is youth-focused, anti-establishment positioning.",
 src:[["Star: MP record makes me fit for Nairobi governor","https://www.the-star.co.ke/news/2026-09-28-babu-mp-record-makes-me-fit-for-nairobi-governor"],["Law and Power Kenya: election ruling","https://lawandpowerkenya.com/babu-owino-loses-seat-irregularities-ground/"],["KBC: how MPs voted on the Finance Bill 2024 (second reading)","https://www.kbc.co.ke/how-mps-voted-for-the-finance-bill-2024/"],["Kenyans.co.ke: Infotrak poll, June 2026","https://www.kenyans.co.ke/news/125200-ruto-maintains-lead-among-presidential-aspirants-2027-race-kalonzo-2nd-infotrak-poll"]]},

{id:"salasya",now:1,exec:0,reviewed:"",n:"Peter Salasya",ini:"PS",role:"Mumias East MP since 2022. 2027 presidential aspirant.",cls:"Insufficient evidence",
 dims:{
  style:[2,"L","Outspoken, populist positioning against the political class (low volume of policy evidence).","S"],
  liberty:[1,"L","An arrest drew condemnation from Senator Omtatah (charge and outcome not verified)."],
  redis:[1,"L","Voted no on the Finance Bill 2024 at second reading in June 2024."]},
 said:[["Running for president in 2027 against the political class.",null,"S"]],
 rec:[
  ["D","Declared a 2027 presidential bid."],
  ["D","Voted no on the Finance Bill 2024 at second reading."],
  ["A","His payslip and social-media earnings drew public debate about MPs' pay."],
  ["D","An arrest was publicly condemned by Senator Okiya Omtatah. Details and outcome not verified."]],
 contra:["Not assessed."],
 suggests:"Insufficient evidence. Highly visible, but this pass found little legislative or policy record.",
 src:[["Kenyans.co.ke: presidential bid","https://www.kenyans.co.ke/news/111493-salasya-joins-long-list-2027-presidential-aspirants"],["People Daily: Omtatah on the arrest","https://peopledaily.digital/news/omtatah-condemns-dramatic-arrest-of-salasya-vows-to-fight-for-justice"],["KBC: how MPs voted on the Finance Bill 2024 (second reading)","https://www.kbc.co.ke/how-mps-voted-for-the-finance-bill-2024/"]]},

{id:"wanga",now:1,exec:1,reviewed:"",n:"Gladys Wanga",ini:"GW",role:"Homa Bay Governor since 2022. Part of the ratified ODM leadership team.",cls:"Insufficient evidence",
 dims:{
  social:[1,"L","Organises with the G7 women governors to get more women into elective office. This is campaigning, not a governing record."],
  style:[-1,"M","Aligned with ODM's leadership and its cooperation with the government."]},
 said:[],
 rec:[
  ["D","Ratified in ODM's post-Raila leadership team alongside Oburu Oginga."],
  ["D","One of seven women governors elected in 2022 who want that number raised in 2027."],
  ["A","Publicly disagreed with MP Millie Odhiambo over road conditions in Homa Bay."]],
 contra:["Not assessed."],
 suggests:"Insufficient evidence. As a governor she is judged on her county record, which has not been compiled in this pass.",
 src:[["Nation: Oburu and Wanga team ratified","https://nation.africa/kenya/news/politics/power-shift-in-odm-oburu-wanga-team-ratified-osotsi-axed-in-sdc-purge-5404810"],["Nation: women in governor races","https://nation.africa/kenya/news/gender/women-politicians-storm-governor-contests-ahead-of-2027-showdown--5403030"]]},

{id:"millie",now:1,exec:0,reviewed:"",n:"Millie Odhiambo",ini:"MO",role:"Suba North MP. National Assembly Minority Chief Whip. ODM.",cls:"Insufficient (partial)",
 dims:{
  social:[1,"L","Long-standing public advocacy on gender and children's issues (check bills sponsored).","S"],
  inst:[1,"L","Serves in a parliamentary oversight role as Minority Chief Whip."],
  style:[0,"M","Declined to align with either ODM faction and was heckled as a fence-sitter in Sept 2026."],
  redis:[1,"L","Voted no on the Finance Bill 2024 at second reading in June 2024."]},
 said:[["Urged leaders to reject ethnic incitement ahead of a Linda Mwananchi rally.",null,"S"]],
 rec:[
  ["D","Refused to join either the Linda Ground or the Linda Mwananchi faction of ODM."],
  ["D","Called for peace ahead of a Linda Mwananchi rally in Homa Bay and urged leaders to reject ethnic incitement."],
  ["A","Said she warned ODM against pursuing Sifuna and was later vindicated. This is her own claim."]],
 contra:["Holds a formal opposition-side post while declining to take a side in ODM's split (interpretation)."],
 suggests:"Insufficient evidence for a full placement. Her legislative record should be compiled next.",
 src:[["Nation: rough road for ODM fence-sitters","https://nation.africa/kenya/news/politics/rough-road-for-odm-fence-sitters-in-nyanza-5595014"],["People Daily: position after Linda Ground disbanded","https://peopledaily.digital/inside-politics/millie-odhiambo-declares-her-position-after-disbandment-of-linda-ground-faction"],["KBC: how MPs voted on the Finance Bill 2024 (second reading)","https://www.kbc.co.ke/how-mps-voted-for-the-finance-bill-2024/"]]},

{id:"nyamu",now:1,exec:0,reviewed:"",n:"Karen Nyamu",ini:"KN",role:"Nominated Senator (UDA) since 2022.",cls:"Insufficient evidence",
 dims:{style:[-1,"M","Publicly aligned with UDA and the government line."]},
 said:[],
 rec:[
  ["D","Proposed an Artificial Intelligence Regulation Bill in 2026."],
  ["D","Said UDA lost the Ol Kalou by-election because its leaders overdid their campaigning."],
  ["A","A Nation opinion piece described her as epitomising UDA. That is a columnist's view."],
  ["A","A public petition alleged she humiliated a student in the Senate. A petition is not a finding."]],
 contra:["Not assessed."],
 suggests:"Insufficient evidence. Very visible, but this pass found one bill and mostly commentary.",
 src:[["People Daily: Ol Kalou by-election remarks","https://peopledaily.digital/inside-politics/karen-nyamu-ol-kalou-voters-rejected-uda-because-we-overdid-it"],["Nation opinion: Karen Nyamu epitomises UDA","https://nation.africa/kenya/blogs-opinion/opinion/karen-nyamu-epitomises-uda-5455088"]]},

{id:"omanga",now:1,exec:0,reviewed:"",n:"Millicent Omanga",ini:"MM",role:"Former nominated senator. Joined DCP in March 2026. Nairobi Woman Rep aspirant.",cls:"Insufficient evidence",
 dims:{style:[1,"L","Left UDA for the opposition."]},
 said:[["Says she left the Ruto camp over broken promises and erosion of principles.",null,"S"]],
 rec:[
  ["D","Joined DCP on 19 March 2026 and was received by Gachagua."],
  ["D","Announced a bid for Nairobi Woman Representative on 6 February 2026."],
  ["D","Denied on 19 September 2026 that she was the person named in an August gazette notice for a borstal board."]],
 contra:["Not assessed."],
 suggests:"Insufficient evidence. The documented pattern is a defection from government to opposition.",
 src:[["Standard: Omanga ditches UDA for DCP","https://www.standardmedia.co.ke/politics/article/2001543418/millicent-omanga-ditches-uda-for-gachaguas-dcp"],["Nation: why I ditched Ruto","https://nation.africa/kenya/news/politics/millicent-omanga-why-i-ditched-ruto-for-gachagua-s-camp-5407226"]]},

{id:"waiguru",now:1,exec:1,reviewed:"",n:"Anne Waiguru",ini:"AW",role:"Kirinyaga Governor since 2017. Former Devolution CS.",cls:"Insufficient evidence",
 dims:{},
 said:[],
 rec:[
  ["D","Women governors publicly proposed her as a female deputy president candidate for 2027 (reported on a Kirinyaga county government page, so corroborate with independent outlets)."],
  ["D","One of the G7 women governors elected in 2022."],
  ["U","Left the Devolution CS post in 2015 during the National Youth Service scandal. Findings and outcomes were not compiled in this pass."]],
 contra:["Not assessed."],
 suggests:"Insufficient evidence. As a former CS and governor she is judged on actions, and needs a dedicated pass on her county record and the NYS matter.",
 src:[["Kirinyaga County: women governors on a female DP (government source)","https://kirinyaga.go.ke/women-governors-say-kenya-is-ready-for-a-female-deputy-president-propose-waiguru/"],["Nation: female governors' bid for inclusion","https://nation.africa/kenya/news/gender/from-g7-to-g16-inside-female-governors-bid-for-greater-political-inclusion-4548874"]]},

// ---------- Earlier leaders ----------
{id:"jomo",now:0,exec:1,reviewed:"",n:"Jomo Kenyatta",ini:"JK",role:"Prime Minister 1963. President 1964 to 1978. KANU. Died 1978.",cls:"Clearly identifiable",
 dims:{
  econ:[-1,"H","Protected private property, welcomed foreign capital and Africanised ownership rather than nationalising it, under a blueprint titled 'African Socialism'."],
  redis:[-2,"M","Settler land was transferred mainly by sale (willing buyer, willing seller) with British-funded loans. The 2004 Ndung'u Commission later documented irregular allocations of public land to the politically connected, beginning in this era."],
  inst:[-2,"H","Amendments from 1964 to 1969 created an executive presidency, stripped the regional (majimbo) assemblies of power, merged the Senate into one chamber and ended in a de facto one-party state."],
  style:[-2,"H","Built and led the post-independence ruling order."],
  liberty:[-2,"H","Banned the opposition KPU in 1969 and detained its leaders without trial. Critics, including the writer Ngugi wa Thiong'o, were detained under public-security laws."]},
 said:[
  ["'African Socialism' (Sessional Paper No. 10, 1965).","Ran a market economy with private property protected and foreign investment encouraged.","D"],
  ["Fight poverty, ignorance and disease.","Schools and clinics expanded, much of it through Harambee self-help funding, while regional and class inequality widened (interpretation).","I"],
  ["Independence would right the colonial land injustice.","Land moved by sale, not restitution. Those with capital and connections gained most (interpretation; see the Ndung'u Report).","I"]],
 rec:[
  ["D","Imprisoned and restricted by the colonial state from 1952 to 1961 after the Kapenguria trial."],
  ["D","The KPU was banned in October 1969 after violence during his visit to Kisumu. Oginga Odinga and other KPU leaders were detained."],
  ["D","MP J.M. Kariuki was murdered in March 1975. A parliamentary select committee implicated senior police officers. No one was convicted."],
  ["D","The Million-Acre Scheme resettled families on former settler farms bought with British and World Bank finance."]],
 contra:["A symbol of the anti-colonial struggle who then detained fellow nationalists who opposed him.","Called the economy socialist while building one of Africa's more market-friendly states."],
 suggests:"State-centred, conservative nation-building: a strong presidency, a market economy and little room for organised dissent.",
 src:[["Wikipedia: Jomo Kenyatta (overview)","https://en.wikipedia.org/wiki/Jomo_Kenyatta"],["Wikipedia: Kenya People's Union","https://en.wikipedia.org/wiki/Kenya_People%27s_Union"]]},

{id:"moi",now:0,exec:1,reviewed:"",n:"Daniel arap Moi",ini:"DM",role:"Vice President 1967 to 1978. President 1978 to 2002. KANU. Died 2020.",cls:"Clearly identifiable",
 dims:{
  econ:[0,"M","Expanded parastatals and state marketing boards in the 1980s, then under donor pressure liberalised prices, maize marketing and foreign exchange in the early 1990s. The record points both ways."],
  redis:[-2,"M","The 2004 Ndung'u Commission documented widespread illegal allocation of public land, peaking in the 1980s and 1990s, largely to the politically connected."],
  inst:[-2,"H","Made Kenya a legal one-party state (Section 2A) in 1982, introduced queue voting in 1988 and removed security of tenure for judges and the Attorney General in 1988."],
  style:[-2,"H","Ran the ruling order for 24 years."],
  liberty:[-2,"H","The Truth, Justice and Reconciliation Commission documented detention without trial, torture in the Nyayo House cells and the 1984 Wagalla killings by security forces."]},
 said:[
  ["'Nyayo': follow Kenyatta's footsteps with 'peace, love and unity'.","Narrowed political space further: one-party law, detentions and torture of dissidents.","D"],
  ["Care for ordinary children and families.","Introduced free school milk in 1979 and the 8-4-4 education system in 1985.","D"],
  ["Multiparty politics would divide the country along tribal lines.","Repealed Section 2A in December 1991 under domestic and donor pressure. Ethnic clashes followed around the 1992 and 1997 elections, which rights groups linked to KANU figures (attributed).","A"]],
 rec:[
  ["D","Section 2A repealed in December 1991. Won the 1992 and 1997 multiparty elections."],
  ["D","Handed power to Mwai Kibaki in December 2002 after KANU lost."],
  ["D","The Goldenberg export-compensation scandal of the early 1990s happened under his government."],
  ["D","Police broke up the Saba Saba multiparty rallies of July 1990."]],
 contra:["Promised peace, love and unity while presiding over detention and torture of opponents.","Resisted multiparty democracy for a decade, then accepted a term limit and handed over power peacefully."],
 suggests:"Authoritarian, patronage-based centralism that bent only under sustained pressure.",
 src:[["Wikipedia: Daniel arap Moi (overview)","https://en.wikipedia.org/wiki/Daniel_arap_Moi"],["Wikipedia: Wagalla massacre","https://en.wikipedia.org/wiki/Wagalla_massacre"],["Wikipedia: Goldenberg scandal","https://en.wikipedia.org/wiki/Goldenberg_scandal"]]},

{id:"kibaki",now:0,exec:1,reviewed:"",n:"Mwai Kibaki",ini:"MKi",role:"Finance Minister 1969 to 1982. Vice President 1978 to 1988. President 2002 to 2013. Died 2022.",cls:"Moderately identifiable",
 dims:{
  econ:[-1,"M","Presided over a revenue-led recovery and Vision 2030: state investment in roads and energy, with private-sector growth as the engine."],
  redis:[0,"L","Adopted a National Land Policy in 2009, and the 2010 Constitution created a National Land Commission. Little land was actually redistributed. Free primary education pushes the other way."],
  inst:[0.5,"M","Signed the 2010 Constitution (devolution, a stronger judiciary, a Bill of Rights). Earlier backed a 2005 draft that kept a powerful presidency, and was sworn in within an hour of the disputed 2007 result."],
  style:[-1,"M","A senior establishment figure for decades, though he left KANU in 1991 to lead the opposition Democratic Party."],
  liberty:[-0.5,"M","Media space widened after 2002, but police raided the Standard Group in 2006 and the Waki Commission documented police killings in the 2007 to 2008 crisis."]},
 said:[
  ["Free primary education (2002 campaign).","Introduced in January 2003. Enrolment rose by more than a million in the first year.","D"],
  ["Zero tolerance for corruption.","The Anglo Leasing contracts surfaced under his government. His anti-corruption adviser John Githongo resigned in 2005 and went into exile.","D"],
  ["A new constitution within 100 days.","Took until 2010, after a failed 2005 referendum and a deadly election crisis.","D"],
  ["A 2002 power-sharing MoU with Raila Odinga's LDP.","LDP said it was not honoured. The coalition split in 2005.","A"]],
 rec:[
  ["D","Declared winner of the disputed December 2007 election. About 1,100 people were killed in the violence that followed (Waki Commission)."],
  ["D","Formed the Grand Coalition with Raila Odinga as Prime Minister in 2008 under the National Accord."],
  ["D","Promulgated the new Constitution on 27 August 2010 after the referendum."]],
 contra:["Came to power on an anti-corruption platform. Anglo Leasing implicated his own government.","Campaigned for constitutional change, then backed a 2005 draft that kept a strong presidency."],
 suggests:"A technocratic, growth-first, cautious reformer. Institutional change came mostly under pressure.",
 src:[["Wikipedia: Mwai Kibaki (overview)","https://en.wikipedia.org/wiki/Mwai_Kibaki"],["Wikipedia: Anglo-Leasing scandal","https://en.wikipedia.org/wiki/Anglo-Leasing_scandal"],["Wikipedia: 2007 to 2008 Kenyan crisis","https://en.wikipedia.org/wiki/2007%E2%80%932008_Kenyan_crisis"]]},

{id:"uhuru",now:0,exec:1,reviewed:"",n:"Uhuru Kenyatta",ini:"UK",role:"Deputy Prime Minister 2008 to 2013. President 2013 to 2022. Jubilee. Retired; his record in office is complete.",cls:"Clearly identifiable",
 dims:{
  econ:[1,"M","Pursued debt-financed, state-led megaprojects such as the Chinese-funded Standard Gauge Railway, and signed a cap on bank interest rates in 2016 (repealed 2019). Public debt rose sharply."],
  redis:[0,"L","The government reported issuing millions of title deeds (its own figures). No major redistribution."],
  inst:[-1,"M","Courts ruled the BBI constitutional-change drive unconstitutional, upheld by the Supreme Court in March 2022. Refused for years to appoint judges nominated by the JSC. He did accept the 2017 Supreme Court nullification and went to a rerun."],
  style:[-2,"H","Son of the first president. Governed as the establishment, then backed Raila Odinga against his own deputy in 2022."],
  liberty:[-1.5,"M","Switched off three TV stations in January 2018 and kept them off despite a court order. Signed the 2018 cybercrimes law, parts of which courts suspended."]},
 said:[
  ["Laptops for every Class One pupil (2013).","Replaced by a scaled-down Digital Literacy Programme using tablets.","I"],
  ["500,000 affordable homes under the Big Four agenda (2017).","Only a small fraction were completed by 2022, according to media and audit reports.","A"],
  ["Fight corruption.","High-profile arrests from 2018, including over the NYS scandal, but few convictions of senior figures (interpretation).","I"]],
 rec:[
  ["D","ICC charges over the 2007 to 2008 violence were withdrawn by the prosecutor in December 2014, citing lack of evidence and non-cooperation."],
  ["D","The March 2018 'handshake' with Raila Odinga ended the post-2017 standoff."],
  ["D","The Supreme Court nullified his August 2017 win. He won the October rerun, which the opposition boycotted."]],
 contra:["Campaigned with William Ruto in 2013 and 2017, then worked against him in 2022.","Promised to fight corruption while debt-funded projects faced repeated audit queries (interpretation)."],
 suggests:"Establishment, state-driven infrastructure developmentalism financed by debt, with a willingness to override courts and media when under pressure.",
 src:[["Wikipedia: Uhuru Kenyatta (overview)","https://en.wikipedia.org/wiki/Uhuru_Kenyatta"],["Wikipedia: Building Bridges Initiative","https://en.wikipedia.org/wiki/Building_Bridges_Initiative"]]},

{id:"raila",now:0,exec:1,reviewed:"",n:"Raila Odinga",ini:"RO",role:"Energy Minister 2001 to 2002. Roads Minister 2003 to 2005. Prime Minister 2008 to 2013. ODM. Died October 2025.",cls:"Mixed / contradictory",
 dims:{
  econ:[0.5,"L","As Prime Minister backed state programmes such as the Kazi Kwa Vijana youth-jobs scheme. His ministerial spells left a thin economic record."],
  inst:[0.5,"M","Detained for years under Moi during the fight for multiparty politics, led the 2005 'No' campaign against a strong-presidency draft and backed the 2010 Constitution. Then co-led BBI, which courts ruled unconstitutional."],
  style:[0,"H","Alternated between confronting and joining government: merged his party into KANU in 2002, joined the Grand Coalition in 2008, the 2018 handshake, and cooperation with Ruto's government from 2025."],
  liberty:[1,"M","Detained without trial 1982 to 1988, 1988 to 1989 and 1990 to 1991, and kept organising. Protests he called were met with police force that rights groups documented."]},
 said:[
  ["Reform and an end to the one-party order.","Spent about eight years in detention and helped win multiparty politics and the 2010 Constitution.","D"],
  ["Stood as the opposition alternative to KANU.","Merged his National Development Party into KANU and joined Moi's cabinet in 2001.","D"],
  ["Called the 2017 result stolen and was sworn in as 'people's president' in January 2018.","Two months later agreed the handshake and cooperated with the government he had rejected.","D"]],
 rec:[
  ["D","Won a Supreme Court petition that nullified the August 2017 presidential result."],
  ["D","Ran for president five times: 1997, 2007, 2013, 2017 and 2022."],
  ["D","Lost the African Union Commission chair election in February 2025. ODM signed a cooperation agreement with Ruto's UDA in March 2025."],
  ["D","Died on 15 October 2025."]],
 contra:["The face of opposition who repeatedly joined or partnered with governments he opposed.","Champion of the 2010 Constitution who co-led BBI, which the courts found unconstitutional."],
 suggests:"A reformer on institutions and rights whose strategy moved between confrontation and deal-making.",
 src:[["Wikipedia: Raila Odinga (overview)","https://en.wikipedia.org/wiki/Raila_Odinga"],["Wikipedia: Building Bridges Initiative","https://en.wikipedia.org/wiki/Building_Bridges_Initiative"]]},

{id:"jaramogi",now:0,exec:1,reviewed:"",n:"Jaramogi Oginga Odinga",ini:"JO",role:"Vice President 1964 to 1966. Founded KPU and later co-founded FORD. Died 1994.",cls:"Moderately identifiable",
 dims:{
  redis:[1.5,"M","Left the government in 1966 over its direction, including a land policy that sold rather than returned land (interpretation of his reasons)."],
  inst:[1,"M","Co-founded FORD in 1991 to force a return to multiparty politics."],
  style:[2,"H","Resigned as Vice President in 1966 and formed the first post-independence opposition party."],
  liberty:[1,"M","Kept organising opposition through detention (1969 to 1971) and later house arrest."]},
 said:[
  ["Refused in 1961 to form a government until Kenyatta was freed.","KANU held to this, and Kenyatta was released that year.","D"],
  ["Nationalisation, free education and land for the landless (KPU platform, 1966).","Not counted. He held executive power only briefly as Vice President, and KPU was banned in 1969 before it could govern.","I"]],
 rec:[
  ["D","Resigned the vice presidency in 1966 and formed the Kenya People's Union."],
  ["D","KPU MPs were forced to seek re-election in the 1966 'Little General Election' under a new constitutional amendment."],
  ["D","Detained after the KPU ban in 1969."],
  ["U","Tried to register an opposition party in 1982. The attempt was one trigger for the one-party amendment."]],
 contra:["Served as Vice President in the government whose direction he then rejected."],
 suggests:"Left-leaning nationalist and opposition pioneer. His economic programme was never tested in office, so it is not counted.",
 src:[["Wikipedia: Jaramogi Oginga Odinga (overview)","https://en.wikipedia.org/wiki/Jaramogi_Oginga_Odinga"],["Wikipedia: Kenya People's Union","https://en.wikipedia.org/wiki/Kenya_People%27s_Union"]]},

{id:"mboya",now:0,exec:1,reviewed:"",n:"Tom Mboya",ini:"TM",role:"Trade unionist. Justice Minister 1963 to 1964. Economic Planning Minister 1964 to 1969. KANU Secretary-General. Assassinated 1969.",cls:"Moderately identifiable",
 dims:{
  econ:[-1,"M","Drafted Sessional Paper No. 10 of 1965. Titled 'African Socialism', in substance it backed a mixed economy, private property and foreign investment."],
  redis:[-1,"L","Backed the purchase-based land transfer policy (interpretation)."],
  inst:[-1.5,"M","As Justice and Constitutional Affairs Minister he steered the 1964 changes that dismantled majimbo and made Kenya a republic with an executive presidency (verify his exact role in each amendment)."],
  style:[-1,"M","Built the ruling party's machinery as KANU Secretary-General."],
  liberty:[-1,"L","Helped push the Odinga faction out at the 1966 Limuru party conference. The amendment forcing defectors to seek re-election followed (attributed)."]},
 said:[
  ["'African Socialism' as the national ideology.","The paper he drafted set out a mixed, investment-friendly economy.","D"],
  ["Education for a new generation of leaders.","Organised the 1959 to 1961 student airlifts that took hundreds of East Africans to US universities.","D"]],
 rec:[
  ["D","Led the Kenya Federation of Labour in the 1950s."],
  ["D","Assassinated in Nairobi on 5 July 1969. Nahashon Njenga Njoroge was convicted and hanged. Who ordered the killing was never established."]],
 contra:["Used a socialist label for a largely capitalist blueprint."],
 suggests:"A pragmatic, pro-Western modernising technocrat who built a strong central state and party.",
 src:[["Wikipedia: Tom Mboya (overview)","https://en.wikipedia.org/wiki/Tom_Mboya"]]},

{id:"saitoti",now:0,exec:1,reviewed:"",n:"George Saitoti",ini:"GS",role:"Finance Minister 1983 to 1993. Vice President 1989 to 1997 and 1999 to 2002. Internal Security Minister 2008 to 2012. Died 2012.",cls:"Moderately identifiable",
 dims:{
  econ:[-1.5,"M","As Finance Minister carried out IMF and World Bank structural adjustment: spending cuts, price decontrol and liberalisation."],
  inst:[-1,"M","A senior figure in the one-party KANU state."],
  style:[-2,"H","A career establishment insider."],
  liberty:[-1,"L","Ran internal security from 2008 while police faced allegations of extrajudicial killings (attributed to rights groups and a UN special rapporteur)."]},
 said:[["Economic reform and fiscal discipline.","The Goldenberg scandal cost the country billions while he was Finance Minister. The courts cleared him of personal liability.","A"]],
 rec:[
  ["D","The Bosire Commission recommended charges against him over Goldenberg. In 2006 the High Court quashed that finding and barred his prosecution."],
  ["D","Died in a police helicopter crash in June 2012."]],
 contra:["Oversaw a reform agenda while the Goldenberg scandal unfolded."],
 suggests:"A market-reforming technocrat inside an authoritarian establishment.",
 src:[["Wikipedia: George Saitoti (overview)","https://en.wikipedia.org/wiki/George_Saitoti"],["Wikipedia: Goldenberg scandal","https://en.wikipedia.org/wiki/Goldenberg_scandal"]]},

{id:"ngala",now:0,exec:1,reviewed:"",n:"Ronald Ngala",ini:"RN",role:"KADU leader 1960 to 1964. Leader of Government Business before independence. Later KANU minister. Died 1972.",cls:"Insufficient evidence",
 dims:{
  inst:[2,"H","Led KADU's push for majimbo, the regional system written into the 1963 independence constitution to protect smaller communities."],
  style:[0,"M","Led the opposition at independence, then dissolved KADU into KANU in 1964 and took a cabinet post."]},
 said:[["Majimbo: power shared with the regions.","Dissolved KADU into KANU in November 1964 as the regional system was being dismantled.","D"]],
 rec:[
  ["D","Formed the pre-independence government as Leader of Government Business after KANU refused to govern until Kenyatta was freed."],
  ["D","Died after a car accident in December 1972."]],
 contra:["Championed regional power, then joined the party that took it apart."],
 suggests:"Coastal federalist who moved from opposition into government once the federal cause was lost. KADU's economic platform is not counted because he held executive power, so there are too few dimensions to match.",
 src:[["Wikipedia: Ronald Ngala (overview)","https://en.wikipedia.org/wiki/Ronald_Ngala"]]},

{id:"matiba",now:0,exec:1,reviewed:"",n:"Kenneth Matiba",ini:"KMt",role:"Minister under Moi until 1988. FORD-Asili leader. 1992 presidential runner-up. Died 2018.",cls:"Moderately identifiable",
 dims:{
  inst:[2,"H","Publicly called for multiparty democracy with Charles Rubia in May 1990, when it was illegal to organise an opposition."],
  style:[1.5,"M","A former senior civil servant, minister and businessman who broke with the regime."],
  liberty:[2,"M","Planned the Saba Saba rally of July 1990 and was detained without trial until 1991, suffering a stroke in detention."]},
 said:[["Multiparty democracy.","Paid with detention. Multiparty politics returned in December 1991, and he came second in 1992.","D"]],
 rec:[
  ["D","Resigned from Moi's cabinet as Minister of Transport and Communications in December 1988."],
  ["U","His resignation followed a protest against rigging in KANU's 1988 party elections."],
  ["D","Detained at Kamiti Maximum Security Prison with Charles Rubia in 1990."]],
 contra:["Served the one-party state for years before opposing it (interpretation)."],
 suggests:"A liberal democrat who took on the one-party state at great personal cost. FORD-Asili's economic platform is not counted.",
 src:[["Wikipedia: Kenneth Matiba (overview)","https://en.wikipedia.org/wiki/Kenneth_Matiba"]]},

{id:"kaggia",now:0,exec:0,reviewed:"",n:"Bildad Kaggia",ini:"BK",role:"One of the Kapenguria Six. MP and Assistant Minister 1963 to 1964. KPU Vice-President. Died 2005.",cls:"Moderately identifiable",
 dims:{
  redis:[2,"H","Broke with Kenyatta's government over land, demanding it go free to the landless and former fighters rather than be sold."],
  econ:[1.5,"M","Became KPU Vice-President in 1966 on a socialist platform.","S"],
  style:[2,"H","Jailed by the colonial state from 1953 to 1961, then left the post-independence government in protest."]},
 said:[["Free land for the landless and those who fought for independence.",null,"S"]],
 rec:[
  ["D","Convicted with Kenyatta in the 1953 Kapenguria trial."],
  ["U","Left his post as an Assistant Minister in 1964 after publicly opposing the government's land policy."],
  ["A","Later accounts say he refused to take land for himself while campaigning for the landless."]],
 contra:["Not assessed."],
 suggests:"A consistent land-reform radical who put the land question above office.",
 src:[["Wikipedia: Bildad Kaggia (overview)","https://en.wikipedia.org/wiki/Bildad_Kaggia"]]},

{id:"jmk",now:0,exec:0,reviewed:"",n:"J.M. Kariuki",ini:"JM",role:"Nyandarua North MP and Assistant Minister. Former Mau Mau detainee. Murdered 1975.",cls:"Partial record",
 dims:{
  redis:[1.5,"M","Campaigned against land and wealth concentrating in a new elite.","S"],
  inst:[1,"L","Used Parliament to press for accountability (interpretation)."],
  style:[1.5,"M","A ruling-party insider who became its loudest critic from the backbench."],
  liberty:[1,"L","Spoke against the harassment of critics.","S"]},
 said:[["Warned against Kenya becoming 'a country of ten millionaires and ten million beggars'.",null,"S"]],
 rec:[
  ["D","Detained by the colonial government for several years during the Emergency."],
  ["D","Abducted and murdered in March 1975. His body was found in the Ngong Hills."],
  ["D","A parliamentary select committee implicated senior police officers and alleged a cover-up. No one was convicted."]],
 contra:["Criticised elite wealth while being a wealthy landowner and businessman himself (interpretation)."],
 suggests:"A populist critic of inequality from inside the ruling party.",
 src:[["Wikipedia: J.M. Kariuki (overview)","https://en.wikipedia.org/wiki/Josiah_Mwangi_Kariuki"]]},

{id:"pinto",now:0,exec:0,reviewed:"",n:"Pio Gama Pinto",ini:"PP",role:"Journalist and KANU MP. Assassinated 1965.",cls:"Partial record",
 dims:{
  econ:[1.5,"L","Organised socialist-leaning MPs and worked to set up the Lumumba Institute in 1964 to train KANU officials.","S"],
  redis:[2,"L","Pushed for land to go free to the landless rather than by purchase (attributed).","S"],
  style:[1.5,"M","A KANU MP organising against his own leadership's economic direction."],
  liberty:[1,"M","Detained by the colonial state from 1954 to 1959 for supporting the independence struggle."]},
 said:[["A socialist economy for independent Kenya.",null,"S"]],
 rec:[
  ["D","Shot dead outside his Nairobi home on 24 February 1965, the first political assassination of independent Kenya."],
  ["D","Detained by the colonial government from 1954 to 1959."]],
 contra:["Not assessed."],
 suggests:"A radical socialist organiser. Too short a public life for firm placements.",
 src:[["Wikipedia: Pio Gama Pinto (overview)","https://en.wikipedia.org/wiki/Pio_Gama_Pinto"]]},

{id:"maathai",now:0,exec:0,reviewed:"",n:"Wangari Maathai",ini:"WM",role:"Founder of the Green Belt Movement. Tetu MP and Assistant Environment Minister 2003 to 2005. Nobel Peace laureate. Died 2011.",cls:"Clearly identifiable",
 dims:{
  social:[1,"M","Built the Green Belt Movement around rural women, paying them to plant trees and organising them politically."],
  redis:[1,"M","Fought the grabbing of public land: Uhuru Park in 1989 and Karura Forest in 1998 to 1999."],
  inst:[1,"M","Campaigned for multiparty democracy, then served as an MP and assistant minister."],
  style:[2,"H","Confronted the Moi government for more than a decade from civil society."],
  liberty:[2,"H","Joined the 1992 hunger strike with mothers of political prisoners at Freedom Corner, where police beat her."]},
 said:[["Protect public land and forests.","Stopped a planned office tower in Uhuru Park and helped save Karura Forest.","D"],["Mass tree planting as a route to rural livelihoods.","The Green Belt Movement reports tens of millions of trees planted.","A"]],
 rec:[
  ["D","Founded the Green Belt Movement in 1977."],
  ["D","Elected MP for Tetu in 2002."],
  ["D","Awarded the Nobel Peace Prize in 2004."]],
 contra:["Not assessed."],
 suggests:"A liberty-first environmental and democratic activist who treated public land as a public trust.",
 src:[["Wikipedia: Wangari Maathai (overview)","https://en.wikipedia.org/wiki/Wangari_Maathai"],["Wikipedia: Green Belt Movement","https://en.wikipedia.org/wiki/Green_Belt_Movement"]]}
];

// Enforce the core rule: no words-based placement for anyone who has held executive power.
L.forEach(function(l){Object.keys(l.dims).forEach(function(k){
  if(l.exec&&l.dims[k][3]==="S"){console.warn("Dropped stated placement for executive-power holder",l.id,k);delete l.dims[k]}
})});

var SETS={
 all:{key:"all",name:"Every leader",q:QA,pool:function(){return L},
  h1:'Whose <span class="mark">record</span> is closest to yours?',
  lede:"Everyone in one pool: the independence generation, the one-party years, the reform era and the people in politics today. Leaders who held power are placed only on what they did with it."},
 now:{key:"now",name:"Current climate",q:QN,pool:function(){return L.filter(function(l){return l.now})},
  h1:'Match your views to today\'s <span class="mark">contenders</span>.',
  lede:"Only the people shaping Kenyan politics now: the government, the opposition and those competing for 2027. Those who have governed are placed on their record in office. The rest are placed on their record and, where that is thin, what they say they would do."}
};

// Number of lines still tagged U (not yet re-checked): record lines plus the "what they did" side of said/did pairs.
function uCount(l){
  return (l.rec||[]).filter(function(r){return r[0]==="U"}).length+(l.said||[]).filter(function(p){return p[1]&&p[2]==="U"}).length;
}
return {uCount:uCount,DIMS:DIMS,TOPIC:TOPIC,QN:QN,QA:QA,ANS:ANS,W:W,CONF:CONF,L:L,SETS:SETS};
})();
if(typeof module!=="undefined"&&module.exports)module.exports=SIASA;
