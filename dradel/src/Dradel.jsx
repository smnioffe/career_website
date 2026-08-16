import React, { useState, useMemo, useRef, useEffect } from "react";

/* ================================================================
   DRΔDEL — guess the famous Jew
   ================================================================ */

const COLORS = {
  ink: "#0C111C",
  ink2: "#131A2A",
  panel: "#1A2340",
  edge: "#2E3A5C",
  tekhelet: "#2B4E96",
  brass: "#C79A45",
  parchment: "#EFE7D5",
  parchDim: "#9AA3B8",
  hit: "#2C6E52",
  near: "#9C7A28",
  miss: "#232B41",
};

const DISPLAY = "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif";
const BODY = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'Courier New', Courier, monospace";

const ERAS = ["pre-1940","1940s","1950s","1960s","1970s","1980s","1990s","2000s","2010s","2020s"];

/* ---- BASE ANSWER ROSTER: the original 100 mystery people ----
   [name, gender, birthYear, country, USstate, living, era, fields, blurb, [3 hints]] */
const CORE = [
["Scarlett Johansson","F",1984,"United States","New York",true,"2000s",["Acting"],"Actor. Among the highest-grossing film leads of her generation.",["Voiced an operating system opposite Joaquin Phoenix","Played a Marvel superspy for a decade","Danish first name, Polish-Jewish mother, raised in Manhattan"]],
["Natalie Portman","F",1981,"Israel","",true,"1990s",["Acting"],"Actor and director. Oscar winner for Black Swan.",["Debuted as a child assassin's protégée","Won an Oscar for a ballet thriller","Born in Jerusalem; Harvard psychology degree"]],
["Paul Newman","M",1925,"United States","Ohio",false,"1950s",["Acting","Film"],"Actor, racer, and founder of Newman's Own.",["His salad dressing funds charity","Cool Hand Luke and The Hustler","Blue-eyed star who raced cars professionally"]],
["Harrison Ford","M",1942,"United States","Illinois",true,"1970s",["Acting"],"Actor. Han Solo and Indiana Jones.",["Was a carpenter before he was a star","Flew the Millennium Falcon","Also cracked a whip as an archaeologist"]],
["Dustin Hoffman","M",1937,"United States","California",true,"1960s",["Acting"],"Actor. The Graduate, Rain Man, Tootsie.",["Seduced by Mrs. Robinson","Played an autistic savant counting cards","'I'm walkin' here!'"]],
["Barbra Streisand","F",1942,"United States","New York",true,"1960s",["Music","Acting","Stage"],"Singer, actor, director. One of a handful of EGOT winners.",["Funny Girl, on Broadway and on film","Directed and starred in Yentl","Famously reluctant to perform live"]],
["Mila Kunis","F",1983,"Ukraine","",true,"2000s",["Acting"],"Actor. That '70s Show, Family Guy, and Black Swan.",["Voices an animated family's long-suffering teenage daughter","Broke out as Jackie on a sitcom set in Wisconsin","Born in Soviet Ukraine; married her former sitcom co-star"]],
["Paul Rudd","M",1969,"United States","New Jersey",true,"2000s",["Acting","Comedy"],"Actor and comedian. Clueless, Anchorman, and Ant-Man.",["Running joke: he appears not to age","Was part of the Anchorman news team","Plays Marvel's size-changing Ant-Man"]],
["Gal Gadot","F",1985,"Israel","",true,"2010s",["Acting"],"Israeli actor. Wonder Woman.",["Served in the IDF before Hollywood","Carried the Lasso of Truth","Former Miss Israel"]],
["Jake Gyllenhaal","M",1980,"United States","California",true,"2000s",["Acting"],"Actor. Donnie Darko, Brokeback Mountain, Nightcrawler.",["Talked to a man in a rabbit suit","Filmed crime scenes for cash in LA","His sister is also a well-known actor"]],
["Winona Ryder","F",1971,"United States","Minnesota",true,"1990s",["Acting"],"Actor. Heathers, Beetlejuice, Stranger Things.",["Croquet and cruelty in a dark high-school comedy","Named after a Minnesota town","Came roaring back hunting a Demogorgon"]],
["Jeff Goldblum","M",1952,"United States","Pennsylvania",true,"1980s",["Acting"],"Actor. The Fly, Jurassic Park, Independence Day.",["Turned into an insect by a teleporter","Chaos theorist in a dinosaur park","Halting speech and serious jazz piano"]],
["Daniel Radcliffe","M",1989,"United Kingdom","",true,"2000s",["Acting"],"British actor. Harry Potter.",["Cast at eleven in a wizarding franchise","British; later chose deliberately strange roles","Played a flatulent corpse in one film"]],
["Sarah Jessica Parker","F",1965,"United States","Ohio",true,"1990s",["Acting","Television"],"Actor and producer. Sex and the City.",["Wrote a column about New York dating","Broadway child actor first","Married to Matthew Broderick"]],
["Leonard Nimoy","M",1931,"United States","Massachusetts",false,"1960s",["Acting","Television"],"Actor and director. Spock on Star Trek.",["Based a famous hand salute on a priestly blessing","Half-Vulcan","Also a director and photographer"]],
["William Shatner","M",1931,"Canada","",true,"1960s",["Acting","Television"],"Canadian actor. Captain Kirk on Star Trek.",["Canadian; commanded a starship","Went to actual space in his nineties","Later played a lawyer named Denny Crane"]],
["Julia Louis-Dreyfus","F",1961,"United States","New York",true,"1990s",["Comedy","Acting","Television"],"Actor and comedian. Seinfeld and Veep.",["Went from Saturday Night Live to sitcom stardom","Played Vice President Selina Meyer","Elaine Benes and her unforgettable dancing"]],
["Lisa Kudrow","F",1963,"United States","California",true,"1990s",["Acting","Comedy","Television"],"Actor and comedian. Friends and The Comeback.",["Earned a biology degree before choosing comedy","Played a faded sitcom star in The Comeback","Phoebe Buffay sang Smelly Cat"]],
["Elizabeth Taylor","F",1932,"United Kingdom","",false,"1950s",["Acting"],"Actor and AIDS activist. Converted to Judaism in 1959.",["Violet eyes and eight marriages","Converted before marrying Eddie Fisher","Early and forceful AIDS fundraiser"]],

["Jerry Seinfeld","M",1954,"United States","New York",true,"1990s",["Comedy","Television","Acting"],"Stand-up comedian and co-creator of Seinfeld.",["A show about nothing","Obsessed with cereal and Porsches","Later drove comedians around for coffee"]],
["Larry David","M",1947,"United States","New York",true,"1990s",["Comedy","Television","Writing"],"Co-creator of Seinfeld; creator and star of Curb Your Enthusiasm.",["Pretty, pretty, pretty good","Co-created a nothing-show, then played himself","Bald, bespectacled, perpetually aggrieved"]],
["Jon Stewart","M",1962,"United States","New York",true,"1990s",["Comedy","Television"],"Comedian and host of The Daily Show. Born Jonathan Stuart Leibowitz.",["Fake news anchor, real influence","Born Leibowitz in New Jersey's suburbs","Lobbied Congress for 9/11 first responders"]],
["Adam Sandler","M",1966,"United States","New York",true,"1990s",["Comedy","Acting"],"Comedian and actor. SNL, Happy Gilmore, Uncut Gems.",["Sang a holiday song listing famous Jews on SNL","Golf, hockey, and a lot of yelling","Dramatic turn in a diamond-district thriller"]],
["Seth Rogen","M",1982,"Canada","",true,"2000s",["Comedy","Acting","Writing"],"Canadian comedian, actor, and screenwriter.",["Canadian; unmistakable laugh","Started writing a stoner comedy as a teenager","Also runs a cannabis and ceramics company"]],
["Mel Brooks","M",1926,"United States","New York",true,"1960s",["Comedy","Film","Writing"],"Writer and director. The Producers, Blazing Saddles.",["A musical about a deliberate Broadway flop","Springtime for Hitler","EGOT winner; married to Anne Bancroft"]],
["Joan Rivers","F",1933,"United States","New York",false,"1960s",["Comedy","Television","Stage"],"Stand-up comedian and talk show host.",["'Can we talk?'","Invented the red-carpet interview","First woman to host a network late-night show"]],
["Ben Stiller","M",1965,"United States","New York",true,"1990s",["Comedy","Acting","Film"],"Actor, comedian, and director. Zoolander, Meet the Parents, and Tropic Thunder.",["Son of comedy duo Jerry Stiller and Anne Meara","Played a very serious male model","Met Robert De Niro's intimidating future father-in-law"]],
["Sacha Baron Cohen","M",1971,"United Kingdom","",true,"2000s",["Comedy","Acting"],"British comedian and actor. Ali G, Borat, and Brüno.",["Cambridge-educated master of staying in character","First broke through as Ali G","Played a fictional reporter from Kazakhstan"]],
["Sarah Silverman","F",1970,"United States","New Hampshire",true,"2000s",["Comedy","Television"],"Stand-up comedian, actor, and writer.",["Deadpan delivery of appalling lines","Had her own Comedy Central program","Her sister is a rabbi in Jerusalem"]],
["Jonah Hill","M",1983,"United States","California",true,"2000s",["Acting","Comedy"],"Actor and filmmaker. Superbad, Moneyball, and The Wolf of Wall Street.",["Earned Oscar nominations for both baseball and finance movies","Directed the coming-of-age film Mid90s","Co-starred in Superbad"]],
["Bill Maher","M",1956,"United States","New York",true,"1990s",["Comedy","Television","Journalism"],"Comedian and political commentator. Politically Incorrect and Real Time.",["Hosted a show called Politically Incorrect","Made the religion documentary Religulous","Longtime Friday-night host on HBO"]],
["Groucho Marx","M",1890,"United States","New York",false,"pre-1940",["Comedy","Acting"],"Marx Brother and host of You Bet Your Life.",["Greasepaint mustache and a cigar","One of five brothers","Hosted a quiz show for years"]],
["Woody Allen","M",1935,"United States","New York",true,"1970s",["Comedy","Film","Writing"],"Filmmaker and comedian. Annie Hall, Manhattan.",["Neurotic New Yorker with a clarinet","Won Best Picture for a romance about a singer","Deeply divisive later life"]],
["Amy Schumer","F",1981,"United States","New York",true,"2010s",["Comedy","Acting"],"Stand-up comedian and actor. Trainwreck.",["Sketch show under her own name","Wrote and starred in a rom-com about a mess","Related to a US senator"]],

["Bob Dylan","M",1941,"United States","Minnesota",true,"1960s",["Music","Writing"],"Songwriter. Nobel laureate in Literature. Born Robert Zimmerman.",["Went electric at Newport","Born Zimmerman on the Iron Range","Won a Nobel Prize in Literature"]],
["Leonard Cohen","M",1934,"Canada","",false,"1960s",["Music","Writing"],"Canadian songwriter and poet. Hallelujah, Suzanne.",["Canadian poet who took up singing late","Wrote a much-covered song built on a psalm","Spent years in a Zen monastery"]],
["Amy Winehouse","F",1983,"United Kingdom","",false,"2000s",["Music"],"British soul singer and songwriter. Back to Black.",["Beehive and winged eyeliner","Refused to go to rehab","Died at 27 in Camden"]],
["Paul Simon","M",1941,"United States","New Jersey",true,"1960s",["Music"],"Songwriter. Half of Simon & Garfunkel; Graceland.",["Half of a folk-rock duo","Recorded a landmark album with South African musicians","Wrote about a bridge over troubled water"]],
["Art Garfunkel","M",1941,"United States","New York",true,"1960s",["Music"],"Singer. The other half of Simon & Garfunkel.",["The tall one with the high voice","Sang lead on the duo's biggest hit","Later taught math and walked across countries"]],
["Lou Reed","M",1942,"United States","New York",false,"1960s",["Music"],"Frontman of The Velvet Underground.",["Fronted the band with the banana album cover","Wrote about a walk on the wild side","Married Laurie Anderson"]],
["Carole King","F",1942,"United States","New York",true,"1960s",["Music"],"Songwriter. Brill Building hitmaker; Tapestry.",["Brill Building songwriter first","Tapestry sold tens of millions","Wrote hits for the Shirelles and Aretha Franklin"]],
["Billy Joel","M",1949,"United States","New York",true,"1970s",["Music"],"Piano-driven songwriter. Piano Man, The Stranger.",["Long Island piano man","Sang a rapid-fire list of postwar history","Long residency at Madison Square Garden"]],
["Gene Simmons","M",1949,"Israel","",true,"1970s",["Music"],"Bassist and co-founder of KISS. Born Chaim Witz.",["Born in Haifa as Chaim Witz","Face paint and an extremely long tongue","Plays bass in a band full of pyrotechnics"]],
["George Gershwin","M",1898,"United States","New York",false,"pre-1940",["Music"],"Composer. Rhapsody in Blue, Porgy and Bess.",["Blended jazz with the concert hall","Wrote a folk opera set on Catfish Row","Died at 38 of a brain tumor"]],
["Irving Berlin","M",1888,"Russia / USSR","",false,"pre-1940",["Music"],"Songwriter. God Bless America, White Christmas.",["Born in the Russian Empire; wrote America's second anthem","Could only play the piano in one key","Also wrote the biggest Christmas song ever"]],
["Idina Menzel","F",1971,"United States","New York",true,"2000s",["Music","Acting","Stage"],"Singer and actor. Wicked, Rent, and Frozen.",["Broadway powerhouse who originated roles in Rent and Wicked","Played the green-skinned witch Elphaba","Sang Let It Go as Elsa"]],
["Drake","M",1986,"Canada","",true,"2010s",["Music"],"Canadian rapper and singer. Had a bar mitzvah in Toronto.",["Started on a Canadian teen drama","Had a bar mitzvah in Toronto","Best-selling rapper of the streaming era"]],
["Barry Manilow","M",1943,"United States","New York",true,"1970s",["Music"],"Singer and songwriter. Mandy, Copacabana.",["Wrote the jingles before the ballads","Copacabana","Brooklyn-born easy-listening institution"]],
["Bette Midler","F",1945,"United States","Hawaii",true,"1970s",["Music","Acting","Comedy","Stage"],"Singer and actor. The Divine Miss M.",["Got her start performing at a New York bathhouse","Born in Honolulu","Beaches, and 'wind beneath my wings'"]],

["Ruth Bader Ginsburg","F",1933,"United States","New York",false,"1990s",["Law","Politics"],"Supreme Court justice and women's rights litigator.",["Famous dissents and elaborate collars","Argued sex-discrimination cases in the 1970s","Second woman on the Supreme Court"]],
["Bernie Sanders","M",1941,"United States","New York",true,"2010s",["Politics"],"Senator from Vermont and two-time presidential candidate.",["Brooklyn accent, Vermont politics","Democratic socialist who ran twice for president","Mittens at an inauguration"]],
["Henry Kissinger","M",1923,"Germany","",false,"1970s",["Politics","Academia"],"Secretary of State and national security adviser.",["Fled Nazi Germany as a teenager","Shuttle diplomacy and a contested Nobel","Served both Nixon and Ford"]],
["Michael Bloomberg","M",1942,"United States","Massachusetts",true,"2000s",["Politics","Business"],"Founder of Bloomberg LP and mayor of New York City.",["Financial data terminals carry his name","Three terms running New York City","Spent a fortune on a very short 2020 campaign"]],
["Golda Meir","F",1898,"Russia / USSR","",false,"1960s",["Politics"],"Fourth prime minister of Israel.",["Grew up in Milwaukee","Led Israel through the 1973 war","Called an Iron Lady before Thatcher was"]],
["Benjamin Netanyahu","M",1949,"Israel","",true,"1990s",["Politics"],"Longest-serving prime minister of Israel.",["Educated at MIT","Israel's longest-serving leader","His brother died leading the Entebbe raid"]],
["Chuck Schumer","M",1950,"United States","New York",true,"2000s",["Politics"],"Senate leader from New York.",["Brooklyn-born, Harvard-educated","Senate Democratic leader","Known for Sunday morning press conferences"]],
["Volodymyr Zelensky","M",1978,"Ukraine","",true,"2010s",["Politics","Comedy","Acting"],"Ukrainian comedian and actor elected president in 2019.",["Played a teacher who unexpectedly became president on television","Then won the presidency in real life","Led Ukraine during Russia's full-scale invasion"]],
["Jared Kushner","M",1981,"United States","New Jersey",true,"2010s",["Business","Politics"],"Real-estate executive and former senior White House adviser.",["Came from a New Jersey real-estate family","Worked on Middle East diplomacy in the White House","Married Ivanka Trump and advised her father"]],
["Wolf Blitzer","M",1948,"Germany","",true,"1990s",["Journalism","Television"],"Journalist and longtime CNN anchor.",["Born in postwar Germany to Holocaust survivors","A longtime face of CNN's election coverage","Hosts The Situation Room"]],

["Albert Einstein","M",1879,"Germany","",false,"pre-1940",["Science","Academia"],"Physicist. Relativity, and the most famous equation in science.",["Worked as a patent clerk in Bern","Declined the presidency of Israel","Wild hair; E=mc²"]],
["Sigmund Freud","M",1856,"Austria","",false,"pre-1940",["Science","Academia","Writing"],"Founder of psychoanalysis.",["Couch, cigars, and dreams","Fled Vienna for London in 1938","Gave us the ego and the id"]],
["Jonas Salk","M",1914,"United States","New York",false,"1950s",["Science"],"Developed the first widely used polio vaccine.",["Refused to patent his discovery","Ended a summer terror for American parents","Founded an institute in La Jolla"]],
["Richard Feynman","M",1918,"United States","New York",false,"1960s",["Science","Academia"],"Physicist, Nobel laureate, and bongo player.",["Bongo-playing Nobel physicist","Explained an o-ring failure with a glass of ice water","Cracked safes at Los Alamos for fun"]],
["Carl Sagan","M",1934,"United States","New York",false,"1980s",["Science","Television","Writing"],"Astronomer and host of Cosmos.",["Billions and billions","Hosted a thirteen-part PBS series","Pushed to turn a probe around for one photo"]],
["Noam Chomsky","M",1928,"United States","Pennsylvania",true,"1960s",["Academia","Activism","Writing"],"Linguist and political critic.",["Transformed linguistics from MIT","Co-wrote Manufacturing Consent","Relentless critic of American foreign policy"]],
["J. Robert Oppenheimer","M",1904,"United States","New York",false,"1940s",["Science","Academia"],"Physicist who led the Los Alamos laboratory.",["Quoted the Bhagavad Gita after a test","Ran a secret laboratory in the desert","Stripped of his security clearance in 1954"]],
["Sam Harris","M",1967,"United States","California",true,"2000s",["Writing","Academia"],"Author and podcaster known for writing about religion, ethics, and consciousness.",["Earned a doctorate in cognitive neuroscience","Associated with the New Atheist movement","Hosts the Making Sense podcast"]],
["Karl Marx","M",1818,"Germany","",false,"pre-1940",["Academia","Writing","Politics"],"Philosopher and economist, born to a family of rabbis.",["Buried in Highgate Cemetery","Wrote a manifesto with Engels","Descended from rabbis, baptized as a boy"]],
["Sam Altman","M",1985,"United States","Illinois",true,"2010s",["Tech","Business"],"Technology entrepreneur and co-founder of OpenAI.",["Led the startup accelerator Y Combinator","Backed ambitious projects in energy and identity","Co-founded the company behind ChatGPT"]],

["Mark Zuckerberg","M",1984,"United States","New York",true,"2000s",["Tech","Business"],"Co-founder and CEO of Facebook, now Meta.",["Dropped out of Harvard in 2004","Hoodie, and a lawsuit-heavy origin story","Renamed his company after a virtual world"]],
["Sergey Brin","M",1973,"Russia / USSR","",true,"2000s",["Tech","Business"],"Co-founder of Google. Born in Moscow.",["Emigrated from Moscow at six","Co-wrote the PageRank paper at Stanford","Later chased airships and flying cars"]],
["Larry Page","M",1973,"United States","Michigan",true,"2000s",["Tech","Business"],"Co-founder of Google.",["The other Stanford co-founder","Named the parent holding company Alphabet","Michigan-born son of a computer science professor"]],
["Larry Ellison","M",1944,"United States","New York",true,"1990s",["Tech","Business"],"Co-founder of Oracle.",["Built a database company on a CIA contract","Owns most of a Hawaiian island","Serious competitive sailor"]],
["Michael Dell","M",1965,"United States","Texas",true,"1990s",["Tech","Business"],"Founder of Dell Technologies.",["Built PCs in a dorm room","Took his company private, then public again","Austin, Texas"]],
["Mark Cuban","M",1958,"United States","Pennsylvania",true,"2000s",["Business","Sports","Television"],"Entrepreneur, investor, and television personality.",["Sold Broadcast.com to Yahoo during the dot-com boom","Became a regular investor on Shark Tank","Longtime owner of the Dallas Mavericks"]],
["Ralph Lauren","M",1939,"United States","New York",true,"1970s",["Business","Art"],"Fashion designer. Born Ralph Lifshitz.",["Born Lifshitz in the Bronx","Started out selling wide ties","Logo is a polo player"]],
["Larry King","M",1933,"United States","New York",false,"1990s",["Journalism","Television"],"Broadcaster and interviewer best known for Larry King Live.",["Signature suspenders and an old-school microphone","Interviewed presidents and celebrities for decades on CNN","Born Lawrence Harvey Zeiger in Brooklyn"]],
["Estée Lauder","F",1908,"United States","New York",false,"1950s",["Business"],"Cosmetics entrepreneur.",["Built an empire on free samples","Queens-born; sold face cream door to door","Youth-Dew"]],
["Sheryl Sandberg","F",1969,"United States","Washington DC",true,"2010s",["Tech","Business","Writing"],"COO of Facebook and author of Lean In.",["Went from Google to Facebook","Told women to lean in","Widowed young; wrote a book about grief"]],

["Sandy Koufax","M",1935,"United States","New York",true,"1960s",["Sports"],"Dodgers pitcher who sat out a World Series game on Yom Kippur.",["Four no-hitters in six seasons","Skipped a World Series start for a holy day","Retired at thirty with an arthritic elbow"]],
["Julian Edelman","M",1986,"United States","California",true,"2010s",["Sports"],"Football wide receiver and three-time Super Bowl champion with New England.",["College quarterback who became an NFL receiver","Spent his entire pro career catching passes in New England","Named MVP of Super Bowl LIII"]],
["Kevin Youkilis","M",1979,"United States","Ohio",true,"2000s",["Sports"],"Baseball infielder and World Series champion with the Boston Red Sox.",["Nicknamed the Greek God of Walks","Mentioned in Moneyball before reaching the majors","A corner infielder for Boston's 2000s championship teams"]],
["Aly Raisman","F",1994,"United States","Massachusetts",true,"2010s",["Sports","Activism"],"Olympic gymnast and captain of the Fierce Five.",["Floor routine set to Hava Nagila","Captained two Olympic gymnastics teams","Testified against a team doctor"]],
["Bobby Fischer","M",1943,"United States","Illinois",false,"1970s",["Sports"],"Chess world champion who beat Spassky in 1972.",["Beat the Soviets in Reykjavik","Chess prodigy who became a recluse","Renounced his American citizenship"]],

["Jesse Eisenberg","M",1983,"United States","New York",true,"2000s",["Acting","Film"],"Actor and filmmaker. The Social Network and Zombieland.",["Known for fast-talking, tightly wound characters","Survived a zombie apocalypse with Woody Harrelson","Played Mark Zuckerberg in The Social Network"]],
["Franz Kafka","M",1883,"Czechia","",false,"pre-1940",["Writing"],"Novelist of bureaucratic dread. The Trial, The Metamorphosis.",["Insurance clerk in Prague","Asked that his manuscripts be burned","A man wakes up as an insect"]],
["Anne Frank","F",1929,"Germany","",false,"1950s",["Writing"],"Diarist who hid in an Amsterdam annex until 1944.",["Wrote in a red-checked notebook","Hid behind a bookcase in Amsterdam","Died at Bergen-Belsen at fifteen"]],
["Elie Wiesel","M",1928,"Romania","",false,"1960s",["Writing","Activism"],"Holocaust survivor, author of Night, Nobel Peace laureate.",["Survived Auschwitz and Buchenwald","Wrote a slim memoir called Night","Nobel Peace Prize, 1986"]],
["Isaac Asimov","M",1920,"Russia / USSR","",false,"1950s",["Writing","Science"],"Science fiction writer. Foundation, I, Robot.",["Wrote three laws for robots","Born near Smolensk, raised in Brooklyn","Wrote or edited hundreds of books"]],
["Timothée Chalamet","M",1995,"United States","New York",true,"2010s",["Acting"],"Actor. Call Me by Your Name, Dune, and Wonka.",["Earned an Oscar nomination for a summer romance in Italy","Played a young chocolatier","Paul Atreides in Dune"]],
["Nora Ephron","F",1941,"United States","New York",false,"1980s",["Writing","Film"],"Essayist and filmmaker. When Harry Met Sally, Sleepless in Seattle.",["'I'll have what she's having'","Started as a journalist and essayist","Wrote an essay collection about her neck"]],

["Steven Spielberg","M",1946,"United States","Ohio",true,"1970s",["Film"],"Director. Jaws, E.T., Schindler's List.",["A shark emptied the beaches in 1975","Black-and-white film about a German industrialist","Co-founded DreamWorks"]],
["Stanley Kubrick","M",1928,"United States","New York",false,"1960s",["Film"],"Director. 2001, Dr. Strangelove, The Shining.",["Bronx photographer turned obsessive director","A bone cuts to a spacecraft","Shot a period film by candlelight"]],
["Joel Coen","M",1954,"United States","Minnesota",true,"1990s",["Film","Writing"],"Half of the Coen brothers. Fargo, The Big Lebowski.",["Works with his brother","A wood chipper in Minnesota","The rug really tied the room together"]],
["Adam Levine","M",1979,"United States","California",true,"2000s",["Music"],"Singer and frontman of Maroon 5.",["Spent years coaching singers on The Voice","Tattooed pop-rock frontman","Sings Moves Like Jagger with Maroon 5"]],
["Judd Apatow","M",1967,"United States","New York",true,"2000s",["Film","Comedy"],"Director and producer. Freaks and Geeks, Knocked Up.",["Made a beloved one-season high school show","Produced a whole generation of comedies","Married to Leslie Mann"]],

["Harry Houdini","M",1874,"Hungary","",false,"pre-1940",["Stage"],"Escape artist. Born Erik Weisz, son of a rabbi.",["Born Erik Weisz in Budapest","Escaped a water torture cell","Died on Halloween of a ruptured appendix"]],
["Seth Meyers","M",1973,"United States","Illinois",true,"2010s",["Comedy","Television"],"Comedian, writer, and host of Late Night with Seth Meyers.",["Rose from sketch performer to head writer at Saturday Night Live","Anchored Weekend Update","Moved behind the desk at Late Night"]],
["Ayn Rand","F",1905,"Russia / USSR","",false,"1950s",["Writing","Academia"],"Novelist and philosopher. Atlas Shrugged.",["Fled the Bolsheviks for Hollywood","Founded a philosophy called Objectivism","A sixty-page radio speech inside a novel"]],
["Noah Kahan","M",1997,"United States","Vermont",true,"2020s",["Music"],"Vermont singer-songwriter known for the album Stick Season.",["Folk-pop songwriter raised in rural Vermont","His breakout album is named for a bleak New England season","Sings Stick Season"]],
];

/* ---- GUESS-ONLY POOL: valid guesses, never the answer ----
   [name, gender, year, country, USstate, living, era, fields] */
const EXTRA = [
["Rodney Dangerfield","M",1921,"United States","New York",false,"1970s",["Comedy","Stage"]],
["Jason Alexander","M",1959,"United States","New Jersey",true,"1990s",["Acting","Comedy","Television"]],
["Bea Arthur","F",1922,"United States","New York",false,"1970s",["Acting","Television","Comedy","Stage"]],
["Jerry Stiller","M",1927,"United States","New York",false,"1970s",["Comedy","Acting"]],
["Goldie Hawn","F",1945,"United States","Washington DC",true,"1970s",["Acting","Comedy"]],
["Gwyneth Paltrow","F",1972,"United States","California",true,"1990s",["Acting","Business"]],
["Rachel Weisz","F",1970,"United Kingdom","",true,"2000s",["Acting"]],
["Peter Falk","M",1927,"United States","New York",false,"1970s",["Acting","Television"]],
["David Schwimmer","M",1966,"United States","New York",true,"1990s",["Acting","Comedy","Television"]],
["Kirk Douglas","M",1916,"United States","New York",false,"1950s",["Acting"]],
["James Franco","M",1978,"United States","California",true,"2000s",["Acting"]],
["Dave Franco","M",1985,"United States","California",true,"2010s",["Acting"]],
["Joseph Gordon-Levitt","M",1981,"United States","California",true,"2000s",["Acting"]],
["Andrew Garfield","M",1983,"United States","California",true,"2010s",["Acting"]],
["Logan Lerman","M",1992,"United States","California",true,"2010s",["Acting"]],
["Alicia Silverstone","F",1976,"United States","California",true,"1990s",["Acting"]],
["Lauren Bacall","F",1924,"United States","New York",false,"1940s",["Acting"]],
["Gilda Radner","F",1946,"United States","Michigan",false,"1970s",["Comedy","Television"]],
["Simon Helberg","M",1980,"United States","California",true,"2000s",["Acting","Comedy"]],
["Zoë Kravitz","F",1988,"United States","California",true,"2010s",["Acting"]],
["Lenny Kravitz","M",1964,"United States","New York",true,"1990s",["Music"]],
["Andy Kaufman","M",1949,"United States","New York",false,"1970s",["Comedy","Television"]],
["Michael Douglas","M",1944,"United States","New Jersey",true,"1970s",["Acting","Film"]],
["Adrien Brody","M",1973,"United States","New York",true,"2000s",["Acting"]],
["Philip Roth","M",1933,"United States","New Jersey",false,"1960s",["Writing"]],
["Rashida Jones","F",1976,"United States","California",true,"2000s",["Acting","Television"]],
["Tony Curtis","M",1925,"United States","New York",false,"1950s",["Acting"]],
["Edward G. Robinson","M",1893,"Romania","",false,"pre-1940",["Acting"]],
["Danny Kaye","M",1911,"United States","New York",false,"1940s",["Acting","Comedy","Stage"]],
["Jack Benny","M",1894,"United States","Illinois",false,"pre-1940",["Comedy","Television"]],
["George Burns","M",1896,"United States","New York",false,"pre-1940",["Comedy","Acting"]],
["Milton Berle","M",1908,"United States","New York",false,"1950s",["Comedy","Television"]],
["Sid Caesar","M",1922,"United States","New York",false,"1950s",["Comedy","Television"]],
["Carl Reiner","M",1922,"United States","New York",false,"1950s",["Comedy","Television","Film"]],
["Rob Reiner","M",1947,"United States","New York",true,"1970s",["Film","Acting"]],
["Don Rickles","M",1926,"United States","New York",false,"1960s",["Comedy","Stage"]],
["Shelley Winters","F",1920,"United States","Missouri",false,"1950s",["Acting"]],
["Zero Mostel","M",1915,"United States","New York",false,"1960s",["Acting","Stage"]],
["Chaim Topol","M",1935,"Israel","",false,"1970s",["Acting","Stage"]],
["Walter Matthau","M",1920,"United States","New York",false,"1960s",["Acting"]],
["Gene Wilder","M",1933,"United States","Wisconsin",false,"1970s",["Acting","Comedy"]],
["Harvey Keitel","M",1939,"United States","New York",true,"1970s",["Acting"]],
["Richard Dreyfuss","M",1947,"United States","New York",true,"1970s",["Acting"]],
["Henry Winkler","M",1945,"United States","New York",true,"1970s",["Acting","Television"]],
["Billy Crystal","M",1948,"United States","New York",true,"1980s",["Comedy","Acting"]],
["Albert Brooks","M",1947,"United States","California",true,"1980s",["Comedy","Film","Acting"]],
["Garry Shandling","M",1949,"United States","Illinois",false,"1990s",["Comedy","Television"]],
["Jerry Lewis","M",1926,"United States","New Jersey",false,"1950s",["Comedy","Acting"]],
["Marty Feldman","M",1934,"United Kingdom","",false,"1970s",["Comedy","Acting"]],
["Peter Sellers","M",1925,"United Kingdom","",false,"1960s",["Comedy","Acting"]],
["Fran Drescher","F",1957,"United States","New York",true,"1990s",["Acting","Television","Comedy"]],
["Debra Messing","F",1968,"United States","New York",true,"1990s",["Acting","Television"]],
["Andy Samberg","M",1978,"United States","California",true,"2000s",["Comedy","Acting"]],
["Ilana Glazer","F",1987,"United States","New York",true,"2010s",["Comedy","Television"]],
["Abbi Jacobson","F",1984,"United States","Pennsylvania",true,"2010s",["Comedy","Television"]],
["Rachel Bloom","F",1987,"United States","California",true,"2010s",["Comedy","Television"]],
["Marc Maron","M",1963,"United States","New Jersey",true,"2010s",["Comedy"]],
["Richard Lewis","M",1947,"United States","New York",false,"1980s",["Comedy","Acting"]],
["Bob Saget","M",1956,"United States","Pennsylvania",false,"1990s",["Comedy","Television"]],
["Howard Stern","M",1954,"United States","New York",true,"1990s",["Journalism","Comedy"]],
["Levi Strauss","M",1829,"Germany","",false,"pre-1940",["Business"]],
["Barbara Walters","F",1929,"United States","Massachusetts",false,"1970s",["Journalism","Television"]],
["Louis Brandeis","M",1856,"United States","Kentucky",false,"pre-1940",["Law"]],
["Ted Koppel","M",1940,"United Kingdom","",true,"1980s",["Journalism","Television"]],
["Mike Wallace","M",1918,"United States","Massachusetts",false,"1960s",["Journalism","Television"]],
["Carl Bernstein","M",1944,"United States","Washington DC",true,"1970s",["Journalism","Writing"]],
["Walter Lippmann","M",1889,"United States","New York",false,"pre-1940",["Journalism","Writing"]],
["Ruth Westheimer","F",1928,"Germany","",false,"1980s",["Television","Academia"]],
["Judith Sheindlin","F",1942,"United States","New York",true,"1990s",["Television","Law"]],
["Jerry Springer","M",1944,"United Kingdom","",false,"1990s",["Television","Politics"]],
["Norman Lear","M",1922,"United States","Connecticut",false,"1970s",["Television","Writing"]],
["Aaron Sorkin","M",1961,"United States","New York",true,"1990s",["Writing","Film","Television"]],
["David Simon","M",1960,"United States","Washington DC",true,"2000s",["Television","Journalism"]],
["Amy Sherman-Palladino","F",1966,"United States","California",true,"2000s",["Television","Writing"]],
["Billy Wilder","M",1906,"Poland","",false,"1940s",["Film","Writing"]],
["Adam Yauch","M",1964,"United States","New York",false,"1980s",["Music"]],
["Adam Horovitz","M",1966,"United States","New York",true,"1980s",["Music"]],
["Michael Diamond","M",1965,"United States","New York",true,"1980s",["Music"]],
["Geddy Lee","M",1953,"Canada","",true,"1970s",["Music"]],
["Neil Diamond","M",1941,"United States","New York",true,"1960s",["Music"]],
["Randy Newman","M",1943,"United States","California",true,"1970s",["Music"]],
["Burt Bacharach","M",1928,"United States","Missouri",false,"1960s",["Music"]],
["Carly Simon","F",1943,"United States","New York",true,"1970s",["Music"]],
["Regina Spektor","F",1980,"Russia / USSR","",true,"2000s",["Music"]],
["Beck","M",1970,"United States","California",true,"1990s",["Music"]],
["Michael Bolton","M",1953,"United States","Connecticut",true,"1990s",["Music"]],
["Leonard Bernstein","M",1918,"United States","Massachusetts",false,"1950s",["Music"]],
["Aaron Copland","M",1900,"United States","New York",false,"pre-1940",["Music"]],
["Benny Goodman","M",1909,"United States","Illinois",false,"pre-1940",["Music"]],
["Artie Shaw","M",1910,"United States","New York",false,"pre-1940",["Music"]],
["Richard Rodgers","M",1902,"United States","New York",false,"pre-1940",["Music"]],
["Oscar Hammerstein II","M",1895,"United States","New York",false,"pre-1940",["Music","Writing"]],
["Stephen Sondheim","M",1930,"United States","New York",false,"1950s",["Music","Writing"]],
["Marvin Hamlisch","M",1944,"United States","New York",false,"1970s",["Music"]],
["Philip Glass","M",1937,"United States","Maryland",true,"1970s",["Music"]],
["Jascha Heifetz","M",1901,"Lithuania","",false,"pre-1940",["Music"]],
["Vladimir Horowitz","M",1903,"Ukraine","",false,"pre-1940",["Music"]],
["Arthur Rubinstein","M",1887,"Poland","",false,"pre-1940",["Music"]],
["Yehudi Menuhin","M",1916,"United States","New York",false,"1940s",["Music"]],
["Daniel Barenboim","M",1942,"Argentina","",true,"1970s",["Music"]],
["Gustav Mahler","M",1860,"Czechia","",false,"pre-1940",["Music"]],
["Felix Mendelssohn","M",1809,"Germany","",false,"pre-1940",["Music"]],
["Kurt Weill","M",1900,"Germany","",false,"pre-1940",["Music"]],
["Serge Gainsbourg","M",1928,"France","",false,"1960s",["Music"]],
["Sidney Lumet","M",1924,"United States","Pennsylvania",false,"1960s",["Film"]],
["Roman Polanski","M",1933,"France","",true,"1960s",["Film"]],
["Mike Nichols","M",1931,"Germany","",false,"1960s",["Film","Comedy"]],
["Ernst Lubitsch","M",1892,"Germany","",false,"pre-1940",["Film"]],
["Fritz Lang","M",1890,"Austria","",false,"pre-1940",["Film"]],
["Otto Preminger","M",1905,"Ukraine","",false,"1940s",["Film"]],
["Darren Aronofsky","M",1969,"United States","New York",true,"1990s",["Film"]],
["Michael Mann","M",1943,"United States","Illinois",true,"1990s",["Film"]],
["Oliver Stone","M",1946,"United States","New York",true,"1980s",["Film","Writing"]],
["David Cronenberg","M",1943,"Canada","",true,"1980s",["Film"]],
["Ivan Reitman","M",1946,"Slovakia","",false,"1980s",["Film"]],
["Jason Reitman","M",1977,"Canada","",true,"2000s",["Film"]],
["Ethan Coen","M",1957,"United States","Minnesota",true,"1990s",["Film","Writing"]],
["Todd Phillips","M",1970,"United States","New York",true,"2000s",["Film"]],
["Eli Roth","M",1972,"United States","Massachusetts",true,"2000s",["Film"]],
["Sam Raimi","M",1959,"United States","Michigan",true,"1990s",["Film"]],
["Harold Ramis","M",1944,"United States","Illinois",false,"1980s",["Film","Comedy","Acting"]],
["Louis B. Mayer","M",1884,"Russia / USSR","",false,"pre-1940",["Business","Film"]],
["Samuel Goldwyn","M",1879,"Poland","",false,"pre-1940",["Business","Film"]],
["Harry Cohn","M",1891,"United States","New York",false,"pre-1940",["Business","Film"]],
["Adolph Zukor","M",1873,"Hungary","",false,"pre-1940",["Business","Film"]],
["David O. Selznick","M",1902,"United States","Pennsylvania",false,"1940s",["Film","Business"]],
["Irving Thalberg","M",1899,"United States","New York",false,"pre-1940",["Film","Business"]],
["Lew Wasserman","M",1913,"United States","Ohio",false,"1960s",["Business","Film"]],
["Jeffrey Katzenberg","M",1950,"United States","New York",true,"1990s",["Business","Film"]],
["David Geffen","M",1943,"United States","New York",true,"1980s",["Business","Music"]],
["Harvey Weinstein","M",1952,"United States","New York",true,"1990s",["Film","Business"]],
["Sumner Redstone","M",1923,"United States","Massachusetts",false,"1990s",["Business"]],
["Barry Diller","M",1942,"United States","California",true,"1990s",["Business","Television"]],
["Andy Grove","M",1936,"Hungary","",false,"1990s",["Tech","Business"]],
["Steve Ballmer","M",1956,"United States","Michigan",true,"1990s",["Tech","Business"]],
["Michael Eisner","M",1942,"United States","New York",true,"1990s",["Business","Film"]],
["Carl Icahn","M",1936,"United States","New York",true,"1980s",["Business"]],
["George Soros","M",1930,"Hungary","",true,"1990s",["Business","Activism"]],
["Bernie Madoff","M",1938,"United States","New York",false,"2000s",["Business"]],
["Sheldon Adelson","M",1933,"United States","Massachusetts",false,"2000s",["Business","Politics"]],
["Ben Cohen","M",1951,"United States","New York",true,"1980s",["Business"]],
["Jerry Greenfield","M",1951,"United States","New York",true,"1980s",["Business"]],
["Marc Benioff","M",1964,"United States","California",true,"2000s",["Tech","Business"]],
["Jan Koum","M",1976,"Ukraine","",true,"2010s",["Tech","Business"]],
["Susan Wojcicki","F",1968,"United States","California",false,"2010s",["Tech","Business"]],
["Anne Wojcicki","F",1973,"United States","California",true,"2000s",["Tech","Business"]],
["Michael Milken","M",1946,"United States","California",true,"1980s",["Business"]],
["Lloyd Blankfein","M",1954,"United States","New York",true,"2000s",["Business"]],
["Alan Greenspan","M",1926,"United States","New York",true,"1990s",["Politics","Business","Academia"]],
["Janet Yellen","F",1946,"United States","New York",true,"2010s",["Politics","Academia"]],
["Ben Bernanke","M",1953,"United States","Georgia",true,"2000s",["Politics","Academia"]],
["Milton Friedman","M",1912,"United States","New York",false,"1970s",["Academia"]],
["Paul Krugman","M",1953,"United States","New York",true,"2000s",["Academia","Journalism"]],
["Joseph Stiglitz","M",1943,"United States","Indiana",true,"2000s",["Academia"]],
["Daniel Kahneman","M",1934,"Israel","",false,"2000s",["Academia","Science"]],
["Amos Tversky","M",1937,"Israel","",false,"1980s",["Academia","Science"]],
["Howard Zinn","M",1922,"United States","New York",false,"1980s",["Academia","Writing","Activism"]],
["Susan Sontag","F",1933,"United States","New York",false,"1960s",["Writing","Academia"]],
["Betty Friedan","F",1921,"United States","Illinois",false,"1960s",["Writing","Activism"]],
["Gloria Steinem","F",1934,"United States","Ohio",true,"1970s",["Journalism","Activism"]],
["Emma Goldman","F",1869,"Lithuania","",false,"pre-1940",["Activism","Writing"]],
["Rosa Luxemburg","F",1871,"Poland","",false,"pre-1940",["Politics","Writing"]],
["Abbie Hoffman","M",1936,"United States","Massachusetts",false,"1960s",["Activism"]],
["Jerry Rubin","M",1938,"United States","Ohio",false,"1960s",["Activism"]],
["Bella Abzug","F",1920,"United States","New York",false,"1970s",["Politics","Activism"]],
["Barney Frank","M",1940,"United States","New Jersey",true,"1990s",["Politics"]],
["Rahm Emanuel","M",1959,"United States","Illinois",true,"2000s",["Politics"]],
["Dianne Feinstein","F",1933,"United States","California",false,"1990s",["Politics"]],
["Elena Kagan","F",1960,"United States","New York",true,"2010s",["Law","Politics"]],
["Stephen Breyer","M",1938,"United States","California",true,"1990s",["Law"]],
["Felix Frankfurter","M",1882,"Austria","",false,"1940s",["Law"]],
["Benjamin Cardozo","M",1870,"United States","New York",false,"pre-1940",["Law"]],
["Alan Dershowitz","M",1938,"United States","New York",true,"1990s",["Law","Academia"]],
["David Ben-Gurion","M",1886,"Poland","",false,"1940s",["Politics"]],
["Harvey Milk","M",1930,"United States","New York",false,"1970s",["Politics","Activism"]],
["Roy Cohn","M",1927,"United States","New York",false,"1950s",["Law","Politics"]],
["Yitzhak Rabin","M",1922,"Israel","",false,"1990s",["Politics"]],
["Shimon Peres","M",1923,"Poland","",false,"1990s",["Politics"]],
["Menachem Begin","M",1913,"Belarus","",false,"1970s",["Politics"]],
["Ariel Sharon","M",1928,"Israel","",false,"2000s",["Politics"]],
["Ehud Barak","M",1942,"Israel","",true,"1990s",["Politics"]],
["Moshe Dayan","M",1915,"Israel","",false,"1960s",["Politics"]],
["Chaim Weizmann","M",1874,"Belarus","",false,"1940s",["Politics","Science"]],
["Ze'ev Jabotinsky","M",1880,"Ukraine","",false,"pre-1940",["Politics","Writing"]],
["Naftali Bennett","M",1972,"Israel","",true,"2020s",["Politics"]],
["Yair Lapid","M",1963,"Israel","",true,"2010s",["Politics","Journalism"]],
["Natan Sharansky","M",1948,"Ukraine","",true,"1980s",["Activism","Politics"]],
["Simon Wiesenthal","M",1908,"Ukraine","",false,"1960s",["Activism"]],
["Niels Bohr","M",1885,"Denmark","",false,"pre-1940",["Science","Academia"]],
["Max Born","M",1882,"Poland","",false,"pre-1940",["Science","Academia"]],
["Lise Meitner","F",1878,"Austria","",false,"pre-1940",["Science","Academia"]],
["Edward Teller","M",1908,"Hungary","",false,"1950s",["Science","Academia"]],
["Leo Szilard","M",1898,"Hungary","",false,"1940s",["Science"]],
["John von Neumann","M",1903,"Hungary","",false,"1940s",["Science","Academia","Tech"]],
["Paul Ehrlich","M",1854,"Poland","",false,"pre-1940",["Science"]],
["Rosalind Franklin","F",1920,"United Kingdom","",false,"1950s",["Science"]],
["Gertrude Elion","F",1918,"United States","New York",false,"1980s",["Science"]],
["Rita Levi-Montalcini","F",1909,"Italy","",false,"1980s",["Science"]],
["Selman Waksman","M",1888,"Ukraine","",false,"1950s",["Science"]],
["Albert Sabin","M",1906,"Poland","",false,"1950s",["Science"]],
["Baruch Spinoza","M",1632,"Netherlands","",false,"pre-1940",["Academia","Writing"]],
["Maimonides","M",1138,"Spain","",false,"pre-1940",["Academia","Writing"]],
["Emmy Noether","F",1882,"Germany","",false,"pre-1940",["Science","Academia"]],
["Norbert Wiener","M",1894,"United States","Missouri",false,"1940s",["Science","Academia"]],
["Stephen Jay Gould","M",1941,"United States","New York",false,"1980s",["Science","Writing"]],
["Jared Diamond","M",1937,"United States","Massachusetts",true,"1990s",["Science","Writing"]],
["Oliver Sacks","M",1933,"United Kingdom","",false,"1980s",["Science","Writing"]],
["Marvin Minsky","M",1927,"United States","New York",false,"1960s",["Tech","Science","Academia"]],
["Saul Bellow","M",1915,"Canada","",false,"1950s",["Writing"]],
["Norman Mailer","M",1923,"United States","New Jersey",false,"1950s",["Writing","Journalism"]],
["Joseph Heller","M",1923,"United States","New York",false,"1960s",["Writing"]],
["J.D. Salinger","M",1919,"United States","New York",false,"1950s",["Writing"]],
["Arthur Miller","M",1915,"United States","New York",false,"1940s",["Writing","Stage"]],
["Neil Simon","M",1927,"United States","New York",false,"1960s",["Writing","Stage"]],
["Tony Kushner","M",1956,"United States","New York",true,"1990s",["Writing","Stage"]],
["Isaac Bashevis Singer","M",1902,"Poland","",false,"1970s",["Writing"]],
["Sholem Aleichem","M",1859,"Ukraine","",false,"pre-1940",["Writing"]],
["Primo Levi","M",1919,"Italy","",false,"1960s",["Writing","Science"]],
["Boris Pasternak","M",1890,"Russia / USSR","",false,"1950s",["Writing"]],
["Osip Mandelstam","M",1891,"Poland","",false,"pre-1940",["Writing"]],
["Joseph Brodsky","M",1940,"Russia / USSR","",false,"1980s",["Writing"]],
["Paul Celan","M",1920,"Romania","",false,"1960s",["Writing"]],
["Amos Oz","M",1939,"Israel","",false,"1970s",["Writing"]],
["David Grossman","M",1954,"Israel","",true,"1990s",["Writing"]],
["Michael Chabon","M",1963,"United States","Washington DC",true,"1990s",["Writing"]],
["Jonathan Safran Foer","M",1977,"United States","Washington DC",true,"2000s",["Writing"]],
["Judy Blume","F",1938,"United States","New Jersey",true,"1970s",["Writing"]],
["Maurice Sendak","M",1928,"United States","New York",false,"1960s",["Writing","Art"]],
["Shel Silverstein","M",1930,"United States","Illinois",false,"1970s",["Writing","Art","Music"]],
["Stan Lee","M",1922,"United States","New York",false,"1960s",["Writing","Art"]],
["Jack Kirby","M",1917,"United States","New York",false,"1960s",["Art","Writing"]],
["Art Spiegelman","M",1948,"Sweden","",true,"1980s",["Art","Writing"]],
["Erica Jong","F",1942,"United States","New York",true,"1970s",["Writing"]],
["Gertrude Stein","F",1874,"United States","Pennsylvania",false,"pre-1940",["Writing"]],
["Dorothy Parker","F",1893,"United States","New Jersey",false,"pre-1940",["Writing"]],
["Walter Benjamin","M",1892,"Germany","",false,"1960s",["Academia","Writing"]],
["Martin Buber","M",1878,"Austria","",false,"1940s",["Academia","Writing"]],
["Ludwig Wittgenstein","M",1889,"Austria","",false,"pre-1940",["Academia","Writing"]],
["Edmund Husserl","M",1859,"Czechia","",false,"pre-1940",["Academia"]],
["Jacques Derrida","M",1930,"Algeria","",false,"1970s",["Academia","Writing"]],
["Isaiah Berlin","M",1909,"Latvia","",false,"1960s",["Academia","Writing"]],
["Leo Strauss","M",1899,"Germany","",false,"1950s",["Academia"]],
["Theodor Adorno","M",1903,"Germany","",false,"1960s",["Academia","Writing"]],
["Herbert Marcuse","M",1898,"Germany","",false,"1960s",["Academia","Writing"]],
["Émile Durkheim","M",1858,"France","",false,"pre-1940",["Academia"]],
["Marcel Proust","M",1871,"France","",false,"pre-1940",["Writing"]],
["Heinrich Heine","M",1797,"Germany","",false,"pre-1940",["Writing"]],
["Alfred Dreyfus","M",1859,"France","",false,"pre-1940",["Politics"]],
["Benjamin Disraeli","M",1804,"United Kingdom","",false,"pre-1940",["Politics","Writing"]],
["Amedeo Modigliani","M",1884,"Italy","",false,"pre-1940",["Art"]],
["Mark Rothko","M",1903,"Latvia","",false,"1950s",["Art"]],
["Roy Lichtenstein","M",1923,"United States","New York",false,"1960s",["Art"]],
["Barnett Newman","M",1905,"United States","New York",false,"1950s",["Art"]],
["Man Ray","M",1890,"United States","Pennsylvania",false,"pre-1940",["Art"]],
["Annie Leibovitz","F",1949,"United States","Connecticut",true,"1980s",["Art"]],
["Diane Arbus","F",1923,"United States","New York",false,"1960s",["Art"]],
["Richard Avedon","M",1923,"United States","New York",false,"1950s",["Art"]],
["Frank Gehry","M",1929,"Canada","",true,"1990s",["Art"]],
["Louise Nevelson","F",1899,"Ukraine","",false,"1960s",["Art"]],
["Helen Frankenthaler","F",1928,"United States","New York",false,"1960s",["Art"]],
["Sid Luckman","M",1916,"United States","New York",false,"pre-1940",["Sports"]],
["Red Auerbach","M",1917,"United States","New York",false,"1960s",["Sports"]],
["Dolph Schayes","M",1928,"United States","New York",false,"1950s",["Sports"]],
["Ryan Braun","M",1983,"United States","California",true,"2000s",["Sports"]],
["Ian Kinsler","M",1982,"United States","California",true,"2000s",["Sports"]],
["Hank Greenberg","M",1911,"United States","New York",false,"pre-1940",["Sports"]],
["Shawn Green","M",1972,"United States","Illinois",true,"1990s",["Sports"]],
["Mark Spitz","M",1950,"United States","California",true,"1970s",["Sports"]],
["Sue Bird","F",1980,"United States","New York",true,"2000s",["Sports"]],
["Dara Torres","F",1967,"United States","California",true,"1990s",["Sports"]],
["Nancy Lieberman","F",1958,"United States","New York",true,"1980s",["Sports"]],
["Bud Selig","M",1934,"United States","Wisconsin",true,"1990s",["Sports","Business"]],
["David Stern","M",1942,"United States","New York",false,"1990s",["Sports","Business"]],
["Adam Silver","M",1962,"United States","New York",true,"2010s",["Sports","Business"]],
["Robert Kraft","M",1941,"United States","Massachusetts",true,"2000s",["Sports","Business"]],
["Howard Schultz","M",1953,"United States","New York",true,"1990s",["Business"]],
["Meyer Lansky","M",1902,"Belarus","",false,"pre-1940",["Business"]],
["Arnold Rothstein","M",1882,"United States","New York",false,"pre-1940",["Business"]],
["Emma Lazarus","F",1849,"United States","New York",false,"pre-1940",["Writing"]],
["Haym Salomon","M",1740,"Poland","",false,"pre-1940",["Business","Politics"]],
["Uri Geller","M",1946,"Israel","",true,"1970s",["Stage"]],
["Monica Lewinsky","F",1973,"United States","California",true,"1990s",["Activism","Writing"]],
["Ben Shapiro","M",1984,"United States","California",true,"2010s",["Journalism","Politics"]],

/* --- batch two --- */
["Wallace Shawn","M",1943,"United States","New York",true,"1980s",["Acting","Writing","Stage"]],
["Mandy Patinkin","M",1952,"United States","Illinois",true,"1980s",["Acting","Music","Stage"]],
["Eugene Levy","M",1946,"Canada","",true,"1980s",["Comedy","Acting"]],
["Gilbert Gottfried","M",1955,"United States","New York",false,"1990s",["Comedy"]],
["David Cross","M",1964,"United States","Georgia",true,"2000s",["Comedy","Acting"]],
["Jeff Garlin","M",1962,"United States","Illinois",true,"2000s",["Comedy","Acting"]],
["Susie Essman","F",1955,"United States","New York",true,"2000s",["Comedy","Acting"]],
["Larry Charles","M",1956,"United States","New York",true,"2000s",["Film","Television","Writing"]],
["Josh Gad","M",1981,"United States","Florida",true,"2010s",["Acting","Comedy"]],
["Jason Segel","M",1980,"United States","California",true,"2000s",["Acting","Comedy"]],
["Jason Schwartzman","M",1980,"United States","California",true,"2000s",["Acting","Music"]],
["Emmy Rossum","F",1986,"United States","New York",true,"2000s",["Acting"]],
["Natasha Lyonne","F",1979,"United States","New York",true,"2010s",["Acting","Comedy"]],
["Sarah Michelle Gellar","F",1977,"United States","New York",true,"1990s",["Acting","Television"]],
["Ben Savage","M",1980,"United States","Illinois",true,"1990s",["Acting","Television"]],
["Fred Savage","M",1976,"United States","Illinois",true,"1980s",["Acting","Television"]],
["Adam Brody","M",1979,"United States","California",true,"2000s",["Acting"]],
["Alex Borstein","F",1971,"United States","Illinois",true,"2000s",["Comedy","Acting"]],
["Nick Kroll","M",1978,"United States","New York",true,"2010s",["Comedy","Acting"]],
["Chelsea Handler","F",1975,"United States","New Jersey",true,"2000s",["Comedy","Television"]],
["Michael Showalter","M",1970,"United States","New Jersey",true,"2000s",["Comedy","Film"]],
["Rachel Sennott","F",1995,"United States","Connecticut",true,"2020s",["Acting","Comedy"]],
["Alan King","M",1927,"United States","New York",false,"1960s",["Comedy","Stage"]],
["Buddy Hackett","M",1924,"United States","New York",false,"1960s",["Comedy","Acting"]],
["Phil Silvers","M",1911,"United States","New York",false,"1950s",["Comedy","Television"]],
["Elaine May","F",1932,"United States","Pennsylvania",true,"1960s",["Comedy","Film","Writing"]],
["Robert Klein","M",1942,"United States","New York",true,"1970s",["Comedy","Stage"]],
["David Steinberg","M",1942,"Canada","",true,"1970s",["Comedy","Television"]],
["Mort Sahl","M",1927,"Canada","",false,"1950s",["Comedy","Stage"]],
["Jackie Mason","M",1928,"United States","Wisconsin",false,"1980s",["Comedy","Stage"]],
["Judd Hirsch","M",1935,"United States","New York",true,"1970s",["Acting","Television"]],
["Ed Asner","M",1929,"United States","Missouri",false,"1970s",["Acting","Television"]],
["Michael Landon","M",1936,"United States","New York",false,"1970s",["Acting","Television"]],
["Lorne Michaels","M",1944,"Canada","",true,"1970s",["Television","Comedy"]],
["Eddie Cantor","M",1892,"United States","New York",false,"pre-1940",["Comedy","Music","Stage"]],
["Fanny Brice","F",1891,"United States","New York",false,"pre-1940",["Comedy","Stage"]],
["Sophie Tucker","F",1886,"Ukraine","",false,"pre-1940",["Music","Stage"]],
["Molly Picon","F",1898,"United States","New York",false,"pre-1940",["Acting","Stage"]],
["Al Jolson","M",1886,"Lithuania","",false,"pre-1940",["Music","Acting","Stage"]],
["Theodore Bikel","M",1924,"Austria","",false,"1960s",["Acting","Music","Stage"]],
["Herb Alpert","M",1935,"United States","California",true,"1960s",["Music","Business"]],
["Neil Sedaka","M",1939,"United States","New York",true,"1960s",["Music"]],
["Carole Bayer Sager","F",1944,"United States","New York",true,"1970s",["Music"]],
["Jerry Leiber","M",1933,"United States","Maryland",false,"1950s",["Music"]],
["Mike Stoller","M",1933,"United States","New York",true,"1950s",["Music"]],
["Phil Spector","M",1939,"United States","New York",false,"1960s",["Music"]],
["Doc Pomus","M",1925,"United States","New York",false,"1950s",["Music"]],
["Clive Davis","M",1932,"United States","New York",true,"1970s",["Business","Music"]],
["Cass Elliot","F",1941,"United States","Maryland",false,"1960s",["Music"]],
["Kinky Friedman","M",1944,"United States","Illinois",false,"1970s",["Music","Writing"]],
["Adam Duritz","M",1964,"United States","Maryland",true,"1990s",["Music"]],
["David Lee Roth","M",1954,"United States","Indiana",true,"1980s",["Music"]],
["Joey Ramone","M",1951,"United States","New York",false,"1970s",["Music"]],
["Tommy Ramone","M",1949,"Hungary","",false,"1970s",["Music"]],
["Lisa Loeb","F",1968,"United States","Maryland",true,"1990s",["Music"]],
["Matisyahu","M",1979,"United States","Pennsylvania",true,"2000s",["Music"]],
["Ezra Koenig","M",1984,"United States","New York",true,"2000s",["Music"]],
["Jack Antonoff","M",1984,"United States","New Jersey",true,"2010s",["Music"]],
["Este Haim","F",1986,"United States","California",true,"2010s",["Music"]],
["Danielle Haim","F",1989,"United States","California",true,"2010s",["Music"]],
["Alana Haim","F",1991,"United States","California",true,"2010s",["Music","Acting"]],
["Mark Ronson","M",1975,"United Kingdom","",true,"2000s",["Music"]],
["Diane Warren","F",1956,"United States","California",true,"1990s",["Music"]],
["Ofra Haza","F",1957,"Israel","",false,"1980s",["Music"]],
["Idan Raichel","M",1977,"Israel","",true,"2000s",["Music"]],
["Shlomo Carlebach","M",1925,"Germany","",false,"1970s",["Music"]],
["Benny Leonard","M",1896,"United States","New York",false,"pre-1940",["Sports"]],
["Barney Ross","M",1909,"United States","New York",false,"pre-1940",["Sports"]],
["Nat Holman","M",1896,"United States","New York",false,"pre-1940",["Sports"]],
["Marv Levy","M",1925,"United States","Illinois",false,"1990s",["Sports"]],
["Al Rosen","M",1924,"United States","South Carolina",false,"1950s",["Sports"]],
["Omri Casspi","M",1988,"Israel","",true,"2010s",["Sports"]],
["Deni Avdija","M",2001,"Israel","",true,"2020s",["Sports"]],
["Sasha Cohen","F",1984,"United States","California",true,"2000s",["Sports"]],
["Jason Lezak","M",1975,"United States","California",true,"2000s",["Sports"]],
["Lenny Krayzelburg","M",1975,"Ukraine","",true,"2000s",["Sports"]],
["Ágnes Keleti","F",1921,"Hungary","",false,"1950s",["Sports"]],
["Wolfgang Pauli","M",1900,"Austria","",false,"pre-1940",["Science","Academia"]],
["Otto Frisch","M",1904,"Austria","",false,"1940s",["Science"]],
["Hans Bethe","M",1906,"Germany","",false,"1940s",["Science","Academia"]],
["Murray Gell-Mann","M",1929,"United States","New York",false,"1960s",["Science","Academia"]],
["Sheldon Glashow","M",1932,"United States","New York",true,"1970s",["Science","Academia"]],
["Steven Weinberg","M",1933,"United States","New York",false,"1970s",["Science","Academia"]],
["Carl Djerassi","M",1923,"Austria","",false,"1960s",["Science","Writing"]],
["Gregory Pincus","M",1903,"United States","New Jersey",false,"1960s",["Science"]],
["Stanley Milgram","M",1933,"United States","New York",false,"1960s",["Science","Academia"]],
["Solomon Asch","M",1907,"Poland","",false,"1950s",["Science","Academia"]],
["Abraham Maslow","M",1908,"United States","New York",false,"1960s",["Science","Academia"]],
["Erik Erikson","M",1902,"Germany","",false,"1960s",["Science","Academia"]],
["Bruno Bettelheim","M",1903,"Austria","",false,"1960s",["Science","Academia"]],
["Anna Freud","F",1895,"Austria","",false,"1950s",["Science","Academia"]],
["Melanie Klein","F",1882,"Austria","",false,"pre-1940",["Science","Academia"]],
["Viktor Frankl","M",1905,"Austria","",false,"1950s",["Science","Writing"]],
["Robert Aumann","M",1930,"Germany","",true,"2000s",["Academia","Science"]],
["Paul Samuelson","M",1915,"United States","Indiana",false,"1970s",["Academia"]],
["Kenneth Arrow","M",1921,"United States","New York",false,"1970s",["Academia"]],
["Robert Solow","M",1924,"United States","New York",false,"1980s",["Academia"]],
["Larry Summers","M",1954,"United States","Connecticut",true,"1990s",["Academia","Politics"]],
["Jeffrey Sachs","M",1954,"United States","Michigan",true,"1990s",["Academia"]],
["Judith Butler","F",1956,"United States","Ohio",true,"1990s",["Academia","Writing"]],
["Peter Singer","M",1946,"Australia","",true,"1990s",["Academia","Writing"]],
["Hannah Arendt","F",1906,"Germany","",false,"1960s",["Academia","Writing"]],
["Yuval Noah Harari","M",1976,"Israel","",true,"2010s",["Writing","Academia"]],
["Abraham Joshua Heschel","M",1907,"Poland","",false,"1960s",["Academia","Activism","Writing"]],
["Joseph Soloveitchik","M",1903,"Belarus","",false,"1960s",["Academia"]],
["Menachem Mendel Schneerson","M",1902,"Ukraine","",false,"1970s",["Academia","Activism"]],
["Meir Kahane","M",1932,"United States","New York",false,"1970s",["Politics","Activism"]],
["Levi Eshkol","M",1895,"Ukraine","",false,"1960s",["Politics"]],
["Yitzhak Shamir","M",1915,"Belarus","",false,"1980s",["Politics"]],
["Ehud Olmert","M",1945,"Israel","",true,"2000s",["Politics"]],
["Tzipi Livni","F",1958,"Israel","",true,"2000s",["Politics"]],
["Avigdor Lieberman","M",1958,"Moldova","",true,"2000s",["Politics"]],
["Isaac Herzog","M",1960,"Israel","",true,"2020s",["Politics"]],
["Abba Eban","M",1915,"South Africa","",false,"1960s",["Politics","Writing"]],
["Yehuda Amichai","M",1924,"Germany","",false,"1960s",["Writing"]],
["S.Y. Agnon","M",1887,"Ukraine","",false,"1960s",["Writing"]],
["Etgar Keret","M",1967,"Israel","",true,"1990s",["Writing"]],
["Ephraim Kishon","M",1924,"Hungary","",false,"1960s",["Writing","Film"]],
["Shira Haas","F",1995,"Israel","",true,"2010s",["Acting"]],
["Lior Raz","M",1971,"Israel","",true,"2010s",["Acting","Writing"]],
["Bar Refaeli","F",1985,"Israel","",true,"2000s",["Business","Acting"]],
["Thomas Friedman","M",1953,"United States","Minnesota",true,"1990s",["Journalism","Writing"]],
["David Brooks","M",1961,"Canada","",true,"2000s",["Journalism","Writing"]],
["Ezra Klein","M",1984,"United States","California",true,"2010s",["Journalism"]],
["Matt Drudge","M",1966,"United States","Maryland",true,"1990s",["Journalism"]],
["Nate Silver","M",1978,"United States","Michigan",true,"2010s",["Journalism","Academia"]],
["Jake Tapper","M",1969,"United States","New York",true,"2010s",["Journalism","Television"]],
["Jeffrey Goldberg","M",1965,"United States","New York",true,"2000s",["Journalism"]],
["Seymour Hersh","M",1937,"United States","Illinois",true,"1970s",["Journalism","Writing"]],
["I.F. Stone","M",1907,"United States","Pennsylvania",false,"1960s",["Journalism","Writing"]],
["Daniel Pearl","M",1963,"United States","New Jersey",false,"2000s",["Journalism"]],
["A.M. Rosenthal","M",1922,"Canada","",false,"1970s",["Journalism"]],
["Arthur Ochs Sulzberger","M",1926,"United States","New York",false,"1970s",["Business","Journalism"]],
["Joseph Pulitzer","M",1847,"Hungary","",false,"pre-1940",["Journalism","Business"]],
["Bari Weiss","F",1984,"United States","Pennsylvania",true,"2010s",["Journalism","Writing"]],
["Daniel Libeskind","M",1946,"Poland","",true,"2000s",["Art"]],
["Moshe Safdie","M",1938,"Israel","",true,"1970s",["Art"]],
["Richard Meier","M",1934,"United States","New Jersey",true,"1990s",["Art"]],
["Sol LeWitt","M",1928,"United States","Connecticut",false,"1970s",["Art"]],
["Eva Hesse","F",1936,"Germany","",false,"1960s",["Art"]],
["Lee Krasner","F",1908,"United States","New York",false,"1950s",["Art"]],
["Ben Shahn","M",1898,"Lithuania","",false,"pre-1940",["Art"]],
["Alfred Stieglitz","M",1864,"United States","New Jersey",false,"pre-1940",["Art"]],
["Weegee","M",1899,"Ukraine","",false,"1940s",["Art","Journalism"]],
["Robert Capa","M",1913,"Hungary","",false,"1940s",["Art","Journalism"]],
["Helmut Newton","M",1920,"Germany","",false,"1970s",["Art"]],
["Garry Winogrand","M",1928,"United States","New York",false,"1970s",["Art"]],
["Calvin Klein","M",1942,"United States","New York",true,"1970s",["Business","Art"]],
["Donna Karan","F",1948,"United States","New York",true,"1980s",["Business","Art"]],
["Isaac Mizrahi","M",1961,"United States","New York",true,"1990s",["Business","Art"]],
["Marc Jacobs","M",1963,"United States","New York",true,"1990s",["Business","Art"]],
["Diane von Furstenberg","F",1946,"Belgium","",true,"1970s",["Business","Art"]],
["Leonard Lauder","M",1933,"United States","New York",true,"1980s",["Business"]],
["Ronald Lauder","M",1944,"United States","New York",true,"1990s",["Business","Politics"]],
["Steve Wynn","M",1942,"United States","Connecticut",true,"1990s",["Business"]],
["Eli Broad","M",1933,"United States","New York",false,"1990s",["Business"]],
["Sanford Weill","M",1933,"United States","New York",true,"1990s",["Business"]],
["Robert Rubin","M",1938,"United States","New York",true,"1990s",["Politics","Business"]],
["Larry Fink","M",1952,"United States","California",true,"2000s",["Business"]],
["Stephen Schwarzman","M",1947,"United States","Pennsylvania",true,"2000s",["Business"]],
["Leon Black","M",1951,"United States","New York",true,"2000s",["Business"]],
["David Rubenstein","M",1949,"United States","Maryland",true,"2000s",["Business"]],
["Ray Kurzweil","M",1948,"United States","New York",true,"1990s",["Tech","Science","Writing"]],
["Paul Baran","M",1926,"Poland","",false,"1990s",["Tech"]],
["Leonard Kleinrock","M",1934,"United States","New York",true,"1990s",["Tech","Academia"]],
["Judea Pearl","M",1936,"Israel","",true,"2000s",["Tech","Academia"]],
["Ilya Sutskever","M",1986,"Russia / USSR","",true,"2010s",["Tech","Science"]],
["Steven Pinker","M",1954,"Canada","",true,"2000s",["Academia","Science","Writing"]],
["Sam Bankman-Fried","M",1992,"United States","California",true,"2020s",["Business","Tech"]],
["Adam Neumann","M",1979,"Israel","",true,"2010s",["Business"]],
["David Sacks","M",1972,"South Africa","",true,"2010s",["Tech","Business"]],
["Aaron Swartz","M",1986,"United States","Illinois",false,"2010s",["Tech","Activism"]],
["James L. Brooks","M",1940,"United States","New York",true,"1980s",["Television","Film"]],
["Garry Marshall","M",1934,"United States","New York",false,"1970s",["Television","Film"]],
["Penny Marshall","F",1943,"United States","New York",false,"1970s",["Acting","Film","Television"]],
["Sherry Lansing","F",1944,"United States","Illinois",true,"1990s",["Business","Film"]],
["Amy Pascal","F",1958,"United States","California",true,"2000s",["Business","Film"]],
["Brian Grazer","M",1951,"United States","California",true,"1990s",["Film","Business"]],
["Jerry Bruckheimer","M",1943,"United States","Michigan",true,"1990s",["Film","Business"]],
["Joel Silver","M",1952,"United States","New Jersey",true,"1990s",["Film","Business"]],
["Robert Evans","M",1930,"United States","New York",false,"1970s",["Film","Business"]],
["William Friedkin","M",1935,"United States","Illinois",false,"1970s",["Film"]],
["Paul Mazursky","M",1930,"United States","New York",false,"1970s",["Film","Writing"]],
["John Landis","M",1950,"United States","Illinois",true,"1980s",["Film"]],
["Barry Levinson","M",1942,"United States","Maryland",true,"1980s",["Film","Writing"]],
["Nancy Meyers","F",1949,"United States","Pennsylvania",true,"1990s",["Film","Writing"]],
["Noah Baumbach","M",1969,"United States","New York",true,"2000s",["Film","Writing"]],
["Benny Safdie","M",1986,"United States","New York",true,"2010s",["Film","Acting"]],
["Josh Safdie","M",1984,"United States","New York",true,"2010s",["Film"]],
["Ari Aster","M",1986,"United States","New York",true,"2010s",["Film","Writing"]],
["Lena Dunham","F",1986,"United States","New York",true,"2010s",["Television","Film","Writing"]],
["Jill Soloway","F",1965,"United States","Illinois",true,"2010s",["Television","Writing"]],
["Matt Weiner","M",1965,"United States","Maryland",true,"2000s",["Television","Writing"]],
["Larry Gelbart","M",1928,"United States","Illinois",false,"1970s",["Television","Writing"]],
["Sherwood Schwartz","M",1916,"United States","New York",false,"1960s",["Television","Writing"]],
["Aaron Spelling","M",1923,"United States","Texas",false,"1970s",["Television","Business"]],

/* --- batch three: contemporary --- */
["Allen Ginsberg","M",1926,"United States","New Jersey",false,"1950s",["Writing"]],
["Alison Brie","F",1982,"United States","California",true,"2010s",["Acting","Comedy"]],
["Jenny Slate","F",1982,"United States","Massachusetts",true,"2010s",["Comedy","Acting"]],
["Gaby Hoffmann","F",1982,"United States","New York",true,"2010s",["Acting"]],
["Amanda Peet","F",1972,"United States","New York",true,"2000s",["Acting"]],
["Lea Michele","F",1986,"United States","New York",true,"2010s",["Acting","Music","Stage"]],
["Itzhak Perlman","M",1945,"Israel","",true,"1960s",["Music"]],
["Josh Peck","M",1986,"United States","New York",true,"2000s",["Acting","Comedy"]],
["Emily Ratajkowski","F",1991,"United Kingdom","",true,"2010s",["Acting","Business","Writing"]],
["Marc Chagall","M",1887,"Russia / USSR","",false,"pre-1940",["Art"]],
["Vanessa Bayer","F",1981,"United States","Ohio",true,"2010s",["Comedy","Acting"]],
["Cazzie David","F",1994,"United States","California",true,"2010s",["Writing","Comedy"]],
["Leon Trotsky","M",1879,"Russia / USSR","",false,"pre-1940",["Politics","Writing"]],
["David Draiman","M",1973,"United States","New York",true,"2000s",["Music"]],
["Scott Ian","M",1963,"United States","New York",true,"1980s",["Music"]],
["Perry Farrell","M",1959,"United States","New York",true,"1990s",["Music"]],
["Mike Gordon","M",1965,"United States","New Jersey",true,"1990s",["Music"]],
["Jon Fishman","M",1965,"United States","Pennsylvania",true,"1990s",["Music"]],
["Brian Epstein","M",1934,"United Kingdom","",false,"1960s",["Business","Music"]],
["Malcolm McLaren","M",1946,"United Kingdom","",false,"1970s",["Business","Music"]],
["Mick Jones","M",1955,"United Kingdom","",true,"1970s",["Music"]],
["Laura Nyro","F",1947,"United States","New York",false,"1960s",["Music"]],
["Janis Ian","F",1951,"United States","New York",true,"1960s",["Music"]],
["Peter Yarrow","M",1938,"United States","New York",false,"1960s",["Music"]],
["Arlo Guthrie","M",1947,"United States","New York",true,"1960s",["Music"]],
["Al Kooper","M",1944,"United States","New York",true,"1960s",["Music"]],
["Robbie Robertson","M",1943,"Canada","",false,"1960s",["Music"]],
["Nicole Krauss","F",1974,"United States","New York",true,"2000s",["Writing"]],
["Gary Shteyngart","M",1972,"Russia / USSR","",true,"2000s",["Writing"]],
["Nathan Englander","M",1970,"United States","New York",true,"2000s",["Writing"]],
["Joshua Cohen","M",1980,"United States","New Jersey",true,"2020s",["Writing"]],
["Andrew Ross Sorkin","M",1977,"United States","New York",true,"2010s",["Journalism","Writing"]],
["Dave Portnoy","M",1977,"United States","Massachusetts",true,"2010s",["Business","Journalism"]],
["Scott Galloway","M",1964,"United States","New York",true,"2010s",["Academia","Business"]],
["Alex Karp","M",1967,"United States","New York",true,"2010s",["Tech","Business"]],
["Michael Rubin","M",1972,"United States","Pennsylvania",true,"2010s",["Business"]],
["Jeremy Stoppelman","M",1977,"United States","Virginia",true,"2000s",["Tech","Business"]],
["Neil Blumenthal","M",1980,"United States","New York",true,"2010s",["Business"]],
["Merrick Garland","M",1952,"United States","Illinois",true,"2020s",["Law","Politics"]],
["Antony Blinken","M",1962,"United States","New York",true,"2020s",["Politics"]],
["Jamie Raskin","M",1962,"United States","Washington DC",true,"2020s",["Politics","Law"]],
["Adam Schiff","M",1960,"United States","Massachusetts",true,"2010s",["Politics","Law"]],
["Jerry Nadler","M",1947,"United States","New York",true,"2010s",["Politics"]],
["Debbie Wasserman Schultz","F",1966,"United States","New York",true,"2010s",["Politics"]],
["Ben Cardin","M",1943,"United States","Maryland",true,"2010s",["Politics"]],
["Brian Schatz","M",1972,"United States","Michigan",true,"2010s",["Politics"]],
["Jared Polis","M",1975,"United States","California",true,"2010s",["Politics","Tech"]],
["Josh Shapiro","M",1973,"United States","Pennsylvania",true,"2020s",["Politics","Law"]],
["Jordan Farmar","M",1986,"United States","California",true,"2000s",["Sports"]],
["Theodor Herzl","M",1860,"Hungary","",false,"pre-1940",["Politics","Journalism","Activism"]],
["Lenny Bruce","M",1925,"United States","New York",false,"1950s",["Comedy","Stage"]],
];

/* ---- ANSWERABLE ADDITIONS: imported from new_answerable_jews.csv ----
   Existing IDs replace their probe/core record; new IDs extend the roster. */
const ANSWERABLE_ADDITIONS = [
[1451,"Sam Bankman-Fried","M",1992,"United States","California",true,"2020s",["Business","Tech"],"FTX founder convicted of fraud and conspiracy for stealing billions in customer funds; sentenced to 25 years in federal prison.",["Built a crypto exchange whose logo appeared on an NBA arena","Known by three initials and an unruly mop of hair","Convicted after FTX collapsed and sentenced to 25 years in federal prison"]],
[1138,"Bernie Madoff","M",1938,"United States","New York",false,"2000s",["Business"],"Financier behind the largest Ponzi scheme in history; sentenced to 150 years and died in federal prison.",["Promised clients remarkably steady investment returns","His name became synonymous with massive financial fraud","Ran the largest Ponzi scheme in history and received a 150-year sentence"]],
[1530,"Jeffrey Epstein","M",1953,"United States","New York",false,"2000s",["Business"],"Financier and convicted sex offender who cultivated an elite social network; died in federal custody while awaiting trial on sex-trafficking charges.",["Went from teaching at the Dalton School to working on Wall Street","Owned a private island and socialized with politicians, royals, and billionaires","A convicted sex offender who died in jail before his 2019 federal trial"]],
[1130,"Harvey Weinstein","M",1952,"United States","New York",true,"1990s",["Film","Business"],"Co-founder of Miramax and formerly powerful film producer. Reporting about his sexual abuse helped ignite #MeToo; he was convicted of sex crimes in California and New York.",["His studio released Pulp Fiction, Good Will Hunting, and Shakespeare in Love","2017 reporting about numerous accusers helped ignite the #MeToo movement","Convicted of rape and sexual assault in California and of a criminal sexual act in New York"]],
[32,"Woody Allen","M",1935,"United States","New York",true,"1970s",["Comedy","Film","Writing"],"Filmmaker and comedian. Annie Hall and Manhattan. Accused by adopted daughter Dylan Farrow of childhood sexual abuse; he denies it and was never charged.",["Neurotic New Yorker with a clarinet","Married Soon-Yi Previn, the adopted daughter of his former partner Mia Farrow","Accused by adopted daughter Dylan Farrow of childhood sexual abuse; he denies it and was never charged"]],
[1105,"Roman Polanski","M",1933,"France","",true,"1960s",["Film"],"Oscar-winning director of Rosemary's Baby, Chinatown, and The Pianist. Pleaded guilty in 1977 to unlawful sexual intercourse with a minor and fled the U.S. before sentencing.",["Survived the Kraków Ghetto; his mother was murdered at Auschwitz","Directed Rosemary's Baby, Chinatown, and The Pianist","Pleaded guilty in a case involving a 13-year-old, then fled the United States before sentencing"]],
[1001,"Jason Alexander","M",1959,"United States","New Jersey",true,"1990s",["Acting","Comedy","Television"],"Actor and comedian best known as George Costanza on Seinfeld.",["Won a Tony before becoming a sitcom icon","Voiced the title character on Duckman","Played George Costanza, master of bad instincts and elaborate lies"]],
[1008,"David Schwimmer","M",1966,"United States","New York",true,"1990s",["Acting","Comedy","Television"],"Actor and director best known as Ross Geller on Friends.",["Voiced Melman the anxious giraffe in Madagascar","His sitcom character insisted they were on a break","Played paleontologist Ross Geller on Friends"]],
[1052,"Andy Samberg","M",1978,"United States","California",true,"2000s",["Comedy","Acting","Music","Television"],"Comedian, actor, and musician. Saturday Night Live, The Lonely Island, and Brooklyn Nine-Nine.",["Helped make SNL's digital shorts an internet phenomenon","One-third of the comedy music group The Lonely Island","Played detective Jake Peralta on Brooklyn Nine-Nine"]],
[1285,"Eugene Levy","M",1946,"Canada","",true,"1980s",["Comedy","Acting","Television"],"Canadian actor and comedian. SCTV, American Pie, and Schitt's Creek.",["Extremely expressive eyebrows","Played Jim's painfully earnest father in American Pie","Co-starred as Johnny Rose with his real-life son on Schitt's Creek"]],
[1531,"Dan Levy","M",1983,"Canada","",true,"2010s",["Acting","Comedy","Television","Writing"],"Canadian actor, writer, and co-creator of Schitt's Creek.",["Started as an MTV Canada host","Co-created a sitcom with his real-life father Eugene","Played sweater-loving David Rose on Schitt's Creek"]],
[1025,"Rashida Jones","F",1976,"United States","California",true,"2000s",["Acting","Television"],"Actor, writer, and producer known for The Office and Parks and Recreation.",["Daughter of Quincy Jones and Peggy Lipton","Played Karen Filippelli on The Office","Was Ann Perkins, Leslie Knope's beautiful tropical fish"]],
[1296,"Sarah Michelle Gellar","F",1977,"United States","New York",true,"1990s",["Acting","Television"],"Actor best known for Buffy the Vampire Slayer, Cruel Intentions, and Scooby-Doo.",["Played Daphne in two live-action Scooby-Doo movies","Traded dangerous bets with Ryan Phillippe in Cruel Intentions","Saved Sunnydale as Buffy the Vampire Slayer"]],
[1291,"Josh Gad","M",1981,"United States","Florida",true,"2010s",["Acting","Comedy","Stage"],"Actor and comedian known for Frozen, The Book of Mormon, and Beauty and the Beast.",["Originated Elder Cunningham in The Book of Mormon on Broadway","Played LeFou in a live-action Disney remake","Voices Olaf, the snowman who likes warm hugs"]],
[1019,"Zoë Kravitz","F",1988,"United States","California",true,"2010s",["Acting","Music"],"Actor and musician known for Big Little Lies, High Fidelity, and The Batman.",["Daughter of Lenny Kravitz and Lisa Bonet","Led a television remake of High Fidelity","Played Catwoman opposite Robert Pattinson's Batman"]],
[1012,"Joseph Gordon-Levitt","M",1981,"United States","California",true,"2000s",["Acting","Film"],"Actor and filmmaker. 3rd Rock from the Sun, (500) Days of Summer, and Inception.",["Grew up playing an alien disguised as a teenager on television","Had a nonlinear romance with Summer","Joined Leonardo DiCaprio's dream-heist team in Inception"]],
[1015,"Alicia Silverstone","F",1976,"United States","California",true,"1990s",["Acting"],"Actor best known as Cher Horowitz in Clueless.",["Appeared in several Aerosmith videos before her biggest film","Her most famous character gave makeovers and matchmaking advice","Played Cher Horowitz in Clueless: as if!"]],
[1013,"Andrew Garfield","M",1983,"United States","California",true,"2010s",["Acting","Film","Stage"],"British-American actor. The Social Network, The Amazing Spider-Man, and tick, tick... BOOM!",["Played Facebook co-founder Eduardo Saverin","Was the big-screen Spider-Man between Tobey Maguire and Tom Holland","Sang as Jonathan Larson in tick, tick... BOOM!"]],
[1295,"Natasha Lyonne","F",1979,"United States","New York",true,"2010s",["Acting","Comedy","Television"],"Actor, writer, and director known for Orange Is the New Black and Russian Doll.",["Distinctive raspy voice and New York delivery","Played Nicky Nichols in a women's prison dramedy","Kept dying and restarting the same night in Russian Doll"]],
[1050,"Fran Drescher","F",1957,"United States","New York",true,"1990s",["Acting","Television","Comedy"],"Actor and comedian best known for creating and starring in The Nanny.",["A nasal Queens accent and an unmistakable laugh","Her breakout character came from Flushing","Played Fran Fine on The Nanny"]],
[1059,"Howard Stern","M",1954,"United States","New York",true,"1990s",["Journalism","Comedy","Television"],"Radio personality and interviewer who calls himself the King of All Media.",["Long hair, sunglasses, and a studio full of recurring characters","Moved his long-running radio show to SiriusXM","Calls himself the King of All Media"]],
[1079,"Neil Diamond","M",1941,"United States","New York",true,"1960s",["Music","Writing"],"Brooklyn-born singer-songwriter behind Sweet Caroline and many other pop standards.",["Wrote I'm a Believer before the Monkees made it a hit","A sequined-shirt concert institution","Good times never seemed so good in Sweet Caroline"]],
[1340,"Jack Antonoff","M",1984,"United States","New Jersey",true,"2010s",["Music"],"Musician and producer behind Bleachers and major albums by Taylor Swift, Lorde, and Lana Del Rey.",["Played guitar in the band that recorded We Are Young","Fronts Bleachers and celebrates his New Jersey roots","Frequent studio collaborator of Taylor Swift, Lorde, and Lana Del Rey"]],
[1532,"P!nk","F",1979,"United States","Pennsylvania",true,"2000s",["Music"],"Pop-rock singer and songwriter born Alecia Moore, known for powerful vocals and aerial live performances.",["Born Alecia Moore in Pennsylvania","Often sings while performing aerial acrobatics above the crowd","Told everyone to Get the Party Started"]],
[1533,"Jack Black","M",1969,"United States","California",true,"2000s",["Acting","Comedy","Music"],"Actor, comedian, and musician. School of Rock, Kung Fu Panda, and Tenacious D.",["One half of the comedy-rock duo Tenacious D","Taught children to shred in School of Rock","Voices the enthusiastic panda Po"]],
[81,"Kevin Youkilis","M",1979,"United States","Ohio",true,"2000s",["Sports"],"Former Boston Red Sox first baseman and third baseman; three-time All-Star and two-time World Series champion.",["Known for an unusual batting stance and a talent for getting on base","Nicknamed the Greek God of Walks in Moneyball","Won two World Series championships with the Boston Red Sox"]],
[1512,"Scott Galloway","M",1964,"United States","New York",true,"2010s",["Academia","Business"],"NYU Stern professor, entrepreneur, author, and outspoken commentator on technology, wealth, and young men.",["Marketing professor at NYU Stern","Co-hosts Pivot with Kara Swisher","Known online as Prof G"]],
[54,"Benjamin Netanyahu","M",1949,"Israel","",true,"1990s",["Politics"],"Israeli politician known as Bibi and the country's longest-serving prime minister.",["Studied architecture and management at MIT","His brother Yonatan was killed leading the Entebbe rescue mission","Known as Bibi; Israel's longest-serving prime minister"]],
[68,"Sam Altman","M",1985,"United States","Illinois",true,"2010s",["Tech","Business"],"Technology entrepreneur, former Y Combinator president, and co-founder and CEO of OpenAI.",["Previously led the startup accelerator Y Combinator","Was abruptly fired and reinstated during a five-day board crisis in 2023","Co-founded and leads the company behind ChatGPT"]],
[19,"Jerry Seinfeld","M",1954,"United States","New York",true,"1990s",["Comedy","Television","Acting"],"Stand-up comedian and co-creator of Seinfeld.",["Co-created a show famously described as being about nothing","Voiced the lead insect in Bee Movie","Later drove comedians around to get coffee"]],
[27,"Sacha Baron Cohen","M",1971,"United Kingdom","",true,"2000s",["Comedy","Acting"],"British comedian and actor known for Ali G, Borat, and Brüno.",["Cambridge-educated master of staying in character","First broke through as Ali G","Played a fictional reporter from Kazakhstan"]],
[58,"Wolf Blitzer","M",1948,"Germany","",true,"1990s",["Journalism","Television"],"Journalist and longtime CNN anchor of The Situation Room.",["Born in postwar Germany to Holocaust survivors","A longtime face of CNN election-night coverage","Hosts The Situation Room"]],
[55,"Chuck Schumer","M",1950,"United States","New York",true,"2000s",["Politics"],"Brooklyn-born U.S. senator from New York and longtime Democratic congressional leader.",["Harvard Law graduate who entered elected office in his twenties","Related to comedian Amy Schumer","New York senator known for visiting all 62 counties every year"]],
[52,"Michael Bloomberg","M",1942,"United States","Massachusetts",true,"2000s",["Politics","Business"],"Founder of Bloomberg L.P., philanthropist, and three-term mayor of New York City.",["Grew up in Medford, Massachusetts","Financial data terminals carry his name","Served three terms as mayor of New York City"]],
[1526,"Josh Shapiro","M",1973,"United States","Pennsylvania",true,"2020s",["Politics","Law"],"Pennsylvania politician who served as state attorney general before becoming governor.",["Former attorney general of Pennsylvania","Oversaw the rapid reopening of a collapsed stretch of Interstate 95","Elected governor of Pennsylvania in 2022"]],
[34,"Bob Dylan","M",1941,"United States","Minnesota",true,"1960s",["Music","Writing"],"Singer-songwriter and Nobel laureate in Literature, born Robert Zimmerman.",["Born Robert Zimmerman in Minnesota","Caused a folk-world uproar by going electric at Newport","Won the Nobel Prize in Literature"]],
[0,"Scarlett Johansson","F",1984,"United States","New York",true,"2000s",["Acting"],"Actor and one of the highest-grossing film leads of her generation.",["Voiced an operating system opposite Joaquin Phoenix","Played a Marvel superspy for more than a decade","Her character Natasha Romanoff is also called Black Widow"]],
[1005,"Gwyneth Paltrow","F",1972,"United States","California",true,"1990s",["Acting","Business"],"Oscar-winning actor and founder of the lifestyle company Goop.",["Won an Oscar for Shakespeare in Love","Founded the wellness and lifestyle company Goop","Won a widely watched Utah trial over a ski-slope collision"]],
[1534,"Billy Eichner","M",1978,"United States","New York",true,"2010s",["Comedy","Acting","Television"],"Comedian, actor, and creator of Billy on the Street.",["Had a Madonna-themed bar mitzvah","Became famous sprinting around New York and shouting questions at pedestrians","Created Billy on the Street and co-wrote and starred in Bros"]],
[1034,"Rob Reiner","M",1947,"United States","New York",false,"1970s",["Film","Acting"],"Actor turned director. Played Michael \"Meathead\" Stivic on All in the Family, then directed This Is Spinal Tap, The Princess Bride, When Harry Met Sally..., and A Few Good Men. He and his wife Michele were stabbed to death in Brentwood in December 2025; their son Nick was indicted and has pleaded not guilty.",["Hollywood's most reliable liberal scold, and the son of an even more famous comedian","Directed a mockumentary about a band whose amplifiers go to eleven","Played Meathead on All in the Family; in December 2025 he and his wife were stabbed to death and their son was charged with the killings"]],
[1044,"Billy Crystal","M",1948,"United States","New York",true,"1980s",["Comedy","Acting"],"Comedian and actor. When Harry Met Sally..., City Slickers, and Monsters, Inc., plus nine turns hosting the Academy Awards.",["Played one of American television's first openly gay recurring characters, in the 1970s","Voiced a one-eyed green monster who coaches a nervous scarer","Told Meg Ryan that men and women can never be friends"]],
[1058,"Bob Saget","M",1956,"United States","Pennsylvania",false,"1990s",["Comedy","Television"],"Comedian and actor. The wholesome father on Full House and host of America's Funniest Home Videos, with a famously filthy stand-up act. Died in 2022 of head trauma in an Orlando hotel room.",["America's wholesome television dad had one of the filthiest stand-up acts alive","Told an infamously obscene version of a joke called The Aristocrats","Played Danny Tanner on Full House; found dead in a hotel room in 2022 from a head injury"]],
[1409,"Jake Tapper","M",1969,"United States","New York",true,"2010s",["Journalism","Television"],"CNN anchor and chief Washington correspondent who hosts The Lead and State of the Union.",["A Washington anchor who writes political thrillers on the side","Co-wrote a bestseller about a president's decline, then got accused of being late to report it himself","CNN's anchor of The Lead and State of the Union"]],
[1472,"Ari Aster","M",1986,"United States","New York",true,"2010s",["Film","Writing"],"Writer and director of unsettling A24 films: Hereditary, Midsommar, and Beau Is Afraid.",["His debut feature dispatched a child with a telephone pole and never let up","Set a horror film in the endless daylight of a Swedish summer festival","Directed Hereditary and Midsommar"]],
[1481,"Jenny Slate","F",1982,"United States","Massachusetts",true,"2010s",["Comedy","Acting"],"Comedian and actor. Saturday Night Live, Obvious Child, Parks and Recreation, and the voice of Marcel the Shell.",["Dropped an f-bomb in her very first sketch and lasted exactly one season","Quit voicing a biracial cartoon teenager, saying the part belonged to a Black actor","Voiced Marcel the Shell and starred in Obvious Child"]],
[1511,"Dave Portnoy","M",1977,"United States","Massachusetts",true,"2010s",["Business","Journalism"],"Founder of Barstool Sports, known for his one-bite pizza reviews and a combative online persona.",["Sold his company for $551 million, then bought the whole thing back for a single dollar","Reviews pizza one bite at a time and has feuded with most of the internet","Founded Barstool Sports and calls himself El Presidente"]],
];

/* ---- PROBE ADDITIONS: valid comparison guesses, never mystery answers ----
   [id, name, gender, birthYear, country, USstate, living, era, fields] */
const PROBE_ADDITIONS = [
[2000,"Seth Green","M",1974,"United States","Pennsylvania",true,"1990s",["Acting","Comedy","Television"]],
[2001,"Jason Biggs","M",1978,"United States","New Jersey",true,"1990s",["Acting","Comedy"]],
[2002,"Hank Azaria","M",1964,"United States","New York",true,"1990s",["Acting","Comedy","Television"]],
[2003,"David Duchovny","M",1960,"United States","New York",true,"1990s",["Acting","Television"]],
[2004,"Julianna Margulies","F",1966,"United States","New York",true,"1990s",["Acting","Television"]],
[2005,"B.J. Novak","M",1979,"United States","Massachusetts",true,"2000s",["Acting","Comedy","Writing","Television"]],
[2006,"Liev Schreiber","M",1967,"United States","California",true,"2000s",["Acting","Film","Television"]],
[2007,"Maggie Gyllenhaal","F",1977,"United States","New York",true,"2000s",["Acting","Film"]],
[2008,"Zach Braff","M",1975,"United States","New Jersey",true,"2000s",["Acting","Comedy","Film","Television"]],
[2009,"Maya Rudolph","F",1972,"United States","Florida",true,"2000s",["Acting","Comedy","Television"]],
[2010,"Beanie Feldstein","F",1993,"United States","California",true,"2010s",["Acting","Comedy","Film"]],
[2011,"Mayim Bialik","F",1975,"United States","California",true,"1990s",["Acting","Academia","Television"]],
[2012,"Alyson Hannigan","F",1974,"United States","Washington DC",true,"1990s",["Acting","Comedy","Television"]],
[2013,"Ben Platt","M",1993,"United States","California",true,"2010s",["Acting","Music","Stage"]],
[2014,"Eric André","M",1983,"United States","Florida",true,"2010s",["Acting","Comedy","Television"]],
[2015,"Tiffany Haddish","F",1979,"United States","California",true,"2010s",["Acting","Comedy"]],
[2016,"Doja Cat","F",1995,"United States","California",true,"2020s",["Music"]],
[2017,"Taika Waititi","M",1975,"New Zealand","",true,"2010s",["Acting","Comedy","Film","Writing"]],
[2018,"Daveed Diggs","M",1982,"United States","California",true,"2010s",["Acting","Music","Stage"]],
[2019,"Jon Bernthal","M",1976,"United States","Washington DC",true,"2010s",["Acting","Television"]],
[2020,"Noah Schnapp","M",2004,"United States","New York",true,"2010s",["Acting","Television"]],
[2021,"Troye Sivan","M",1995,"South Africa","",true,"2010s",["Acting","Music"]],
[2022,"Zac Efron","M",1987,"United States","California",true,"2000s",["Acting","Music"]],
[2023,"Mac Miller","M",1992,"United States","Pennsylvania",false,"2010s",["Music"]],
[2024,"Joaquin Phoenix","M",1974,"Puerto Rico","",true,"2000s",["Acting","Film"]],
];

const BASE_ROSTER = [
  ...CORE.map((r, i) => ({
    id: i, answerable: true,
    name: r[0], gender: r[1], year: r[2], country: r[3], state: r[4],
    living: r[5], era: r[6], fields: r[7], blurb: r[8], hints: r[9],
  })),
  ...EXTRA.map((r, i) => ({
    id: 1000 + i, answerable: false,
    name: r[0], gender: r[1], year: r[2], country: r[3], state: r[4],
    living: r[5], era: r[6], fields: r[7], blurb: "", hints: [],
  })),
  ...PROBE_ADDITIONS.map((r) => ({
    id: r[0], answerable: false,
    name: r[1], gender: r[2], year: r[3], country: r[4], state: r[5],
    living: r[6], era: r[7], fields: r[8], blurb: "", hints: [],
  })),
];

const answerableById = new Map(ANSWERABLE_ADDITIONS.map((r) => [r[0], {
  id: r[0], answerable: true,
  name: r[1], gender: r[2], year: r[3], country: r[4], state: r[5],
  living: r[6], era: r[7], fields: r[8], blurb: r[9], hints: r[10],
}]));
const baseIds = new Set(BASE_ROSTER.map((p) => p.id));
const ROSTER = [
  ...BASE_ROSTER.map((p) => answerableById.get(p.id) || p),
  ...[...answerableById.values()].filter((p) => !baseIds.has(p.id)),
];

const ANSWERS = ROSTER.filter((p) => p.answerable);

/* ---------------- comparison ---------------- */

const HIT = "hit", NEAR = "near", MISS = "miss";

function compare(g, t) {
  const shared = g.fields.filter((f) => t.fields.includes(f));
  const yd = t.year - g.year;
  const gi = ERAS.indexOf(g.era), ti = ERAS.indexOf(t.era);
  const ed = ti - gi;

  let place = { state: MISS, sub: null };
  if (g.country === t.country) {
    if (g.country === "United States") {
      place = g.state === t.state ? { state: HIT, sub: HIT } : { state: NEAR, sub: MISS };
    } else place = { state: HIT, sub: null };
  }

  return {
    guess: g,
    targetId: t.id,
    // any shared field counts as a match
    fields: { state: shared.length > 0 ? HIT : MISS, shared },
    gender: { state: g.gender === t.gender ? HIT : MISS },
    year: {
      state: yd === 0 ? HIT : Math.abs(yd) <= 5 ? NEAR : MISS,
      arrow: yd === 0 ? "" : yd < 0 ? "↓" : "↑",
    },
    place,
    living: { state: g.living === t.living ? HIT : MISS },
    era: {
      state: ed === 0 ? HIT : Math.abs(ed) === 1 ? NEAR : MISS,
      arrow: ed === 0 ? "" : ed > 0 ? "↑" : "↓",
    },
  };
}

const tileBg = (s) => (s === HIT ? COLORS.hit : s === NEAR ? COLORS.near : COLORS.miss);

/* ---------------- dreidel ---------------- */

function Dreidel({ spinKey }) {
  return (
    <div className="dreidel-stage" aria-hidden="true">
      <span className="dreidel-orbit" />
      <svg
        className="dreidel"
        viewBox="0 0 60 76"
        width="50"
        height="64"
        key={spinKey}
        style={{
          transformOrigin: "50% 45%",
          animation: spinKey > 0 ? "dspin 1250ms cubic-bezier(.16,.74,.22,1) 1" : "none",
        }}
      >
        <defs>
          <linearGradient id="dreidel-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4673CB" />
            <stop offset="0.55" stopColor={COLORS.tekhelet} />
            <stop offset="1" stopColor="#172C5D" />
          </linearGradient>
        </defs>
        <rect x="26" y="0" width="8" height="12" rx="2" fill={COLORS.brass} />
        <path d="M10 12 h40 v34 l-20 22 -20 -22 z" fill="url(#dreidel-blue)"
          stroke={COLORS.brass} strokeWidth="2" strokeLinejoin="round" />
        <path d="M14 16 h30" stroke="rgba(255,255,255,0.24)" strokeWidth="1.5" strokeLinecap="round" />
        <text x="30" y="39" textAnchor="middle" fill={COLORS.parchment}
          style={{ font: `700 23px ${DISPLAY}` }}>נ</text>
      </svg>
    </div>
  );
}

function GuessReveal({ reveal, onSkip }) {
  const { result, landed } = reveal;
  const correct = result.guess.id === result.targetId;
  const states = [
    result.fields.state,
    result.gender.state,
    result.year.state,
    result.place.state,
    result.living.state,
    result.era.state,
  ];
  const matches = states.filter((state) => state === HIT).length;
  const accent = correct ? COLORS.brass : "#4673CB";

  return (
    <div
      className={`dguess-overlay${correct ? " is-correct" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Checking ${result.guess.name}`}
      tabIndex={-1}
      autoFocus
      onClick={onSkip}
      onKeyDown={(event) => {
        if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSkip();
        }
      }}
    >
      <div className="dguess-reveal-name">
        <span>Spinning for</span>
        <strong>{result.guess.name}</strong>
      </div>

      <div className="dguess-reveal-stage" aria-hidden="true">
        <span className="dguess-burst dguess-burst-one" style={{ borderColor: accent }} />
        <span className="dguess-burst dguess-burst-two" style={{ borderColor: accent }} />
        <svg className="dguess-big-dreidel" viewBox="0 0 60 76">
          <defs>
            <linearGradient id="dreidel-reveal-blue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#5B87DC" />
              <stop offset="0.55" stopColor={COLORS.tekhelet} />
              <stop offset="1" stopColor="#172C5D" />
            </linearGradient>
          </defs>
          <rect x="26" y="0" width="8" height="12" rx="2" fill={COLORS.brass} />
          <path d="M10 12 h40 v34 l-20 22 -20 -22 z" fill="url(#dreidel-reveal-blue)"
            stroke={COLORS.brass} strokeWidth="2" strokeLinejoin="round" />
          <path d="M14 16 h30" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeLinecap="round" />
          {!landed ? HEB.map((letter, index) => (
            <text key={letter} className={`dguess-face dguess-face-${index + 1}`} x="30" y="40"
              textAnchor="middle" fill={COLORS.parchment} style={{ font: `700 24px ${DISPLAY}` }}>
              {letter}
            </text>
          )) : (
            <text className="dguess-landed-letter" x="30" y="40" textAnchor="middle"
              fill={COLORS.parchment} style={{ font: `700 24px ${DISPLAY}` }}>
              {correct ? "ג" : "נ"}
            </text>
          )}
        </svg>
      </div>

      <div className="dguess-reveal-result" aria-live="assertive">
        {landed ? (
          <>
            <strong style={{ color: accent }}>
              {correct ? "Gimel — correct!" : `Nun — ${matches} of 6 match`}
            </strong>
            <span className="dguess-result-dots" aria-hidden="true">
              {states.map((state, index) => (
                <i key={`${state}-${index}`} style={{ background: tileBg(state) }} />
              ))}
            </span>
          </>
        ) : <span className="dguess-waiting">Where will it land?</span>}
        <button type="button" className="dguess-skip" onClick={(event) => { event.stopPropagation(); onSkip(); }}>
          Tap to skip
        </button>
      </div>
    </div>
  );
}

const HEB = ["נ", "ג", "ה", "ש"];

/* ---------------- main ---------------- */

export default function Dradel() {
  const [target, setTarget] = useState(() => ANSWERS[Math.floor(Math.random() * ANSWERS.length)]);
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState("");
  const [hints, setHints] = useState(1); // first hint is free
  const [status, setStatus] = useState("playing");
  const [confirmGiveUp, setConfirmGiveUp] = useState(false);
  const [spinKey, setSpinKey] = useState(1);
  const [flash, setFlash] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [unseen, setUnseen] = useState(() => ANSWERS.map((p) => p.id));
  const [guessReveal, setGuessReveal] = useState(null);
  const inputRef = useRef(null);
  const revealTimerRef = useRef(null);
  const landTimerRef = useRef(null);

  const guessedIds = guesses.map((g) => g.guess.id);

  const matches = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    const starts = [], contains = [];
    for (const p of ROSTER) {
      if (guessedIds.includes(p.id)) continue;
      const n = p.name.toLowerCase();
      if (n.startsWith(q)) starts.push(p);
      else if (n.includes(q)) contains.push(p);
    }
    return [...starts, ...contains].slice(0, 7);
  }, [input, guesses]);

  useEffect(() => setHighlight(0), [input]);

  useEffect(() => () => {
    clearTimeout(revealTimerRef.current);
    clearTimeout(landTimerRef.current);
  }, []);

  useEffect(() => {
    if (!guessReveal) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [!!guessReveal]);

  function spin() {
    setSpinKey((k) => k + 1);
  }

  function revealHint() {
    if (hints >= 4) return;
    setHints((count) => count + 1);
    spin();
  }

  function giveUp() {
    setStatus("gave-up");
    setConfirmGiveUp(false);
    spin();
  }

  function newGame() {
    clearTimeout(revealTimerRef.current);
    clearTimeout(landTimerRef.current);
    setGuessReveal(null);
    let pool = unseen.filter((id) => id !== target.id);
    if (pool.length === 0) pool = ANSWERS.map((p) => p.id);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setUnseen(pool.filter((id) => id !== pick));
    setTarget(ROSTER.find((p) => p.id === pick));
    setGuesses([]); setInput(""); setHints(1);
    setStatus("playing"); setConfirmGiveUp(false); setFlash("");
    spin();
    setTimeout(() => inputRef.current && inputRef.current.focus(), 60);
  }

  function finishGuessReveal(result) {
    clearTimeout(revealTimerRef.current);
    clearTimeout(landTimerRef.current);
    setGuessReveal(null);
    setGuesses((prev) => [result, ...prev]);
    if (result.guess.id === result.targetId) setStatus("won");
    else setTimeout(() => inputRef.current && inputRef.current.focus(), 80);
  }

  function startGuessReveal(result) {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setGuessReveal({ result, landed: !!reduceMotion });
    spin();
    if (!reduceMotion) {
      landTimerRef.current = setTimeout(() => {
        setGuessReveal((current) => current ? { ...current, landed: true } : current);
      }, 1050);
    }
    revealTimerRef.current = setTimeout(() => finishGuessReveal(result), reduceMotion ? 650 : 1900);
  }

  function submit(person) {
    if (status !== "playing" || guessReveal) return;
    const p = person || matches[highlight];
    if (!p) { setFlash("No one by that name in the pool. Try a few letters."); return; }
    if (guessedIds.includes(p.id)) { setFlash(`Already guessed ${p.name}.`); return; }
    setFlash(""); setInput("");
    startGuessReveal(compare(p, target));
  }

  const hintText = [
    ...target.hints,
    `Initials: ${target.name.split(" ").map((w) => w[0]).join(".")}.`,
  ];

  const solved = status === "won";
  const revealed = status !== "playing";

  return (
    <div className="dapp" style={{
      background: `radial-gradient(120% 80% at 50% -10%, ${COLORS.panel} 0%, ${COLORS.ink} 60%)`,
      color: COLORS.parchment, fontFamily: BODY,
    }}>
      <style>{`
        html, body, #root { margin: 0; min-height: 100%; background: ${COLORS.ink}; }
        html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
        body { min-width: 280px; overflow-x: hidden; }
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes dspin {
          0% { transform: rotate(0deg) scale(.88); filter: drop-shadow(0 0 0 rgba(199,154,69,0)); }
          18% { transform: rotate(160deg) scale(1.03); }
          52% { transform: rotate(720deg) scale(1.16); filter: drop-shadow(0 0 14px rgba(199,154,69,.8)); }
          82% { transform: rotate(1045deg) scale(.97); }
          100% { transform: rotate(1080deg) scale(1); filter: drop-shadow(0 7px 8px rgba(0,0,0,.42)); }
        }
        @keyframes orbitPulse {
          0%, 100% { opacity: .38; transform: scale(.96); }
          50% { opacity: .72; transform: scale(1.04); }
        }
        @keyframes drop { from { opacity:0; transform: translateY(-10px) } to { opacity:1; transform:none } }
        @keyframes dGuessOverlayLife {
          0% { opacity: 0; }
          7%, 87% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes dGuessRevealSpin {
          0% { transform: rotate(0deg) scale(.28); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: rotate(1260deg) scale(1.12); }
          78% { transform: rotate(2010deg) scale(1); }
          88% { transform: rotate(2056deg) scale(1.06); }
          100% { transform: rotate(2048deg) scale(1); opacity: 1; }
        }
        @keyframes dGuessFaceCycle {
          0%, 24.9% { opacity: 1; }
          25%, 100% { opacity: 0; }
        }
        @keyframes dGuessBurst {
          from { transform: scale(.34); opacity: .9; }
          to { transform: scale(1.9); opacity: 0; }
        }
        @keyframes dGuessStamp {
          from { transform: scale(1.45); opacity: 0; letter-spacing: .42em; }
          to { transform: scale(1); opacity: 1; letter-spacing: .16em; }
        }
        @keyframes dGuessRise {
          from { transform: translateY(14px); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
        @keyframes dGuessLetterIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dGuessWaiting {
          0%, 100% { opacity: .48; }
          50% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
        .dapp {
          min-height: 100vh;
          min-height: 100dvh;
          padding: 28px 16px 64px;
          padding-top: max(28px, env(safe-area-inset-top));
          padding-right: max(16px, env(safe-area-inset-right));
          padding-bottom: max(64px, env(safe-area-inset-bottom));
          padding-left: max(16px, env(safe-area-inset-left));
          overflow-x: hidden;
        }
        .dcontent { width: 100%; max-width: 920px; margin: 0 auto; }
        .dheader { text-align: center; margin-bottom: 28px; }
        .dreidel-stage {
          position: relative;
          display: grid;
          place-items: center;
          width: 88px;
          height: 88px;
          margin: 0 auto 10px;
          border: 1px solid rgba(199,154,69,.38);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(43,78,150,.34), rgba(19,26,42,.3) 60%, transparent 61%);
          box-shadow: inset 0 0 24px rgba(43,78,150,.2), 0 12px 34px rgba(0,0,0,.24);
        }
        .dreidel-orbit {
          position: absolute;
          inset: 8px;
          border: 1px dashed rgba(199,154,69,.34);
          border-radius: 50%;
          animation: orbitPulse 2200ms ease-in-out infinite;
        }
        .dreidel {
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 7px 8px rgba(0,0,0,.42));
          transform-style: preserve-3d;
        }
        .dbyline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          padding: 8px 12px;
          border: 1px solid rgba(199,154,69,.52);
          border-radius: 999px;
          background: rgba(199,154,69,.08);
          color: ${COLORS.parchment};
          font-family: ${MONO};
          font-size: 10px;
          letter-spacing: .14em;
          text-decoration: none;
          text-transform: uppercase;
          transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
        }
        .dbyline-label { color: ${COLORS.parchDim}; }
        .dbyline-name { color: ${COLORS.brass}; font-weight: 700; }
        .dbyline-arrow { font-size: 13px; color: ${COLORS.brass}; }
        .dgame {
          padding: 24px;
          border: 1px solid rgba(46,58,92,.9);
          border-radius: 16px;
          background: linear-gradient(155deg, rgba(26,35,64,.78), rgba(12,17,28,.9) 55%);
          box-shadow: 0 24px 70px rgba(0,0,0,.3), inset 0 1px rgba(255,255,255,.025);
        }
        .dsection-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 0 0 9px;
          color: ${COLORS.parchDim};
          font-family: ${MONO};
          font-size: 10px;
          letter-spacing: .15em;
          text-transform: uppercase;
        }
        .dsection-head strong { color: ${COLORS.brass}; font-weight: 400; }
        .dcontrols { position: relative; }
        .dsearch { position: relative; margin-bottom: 14px; }
        .dinput-row { display: flex; gap: 8px; align-items: stretch; }
        .dinput { flex: 1 1 auto; min-width: 0; min-height: 54px; transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease; }
        .dinput:focus { border-color: ${COLORS.brass} !important; box-shadow: 0 0 0 3px rgba(199,154,69,.12); background: #171F33 !important; }
        .dsubmit { display: none; }
        .dsuggestions {
          max-height: min(336px, 42dvh);
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
        .doption {
          appearance: none;
          width: 100%;
          min-height: 48px;
          border: 0;
          color: inherit;
          text-align: left;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .dhint { border-radius: 8px; box-shadow: inset 0 1px rgba(255,255,255,.025); }
        .dactions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 22px; }
        .dcount {
          margin-left: auto;
          padding: 7px 10px;
          border: 1px solid ${COLORS.edge};
          border-radius: 999px;
          background: rgba(12,17,28,.5);
        }
        .dconfirm { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .dbtn {
          min-height: 44px;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease, filter 140ms ease;
        }
        .dbtn:active { transform: translateY(1px) scale(.99); }
        .dshort-label { display: none; }
        .drow {
          animation: drop 240ms ease-out both;
          padding: 12px;
          border: 1px solid rgba(46,58,92,.72);
          border-radius: 10px;
          background: rgba(19,26,42,.55);
        }
        .dgrid { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:6px; }
        .dguesses-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin: 0 2px 10px;
          color: ${COLORS.parchDim};
          font-family: ${MONO};
          font-size: 10px;
          letter-spacing: .15em;
          text-transform: uppercase;
        }
        .dguesses-head strong { color: ${COLORS.brass}; font-weight: 400; }
        .dlegend-direction { margin-left: auto; }
        .dreveal { border-radius: 12px; box-shadow: 0 16px 44px rgba(0,0,0,.22); }
        .dguess-overlay {
          position: fixed;
          z-index: 100;
          inset: 0;
          display: grid;
          place-items: center;
          align-content: center;
          gap: clamp(18px, 4vh, 30px);
          padding: max(24px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left));
          overflow: hidden;
          background: radial-gradient(70% 48% at 50% 47%, rgba(43,78,150,.36), rgba(6,10,18,.94) 72%), rgba(6,10,18,.94);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          cursor: pointer;
          touch-action: manipulation;
          animation: dGuessOverlayLife 1900ms ease both;
        }
        .dguess-reveal-name {
          display: grid;
          gap: 7px;
          justify-items: center;
          text-align: center;
          animation: dGuessRise 320ms ease-out 120ms both;
        }
        .dguess-reveal-name span {
          color: ${COLORS.brass};
          font-family: ${MONO};
          font-size: 10px;
          letter-spacing: .3em;
          text-transform: uppercase;
        }
        .dguess-reveal-name strong {
          max-width: min(88vw, 640px);
          color: ${COLORS.parchment};
          font-family: ${DISPLAY};
          font-size: clamp(26px, 6vw, 46px);
          line-height: 1.1;
          text-wrap: balance;
        }
        .dguess-reveal-stage {
          position: relative;
          display: grid;
          width: min(64vmin, 340px);
          height: min(64vmin, 340px);
          place-items: center;
        }
        .dguess-big-dreidel {
          position: relative;
          z-index: 1;
          width: min(48vmin, 240px);
          height: auto;
          overflow: visible;
          filter: drop-shadow(0 20px 38px rgba(0,0,0,.58));
          transform-origin: 50% 45%;
          animation: dGuessRevealSpin 1250ms cubic-bezier(.13,.72,.18,1) both;
        }
        .dguess-burst {
          position: absolute;
          inset: 0;
          border: 2px solid ${COLORS.brass};
          border-radius: 50%;
          opacity: 0;
          pointer-events: none;
        }
        .dguess-burst-one { animation: dGuessBurst 620ms cubic-bezier(.2,.7,.3,1) 1080ms both; }
        .dguess-burst-two { inset: 14%; border-width: 1px; animation: dGuessBurst 700ms cubic-bezier(.2,.7,.3,1) 1170ms both; }
        .dguess-face { opacity: 0; animation: dGuessFaceCycle 560ms steps(1,end) infinite; }
        .dguess-face-2 { animation-delay: 140ms; }
        .dguess-face-3 { animation-delay: 280ms; }
        .dguess-face-4 { animation-delay: 420ms; }
        .dguess-landed-letter { animation: dGuessLetterIn 180ms linear both; }
        .dguess-reveal-result {
          display: grid;
          min-height: 84px;
          gap: 11px;
          justify-items: center;
          text-align: center;
        }
        .dguess-reveal-result > strong {
          font-family: ${MONO};
          font-size: clamp(13px, 3.5vw, 17px);
          letter-spacing: .16em;
          text-transform: uppercase;
          animation: dGuessStamp 360ms cubic-bezier(.2,.8,.25,1) both;
        }
        .dguess-waiting {
          color: ${COLORS.parchDim};
          font-family: ${MONO};
          font-size: 11px;
          letter-spacing: .2em;
          text-transform: uppercase;
          animation: dGuessWaiting 700ms ease-in-out infinite;
        }
        .dguess-result-dots { display: flex; gap: 7px; animation: dGuessRise 280ms ease-out both; }
        .dguess-result-dots i { display: block; width: 13px; height: 13px; border: 1px solid rgba(255,255,255,.12); border-radius: 4px; }
        .dguess-skip {
          border: 0;
          background: transparent;
          color: #68748C;
          font-family: ${MONO};
          font-size: 10px;
          letter-spacing: .18em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .dguess-skip:hover { color: ${COLORS.parchDim}; }
        @media (hover: hover) {
          .dbyline:hover { background: rgba(199,154,69,.14); border-color: ${COLORS.brass}; transform: translateY(-1px); }
          .dbtn:not(:disabled):hover { filter: brightness(1.14); box-shadow: 0 8px 20px rgba(0,0,0,.18); transform: translateY(-1px); }
        }
        @media (max-width: 1024px) {
          .dapp {
            padding-top: max(22px, env(safe-area-inset-top));
            padding-right: max(16px, env(safe-area-inset-right));
            padding-bottom: max(48px, env(safe-area-inset-bottom));
            padding-left: max(16px, env(safe-area-inset-left));
          }
          .dcontent { max-width: none; }
          .dheader { margin-bottom: 20px; }
          .dheader h1 { font-size: clamp(42px, 11vw, 68px) !important; }
          .dreidel-stage { width: 82px; height: 82px; margin-bottom: 8px; }
          .dreidel { width: 46px; height: 59px; }
          .dtagline { font-size: 15px !important; letter-spacing: 0.18em !important; }
          .dbyline { margin-top: 12px; padding: 9px 13px; font-size: 12px; }
          .dlede { font-size: 18px !important; }
          .dgame { padding: 22px 20px; border-radius: 14px; }
          .dsection-head { font-size: 13px; }
          .dhint { padding: 13px 15px !important; }
          .dhint-text { font-size: 20px !important; line-height: 1.4; }
          .dinput { min-height: 68px; font-size: 24px !important; }
          .doption { min-height: 60px; font-size: 20px !important; }
          .dactions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .dactions > .dbtn { width: 100%; min-height: 60px; font-size: 14px !important; }
          .dcount { grid-column: 2; margin-left: 0; justify-self: end; text-align: right; font-size: 14px !important; }
          .dconfirm {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }
          .dconfirm > span { grid-column: 1 / -1; }
          .dconfirm > .dbtn { width: 100%; min-height: 60px; font-size: 14px !important; }
          .dintro { margin-top: 30px !important; font-size: 18px !important; }
          .dlegend-direction { width: 100%; margin-left: 0; }
        }
        /* Touch devices get the phone shell even when the browser reports a
           desktop-width viewport (e.g. Chrome's "Desktop site" mode). */
        @media (max-width: 767px), (hover: none) and (pointer: coarse) and (max-width: 1024px) {
          html, body, #root { height: 100%; overflow: hidden; }
          .dapp {
            position: fixed;
            inset: 0;
            display: flex;
            flex-direction: column;
            height: 100dvh;
            padding: 0;
            overflow: hidden;
          }
          .dcontent {
            flex: 1 1 auto;
            min-height: 0;
            max-width: 620px;
            overflow-y: auto;
            overscroll-behavior-y: contain;
            -webkit-overflow-scrolling: touch;
            padding-top: max(12px, env(safe-area-inset-top));
            padding-right: max(12px, env(safe-area-inset-right));
            padding-bottom: calc(158px + env(safe-area-inset-bottom));
            padding-left: max(12px, env(safe-area-inset-left));
          }
          .dheader { margin-bottom: 16px; }
          .dheader h1 { font-size: clamp(40px, 13vw, 58px) !important; letter-spacing: .08em !important; text-indent: .08em !important; }
          .dreidel-stage { width: 52px; height: 52px; margin-bottom: 7px; }
          .dreidel-stage::after { content: none; }
          .dreidel-orbit { inset: 6px; }
          .dreidel { width: 28px; height: 36px; }
          .dtagline { margin-top: 6px !important; font-size: 10.5px !important; letter-spacing: .24em !important; }
          .dbyline { margin-top: 9px; padding: 7px 12px; font-size: 10px; }
          .dlede { display: none; }
          .dgame { padding: 0; border: 0; border-radius: 0; background: transparent; box-shadow: none; }
          .dclue-section {
            margin-bottom: 18px !important;
            padding: 12px 14px 10px;
            border: 1px solid rgba(46,58,92,.82);
            border-radius: 14px;
            background: linear-gradient(180deg, rgba(26,35,64,.72), rgba(19,26,42,.78));
          }
          .dsection-head { gap: 8px; font-size: 10px; letter-spacing: .14em; }
          .dsection-head > span { max-width: 50%; text-align: right; line-height: 1.35; }
          .dclue-section .dsection-head { margin-bottom: 8px; }
          .dhint { padding: 5px 4px 5px 10px !important; background: transparent !important; }
          .dhint-text { font-size: 17px !important; }
          .dcontrols {
            position: fixed;
            z-index: 40;
            right: 0;
            bottom: 0;
            left: 0;
            padding: 18px max(12px, env(safe-area-inset-right)) calc(12px + env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
            border-top: 1px solid rgba(46,58,92,.72);
            background: linear-gradient(180deg, rgba(12,17,28,0), rgba(12,17,28,.96) 16px, ${COLORS.ink} 42px);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }
          .dsearch { margin: 0 0 9px; }
          .dsearch > .dsection-head { display: none; }
          .dinput { min-height: 52px; border: 1.5px solid ${COLORS.brass} !important; border-radius: 12px !important; font-size: 18px !important; padding: 0 14px !important; }
          .dsubmit {
            display: grid;
            flex: 0 0 52px;
            width: 52px;
            min-height: 52px;
            place-items: center;
            border: 1px solid ${COLORS.tekhelet};
            border-radius: 12px;
            background: #315DA8;
            color: white;
            font: 600 23px/1 ${BODY};
            cursor: pointer;
            touch-action: manipulation;
          }
          .dsubmit:disabled { opacity: .45; cursor: default; }
          .dsuggestions {
            top: auto !important;
            bottom: calc(100% + 7px);
            max-height: min(330px, 42dvh);
            border: 1px solid ${COLORS.edge} !important;
            border-radius: 12px !important;
            box-shadow: 0 -18px 50px rgba(0,0,0,.38);
          }
          .doption { min-height: 52px; font-size: 18px !important; }
          .dactions { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0; }
          .dactions > .dbtn { min-height: 42px; padding: 8px 6px !important; border-radius: 11px !important; font-size: 10px !important; letter-spacing: .1em !important; }
          .dactions > .dbtn:nth-child(2) { border-color: #6B551F !important; background: #2A210D !important; color: #EDCB84 !important; }
          .dcount { display: none; }
          .dconfirm { grid-column: 1 / -1; grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .dconfirm > span { text-align: center; }
          .dconfirm > .dbtn { min-height: 42px; font-size: 10px !important; }
          .dactions.is-confirming > .dbtn { display: none; }
          .dcontrols.is-revealed .dactions { grid-template-columns: 1fr; }
          .dfull-label { display: none; }
          .dshort-label { display: inline; }
          .dguesses-head { margin: 0 2px 10px; font-size: 10px; letter-spacing: .16em; }
          .drow { padding: 9px !important; border-radius: 14px !important; background: rgba(19,26,42,.72); }
          .drow-head { padding: 4px 4px 9px !important; }
          .drow-name { font-size: 20px !important; font-weight: 700; }
          .drow-index { margin-left: auto; color: ${COLORS.parchDim}; font-family: ${MONO}; font-size: 10px; }
          .dgrid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
          .dtile { min-height: 64px !important; padding: 9px 10px 10px !important; border-radius: 10px !important; }
          .dlegend { gap: 10px 14px !important; margin-top: 16px !important; font-size: 10px !important; }
          .dlegend-direction { width: 100%; }
          .dreveal { padding: 22px 16px !important; margin-bottom: 18px !important; }
          .dintro { display: none; }
        }
        @media (max-width: 359px) {
          .dcontent { padding-right: max(8px, env(safe-area-inset-right)); padding-left: max(8px, env(safe-area-inset-left)); }
          .dheader h1 { font-size: 38px !important; }
          .dtagline { font-size: 9px !important; }
          .dbyline { font-size: 9px; }
          .dcontrols { padding-right: max(8px, env(safe-area-inset-right)); padding-left: max(8px, env(safe-area-inset-left)); }
          .dactions > .dbtn { font-size: 9px !important; }
        }
        @media (min-width: 1025px){ .dgrid { grid-template-columns: repeat(6, minmax(0,1fr)); } }
        input:focus-visible, button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.brass}; outline-offset: 2px; }
      `}</style>

      <div className="dcontent">
        <header className="dheader">
          <Dreidel spinKey={spinKey} />
          <h1 style={{
            fontFamily: DISPLAY, fontSize: "clamp(38px, 9vw, 62px)",
            letterSpacing: "0.16em", margin: 0, fontWeight: 700, textIndent: "0.16em",
          }}>
            DR<span style={{ color: COLORS.brass }}>Δ</span>DEL
          </h1>
          <p className="dtagline" style={{
            fontFamily: MONO, fontSize: 12, letterSpacing: "0.22em",
            textTransform: "uppercase", color: COLORS.brass, margin: "8px 0 0",
          }}>Guess the famous Jew</p>
          <a className="dbyline" href="/" aria-label="Made by Simon Ioffe — visit his portfolio">
            <span className="dbyline-label">Made by</span>
            <strong className="dbyline-name">Simon Ioffe</strong>
            <span className="dbyline-arrow" aria-hidden="true">→</span>
          </a>
          <p className="dlede" style={{ color: COLORS.parchDim, fontSize: 13, margin: "10px 0 0", lineHeight: 1.5 }}>
            Every wrong guess tells you how the two people compare. Narrow it down.
          </p>
        </header>

        <main className="dgame">
        {!revealed && (
          <section className="dclue-section" style={{ marginBottom: 18 }}>
            <div className="dsection-head">
              <strong>Your clue</strong>
              <span>{hints === 1 ? "Opening clue" : `${hints} clues revealed`}</span>
            </div>
            {hintText.slice(0, hints).map((h, i) => (
              <div className="dhint" key={i} style={{
                display: "flex", gap: 12, alignItems: "baseline",
                borderLeft: `2px solid ${COLORS.brass}`, padding: "8px 14px",
                marginBottom: 6, background: `linear-gradient(90deg, ${COLORS.ink2}, rgba(26,35,64,.7))`,
              }}>
                <span style={{ fontFamily: DISPLAY, fontSize: 20, color: COLORS.brass, width: 18 }}>{HEB[i]}</span>
                <span className="dhint-text" style={{ fontSize: 15 }}>{h}</span>
              </div>
            ))}
          </section>
        )}

        <div className={`dcontrols${revealed ? " is-revealed" : ""}`}>
          {!revealed && (
            <div className="dsearch">
              <label className="dsection-head" htmlFor="dradel-guess">
                <strong>Your guess</strong>
                <span>Answers and probe names</span>
              </label>
              <div className="dinput-row">
                <input
                  className="dinput"
                  id="dradel-guess"
                  ref={inputRef} value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); submit(); }
                    else if (e.key === "ArrowDown" && matches.length > 0) { e.preventDefault(); setHighlight((h) => Math.min(h + 1, matches.length - 1)); }
                    else if (e.key === "ArrowUp" && matches.length > 0) { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
                    else if (e.key === "Escape") setInput("");
                  }}
                  placeholder="Start typing a name…"
                  aria-label="Guess a famous Jewish person"
                  aria-autocomplete="list"
                  aria-controls="dradel-suggestions"
                  aria-expanded={matches.length > 0}
                  aria-activedescendant={matches.length > 0 ? `dradel-option-${matches[highlight]?.id ?? matches[0].id}` : undefined}
                  role="combobox"
                  autoComplete="off"
                  autoCapitalize="words"
                  enterKeyHint="go"
                  spellCheck="false"
                  style={{
                    width: "100%", boxSizing: "border-box", background: COLORS.ink2,
                    border: `1px solid ${COLORS.edge}`, borderRadius: 10, color: COLORS.parchment,
                    fontFamily: DISPLAY, fontSize: 20, padding: "14px 16px",
                  }}
                />
                <button
                  className="dsubmit"
                  type="button"
                  onClick={() => submit()}
                  disabled={!input.trim()}
                  aria-label="Submit guess"
                >→</button>
              </div>
              {matches.length > 0 && (
                <ul className="dsuggestions" id="dradel-suggestions" role="listbox" style={{
                  listStyle: "none", margin: 0, padding: 0, position: "absolute", zIndex: 20,
                  left: 0, right: 0, background: COLORS.ink2, border: `1px solid ${COLORS.edge}`,
                  borderTop: "none", borderRadius: "0 0 10px 10px",
                }}>
                  {matches.map((p, i) => (
                    <li key={p.id} role="none">
                      <button
                        className="doption"
                        id={`dradel-option-${p.id}`}
                        type="button"
                        role="option"
                        aria-selected={i === highlight}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => submit(p)}
                        onMouseEnter={() => setHighlight(i)}
                        onFocus={() => setHighlight(i)}
                        style={{
                        padding: "11px 16px", cursor: "pointer", fontFamily: DISPLAY, fontSize: 17,
                        background: i === highlight ? COLORS.tekhelet : "transparent",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <span>{p.name}</span>
                        {!p.answerable && (
                          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", color: COLORS.parchDim }}>
                            PROBE
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {flash && (
            <p className="dflash" style={{ fontFamily: MONO, fontSize: 12, color: COLORS.brass, margin: "0 0 12px" }}>{flash}</p>
          )}

          <div className={`dactions${confirmGiveUp ? " is-confirming" : ""}`}>
            <Btn onClick={newGame}>New game</Btn>
            {!revealed && (
              <>
                <Btn onClick={revealHint} disabled={hints >= 4}>
                  <span className="dfull-label">{hints >= 4 ? "No hints left" : "Another hint"}</span>
                  <span className="dshort-label">{hints >= 4 ? "No hints" : "Hint"}</span>
                </Btn>
                {!confirmGiveUp ? (
                  <Btn ghost onClick={() => setConfirmGiveUp(true)}>I give up</Btn>
                ) : (
                  <span className="dconfirm">
                    <span style={{ fontSize: 13, color: COLORS.parchDim }}>Reveal the mystery Jew?</span>
                    <Btn ghost onClick={giveUp}>Yes, reveal</Btn>
                    <Btn ghost onClick={() => setConfirmGiveUp(false)}>Keep going</Btn>
                  </span>
                )}
              </>
            )}
            <span className="dcount" style={{ fontFamily: MONO, fontSize: 12, color: COLORS.parchDim }}>
              {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}
              {hints > 1 && ` · ${hints - 1} ${hints - 1 === 1 ? "hint" : "hints"}`}
            </span>
          </div>
        </div>

        {revealed && (
          <div className="dreveal" style={{
            border: `1px solid ${COLORS.brass}`, background: `linear-gradient(145deg, ${COLORS.ink2}, rgba(43,78,150,.2))`,
            padding: "26px 22px", marginBottom: 26, textAlign: "center",
          }}>
            <p style={{
              fontFamily: MONO, letterSpacing: "0.24em", textTransform: "uppercase",
              fontSize: 12, color: COLORS.brass, margin: 0,
            }}>{solved ? "Mazel tov" : "The answer was"}</p>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(28px, 6vw, 42px)", margin: "10px 0 6px", letterSpacing: "0.03em" }}>
              {target.name}
            </h2>
            <p style={{ color: COLORS.parchDim, fontSize: 15, margin: "0 auto", maxWidth: 460, lineHeight: 1.55 }}>
              {target.blurb}
            </p>
            <p style={{ fontFamily: MONO, fontSize: 13, marginTop: 18 }}>
              {solved
                ? `Solved in ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}${hints > 1 ? ` with ${hints - 1} ${hints - 1 === 1 ? "hint" : "hints"}` : ""}.`
                : `Gave up after ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}.`}
            </p>
            <div style={{ marginTop: 16 }}><Btn onClick={newGame}>New game</Btn></div>
          </div>
        )}

        {guesses.length > 0 ? (
          <section className="dguess-section">
            <div className="dguesses-head">
              <span>Your guesses</span>
              <strong>{guesses.length} {guesses.length === 1 ? "guess" : "guesses"}</strong>
            </div>
            {guesses.map((g, index) => (
              <GuessRow key={g.guess.id} r={g} correct={g.guess.id === target.id} number={guesses.length - index} />
            ))}
            <Legend />
          </section>
        ) : !revealed ? (
          <p className="dintro" style={{ textAlign: "center", color: COLORS.parchDim, fontSize: 14, marginTop: 40, lineHeight: 1.6 }}>
            The answer is someone widely known.
            <br />
            Start anywhere. A bad guess is still information.
          </p>
        ) : null}
        </main>
      </div>
      {guessReveal && (
        <GuessReveal
          reveal={guessReveal}
          onSkip={() => finishGuessReveal(guessReveal.result)}
        />
      )}
    </div>
  );
}

function Btn({ children, onClick, disabled, ghost }) {
  return (
    <button className="dbtn" type="button" onClick={onClick} disabled={disabled} style={{
      background: ghost ? "transparent" : COLORS.tekhelet,
      border: `1px solid ${ghost ? COLORS.edge : COLORS.tekhelet}`,
      color: disabled ? COLORS.parchDim : COLORS.parchment,
      fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
      padding: "10px 14px", borderRadius: 8,
      cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
    }}>{children}</button>
  );
}

function Tile({ label, state, main, sub, arrow }) {
  return (
    <div className="dtile" style={{
      background: tileBg(state),
      border: `1px solid ${state === MISS ? COLORS.edge : "transparent"}`,
      padding: "8px 8px 9px", borderRadius: 6, minHeight: 62,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
    }}>
      <div style={{
        fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
        color: state === MISS ? COLORS.parchDim : "rgba(239,231,213,0.75)",
      }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, flexWrap: "wrap" }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 15, lineHeight: 1.15 }}>{main}</span>
        {arrow && <span style={{ fontFamily: MONO, fontSize: 15, color: COLORS.brass, fontWeight: 700 }}>{arrow}</span>}
      </div>
      {sub && <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(239,231,213,0.7)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function GuessRow({ r, correct, number }) {
  const g = r.guess;
  const fieldText = r.fields.shared.length ? r.fields.shared.join(" · ") : g.fields.join(" · ");
  return (
    <div className="drow" style={{ marginBottom: 14 }}>
      <div className="drow-head" style={{
        display: "flex", alignItems: "baseline", gap: 10, padding: "6px 2px 8px",
        borderBottom: `1px solid ${COLORS.edge}`, marginBottom: 8,
      }}>
        <span className="drow-name" style={{ fontFamily: DISPLAY, fontSize: 20, color: correct ? COLORS.brass : COLORS.parchment }}>
          {g.name}
        </span>
        {correct && (
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", color: COLORS.brass }}>✦ FOUND</span>
        )}
        {!correct && <span className="drow-index">#{number}</span>}
      </div>
      <div className="dgrid">
        <Tile label="Field" state={r.fields.state} main={fieldText} />
        <Tile label="Gender" state={r.gender.state} main={g.gender === "M" ? "Male" : "Female"} />
        <Tile label="Born" state={r.year.state} main={g.year} arrow={r.year.arrow} />
        <Tile label="Birthplace" state={r.place.state} main={g.country}
          sub={g.country === "United States" ? g.state : null} />
        <Tile label="Living" state={r.living.state} main={g.living ? "Living" : "Deceased"} />
        <Tile label="Fame era" state={r.era.state} main={g.era} arrow={r.era.arrow} />
      </div>
    </div>
  );
}

function Legend() {
  const items = [[COLORS.hit, "Match"], [COLORS.near, "Close"], [COLORS.miss, "No match"]];
  return (
    <div className="dlegend" style={{
      display: "flex", gap: 16, flexWrap: "wrap", marginTop: 22, paddingTop: 14,
      borderTop: `1px solid ${COLORS.edge}`, fontFamily: MONO, fontSize: 11,
      color: COLORS.parchDim, letterSpacing: "0.1em",
    }}>
      {items.map(([c, t]) => (
        <span key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 12, height: 12, background: c, border: `1px solid ${COLORS.edge}` }} />
          {t.toUpperCase()}
        </span>
      ))}
      <span className="dlegend-direction">↑ LATER · ↓ EARLIER</span>
    </div>
  );
}
