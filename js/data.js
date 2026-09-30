// Quiz content: dimensions, questions, answer scale and leader records.
var DIMS=[
 {k:"econ",name:"Role of the state in the economy",lo:"Market-led",hi:"State-led"},
 {k:"redis",name:"Redistribution and taxes",lo:"Low redistribution",hi:"Strong redistribution"},
 {k:"social",name:"Social values",lo:"Socially conservative",hi:"Socially progressive"},
 {k:"inst",name:"Institutions and devolution",lo:"Executive-centred",hi:"Checks and devolution"},
 {k:"style",name:"Political style",lo:"Establishment",hi:"Anti-establishment"},
 {k:"liberty",name:"Civil liberties",lo:"Order-first",hi:"Liberty-first"}
];
var TOPIC={econ:"Economy",redis:"Tax and welfare",social:"Values",inst:"Institutions",style:"Political style",liberty:"Rights"};
var Q=[
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
var ANS=["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"];
var W={H:1,M:.8,L:.5};
var CONF={H:"high",M:"medium",L:"low"};

var L=[
{id:"ruto",n:"William Ruto",ini:"WR",role:"President since 2022. Deputy President 2013 to 2022. Party: UDA.",cls:"Mixed / contradictory",
 dims:{
  econ:[0,"M","Finance Acts and levies raised the tax take, while the state also funds or runs housing, health cover (SHA) and input subsidies. The record points both ways."],
  redis:[-1,"L","Tax measures in the 2023, 2024 and 2026 Finance Bills were criticised as falling on consumers and payrolls. Subsidies and the Hustler Fund point the other way. Contested."],
  social:[-1,"L","Public positioning aligns with religious conservatism. This pass found little legislative record either way."],
  inst:[-1,"L","Rights groups and critics allege executive overreach. Supporters point to laws passing through Parliament. Not court-settled in this pass."],
  style:[-1,"M","Ran in 2022 as an outsider against political dynasties. Now governs in a broad-based arrangement with ODM."],
  liberty:[-1,"M","Rights organisations documented deaths and abductions around the 2024 protests. The government disputes parts of this."]},
 rec:[
  ["D","Signed the Finance Bill 2026 into law on 23 June 2026, after the National Assembly passed it 122 to 40 on 18 June."],
  ["D","The 2024 Finance Bill was withdrawn after nationwide protests in June 2024, and the Cabinet was dissolved and rebuilt in July 2024 with opposition-linked appointees."],
  ["D","ODM and UDA have moved from informal cooperation to preparing formal 2027 coalition talks."],
  ["A","Rights groups such as KNCHR and Amnesty Kenya attributed killings and abductions to security agencies during the 2024 protest period. The government disputes parts of that."]],
 contra:["Campaigned as an anti-dynasty outsider, now in alliance with the party of the country's best-known political family.","Pledged to ease the cost of living while signing successive Finance Acts whose levies were contested as raising it (interpretation)."],
 suggests:"Pragmatic, executive-centred developmentalism with IMF-aligned fiscal consolidation, adjusting to coalition needs. Confidence is high that the record is large, and only medium that any single label fits.",
 src:[["Kenyans.co.ke: Ruto signs 2026 Finance Bill","https://www.kenyans.co.ke/news/124557-ruto-signs-2026-finance-bill-law"],["Nation: ODM, UDA joint talks team","https://nation.africa/kenya/news/politics/odm-uda-to-form-joint-talks-team-as-oburu-signals-start-of-2027-coalition-negotiations-5323202"]]},

{id:"gachagua",n:"Rigathi Gachagua",ini:"RG",role:"Deputy President 2022 to Oct 2024 (impeached). Former Mathira MP. Leader of DCP.",cls:"Insufficient (partial)",
 dims:{
  econ:[1,"L","As Deputy President he pushed farmer-focused interventions such as coffee-sector reform (interpretation; verify specific measures)."],
  social:[-1,"L","Faith-aligned conservative public positioning. Little legislative record compiled."],
  style:[1,"M","Former second-in-command now leads an opposition party. Analysts describe regional-identity mobilisation (attributed)."]},
 rec:[
  ["D","In July 2022 the Anti-Corruption Court ordered forfeiture of Sh202 million, finding he could not prove how the money was raised."],
  ["D","In January 2023 the forfeiture order was set aside by consent between the parties and the State agreed to pay his costs. That was a settlement, not a ruling on the merits."],
  ["D","Impeached and removed as Deputy President in October 2024."],
  ["D","One of the United Opposition principals working on a single-candidate coalition formula for 2027."]],
 contra:["Helped form the administration he now campaigns against (interpretation).","The forfeiture finding and its later consent settlement point in different directions and should not be read as a verdict either way."],
 suggests:"Insufficient evidence for a full ideological placement. The clearest documented pattern is a shift from government insider to opposition leader.",
 src:[["Standard: court orders Gachagua to surrender Sh202m","https://www.standardmedia.co.ke/national/article/2001451803/corruption-court-orders-rigathi-gachagua-to-surrender-sh202m"],["Standard: Gachagua gets back seized millions","https://www.standardmedia.co.ke/health/politics/article/2001466359/dp-gachagua-gets-back-his-seized-millions"],["Nation: opposition principals meet","https://nation.africa/kenya/news/politics/karua-kalonzo-matiangi-gachagua-shape-2027-opposition-5021222"]]},

{id:"kalonzo",n:"Kalonzo Musyoka",ini:"KM",role:"Vice President 2008 to 2013. Wiper leader. United Opposition principal.",cls:"Insufficient evidence",
 dims:{
  inst:[1,"L","Took part in the Grand Coalition era that produced the 2010 Constitution (verify his specific role)."],
  style:[0,"M","A career insider in and out of government across administrations."]},
 rec:[
  ["D","Vice President from 2008 to 2013 under the Grand Coalition."],
  ["D","Among the United Opposition principals working toward a single 2027 candidate."],
  ["U","Has led opposition and coalition formations over several election cycles. Dates and roles need checking."]],
 contra:["No contradictions assessed. Not enough documented policy record compiled in this pass."],
 suggests:"Insufficient evidence to place him beyond a long-serving establishment figure now in opposition.",
 src:[["Star: Kalonzo edges Matiang'i as top opposition pick (July 2026)","https://www.the-star.co.ke/news/2026-07-13-kalonzo-edges-matiangi-as-oppositions-top-pick"]]},

{id:"matiangi",n:"Fred Matiang'i",ini:"FM",role:"Education CS 2015 to 2018. Interior CS 2018 to 2022. Jubilee leader.",cls:"Insufficient (partial)",
 dims:{
  econ:[1,"L","Led state-driven delivery programmes such as the exam overhaul and school-transition policy (interpretation; verify)."],
  inst:[-1,"L","A 2018 dispute over compliance with court orders happened under his Interior docket. Outcome not verified here."],
  style:[-1,"M","Senior member of the Jubilee cabinet across two terms, now presenting as an opposition candidate."],
  liberty:[-1,"L","Oversaw police and security agencies in the 2018 to 2022 period. Specific findings not compiled in this pass."]},
 rec:[
  ["D","Held two of the most senior cabinet posts in the Kenyatta government."],
  ["D","Now Jubilee party leader and among the United Opposition principals."],
  ["U","The Huduma Namba national ID registration drive he led was challenged in court in 2019 to 2020."]],
 contra:["Senior insider in the previous government now positioned as its alternative (interpretation)."],
 suggests:"A technocratic, state-delivery style of governing. Most placements here are low confidence.",
 src:[["Star: opposition pick (July 2026)","https://www.the-star.co.ke/news/2026-07-13-kalonzo-edges-matiangi-as-oppositions-top-pick"],["Nation: opposition principals meet","https://nation.africa/kenya/news/politics/karua-kalonzo-matiangi-gachagua-shape-2027-opposition-5021222"]]},

{id:"karua",n:"Martha Karua",ini:"MK",role:"Justice Minister 2003 to 2009. Former Gichugu MP. Leader of PLP.",cls:"Moderately identifiable",
 dims:{
  econ:[0,"L","PLP's alternative budget combines spending restraint with support for productive sectors and household relief."],
  redis:[1,"L","Rejected consumer-facing levies such as digital service and mobile money charges and called for relief for struggling households."],
  social:[1,"L","Long public record on women's rights and gender equality (interpretation; check bills and votes)."],
  inst:[2,"M","Consistent public position for constitutional process and judicial independence, and repeated challenges to executive action."],
  style:[1,"L","Former Kibaki-era minister who now leads a small opposition party. Insider and outsider at once."],
  liberty:[1,"M","Regularly criticised state responses to protest and dissent."]},
 rec:[
  ["D","Rejected key Finance Bill 2026 proposals and unveiled the PLP alternative budget plan."],
  ["D","Accused the government of reintroducing clauses of the rejected 2024 Finance Bill through the 2026 Bill."],
  ["D","Criticised MPs who missed the Finance Bill 2026 vote."],
  ["D","Served as Justice Minister from 2003 to 2009 in the Kibaki government."]],
 contra:["Served in a government whose record includes the Anglo Leasing scandals. Her own role was not examined in this pass.","Champions constitutional limits on the executive from outside government. Her record while in the executive deserves the same scrutiny."],
 suggests:"A constitutionalist with a rights-first bent and a fiscal position that mixes restraint and household relief.",
 src:[["Standard: Karua's alternative budget","https://www.standardmedia.co.ke/national/article/2001549877/karua-rejects-key-finance-bill-proposals-unveils-plps-alternative-budget-plan"],["Kenyans.co.ke: Finance Bill 2026 claim","https://www.kenyans.co.ke/news/123960-karua-accuses-govt-reintroducing-2024-finance-bill-through-finance-bill-2026"],["People Daily: Karua on MPs who missed the vote","https://peopledaily.digital/inside-politics/martha-karua-criticises-mps-who-missed-finance-bill-voting-session"]]},

{id:"sifuna",n:"Edwin Sifuna",ini:"ES",role:"Nairobi Senator since 2017. Removed as ODM Secretary-General. Linda Mwananchi presidential candidate.",cls:"Moderately identifiable (style)",
 dims:{
  inst:[1,"L","Has used the Senate seat and party platform to challenge party and government positions (interpretation)."],
  style:[2,"M","Removed from ODM's secretary-general post twice, upheld by the Political Parties Disputes Tribunal, and now heads a rival movement."],
  liberty:[1,"L","Publicly sided with protesters on rights issues (attributed; verify statements)."]},
 rec:[
  ["D","ODM's National Executive Committee removed him as Secretary-General a second time, and the Registrar ratified it."],
  ["D","The Political Parties Disputes Tribunal upheld the removal in September 2026, dismissing his third challenge."],
  ["D","The Linda Mwananchi movement named him its presidential candidate for 2027."],
  ["A","A TIFA survey reported him as the most preferred ODM flag bearer among respondents."]],
 contra:["Rose through ODM's own structures as Senator and Secretary-General before turning against its leadership (interpretation)."],
 suggests:"The documented pattern is a clear anti-establishment turn within party politics. Policy placements are thin.",
 src:[["Nation: Linda Mwananchi on Sifuna's second expulsion","https://nation.africa/kenya/news/politics/linda-mwananchi-to-fight-odm-over-sifuna-s-second-expulsion--5505924"],["The Online Kenyan: tribunal upholds removal","https://www.theonlinekenyan.com/daily/2026-09-10/tribunal-upholds-sifuna-s-removal-as-odm-secretary-general"],["The Online Kenyan: nomination","https://www.theonlinekenyan.com/daily/2026-09-28/sifuna-secures-linda-mwananchi-presidential-nomination"],["Kenyans.co.ke: TIFA survey","https://www.kenyans.co.ke/news/125558-tifa-survey-ranks-sifuna-most-preferred-odm-flag-bearer-ahead-2027-polls"]]},

{id:"nyoro",n:"Ndindi Nyoro",ini:"NN",role:"Kiharu MP. Leader of the People's Party since Aug 2026.",cls:"Insufficient evidence",
 dims:{
  econ:[-1,"L","Fiscal-discipline messaging from his budget-committee background (interpretation; verify)."],
  style:[1,"M","Left UDA on 17 August 2026 and aligned with the opposition."]},
 rec:[
  ["D","Announced his exit from UDA on 17 August 2026 and took over the People's Party."],
  ["D","On 22 September unveiled the first party officials, including a 24-year-old secretary general."],
  ["D","Touring counties with Matiang'i and Siaya Governor James Orengo ahead of 2027."]],
 contra:["Long a Ruto ally and UDA insider, now campaigning against the president (interpretation)."],
 suggests:"Insufficient evidence for a policy placement. Documented change is his move from government camp to opposition.",
 src:[["Nation: Nyoro joins United Opposition after UDA exit","https://nation.africa/kenya/news/politics/ndindi-nyoro-joins-united-opposition-after-uda-exit-5561664"],["People Daily: Nyoro joins People's Party","https://peopledaily.digital/inside-politics/ndindi-nyoro-joins-peoples-party-of-kenya"]]},

{id:"babu",n:"Babu Owino",ini:"BO",role:"Embakasi East MP since 2017. Nairobi governor aspirant.",cls:"Insufficient (partial)",
 dims:{
  redis:[1,"L","Long association with student-fee and cost-of-living advocacy (interpretation; verify)."],
  style:[1,"M","Left ODM to run for Nairobi governor under The Mwananchi Party within the Linda Mwananchi formation."],
  liberty:[1,"L","Youth-facing, rights-forward public messaging (interpretation)."]},
 rec:[
  ["D","Announced a 2027 Nairobi governorship bid and said he would seek the presidency in 2032."],
  ["A","A survey reported in July 2026 placed him first among MPs at 80% approval. Methodology not reviewed."],
  ["A","A High Court ruling nullifying an Embakasi East win has been reported. Appeal status and date not verified in this pass."]],
 contra:["Campaigns on his MP record while moving between political vehicles (interpretation)."],
 suggests:"Insufficient evidence for a policy placement. Documented pattern is youth-focused, anti-establishment positioning.",
 src:[["Star: MP record makes me fit for Nairobi governor","https://www.the-star.co.ke/news/2026-09-28-babu-mp-record-makes-me-fit-for-nairobi-governor"],["Law and Power Kenya: election ruling","https://lawandpowerkenya.com/babu-owino-loses-seat-irregularities-ground/"]]},

{id:"salasya",n:"Peter Salasya",ini:"PS",role:"Mumias East MP since 2022. 2027 presidential aspirant.",cls:"Insufficient evidence",
 dims:{
  style:[2,"L","Outspoken, populist positioning against the political class (interpretation; low volume of policy evidence)."],
  liberty:[1,"L","An arrest drew condemnation from Senator Omtatah (charge and outcome not verified)."]},
 rec:[
  ["D","Declared a 2027 presidential bid."],
  ["A","His payslip and social-media earnings drew public debate about MPs' pay."],
  ["D","An arrest was publicly condemned by Senator Okiya Omtatah. Details and outcome not verified."]],
 contra:["Not assessed."],
 suggests:"Insufficient evidence. Highly visible, but this pass found little legislative or policy record.",
 src:[["Kenyans.co.ke: presidential bid","https://www.kenyans.co.ke/news/111493-salasya-joins-long-list-2027-presidential-aspirants"],["People Daily: Omtatah on the arrest","https://peopledaily.digital/news/omtatah-condemns-dramatic-arrest-of-salasya-vows-to-fight-for-justice"]]},

{id:"wanga",n:"Gladys Wanga",ini:"GW",role:"Homa Bay Governor since 2022. Part of the ratified ODM leadership team.",cls:"Insufficient evidence",
 dims:{
  social:[1,"M","Part of the G7 women governors pushing for more women in elective office."],
  style:[-1,"M","Aligned with ODM's leadership and its cooperation with the government."]},
 rec:[
  ["D","Ratified in ODM's post-Raila leadership team alongside Oburu Oginga."],
  ["D","One of seven women governors elected in 2022 who want that number raised in 2027."],
  ["A","Publicly disagreed with MP Millie Odhiambo over road conditions in Homa Bay."]],
 contra:["Not assessed."],
 suggests:"Insufficient evidence for a full placement. Governing record in Homa Bay not compiled in this pass.",
 src:[["Nation: Oburu and Wanga team ratified","https://nation.africa/kenya/news/politics/power-shift-in-odm-oburu-wanga-team-ratified-osotsi-axed-in-sdc-purge-5404810"],["Nation: women in governor races","https://nation.africa/kenya/news/gender/women-politicians-storm-governor-contests-ahead-of-2027-showdown--5403030"]]},

{id:"millie",n:"Millie Odhiambo",ini:"MO",role:"Suba North MP. National Assembly Minority Chief Whip. ODM.",cls:"Insufficient (partial)",
 dims:{
  social:[1,"L","Long-standing public advocacy on gender and children's issues (interpretation; check bills sponsored)."],
  inst:[1,"L","Serves in a parliamentary oversight role as Minority Chief Whip."],
  style:[0,"M","Declined to align with either ODM faction and was heckled as a fence-sitter in Sept 2026."]},
 rec:[
  ["D","Refused to join either the Linda Ground or the Linda Mwananchi faction of ODM."],
  ["D","Called for peace ahead of a Linda Mwananchi rally in Homa Bay and urged leaders to reject ethnic incitement."],
  ["A","Said she warned ODM against pursuing Sifuna and was later vindicated. This is her own claim."]],
 contra:["Holds a formal opposition-side post while declining to take a side in ODM's split (interpretation)."],
 suggests:"Insufficient evidence for a full placement. Her legislative record should be compiled next.",
 src:[["Nation: rough road for ODM fence-sitters","https://nation.africa/kenya/news/politics/rough-road-for-odm-fence-sitters-in-nyanza-5595014"],["People Daily: position after Linda Ground disbanded","https://peopledaily.digital/inside-politics/millie-odhiambo-declares-her-position-after-disbandment-of-linda-ground-faction"]]},

{id:"nyamu",n:"Karen Nyamu",ini:"KN",role:"Nominated Senator (UDA) since 2022.",cls:"Insufficient evidence",
 dims:{style:[-1,"M","Publicly aligned with UDA and the government line."]},
 rec:[
  ["D","Proposed an Artificial Intelligence Regulation Bill in 2026."],
  ["D","Said UDA lost the Ol Kalou by-election because its leaders overdid their campaigning."],
  ["A","A Nation opinion piece described her as epitomising UDA. That is a columnist's view."],
  ["A","A public petition alleged she humiliated a student in the Senate. A petition is not a finding."]],
 contra:["Not assessed."],
 suggests:"Insufficient evidence. Very visible, but this pass found one bill and mostly commentary.",
 src:[["People Daily: Ol Kalou by-election remarks","https://peopledaily.digital/inside-politics/karen-nyamu-ol-kalou-voters-rejected-uda-because-we-overdid-it"],["Nation opinion: Karen Nyamu epitomises UDA","https://nation.africa/kenya/blogs-opinion/opinion/karen-nyamu-epitomises-uda-5455088"]]},

{id:"omanga",n:"Millicent Omanga",ini:"MM",role:"Former nominated senator. Joined DCP in March 2026. Nairobi Woman Rep aspirant.",cls:"Insufficient evidence",
 dims:{style:[1,"L","Left UDA for the opposition citing broken promises (her own account)."]},
 rec:[
  ["D","Joined DCP on 19 March 2026 and was received by Gachagua."],
  ["A","Said she left the Ruto camp over broken promises and erosion of principles. This is her stated reason."],
  ["D","Announced a bid for Nairobi Woman Representative on 6 February 2026."],
  ["D","Denied on 19 September 2026 that she was the person named in an August gazette notice for a borstal board."]],
 contra:["Not assessed."],
 suggests:"Insufficient evidence. The documented pattern is a defection from government to opposition.",
 src:[["Standard: Omanga ditches UDA for DCP","https://www.standardmedia.co.ke/politics/article/2001543418/millicent-omanga-ditches-uda-for-gachaguas-dcp"],["Nation: why I ditched Ruto","https://nation.africa/kenya/news/politics/millicent-omanga-why-i-ditched-ruto-for-gachagua-s-camp-5407226"]]},

{id:"waiguru",n:"Anne Waiguru",ini:"AW",role:"Kirinyaga Governor since 2017. Former Devolution CS.",cls:"Insufficient evidence",
 dims:{},
 rec:[
  ["D","Women governors publicly proposed her as a female deputy president candidate for 2027 (reported on a Kirinyaga county government page, so corroborate with independent outlets)."],
  ["D","One of the G7 women governors elected in 2022."],
  ["U","Left the Devolution CS post in 2015 during the National Youth Service scandal. Findings and outcomes were not compiled in this pass."]],
 contra:["Not assessed."],
 suggests:"Insufficient evidence. Needs a dedicated pass on her county record and the NYS matter.",
 src:[["Kirinyaga County: women governors on a female DP (government source)","https://kirinyaga.go.ke/women-governors-say-kenya-is-ready-for-a-female-deputy-president-propose-waiguru/"],["Nation: female governors' bid for inclusion","https://nation.africa/kenya/news/gender/from-g7-to-g16-inside-female-governors-bid-for-greater-political-inclusion-4548874"]]}
];
