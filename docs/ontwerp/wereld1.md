# Wereld 1 – De Haven: ontwerp "De Ellehaven"

Fase 1: onderzoek en ontwerp. Er is nog geen code veranderd. Datum: 30 oktober 2026.
Uitgangspunt: het spel is alleen nog first person (ooghoogte 1,55 m, FOV 70, lopen met WASD, rondkijken met de muis).
Opdrachten, antwoorden, station-id's en de koppeling opdracht → station blijven precies zoals ze zijn. Alleen de plek van de stations en de omgeving veranderen.
Bij dit document hoort de plattegrond [`wereld1-plattegrond.svg`](wereld1-plattegrond.svg).

---

## 0. In het kort

- **Onderzoek:** 100 echte havens uit 41 landen en alle zeven werelddelen. Deze kenmerken komen het vaakst terug: historische schepen (21), een havenkantoor of douanehuis (20), een veerpont (19), pakhuizen (19) en een vismijn of visafslag (16).
- **Concept:** alles samen wordt **De Ellehaven**, een compacte Hollandse haven rond één havenkom. In de kom ligt een jachthaven met drijvende steigers. Rondom staan een havenkantoor met klokkentoren, een visafslag, een pakhuis met hijsbalk, een werf met helling, een weegloods en een vertrekloods. Aan de buitenkade ligt De Eenheid.
- **Route:** het **kadeplein** is het hart van de haven. Elke DIM-fase opent vanaf dit plein een nieuwe richting. Vanaf de start zie je al bijna alles: het schip, de vuurtoren, de kraan, de opgehaalde brug en de seinmast bij de poort. Maar je moet er nog naartoe lopen.
- **Tijd als sfeer:** je begint in het gouden uur (19.40 uur) en eindigt in het blauwe uur (21.30 uur). Dan is het hoogwater en vertrekt het schip. De klok op het havenkantoor loopt mee met de fases.
- **Motor:** daarvoor zijn 17 optionele uitbreidingen nodig. De belangrijkste zijn een eigen hoogte per kamer, open loodsen met kolommen, vloeren op hun eigen hoogte (voor de steigers), een kademuur met water, hekken tussen buitenruimtes, roldeuren en een sfeer per fase (§ 9).

---

## 1. Werkwijze en betrouwbaarheid

- Ik deed 11 gerichte zoekopdrachten met WebSearch: naar lijsten van containerhavens, pakhuizen met hijsbalken, havenkantoren met een klok, vismijnen, historische havenkranen, pakhuizen in Japan, en havens in Afrika, Zuid-Amerika en Oceanië. De rest komt uit mijn eigen kennis.
- Ik heb alleen titels en samenvattingen uit de zoekresultaten gezien en geen pagina's zelf gelezen. Bij elke haven staat één kenmerk dat algemeen bekend en goed te zien is. Jaartallen staan er alleen als ik er zeker van ben. Details waar ik aan twijfelde, heb ik weggelaten (bijvoorbeeld het openingsjaar van de Nieuwe Sluis Terneuzen of een klok op het Customs House in Sydney).
- Per haven staan de opvallendste zichtbare kenmerken als code. Dat is geen volledige lijst. Een kademuur met bolders heeft elke haven, dus die telt niet mee: daar begint ons ontwerp mee.

---

## 2. De 100 havens (a)

Verdeling: Nederland 20 · rest van Europa 32 · Azië 15 · Afrika 9 · Noord- en Midden-Amerika 10 · Zuid-Amerika 7 · Oceanië 6 · Antarctica 1.
Soorten (een haven kan meerdere soorten zijn): 11 grote containerhavens, 16 havens met visafslag of vismarkt, 11 jachthavens of steigerhavens, 19 veerhavens en 19 historische havens met pakhuizen.

Codes: **PH** pakhuizen aan het water · **HB** hijsbalk of takel aan de gevel · **HK** havenkantoor of douanehuis · **KL** klok of klokkentoren · **KR** historische havenkraan · **CK** containerkranen en containers · **VT** vuurtoren of havenlicht · **HH** havenhoofd of lange pier · **SL** sluis · **BR** beweegbare of opvallende brug · **VM** vismijn, visafslag of vismarkt · **LO** grote open loods of hal · **TO** tankopslag of silo · **KT** kadetrap tot in het water · **DS** drijvende steigers of pontons · **VE** veerpont of veerboot · **SC** historische schepen aan de kade · **DR** werf, helling of droogdok · **MA** markt of kramen aan de kade · **VS** fort, stadspoort of toren bij de havenmond · **KM** kleurrijke gevels · **ST** haven tegen een helling (trappen, lift) · **GE** getij zichtbaar (peilschaal, droogvallen) · **TK** tijdbal of tijdsein voor schepen · **ZU** zuilen of kolommen langs de kade · **OV** overkapping of daglicht van boven · **NE** netten of vistuig aan de kade · **SP** rails op de kade

| nr | Haven | Plaats | Land | Kenmerk voor ons ontwerp | Codes |
|---:|---|---|---|---|---|
| 1 | Maasvlakte 2 | Rotterdam | Nederland | Geautomatiseerde containerterminals: een lange rij containerkranen langs een kilometers lange kademuur. | CK, SP |
| 2 | Wilhelminapier | Rotterdam | Nederland | Hotel New York: het oude hoofdkantoor van de Holland-Amerika Lijn met twee torentjes met klokken, op de kop van de pier. | HK, KL, VE |
| 3 | Delfshaven | Rotterdam | Nederland | Smalle oude haven met pakhuizen, een ophaalbrug en oude zeilschepen. | PH, BR, SC |
| 4 | Veerhaven | Rotterdam | Nederland | Kleine binnenhaven aan de Maas met historische zeilschepen aan steigers. | SC, DS |
| 5 | Entrepotdok | Amsterdam | Nederland | Lange rij 19e-eeuwse pakhuizen (vroeger douane-opslag) met hijsbalken en houten luiken. | PH, HB |
| 6 | NDSM-werf | Amsterdam | Nederland | Enorme open scheepsbouwloods en een oude havenkraan aan het IJ. | LO, KR, DR |
| 7 | IJ-veren achter Centraal Station | Amsterdam | Nederland | Gratis ponten varen heen en weer; je loopt over een klep de pont op. | VE |
| 8 | Noorderhaven | Harlingen | Nederland | Gegraven in 1578; pakhuizen en koopmanshuizen uit de 16e–18e eeuw, ophaalbruggen en de bruine vloot. | PH, BR, SC |
| 9 | Willemsoord | Den Helder | Nederland | Oude Rijkswerf met droogdok, een mastenloods (ca. 1826) en museumschepen. | DR, LO, SC |
| 10 | Scheveningen | Den Haag | Nederland | Vissershaven met visafslag, twee havenhoofden met lichten en een jachthaven. | VM, HH, VT, DS |
| 11 | IJmuiden | Velsen | Nederland | Zeesluis IJmuiden (2022) naar het Noordzeekanaal, een visafslag en twee vuurtorens. | SL, VM, VT, HH |
| 12 | Urk | Urk | Nederland | Visafslag in de oude haven en een vuurtoren op de oude dijk. | VM, VT, SC |
| 13 | Enkhuizen | Enkhuizen | Nederland | De Drommedaris (1540): een verdedigingstoren aan de havenmond. | VS, SC, DS |
| 14 | Hoorn | Hoorn | Nederland | De Hoofdtoren (1532) aan de binnenhaven, met oude pakhuizen langs de kade. | VS, PH, SC, DS |
| 15 | Zierikzee | Zierikzee | Nederland | Zuidhavenpoort en Noordhavenpoort: twee stadspoorten aan de oude haven. | VS |
| 16 | Groothoofd | Dordrecht | Nederland | De Groothoofdspoort op de plek waar drie rivieren samenkomen. | VS, PH |
| 17 | Vlissingen | Vlissingen | Nederland | Scheepswerf aan de Westerschelde en de voetveerpont naar Breskens. | DR, VE |
| 18 | Terneuzen | Terneuzen | Nederland | Grote zeesluizen naar het kanaal Gent–Terneuzen, met bruggen over de sluizen. | SL, BR |
| 19 | Lauwersoog | Lauwersoog | Nederland | Vissershaven met garnalenkotters en een visafslag achter de Robbengatsluis. | VM, SL |
| 20 | Volendam | Volendam | Nederland | Haven met botters en palingrokerijen langs de dijk. | SC, MA |
| 21 | Havenhuis | Antwerpen | België | Glazen "diamant" (Zaha Hadid, 2016) bovenop een oude brandweerkazerne, midden in een containerhaven. | HK, CK |
| 22 | Vistrap | Oostende | België | Een rij viskraampjes langs de kade. | MA, VM |
| 23 | Speicherstadt | Hamburg | Duitsland | Grootste pakhuiswijk ter wereld op eikenhouten palen; hijsluiken en takels aan de waterkant. | PH, HB, BR |
| 24 | Landungsbrücken | Hamburg | Duitsland | Drijvende pontons voor de veerboten; een toren met klok en een peilschaal voor het waterpeil. | DS, VE, KL, GE |
| 25 | Wasserschout | Bremen | Duitsland | Douanehuis (1897) bij de oude havensluis. | HK, SL |
| 26 | Salzspeicher | Lübeck | Duitsland | Rij zoutpakhuizen (16e–18e eeuw) aan de Trave. | PH |
| 27 | Żuraw | Gdańsk | Polen | Middeleeuwse havenkraan (1442–1444): een houten hijswerk tussen twee bakstenen torens, ook stadspoort. | KR, VS |
| 28 | Bryggen | Bergen | Noorwegen | Houten Hanzepakhuizen met hijsbalken in de puntgevels; vismarkt aan de kop van de haven. | PH, HB, VM, KM |
| 29 | Nyhavn | Kopenhagen | Denemarken | Kleurrijke gevels langs een smal kanaal met houten zeilschepen. | KM, SC |
| 30 | Øresund-douanehuis | Helsingør | Denemarken | Douanehuis (uitgebreid 1830–31) met een klok boven de ingang; slot Kronborg en de veerboot naar Zweden. | HK, KL, VS, VE |
| 31 | Kauppatori | Helsinki | Finland | Marktplein aan de haven met een oude markthal (1889) en veerboten naar Suomenlinna. | MA, VE |
| 32 | Tinganes | Tórshavn | Faeröer | Rode houten gebouwen met grasdaken op een rotspunt in de haven. | KM, HK |
| 33 | Royal Albert Dock | Liverpool | Verenigd Koninkrijk | Bakstenen pakhuizen (1846) op een rij gietijzeren zuilen langs de kade. | PH, ZU |
| 34 | St Katharine Docks | Londen | Verenigd Koninkrijk | Oud dok met sluis, nu een jachthaven met steigers tussen de pakhuizen. | DS, SL, PH, BR |
| 35 | Floating Harbour | Bristol | Verenigd Koninkrijk | Vier oude elektrische havenkranen op de kade; de SS Great Britain in een droogdok. | KR, DR, SC, SL |
| 36 | Historic Dockyard | Portsmouth | Verenigd Koninkrijk | HMS Victory in een droogdok. | DR, SC |
| 37 | Whitby | Whitby | Verenigd Koninkrijk | Twee havenhoofden met vuurtorentjes en een draaibrug over de rivier. | HH, VT, BR, VM |
| 38 | St Ives | St Ives | Verenigd Koninkrijk | Getijdenhaven: bij eb liggen de boten op het zand; een pier met een lichtje. | GE, HH, VT |
| 39 | Customhouse Quay | Greenock | Verenigd Koninkrijk | Klokkentoren op de kade (ca. 1860) die ook havenlicht was. | KL, VT, HK |
| 40 | Harbour Office | Belfast | Verenigd Koninkrijk | Havenkantoor (1854) met klokkentoren; de gele werfkranen Samson en Goliath. | HK, KL, KR, DR |
| 41 | Custom House Quay | Dublin | Ierland | Douanehuis (1791) aan de kade van de Liffey. | HK |
| 42 | Dún Laoghaire | Dún Laoghaire | Ierland | Twee lange granieten pieren met vuurtorens; je wandelt tot op de kop. | HH, VT |
| 43 | Saint-Malo | Saint-Malo | Frankrijk | Ommuurde stad met een getijverschil tot ongeveer 13 m; sluizen houden de bassins op peil. | VS, GE, SL |
| 44 | Vieux Bassin | Honfleur | Frankrijk | Hoge, smalle huizen met leien gevels rond een jachthaven. | KM, DS |
| 45 | Vieux-Port | Marseille | Frankrijk | Elke ochtend vismarkt op de kade; een spiegelende luifel (2013); forten bij de ingang. | VM, MA, OV, VS |
| 46 | Cais das Colunas | Lissabon | Portugal | Een marmeren kadetrap tussen twee zuilen, tot in de Taag. | KT, ZU, VE |
| 47 | Ribeira | Porto | Portugal | Rabelo-bootjes voor kleurrijke huizen op de helling; de ijzeren Dom Luís I-brug. | KM, ST, BR, SC |
| 48 | Arsenale | Venetië | Italië | Oude scheepswerf achter een torenpoort; kadetrappen tot in het water en drijvende haltes. | DR, VS, KT, DS, VE |
| 49 | Porto Antico | Genua | Italië | De Lanterna, een van de oudste werkende vuurtorens; de Bigo in de vorm van een havenkraan. | VT, KR, PH |
| 50 | Grand Harbour | Valletta | Malta | Bastions boven de haven; elke dag om 12.00 uur schiet de Saluting Battery een kanon af. | VS, ST, TK, VE |
| 51 | Piraeus | Piraeus | Griekenland | Containerterminal en de grootste passagiershaven van Europa: veerboten naar de eilanden. | CK, VE |
| 52 | Eminönü en Karaköy | Istanbul | Turkije | Veerboten over de Bosporus; vissers op de Galatabrug en visbroodjesboten aan de kade. | VE, BR, VM, MA |
| 53 | Yangshan | Shanghai | China | Geautomatiseerde diepzeehaven, met het vasteland verbonden door de Donghai-brug (ruim 32 km). | CK, BR |
| 54 | The Bund | Shanghai | China | Custom House (1927) met klokkentoren langs de kade van de Huangpu. | HK, KL, VE |
| 55 | Victoria Harbour | Hongkong | China | Star Ferry heen en weer; bij de pier de klokkentoren (1915) van het oude station. | VE, KL, DS |
| 56 | Busan | Busan | Zuid-Korea | Jagalchi-vismarkt aan de kade, naast een van de grootste containerhavens. | VM, CK, MA |
| 57 | Toyosu | Tokio | Japan | Groothandelsvismarkt met tonijnveiling (sinds 2018); bezoekers kijken vanaf een galerij. | VM |
| 58 | Shinko | Yokohama | Japan | Red Brick Warehouse (1911 en 1913), gebouwd als douanepakhuizen. | PH, HK |
| 59 | Otaru-kanaal | Otaru | Japan | Kanaal (1923) met stenen pakhuizen van rederijen en kooplieden. | PH |
| 60 | Kanemori | Hakodate | Japan | Rode bakstenen pakhuizen, herbouwd in 1909 na een grote brand. | PH |
| 61 | Dejima | Nagasaki | Japan | Nederlandse handelspost op een kunstmatig eiland in de haven (1641–1859). | PH, HK |
| 62 | Sunda Kelapa | Jakarta | Indonesië | Oude haven van Batavia: houten pinisi-schoeners, VOC-pakhuizen en de havenmeesterstoren. | SC, PH, HK |
| 63 | Fort Galle | Galle | Sri Lanka | Nederlands fort aan de haven met een vuurtoren op de wal. | VS, VT |
| 64 | Fort Kochi | Kochi | India | Chinese visnetten: grote houten hefconstructies aan de kade. | NE, VM |
| 65 | Dubai Creek | Dubai | Verenigde Arabische Emiraten | Houten dhows laden en lossen aan de kades; abra-bootjes varen over de kreek. | SC, VE, MA |
| 66 | Fujairah | Fujairah | Verenigde Arabische Emiraten | Grote olieopslag in tanks voor de scheepvaart. | TO |
| 67 | Pasir Panjang en Tuas | Singapore | Singapore | Een van de drukste containerhavens ter wereld: rijen kranen en stapels containers. | CK |
| 68 | V&A Waterfront | Kaapstad | Zuid-Afrika | Clock Tower (1882), eerst het kantoor van de havenkapitein; een draaibrug en een droogdok. | KL, HK, BR, DR |
| 69 | Durban | Durban | Zuid-Afrika | De drukste containerhaven van Afrika ten zuiden van de Sahara. | CK |
| 70 | Tanger Med | Tanger | Marokko | Grote containerhaven aan de Straat van Gibraltar, met veerboten naar Spanje. | CK, VE |
| 71 | Essaouira | Essaouira | Marokko | Blauwe vissersboten, houten bootbouw op de kade en een stenen verdedigingstoren. | VM, SC, DR, VS |
| 72 | Oostelijke Haven | Alexandrië | Egypte | Citadel van Qaitbay op de plek van de oude vuurtoren van Pharos. | VS, VT |
| 73 | Old Port | Mombasa | Kenia | Dhows in de oude haven onder Fort Jesus. | SC, VS |
| 74 | Stone Town | Zanzibar | Tanzania | Dhows voor de kust en een avondmarkt met eten in de Forodhani-tuinen aan het water. | SC, MA |
| 75 | Soumbédioune | Dakar | Senegal | Kleurrijke houten pirogues op het strand bij de vismarkt; veerboot naar Gorée. | VM, SC, KM, VE |
| 76 | Porto Grande | Mindelo | Kaapverdië | Aan de waterkant een kopie van de Torre de Belém uit Lissabon. | VS |
| 77 | South Street Seaport | New York | Verenigde Staten | Schermerhorn Row (bakstenen pakhuizen uit de jaren 1810) en historische zeilschepen aan de pier. | PH, SC |
| 78 | Long Wharf | Boston | Verenigde Staten | Custom House Tower: douanehuis met klokkentoren (1915). | HK, KL |
| 79 | Ferry Building | San Francisco | Verenigde Staten | Veerterminal (1898) met klokkentoren en een lange hal met daglicht van boven; markt binnen. | VE, KL, OV, MA, LO |
| 80 | Fisherman's Wharf | San Francisco | Verenigde Staten | Krabkramen aan de kade en historische schepen aan de Hyde Street Pier. | VM, MA, SC |
| 81 | San Pedro Bay | Los Angeles en Long Beach | Verenigde Staten | Het grootste containerhavencomplex van de VS. | CK |
| 82 | Houston Ship Channel | Houston | Verenigde Staten | Kanaal met kilometers olie- en chemicaliëntanks langs de oever. | TO |
| 83 | Granville Island | Vancouver | Canada | Markt in oude fabrieksloodsen onder een brug; kleine veerbootjes. | LO, MA, VE, BR |
| 84 | Pier 21 | Halifax | Canada | Grote aankomstloods voor immigranten aan de kade (nu museum). | LO, HK |
| 85 | Lunenburg | Lunenburg | Canada | Rode visloodsen aan het water (visserijmuseum) en de schoener Bluenose II. | LO, KM, SC |
| 86 | Miraflores-sluizen | Panama-Stad | Panama | Sluizen van het Panamakanaal; elektrische locomotieven op rails trekken de schepen. | SL, SP |
| 87 | Puerto Madero | Buenos Aires | Argentinië | Rode bakstenen dokpakhuizen (1900–1905), bewaarde havenkranen en een draaibrug. | PH, KR, BR |
| 88 | Valparaíso | Valparaíso | Chili | Kabelliftjes (ascensores) van de haven de heuvels op; kleurrijke huizen. | ST, KM, CK |
| 89 | Santos | Santos | Brazilië | Grootste containerhaven van Latijns-Amerika; de koffiebeurs heeft een klokkentoren. | CK, KL, HK |
| 90 | Mercado del Puerto | Montevideo | Uruguay | IJzeren markthal (1868) bij de haven met een grote klok in het midden. | MA, KL, ZU, OV |
| 91 | Cidade Baixa | Salvador | Brazilië | Elevador Lacerda: een lift tussen de haven en de bovenstad; Mercado Modelo in een oud douanegebouw. | ST, MA, HK |
| 92 | Ilha Fiscal | Rio de Janeiro | Brazilië | Neogotisch douanegebouwtje op een eilandje in de baai. | HK |
| 93 | Ushuaia | Ushuaia | Argentinië | Zuidelijkste haven; de rood-witte vuurtoren Les Éclaireurs in het Beaglekanaal. | VT |
| 94 | Circular Quay | Sydney | Australië | Veerbootpieren met pontons; het oude Customs House aan het plein. | VE, DS, HK |
| 95 | Walsh Bay | Sydney | Australië | Houten vingerpieren met loodsen op palen in het water. | LO, HH |
| 96 | Salamanca Place | Hobart | Australië | Zandstenen pakhuizen (jaren 1830); goederen werden vanaf de bovenverdieping op schepen gehesen. | PH, HB, VM |
| 97 | Williamstown | Melbourne | Australië | Tijdbaltoren: de bal viel op een vast tijdstip zodat schepen hun klok gelijk konden zetten. | TK, VT |
| 98 | Lyttelton | Lyttelton | Nieuw-Zeeland | Timeball Station (1876), na aardbevingsschade herbouwd. | TK |
| 99 | Wynyard Quarter | Auckland | Nieuw-Zeeland | Oude silo's en tanks aan de kade zijn bewaard (Silo Park); jachthaven ernaast. | TO, DS |
| 100 | Port Lockroy | Goudiereiland | Antarctica | Natuurlijke haven met een oud Brits basisstation, nu museum en postkantoor. | HK |

---

## 3. Top 15 van terugkerende kenmerken (b)

| # | Kenmerk | Aantal | Wat we ermee doen in De Ellehaven |
|---:|---|---:|---|
| 1 | Historische schepen aan de kade | 21 | Aan de steigers liggen een kotter (met de kombuis) en een botter. Op de helling staat een schip in aanbouw. Je komt aan met een oude **waterbus**. De Eenheid is het moderne contrast. |
| 2 | Havenkantoor of douanehuis | 20 | Het **havenkantoor** staat aan de kop van de haven. Beneden is de havenmeesterij (uitleg), boven de kaartenkamer (rekenkaart). In de vertrekloods staat een douanebalie (goudstaven). |
| 3 | Veerpont of veerboot | 19 | Je stapt van de waterbus op het kadeplein. Naast de boot staat de pallet sap die net is uitgeladen. In de vertrekloods hangt de dienstregeling (station *pont*). |
| 4 | Pakhuizen aan het water | 19 | **Pakhuis De Hijsbalk**: baksteen, groene luiken, twee lagen en een hijsbalk boven het zolderluik. Hier liggen de 'goederen' van de keuzeopdrachten: cement, kabel, zand en sap. |
| 5 | Vismijn, visafslag of vismarkt | 16 | De **visafslag** met tribune en veilingklok wordt het lokaal voor *Samen oefenen*. Kopers zitten op een tribune en kijken samen naar de klok, net als een klas. |
| 6 | Fort, stadspoort of toren bij de havenmond | 15 | We bouwen geen fort, maar gebruiken het idee 'poort aan het water'. De **uitgang** is een douanepoort aan de loopplank, met een seinmast. Torens helpen je de weg te vinden: de klokkentoren en de vuurtoren. |
| 7 | Markt of kramen aan de kade | 13 | Op de afslagvloer staan genummerde kavels. Op de steigers staan een smoothiekiosk en een drijvend havencafé. |
| 8 | Klok of klokkentoren | 12 | De **klokkentoren** op het havenkantoor zie je overal en hij loopt mee met de fases. In de visafslag hangt een **veilingklok**. Tijd is ook een grootheid. |
| 9 | Beweegbare of opvallende brug | 12 | Over de havenmond ligt een dubbele **Hollandse ophaalbrug**. Hij staat omhoog tot de Eindcheck. Dan zakt hij en wordt hij een kortere weg naar de vertrekloods. |
| 10 | Vuurtoren of havenlicht | 12 | Op het havenhoofd staat een rood-witte **vuurtoren**. Het draaiende licht gaat aan in het blauwe uur. Ernaast staat het weerstation. |
| 11 | Containerkranen en containers | 11 | Boven de vertrekkade staat één **portaalkraan**. Op het terrein ernaast staan containerstapels, en ver aan de horizon zie je een grote containerterminal als silhouet. |
| 12 | Drijvende steigers of pontons | 11 | In de havenkom ligt de **jachthaven**: een hoofdsteiger, twee pontons en een kopponton, 0,8 m lager dan de kade. Hier zit de klus 'Schenken'. |
| 13 | Werf, helling of droogdok | 9 | De **werf** heeft een werkplaats en een helling met een kotter in aanbouw. Hier zit de klus 'Meten'. |
| 14 | Sluis | 8 | De ophaalbrug ligt op een **keersluis**: twee houten sluisdeuren staan open in hun nissen (decor). Ernaast staat een peilschaal. |
| 15 | Kleurrijke gevels | 8 | Achter het kadeplein staat op de dijk een rij smalle huisjes met gekleurde gevels (decor buiten de plattegrond). In de haven zelf houden we het rustig: baksteen en groen. |

**Net buiten de top 15, maar wel gebruikt:**
- open loodsen (7): de werkplaats, de weegloods en de vertrekloods;
- historische havenkraan (6): een oude kraan op de pakhuiskade waar je onderdoor loopt;
- havenhoofd (6): met de vuurtoren;
- hijsbalk (4): op het pakhuis;
- tijdbal (3): op de klokkentoren, valt bij de start van de Eindcheck;
- getij (3): de peilschaal, en hoogwater als vertrektijd;
- zuilen (3) en daglicht van boven (3): kolommen en een lichtstraat in de loodsen.

**Niet gebruikt:** een haven tegen een helling (past niet bij Nederland), tankopslag (alleen als silhouet in de verte) en netten (alleen als klein decor).

**Wat bijna elke beroemde haven heeft:** één hoog herkenningspunt aan het water, zoals een klok, een vuurtoren of een kraan. Wij gebruiken er drie, in een driehoek: de **klokkentoren (zuid)**, de **vuurtoren (noordwest)** en de **portaalkraan (noordoost)**. Zo weet je in first person altijd waar je bent, ook zonder overzicht van boven.

---

## 4. Het concept (c)

### 4.1 Naam en verhaal

**De Ellehaven.** In 1820 ging Nederland over op het metrieke stelsel, maar met de oude namen. Een meter heette een **el**, een centimeter een **duim**, een kilogram een **pond**, 100 gram een **ons** en een liter een **kan**. Het ons gebruiken we nog steeds. Aan de gevel van het havenkantoor hangt een bronzen ijkmaat van 1 el (= 1 meter) met de duimen erop, op ooghoogte. Daar kun je je eigen lengte mee vergelijken.

Het verhaal blijft hetzelfde, met kleine verbeteringen:
- Om 21.30 uur is het hoogwater. Alleen dan kan De Eenheid de haven uit. Maar de maten van de lading kloppen niet.
- Mees de havenmeeuw blijft je maatje. Havenmeester Fenna (bestaat al als decor) staat in de havenmeesterij.
- Er zijn drie kluizen met drie sleutels. Elke open kluis zet een licht aan in de seinmast bij de poort. Dat licht zie je overal in de haven: het is je voortgang, zonder kaart.
- Aan het eind gaat de poort open. Je loopt de loopplank op, De Eenheid toetert en vaart weg.

Voorstel voor de teksten (2F; dit zijn geen opdrachtteksten):
- **missie:** "Om half tien is het hoogwater. Dan vaart De Eenheid uit." / "Maar de maten van de lading kloppen niet." / "Open de drie kluizen. Dan gaat de poort naar het schip open."
- **intro Mees:** ["Ahoy! Ik ben Mees, de meeuw van de Ellehaven.", "Ik ken hier elke kade en elke bolder."] · ["Kijk, daar ligt De Eenheid.", "Om half tien is het hoogwater. Dan vaart ze uit."] · ["Maar de maten van de lading kloppen niet.", "Reken ze om met de eenhedentrap."] · ["Zie je de seinmast bij het schip?", "Elke open kluis zet daar een licht aan."]
- **hintTerugblik:** "Loop naar de pallet bij de waterbus. Tik op het oranje icoon." · **hintInstructie:** "De deur van het havenkantoor is open. Loop naar binnen."
- **klusnamen** (de id's blijven gelijk): `lengte` "Meten op de werf", `inhoud` "Schenken op de steigers", `gewicht` "Wegen in de loods".
- **Mees** zit bij de start op de klokkentoren. Bij hints landt hij op de dichtstbijzijnde bolder of reling. In de visafslag pikt hij één keer een vis van een kavel (grapje, ver van de getallen).

### 4.2 Sfeer en tijdstip

Het is een heldere avond laat in de zomer (eind augustus). Je begint in het **gouden uur (19.40 uur)** en eindigt in het **blauwe uur (21.30 uur)**. De zon gaat onder in het westnoordwesten: boven zee, achter de vuurtoren.

Waarom dit tijdstip?
1. **Leesbaar.** In de eerste fases krijg je veel nieuwe informatie. Dan is het licht nog helder, zodat borden en etiketten goed te lezen zijn, ook op een Chromebook.
2. **Je voelt de voortgang.** Elke fase is een kwartier later. Het licht, de klok en de lampen veranderen mee. De tijd geeft sfeer, maar is geen straf (patroon 15 uit het onderzoek).
3. **Mooi op ooghoogte.** Een lage zon geeft lange schaduwen over de kinderkopjes. Kranen, masten en het schip staan als silhouet tegen een oranje lucht.
4. **Licht wijst de weg.** In het blauwe uur gaan de ramen en lampen aan van de plekken die net open zijn. Het licht trekt je naar de volgende plek.
5. **Het klopt.** Een schip vertrekt bij hoogwater. Dat verklaart de vertrektijd, zonder echte tijdsdruk.

| Fase | Klok | Zon (kleur, sterkte, hoogte) | Lucht en mist | Lampen |
|---|---|---|---|---|
| Terugblik, Doel | 19.40 | warm geel `#ffc98a`, 2,2, ca. 8° in het WNW | lichtblauw naar perzik, mist `#e8c9a6` vanaf 45 m | uit |
| Uitleg | 19.55 | `#ffbb7a`, 2,0, 6° | idem | havenkantoor aan |
| Samen | 20.10 | `#ffa866`, 1,7, 4° | perzik naar roze | + visafslag |
| Zelf | 20.40 | `#ff8f62`, 1,0, 1° (net boven zee) | roze-paars `#c9b6d8`, mist vanaf 38 m | kadelantaarns aan, ramen gloeien |
| Check | 21.10 | maanlicht `#b8c6ff`, 0,8 | blauw uur (palet van nu), mist `#28335a` vanaf 30 m | vertrekloods, schip, vuurtoren, rode lampen op de kraan |
| Klaar | 21.30 | idem | idem + sterren | alles aan, het schip vaart weg |

### 4.3 Kleuren en materialen

We gebruiken weinig materialen. Kleurverschillen maken we met vertexkleuren. In totaal zijn het **14 materialen** plus de tekst-atlas.

| Materiaal | Kleur | Waar |
|---|---|---|
| Baksteen (1 textuur, 3 tinten) | rood-bruin `#8a4b35`, oranjerood `#9a5a3c`, donker `#6e3a2c` | pakhuis, havenkantoor, visafslag en werf |
| Natuursteen (banden, plint) | `#d8cdb8` | havenkantoor, sluishoofden |
| Hardsteen (kantstenen) en kademuur | `#5f6670`; muur donkere baksteen met algenrand `#3f5a3a` | alle kades |
| Kinderkopjes en klinkers | `#8d8a86` en `#9a7e6a` | kades en kadeplein |
| Hout, verweerd | `#8a6440` | steigers, loopbrug, tribune |
| Hout, geschilderd (vertexkleur) | Amsterdams groen `#2c4a3b`, wit `#efe9dc` | luiken, deuren, hekken |
| Staal, geschilderd (vertexkleur) | kraan wit `#e9e3d8` met blauw `#2f6f9a`; oude kraan groengrijs `#5d6b5a`; brug zwart-wit | kranen, brug, kolommen |
| Golfplaat en zink | `#8c949a` | loodsdaken |
| Dak: pannen en leien | `#8e3f2c` en `#3b4148` | pakhuis en havenkantoor |
| Glas (1 materiaal: helder of warm) | — | ramen, lichtstraten |
| Water (1 shader) | dag `#2e5d6b`, blauw uur `#1b3346` | kom, buitenhaven, zee |
| Beton | `#b3b0a8` | loodsvloeren, helling, havenhoofd |
| Signaalkleuren (vertexkleur) | geel-zwart `#f2c230`/`#1f1f1f`, rood-wit `#d23a2a`/`#f3efe6` | weegbrug, vuurtoren, slagboom, reddingsboeien |
| Emissive (1 materiaal, 1 uniform) | warm `#ffb45c` | ramen, lantaarns, seinmast |

De regel: elke zone heeft één hoofdmateriaal en accenten in vertexkleur. Komt er een nieuwe textuur bij, dan moet er een andere weg.

### 4.4 Licht

- **Buiten** schijnt één zon met schaduw, plus hemellicht; in het blauwe uur de maan. Er staan 24 kadelantaarns (instanced) met een gloed als sprite. Alleen de 4 dichtstbijzijnde geven echt licht.
- **Binnen** valt daglicht door de ramen en lichtstraten. Lampen per kamer (`lampen`) geven een warme lichtplek op de vloer. In de loodsen hangen industriële lampen. In de visafslag is het licht koel wit, met een warme gloed rond de klok.
- **Licht als hint:** wat open gaat, krijgt licht. Bij elke nieuwe fase gaan de lampen van de nieuwe zone aan, een halve seconde na het geluid van de deur.

### 4.5 Geluid

- **Buiten, altijd:** meeuwen (richting water), golfjes tegen de kademuur, krakende touwen en stootbanden, ver weg een scheepsdiesel. Op het havenhoofd waait het harder.
- **Klokkentoren:** slaat bij elke nieuwe fase (het 'kwartier'). Bij de start van de Eindcheck valt de tijdbal met een klap.
- **Per zone:**
  - havenmeesterij: een krakende marifoon en een tikkende wandklok;
  - visafslag: de tikkende veilingklok, zoemende koelcellen en echo;
  - pakhuis: een krakende houten vloer, en op zolder wind door het luik;
  - werf: in de verte een hamer en een zaag;
  - steigers: water dat onder de planken klotst, en een steiger die deint;
  - weegloods: de piep van een achteruitrijdende heftruck en het piepje van de weegbrug;
  - vertrekloods: een omroep ("De Eenheid vertrekt om half tien") en voetstappen met echo.
- **Feedback:** een roldeur ratelt omhoog, een hek piept. De ophaalbrug geeft een bel, motorgeluid en een zware klap. Een open kluis geeft een zoemer bij de seinmast en zet een licht aan. In de finale klinkt een lange scheepshoorn.
- Alle geluiden komen uit een richting (3D). Zo hoor je waar je nog niet geweest bent.

---

## 5. De plattegrond in woorden (d)

**Assen** zoals in de code: x loopt naar het oosten, z naar het zuiden (noord = −z). Alle maten zijn in meters. De kade en de vloeren liggen op y = 0, het water op y = −1,2 en de steigers op y = −0,8.

**Omvang:** ongeveer 58 × 56 m land, met het havenhoofd erbij. Op de begane grond is 1997 m² begaanbaar, op de verdieping 292 m². Dat is iets minder dan nu (ca. 2100 m²), en alles ligt rond één havenkom. De verste plek, de kop van het havenhoofd, ligt op 50 m lopen van de start: 11 seconden. Het eiland kan `[90, 79]` blijven, maar `[84, 76]` past ook.

**Raster** (kolommen van west naar oost): A x −26..−14 (12 m) · B −14..−8 (6 m, westkade) · C −8..8 (16 m, havenkom) · D 8..14 (6 m, oostkade) · E 14..26 (12 m). De extra verdieping zit alleen in het havenkantoor en het pakhuis: `verdiepingHoogte` 3,9.

| Zone | x | z | Maat | Soort | Hoogte | Vloer | Open vanaf |
|---|---|---|---|---|---|---|---|
| Kadeplein | −14..14 | 6..14 | 28 × 8 | buiten | – | klinkers, langs de kade kinderkopjes | start |
| Havenkantoor: havenmeesterij | −8..8 | 14..22 | 16 × 8 | binnen, v0 | 3,6 | visgraat | Uitleg |
| Havenkantoor: kaartenkamer | −8..8 | 14..22 | 16 × 8 | binnen, v1 | 3,3 | planken | Zelf (trap) |
| Balkon | −4..4 | 11,5..14 | 8 × 2,5 | buiten, v1, reling | – | planken | Zelf |
| Klokkentoren (decor) | −2..2 | 16..20 | 4 × 4 | op het dak, tot 14 m | klok op 11 m, tijdbal op 14 m | – | – |
| Visafslag | −26..−14 | 6..22 | 12 × 16 | binnen | 6,5 (sheddak met glasstroken) | glad beton met natte glans | Samen |
| Pakhuis | −26..−14 | −6..6 | 12 × 12 | binnen, v0 | 3,6 (balkenplafond) | planken | Zelf |
| Pakhuis: zolder | −26..−14 | −6..6 | 12 × 12 | binnen, v1 | kap, nok 5,5 m boven de vloer | planken | Zelf |
| Pakhuiskade | −14..−8 | −18..6 | 6 × 24 | buiten | – | kinderkopjes | Zelf |
| Werf: werkplaats | −26..−14 | −18..−6 | 12 × 12 | binnen, oostzijde open | 6,0 (stalen spanten) | beton | Zelf |
| Werf: helling | −26..−8 | −24..−18 | 18 × 6 | buiten | – | beton en grind | Zelf |
| Havenhoofd | −14..−8 | −34..−24 | 6 × 10 | buiten | – | beton en basaltblokken | Zelf |
| Havenkom (water) | −8..8 | −15..6 | 16 × 21 | water, y −1,2 | – | – | – |
| Jachthaven (steigers, y −0,8) | loopbrug −1..1 · hoofdsteiger −1,5..1,5 · werkponton −6,5..−1,5 · caféponton 1,5..6,5 · kopponton −5,5..5,5 | 1..6 · −10,6..1 · −4,6..−1,8 · −6,2..−1,8 · −14..−10,6 | 2×5 · 3×11,6 · 5×2,8 · 5×4,4 · 11×3,4 | buiten, drijvend | – | vlonder | Zelf |
| Ophaalbrug | −8..8 | −18..−15 | 16 × 3 | buiten, beweegt | – | staal en hout | Check |
| Buitenhaven (water) | −8..8 | −24..−18 | 16 × 6 | water, daarna open zee | – | – | – |
| Oostkade | 8..14 | −18..6 | 6 × 24 | buiten | – | kinderkopjes met kraanrails | Zelf |
| Weegloods | 14..26 | −6..6 | 12 × 12 | binnen, westzijde open | 6,0 | beton met weegbrug | Zelf |
| Kantine | 14..26 | 6..14 | 12 × 8 | binnen | 3,2 | tegels | Zelf |
| Vertrekloods | 14..26 | −18..−6 | 12 × 12 | binnen | 6,5 (glazen lichtstraat) | steen | Check |
| Vertrekkade | 14..32 | −26..−18 | 18 × 8 | buiten | – | beton en kinderkopjes | Check, na blok 1 |
| Loopplank en dek | 15..18 | −31..−26 | 3 × 5 | buiten | helling van 0 naar +1,5 | staal | Klaar |

### 5.1 De zones

- **Kadeplein (start, het hart).** 28 × 8 m klinkers, met een strook kinderkopjes langs de kade.
  - Noord: de kade, met kantstenen en om de 4 m een bolder. In het midden gaat de loopbrug naar de steigers, oostelijk ligt de waterbus.
  - Zuid: de gevel van het havenkantoor. Boven de deur steekt het balkon uit als luifel.
  - West: de visafslag met zijn roldeur. Oost: de dichte muur van de kantine met grote ramen.
  - Op het plein staan bankjes, twee lantaarns, het mededelingenbord van de haven (*buitenmissie*) en de pallet. Op de kademuur zit een peilschaal.
  - Groene stalen hekken (1,1 m) sluiten de pakhuiskade en de oostkade af.
- **Havenkantoor.**
  - Twee lagen baksteen met natuurstenen banden en een schilddak van leien. In het midden staat een vierkante toren (4 × 4 m) van 14 m hoog. Aan alle vier de kanten zit een klok (Ø 1,6 m, op 11 m hoogte), en bovenop een tijdbal.
  - Begane grond (de havenmeesterij, 3,6 m hoog): de balie van havenmeester Fenna (oost), een uitlegtafel met touw (west) en een wandbord met de eenhedentrap (westmuur). Langs de achtergevel gaat een trap omhoog (4,4 × 1,2 m). Tot *Zelf doen* hangt er een ketting voor. Op de treden staan km, hm, dam, m, dm, cm en mm: je loopt over de echte eenhedentrap.
  - Boven ligt de kaartenkamer (3,3 m hoog), met zes lessenaars, de grote rekenkaart aan de westmuur en een globe. Een deur geeft toegang tot het balkon (reling 1,1 m), met uitzicht over de hele haven.
- **Visafslag.**
  - Een hal van 12 × 16 m en 6,5 m hoog, met een sheddak met glasstroken (daglicht van boven). De muren zijn van donkere baksteen, tot 2 m hoogte betegeld met witte tegels.
  - Je komt binnen door een roldeur van 4 m breed en 3,8 m hoog vanaf het kadeplein. Binnen hangt boven de roldeur de ronde veilingklok (Ø 2,4 m).
  - Langs de westmuur staat een tribune met kopersbanken: drie treden van 1,1 m diep en 0,42 m hoog. Op de vloer staan vijf afslagtafels in een U (kavel 1 tot en met 5).
  - In de noordmuur zit de koelceldeur naar het pakhuis. Die gaat open bij *Zelf doen*.
- **Pakhuis De Hijsbalk.**
  - 12 × 12 m, twee lagen en een kap. Het zadeldak heeft de nok van oost naar west. De topgevel kijkt naar de kade, met de hijsbalk en een groot zolderluik.
  - Begane grond (3,6 m hoog, houten balken, twee gietijzeren kolommen in het midden): pallets cement en de kabelhaspel. De trap gaat langs de noordmuur omhoog.
  - Zolder: je ziet de schuine kap. Hier staan de zandbak en de bag-in-box. Het open hijsluik heeft een reling en uitzicht over de kom. Boven de pakhuisdeur zit een vloerluik met balustrade (vide, 2 × 1,6 m).
- **Pakhuiskade.** Een kade van 6 m breed langs de westkant van de kom. Er staat een oude elektrische havenkraan op rails: de poten staan 4,5 m uit elkaar, dus je loopt eronderdoor. Verder bolders en een kadetrap naar het water (afgezet, alleen decor).
- **Werf.**
  - De werkplaats is 12 × 12 m en 6 m hoog. De kant naar de kade is open, met om de 4 m een stalen kolom. Onder het dak zitten stalen spanten en een loopkraan.
  - Het werfterrein (18 × 6 m) heeft een helling: een betonnen strook die vanaf z −21 het water in loopt. Daarop staat een kotter in aanbouw op een slede, met de boeg naar het land.
  - Bij de opgebroken kaderand staan bouwhekken en een bord "Voetpad dicht – omleiding".
- **Havenhoofd.** 6 × 10 m beton met basaltblokken. Op de kop staat de vuurtoren (Ø 2,8 m, 9 m hoog, rood-wit, met draaiend licht), met het weerstation erbij. Hier zie je de horizon voor het eerst helemaal vrij.
- **Havenkom en jachthaven.**
  - Het water is 16 × 21 m. De kademuur staat 1,2 m boven het water.
  - De steigers drijven 0,8 m onder de kade. Je ogen zijn daar maar 0,75 m hoger dan de kade, dus de haven voelt laag en dicht bij het water.
  - Een loopbrug van 5 m (helling 16 %) gaat naar beneden. Daarna volgen de hoofdsteiger van 3 m breed, twee pontons en een kopponton van 11 × 3,4 m.
  - Aan de steigers liggen een kotter (west), een botter (oost) en twee sloepen. De waterbus ligt aan het kadeplein.
- **Ophaalbrug en keersluis.**
  - Over de havenmond ligt een dubbele Hollandse ophaalbrug: twee klappen van 8 m, met balansbalken op twee portalen van 9 m hoog.
  - De brug staat omhoog tot de Eindcheck en zakt dan in 6 seconden.
  - Onder de brug staan twee open sluisdeuren in hun nissen (decor), met een peilschaal.
- **Oostkade.** Een kade van 6 m breed, met kinderkopjes, twee kraanrails en bolders. Er staan een straddle carrier en een paar containers. Aan de oostkant liggen de open weegloods, de kantine en de vertrekloods.
- **Weegloods en kantine.**
  - De weegloods is 12 × 12 m en 6 m hoog. De westkant is open, met om de 4 m een kolom. In de vloer ligt een weegbrug van 7 × 3 m (staal met een geel-zwarte rand), met een container op een oplegger en een groot display. Langs de oostmuur staan magazijnstellingen.
  - De kantine is 12 × 8 m en 3,2 m hoog, met tafels, een koffieautomaat en grote ramen naar het kadeplein. Van buiten zie je hem al gloeien.
- **Vertrekloods.**
  - 12 × 12 m en 6,5 m hoog, met een lange glazen lichtstraat in het dak (zoals het Ferry Building in San Francisco).
  - Je komt binnen door een roldeur vanaf de oostkade. In de noordmuur zit een grote schuifdeur (4 m) naar de vertrekkade.
  - In het midden staat een douanebalie. Langs de wanden staan de vijf stations van blok 1.
- **Vertrekkade en De Eenheid.**
  - De kade is 18 × 8 m. De Eenheid is een kustvaarder van 30 × 7 m (nu 21 m), die langs de noordrand ligt, met de boeg naar het westen. De romp steekt 2,8 m boven de kade uit, de brug van het schip staat op 9 m. Op ooghoogte is het schip een muur van staal.
  - Over de kade staat een portaalkraan (16 m hoog, poten 5 m uit elkaar, giek over het schip). Je loopt tussen de poten door.
  - Op x = 16,5 staan de douanepoort met sleutelgaten en de **seinmast** (10 m, drie lampen in de kleuren van de klussen). Daarachter gaat de loopplank omhoog naar het dek.
- **Omgeving (buiten de plattegrond).**
  - Zuid: een dijk met een rij smalle gekleurde huisjes en een kerktorentje.
  - West: bomen op de dijk.
  - Oost (x 26–40): een containerterrein met stapels achter een hek (instanced).
  - Noord: open zee met boeien en een vissersboot die af en toe voorbij vaart. Ver weg in het oostnoordoosten ligt een containerterminal als silhouet (vlakke plaatjes, geen echte vormen).

### 5.2 Doorgangen, trappen en startplek

| Nr | Plek `pos` (as) | Tussen | Soort | Breed | Open vanaf |
|---|---|---|---|---|---|
| D1 | (0, 14) x | kadeplein – havenmeesterij | dubbele deur | 2,4 | Uitleg |
| D2 | (−14, 14) z | kadeplein – visafslag | roldeur | 4,0 | Samen |
| D3 | (−11, 6) x | kadeplein – pakhuiskade | hek | 3,0 | Zelf |
| D4 | (11, 6) x | kadeplein – oostkade | hek | 3,0 | Zelf |
| D5 | (0, 6) x | kadeplein – loopbrug | hekje | 2,0 | Zelf |
| D6 | (−18,6, 6) x | visafslag – pakhuis | koelceldeur | 1,6 | Zelf |
| D7 | (−14, 0) z | pakhuiskade – pakhuis | dubbele deur | 2,4 | Zelf |
| D8 | oostzijde werkplaats | pakhuiskade – werkplaats | open, met kolommen | 12 | Zelf |
| D9 | (2,6, 14) x, v1 | kaartenkamer – balkon | deur | 1,6 | Zelf |
| D10 | (20, 6) x | weegloods – kantine | boog | 1,6 | altijd |
| D11 | westzijde weegloods | oostkade – weegloods | open, met kolommen | 12 | Zelf |
| D12 | (14, −12) z | oostkade – vertrekloods | roldeur | 4,0 | Check |
| D13 | (17,5, −18) x | vertrekloods – vertrekkade | schuifdeur | 4,0 | Check, na blok 1 |
| D14 | (−8, −16,5) z | pakhuiskade – brug | brugklep | 3,0 | Check |
| D15 | (8, −16,5) z | brug – oostkade | brugklep | 3,0 | Check |
| Uitgang | (16,5, −26) x | vertrekkade – loopplank | vrijstaande poort + seinmast | 3,4 | Klaar |

- **T1, trap havenkantoor:** `pos (3,5, 20,9)`, as x, richting +1, lengte 4,4, breed 1,2, van 0. Open vanaf Zelf (zie wens 11).
- **T2, trap pakhuis:** `pos (−20, −5)`, as x, richting −1, lengte 4,4, breed 1,1, van 0.
- **Startplek:** `(1,5, 11,0)`. Je kijkt naar het noorden, iets naar rechts (naar het schip).
- **Vrij te houden:** de lijn van de start naar de poort (39,9 m) loopt langs de hoek van de vertrekloods. De seinmast (10 m) steekt 2,2 m boven het dak van de loods uit (12,0° boven je ooghoogte, de dakrand 8,9°). Je ziet het einddoel dus altijd.

---

## 6. De DIM-route (e)

| Fase | Wat gaat open | Stations | Wat je ziet, en waarom het spannend is |
|---|---|---|---|
| Terugblik | het kadeplein (de rest is dicht) | terugblik | Je ziet de hele haven: het schip, de opgehaalde brug, de vuurtoren en de seinmast met drie donkere lampen. Alles is dichtbij, maar nog dicht. Dat maakt nieuwsgierig. |
| Doel | niets nieuws | – | Mees vliegt naar de seinmast en terug ("Daar moet je heen!"). Het doel krijgt een plek in de wereld. |
| Uitleg | havenkantoor, begane grond | uitleg | Binnen zie je de trap met de ketting ervoor: daar mag je later heen. Door de ramen kijk je naar het plein en de kom. |
| Samen | visafslag | 5 kavels | Alles in één ruimte, samen, met de tribune als klas. De koelceldeur in de achterwand blijft nog dicht: dicht betekent 'later'. |
| Zelf | drie richtingen tegelijk + de keuzeplekken | 11 klusstations + 3 kluizen, 17 keuzestations | West: de werf (lengte). Midden: de steigers (inhoud). Oost: de weegloods (gewicht). De keuzestations liggen verspreid over het pakhuis, de kaartenkamer, het balkon, het havenhoofd, de werf, de kantine en het plein. Je kiest zelf welke kant je eerst neemt (patroon 7). Elke kant voelt anders: hoog en hard, laag op het water, groot en industrieel. De lampen gaan aan. |
| Check, blok 1 | de brug zakt, de vertrekloods gaat open | 5 binnen | De tijdbal valt, de klok slaat en de brug zakt: een grote gebeurtenis. Vanaf de werf is er nu een korte weg (30 m in plaats van 68 m). |
| Check, blok 2 | de schuifdeur naar de vertrekkade | 5 buiten | Je stapt naar buiten en staat recht voor de romp van het schip, onder de kraan. |
| Klaar | de poort, de loopplank, het dek | – | De scheepshoorn klinkt en het schip vaart de haven uit. |

**Waarom het spannend blijft:**
1. **Alles begint op één plein.** Elke fase opent een nieuwe richting vanaf hetzelfde plein. Je komt steeds terug op een bekende plek en ziet wat erbij gekomen is.
2. **Je ziet wat later komt.** Vanaf het plein zie je de brug (dicht), het schip en de seinmast (het einddoel). In de havenmeesterij zie je de trap met de ketting, in de visafslag de koelceldeur, en vanaf de steigers de vertrekloods aan de overkant.
3. **Gespreid.** Nergens staan meer dan 6 stations in één ruimte: de kaartenkamer heeft er 6, maar dat is één rekenkaart, en de eindcheck staat in twee ruimtes (5 + 5). De klussen liggen in drie verschillende hoeken. Bij elke klus zie je de kluis zodra je binnenkomt.
4. **Ontdekken loont.** De drie 24-kaarten liggen op drie beloningsplekken (de kop van het havenhoofd, de pakhuiszolder en het balkon). De 8 lampjes vind je alleen als je goed rondkijkt.
5. **Steeds een andere hoogte.** De steigers liggen laag op het water, de zolder en het balkon hoog. Zo krijg je steeds een ander perspectief, zonder dat de haven groter wordt.
6. **De wereld reageert.** Lampen gaan aan, de seinmast krijgt lichten, de brug zakt en de lucht verkleurt.
7. **Geen dood spoor.** Elke zijweg eindigt bij iets: een vuurtoren, een kluis of een uitzicht.

**Loopafstanden vanaf de start:** uitleg 8 m · visafslag 20 m · kluis op de steigers 24 m · weegloods 32 m · vertrekloods 38 m · werf 43 m · kop van het havenhoofd 50 m.

---

## 7. Stations, kluizen en lampjes: van oude naar nieuwe plek (f)

Alle 45 station-id's en hun opdrachten blijven gelijk. De nummers zijn de stippen op de plattegrond. `v1` = verdieping 1.

| Nr | Station-id | Opdrachten | Nu in | Wordt | Plek [x, z] | Waarom hier |
|---:|---|---|---|---|---|---|
| 1 | `terugblik` | W1-TERUG | Hal | Kadeplein, bij de waterbus | (5,5, 8,4) | Een net uitgeladen pallet sap: het eerste wat je ziet na het aanmeren. |
| 2 | `uitleg` | W1-INSTR | Havenschool | Havenmeesterij, uitlegtafel | (−3,0, 17,4) | De tros hoort bij de havenmeester. De eenhedentrap hangt aan de muur. |
| 3 | `meetkist` | O1-INS-01, 03, 06, 10 | Markthal | Visafslag, kavel 1 | (−16,8, 19,6) | De kavels liggen op de afslagvloer. Je bekijkt ze samen vanaf de tribune. |
| 4 | `meetlat` | O1-INS-02, 09 | Markthal | Visafslag, kavel 2 | (−20,4, 19,6) | Een duimstok en een plank liggen klaar voor de kopers. |
| 5 | `maatbeker` | O1-INS-04, 07 | Markthal | Visafslag, kavel 3 | (−20,6, 14,0) | In het midden, recht voor de tribune. |
| 6 | `paddenstoel` | O1-INS-05 | Markthal | Visafslag, kavel 4 | (−20,4, 9,4) | De wegwijzer voor de kopers: hoe ver is het naar huis? |
| 7 | `suikerpak` | O1-INS-08 | Markthal | Visafslag, kavel 5 | (−16,8, 9,4) | De laatste kavel, vlak bij de uitgang. |
| 8 | `snelwegbord` | O1-NIV-01a | Kade | Werf, bij de werfpoort | (−24,8, −20,2) | Hier begint de havenweg naar de snelweg. |
| 9 | `werkplaats` | O1-NIV-01b, 01c | Kade | Werkplaats | (−21,6, −15,4) | Timmeren met spijkers hoort op een werf. |
| 10 | `hakken` | O1-NIV-02 | Kade | Werkplaats, kraam met laarzen en werkschoenen | (−17,4, −9,0) | De werfwinkel verkoopt schoenen. |
| 11 | `omleiding` | O1-NIV-03 | Kade | Werf, bij de opgebroken kade | (−11,4, −20,6) | Het voetpad is dicht: je loopt hier zelf om. |
| 12 | `kombuis` | O1-NIV-04a | Viskade | Werkponton, naast de kotter | (−4,4, −3,2) | Een kombuis is de keuken van een schip. |
| 13 | `cocktail` | O1-NIV-04c | Viskade | Caféponton (drijvend havencafé) | (4,4, −4,0) | Een café op het water. |
| 14 | `badje` | O1-NIV-04b | Viskade | Kopponton, zwemplek | (3,5, −12,3) | Water en zwemmen, bij de steiger. |
| 15 | `smoothie` | O1-NIV-05 | Viskade | Kopponton, kiosk | (−3,6, −12,3) | Een kiosk op de steiger. |
| 16 | `rijstkom` | O1-NIV-06 | Weegruimte | Kantine | (21,6, 10,4) | De lunch van de havenwerkers. |
| 17 | `weegschaal` | O1-NIV-07 | Weegruimte | Weegloods, naast de weegbrug | (17,6, −3,2) | Groot en klein wegen naast elkaar: een container en een mens. |
| 18 | `klontjes` | O1-NIV-08 | Weegruimte | Weegloods, magazijn | (23,8, −4,0) | Pakken suiker in de stelling. |
| 19 | `kaart-lengte` | O1-EXP-01a–d | Havenkantoor | Kaartenkamer (v1), lessenaar 1 | (−5,2, 17,0) | De rekenkaart ligt als een zeekaart op een kaartentafel. |
| 20 | `kaart-opp` | O1-EXP-02a–d | Havenkantoor | Kaartenkamer (v1), lessenaar 2 | (0,0, 17,0) | idem |
| 21 | `kaart-inhoud` | O1-EXP-03a–d | Havenkantoor | Kaartenkamer (v1), lessenaar 3 | (5,2, 17,0) | idem |
| 22 | `kaart-liter1` | O1-EXP-04a–c | Havenkantoor | Kaartenkamer (v1), lessenaar 4 | (−5,2, 19,0) | idem |
| 23 | `kaart-liter2` | O1-EXP-04d–f | Havenkantoor | Kaartenkamer (v1), lessenaar 5 | (0,0, 19,0) | idem |
| 24 | `kaart-gewicht` | O1-EXP-05a–d | Havenkantoor | Kaartenkamer (v1), lessenaar 6 | (5,2, 19,0) | idem |
| 25 | `kabelhaspel` | O1-EXP-06 | Oostkade | Pakhuis, begane grond | (−17,4, −2,4) | Kabel ligt in de opslag. |
| 26 | `cement` | O1-EXP-07a, 07b | Oostkade | Pakhuis, begane grond | (−23,0, 2,4) | Zware pallets staan beneden. |
| 27 | `zandbak` | O1-EXP-08 | Pakhuis | Pakhuis, zolder (v1) | (−22,4, 2,6) | Speelzand in zakken op zolder. |
| 28 | `bag-in-box` | O1-EXP-10 | Pakhuis | Pakhuis, zolder (v1) | (−17,2, 3,4) | Dozen sap in de opslag. |
| 29 | `buitenmissie` | O1-PRA-01 t/m 04 | Pakhuis | Kadeplein, mededelingenbord | (−5,4, 12,6) | Opdrachten voor buiten de game: op het bord waar iedereen langskomt. |
| 30 | `champagne` | O1-EXP-09 | Oostkade | Werf, bij de boeg op de helling | (−19,8, −19,6) | Een nieuw schip doop je met champagne. |
| 31 | `auto` | O1-EXP-11 | Kapiteinskamer | Kantine, tafel bij het raam | (16,8, 11,4) | Chauffeur Aysel houdt pauze in de kantine. |
| 32 | `weerstation` | O1-EXP-12a–c | Pier | Havenhoofd | (−10,4, −26,8) | Vrij uitzicht over zee: onweer zie je hier het eerst. |
| 33 | `kaart24-1` | O1-PUZ-01 | Kapiteinskamer | Havenhoofd, bij de vuurtoren | (−12,6, −29,8) | Een beloning voor wie helemaal tot het eind loopt. |
| 34 | `kaart24-2` | O1-PUZ-02 | Kapiteinskamer | Pakhuis, zolder, bij het hijsluik (v1) | (−15,6, −3,4) | Verstopt, boven. |
| 35 | `kaart24-3` | O1-PUZ-03 | Kapiteinskamer | Balkon van het havenkantoor (v1) | (−2,0, 12,6) | Een kaartspel op de uitkijkpost. |
| 36 | `koffie` | O1-EIN-01 | Vertrekhal | Vertrekloods (blok 1) | (17,4, −8,0) | Proviand voor de reis. |
| 37 | `bessen` | O1-EIN-02 | Vertrekhal | Vertrekloods (blok 1) | (21,0, −8,0) | Proviand voor de reis. |
| 38 | `goud` | O1-EIN-03 | Vertrekhal | Vertrekloods, douanebalie (blok 1) | (24,8, −10,0) | Goud gaat langs de douane. |
| 39 | `vuistregel` | O1-EIN-04 | Vertrekhal | Vertrekloods, incheckbalie met weegschaal (blok 1) | (24,8, −14,2) | Bij het inchecken wordt gewogen. |
| 40 | `pont` | O1-EIN-05 | Vertrekhal | Vertrekloods, dienstregeling (blok 1) | (22,4, −16,4) | Reistijden horen bij een veerhaven. |
| 41 | `regenmeter` | O1-EIN-06 | Vertrekhal | Vertrekkade (blok 2) | (21,0, −24,4) | Een regenmeter staat in de open lucht. |
| 42 | `parkeerschijf` | O1-EIN-07 | Vertrekhal | Vertrekkade, parkeervak op de kop (blok 2) | (30,0, −22,0) | Parkeren voor wie meevaart. |
| 43 | `klontjesdoos` | O1-EIN-08 | Vertrekhal | Vertrekkade, op een vrachtkist (blok 2) | (21,4, −19,6) | Lading die nog aan boord moet. |
| 44 | `watervat` | O1-EIN-09 | Vertrekhal | Vertrekkade, drinkwater voor het schip (blok 2) | (25,6, −24,9) | Een schip tankt water aan de kade. |
| 45 | `mondwater` | O1-EIN-10 | Vertrekhal | Vertrekkade, scheepsvoorraad op een bagagekar (blok 2) | (25,6, −20,2) | Voorraad voor de bemanning. |

**Kluizen (klussen)**

| Klus-id | Stations (gelijk) | Nu | Wordt | Plek [x, z] | Waarom |
|---|---|---|---|---|---|
| `lengte` | snelwegbord, werkplaats, hakken, omleiding | Kade | Werkplaats, tegen de achterwand, voorkant naar het oosten | (−25,3, −12,0) | Door de open zijde zie je hem al vanaf de pakhuiskade. |
| `inhoud` | kombuis, cocktail, badje, smoothie | Viskade | Kopponton, midden, voorkant naar het zuiden | (0, −13,2) | Aan het eind van de steiger. Vanaf het kadeplein kijk je er recht op. |
| `gewicht` | rijstkom, weegschaal, klontjes | Weegruimte | Weegloods, oostwand, voorkant naar het westen | (25,3, 1,0) | Zichtbaar vanaf de oostkade, voorbij de weegbrug. |

**Lampjes (8):** L1 (−13,4, 13,4) kadeplein, achter de bank · L2 (−25,4, 21,3) visafslag, achter de bovenste tribunetrede · L3 (−7,4, 21,4, v1) kaartenkamer, achter de globe · L4 (−15,0, 5,3, v1) zolder, in de hoek bij het luik · L5 (−25,4, −17,4) werkplaats, onder de werkbank · L6 (−12,9, −33,4) havenhoofd, achter de vuurtoren · L7 (6,0, −2,4) caféponton, achterhoek · L8 (25,5, −5,5) weegloods, achter de stelling.

**Decor bij stations** (geen opdrachtwijziging):
- De vijf kavels in de visafslag krijgen roestvrijstalen afslagtafels met een kaartje "Kavel 1–5" in plaats van marktkramen. De volgorde blijft de werkboekvolgorde.
- De smoothie houdt zijn kraam (als kiosk), de kombuis zijn `KombuisWand` en de cocktail zijn parasol.
- De schalen blijven gelijk: cement 1,35, kabelhaspel 1,25 en parkeerschijf 0,7.

---

## 8. Belangrijke beelden op ooghoogte (g)

1. **De start (kadeplein, je kijkt naar het noorden).**
   - Links staat de bakstenen visafslag met de letters VISAFSLAG boven de roldeur. Recht vooruit gaat de loopbrug omlaag naar de steigers, met masten en wapperende vlaggetjes.
   - Achter de kom staan de twee balansbalken van de opgehaalde brug zwart tegen een oranje lucht. Links in de verte staat de vuurtoren op het havenhoofd, met de zon er laag naast.
   - Rechts zie je de oostkade en de boeg van De Eenheid, met daarboven de witte portaalkraan en de seinmast met drie donkere lampen.
   - Draai je je om, dan staat het havenkantoor met de klokkentoren in het goudlicht.
2. **De havenmeesterij.** Je komt binnen op een visgraatvloer en kijkt naar het zuiden. Links (oost) staat de balie van Fenna met een krakende marifoon. Rechts, aan de westmuur bij de uitlegtafel, hangt een grote eenhedentrap. Achterin gaat de trap omhoog, met een ketting en een bordje "Pas bij Zelf doen". Door de hoge ramen zie je het plein en de masten.
3. **De visafslag.** Je komt onder de grote veilingklok door binnen. Voor je stijgt de houten tribune op, met Mees op de bovenste bank. Tussen jou en de tribune staan vijf blinkende afslagtafels in een U. Van boven valt licht door de glasstroken in het sheddak, en de vloer glanst nat.
4. **De pakhuiskade.** Je loopt naar het noorden, onder de poten van de oude havenkraan door. Links gaat de bakstenen gevel van het pakhuis omhoog, met groene luiken. Boven je steekt de hijsbalk uit, met een takel en een hangend net. Verderop ligt de werf: een open hal vol licht, en op de helling de rode romp van een kotter in aanbouw.
5. **De pakhuiszolder.** Je komt boven onder schuine houten balken. Door het open hijsluik valt de lage zon in strepen naar binnen. Kijk je naar buiten, dan zie je de hele kom met de steigers en aan de overkant de oranje verlichte gevels van de oostkade.
6. **Op de steigers.** Je loopt de loopbrug af en de kademuren rijzen om je heen op. Het water klotst vlak onder je voeten. De kotter deint naast je, en aan het eind van de steiger staat de turquoise kluis, met daarachter de opgehaalde brug.
7. **De weegloods.** Je loopt vanaf de kade een rij kolommen in. In de vloer ligt de weegbrug met een rode container erop; het grote display gloeit groen. Achter de ramen van de kantine branden de lampen al.
8. **De finale op de vertrekkade.** De schuifdeur rolt open en voor je staat de donkerblauwe romp van De Eenheid, verlicht door de kraan. De loopplank gaat omhoog. Aan de voet staat de poort met drie sleutelgaten, en de seinmast erboven brandt in drie kleuren. In het blauwe uur draait ver weg het licht van de vuurtoren.

---

## 9. Motorwensen (h)

Alle velden zijn optioneel. Zonder het veld werkt alles zoals nu, dus andere werelden merken er niets van. Prioriteit: **P1** is nodig voor dit ontwerp, **P2** maakt het veel beter, **P3** is mooi meegenomen.

| # | Wens | Veld (`types.ts`) | Gedrag | Prio | Terugval als het (nog) niet kan |
|---:|---|---|---|---|---|
| 1 | Hoogte per kamer | `Kamer.hoogte?: number` | Muren, plafond en dak van deze kamer op deze hoogte. Een gedeelde muur krijgt de hoogste van beide kanten. Het bovenstuk boven deuren loopt door tot die hoogte. Een kamer hoger dan `verdiepingHoogte` mag geen kamer boven zich hebben (controle in `controle.ts`). | P1 | Alle kamers 3,6 m; loodsen voelen dan laag. |
| 2 | Open loods met kolommen | `Kamer.open?: ('n'\|'o'\|'z'\|'w')[]` en `Kamer.kolommen?: { afstand: number; soort?: 'staal'\|'gietijzer'\|'hout'\|'baksteen'; raster?: [number, number] }` | Geen muur aan die zijden, wel een balk bovenin en om de `afstand` m een kolom (instanced). Botsing alleen op de kolommen. Deze kamer telt voor het zicht als buiten: `Binnen` verbergt de inrichting niet. Met `raster` komen er ook kolommen binnen in de kamer. | P1 | Drie brede roldeuren in de gevel. |
| 3 | Plafond en meer daksoorten | `Kamer.plafond?: 'vlak'\|'balken'\|'spanten'\|'kap'\|'glas'`; `Kamer.dak` krijgt erbij `'plat'\|'shed'\|'boog'` | `kap`: je ziet de schuine onderkant van het dak (zolder). `spanten`: stalen spanten om de 4 m. `glas`: glasstroken in het dak, met extra hemellicht binnen. `shed`: zaagtanddak met glas op het noorden. | P2 | Vlak plafond. |
| 4 | Vloer op eigen hoogte | `Kamer.vloerY?: number` en `Kamer.deint?: number` | Vloer, randen en muren beginnen op `vloerY` (mag negatief zijn: een steiger op −0,8). De kamer registreert zijn hoogte voor de botsing (`hoogteOp` moet onder nul kunnen). Stations, kluizen en lampjes in deze kamer krijgen vanzelf die y. `deint` laat vloer en inhoud zacht op en neer gaan (alleen beeld, bv. 0,02 m in 4 s). | P1 | Steigers op kadehoogte; het water wordt dan een vlak 0,4 m lager. |
| 5 | Kademuur als rand | `Kamer.rand` krijgt erbij `'kade'`; `Plattegrond.kade?: { bolderAfstand?: number; steen?: string; muur?: string }` | Een kantsteen van 0,5 × 0,25 m op de rand, om de `bolderAfstand` m een bolder (instanced) en een onzichtbare grens van 1,1 m hoog. Is er water (wens 14), dan loopt de kademuur door tot onder het water, met een algenrand. | P1 | Rand `'geen'` + kademuur in `Omgeving`, zoals nu. |
| 6 | Ramen waar je doorheen kijkt | `Kamer.ramen?: 'warm'\|'helder'\|'luiken'` | `helder`: glas met lichte weerkaatsing waar je doorheen kijkt (van binnen naar buiten en andersom). `luiken`: houten luiken (pakhuis). Alleen voor een paar kamers gebruiken (prestatie). | P2 | Warme ramen zoals nu. |
| 7 | Vide of vloerluik | `Kamer.vide?: [number, number, number, number][]` | Een gat in de vloer van deze verdieping (zoals bij trapgaten nu), met een balustrade en een botsvak eromheen. | P3 | Geen luik. |
| 8 | Beweegbare brug | `Kamer.brug?: { soort: 'ophaal'\|'draai'; as: 'x'\|'z'; vanaf?: Fase; klus?: string }` | De kamer wordt een brugdek. Tot `vanaf` staat de brug omhoog (of opengedraaid) en kun je er niet op. Dan daalt hij in 6 s, met een geluidsmoment. | P2 | Een vaste brug met een hek (`vanaf: 'evaluatie'`). |
| 9 | Meer soorten doorgangen | `Doorgang.soort` krijgt erbij `'roldeur'\|'schuif'\|'hek'`; `Doorgang.hoog?: number` | `roldeur` rolt omhoog (lamellen, 3,8 m), `schuif` schuift opzij, `hek` is een dubbel stalen hek (ook in een rand). `hoog` geeft de hoogte van de opening (standaard 2,45). | P1 | Dubbele deur. |
| 10 | Deur open na stations | `Doorgang.naStations?: string[]` | Dicht tot al deze stations klaar zijn, bijvoorbeeld blok 1 van de eindcheck. Breed bruikbaar: "deze deur gaat open na deze opdrachten". | P2 | `vanaf: 'evaluatie'`; blok 2 is dan zichtbaar maar op slot (dat doet `isOpen` al). |
| 11 | Trap op slot | `Trap.vanaf?: Fase`; `Trap.klus?: string` | Tot dan staat er een ketting met een bordje voor de trap, en een botsvak onderaan. | P1 | Een deur boven aan de trap. |
| 12 | Grens tussen buitenruimtes | `Plattegrond.grenzen?: { van: [number, number]; tot: [number, number]; soort: 'hek'\|'muurtje'\|'reling'\|'kade'; verdieping?: number }[]` | Nu staat er niets tussen twee buitenruimtes. Een grens tekent daar toch een rand. Doorgangen op die lijn worden hekjes (de `Hekje` bestaat al). | P1 | Losse decorhekken en botsvakken, zonder fase-slot. |
| 13 | Hellingen in het plan | `Plattegrond.hellingen?: { van: [number, number]; tot: [number, number]; breed: number; y0: number; y1: number; soort?: 'loopbrug'\|'pad'\|'loopplank'; vanaf?: Fase }[]` | Tekent een plankdek met leuningen en registreert `helling()`, dat al bestaat in `botsing.ts`. Met `vanaf` staat er een hekje boven. | P1 | `helling()` met de hand in `registreer` en de loopbrug als decor. |
| 14 | Water in het plan | `Plattegrond.water?: { niveau: number; vlakken: [number, number, number, number][]; kleur?: string }` | Eén watervlak (de shader van de `Water` in `natuur.tsx`), alleen in deze rechthoeken, samen getekend. Langs elke rand `'kade'` een kademuur tot onder het water. | P1 | Water en kademuur in `Omgeving` (zoals nu). |
| 15 | Vrijstaande poort met seinmast | `Plattegrond.uitgang` krijgt erbij `vrij?: boolean; mast?: number` | `vrij`: de poort staat los, met twee pijlers (zoals bij de buiteneilanden), in een rand of op een kade. `mast`: een seinmast van deze hoogte met één lamp per klus in de klus-kleur. De lamp gaat aan als de kluis open is (`kluisOpen`). | P1 | Poort in de muur van de vertrekloods; de seinmast als decor in `Levend`. |
| 16 | Sfeer per fase | `WereldDef.sfeerPerFase?: Partial<Record<Fase, Partial<Sfeer> & { lampen?: boolean; klok?: string }>>` | Bij een nieuwe fase vloeien zon, hemel, mist, achtergrond en zonrichting in ongeveer 6 s over. De schaduwkaart wordt één keer opnieuw berekend. `lampen` zet ramen en buitenlantaarns aan (één gedeeld materiaal, dus één uniform). `klok` is de tijd die het decor kan tonen. De zon blijft voor de schaduw minstens 12° hoog, ook als de lucht hem lager laat zien. | P2 | Eén vaste sfeer (gouden uur). |
| 17 | Filmisch overzicht | `WereldDef.overzicht?: { pad: [number, number, number][]; kijk: [number, number, number]; duur: number }` | Achter het startscherm volgt de camera traag dit pad (een vloeiende lijn, in een lus). De daken zijn dan zichtbaar en niets is klikbaar. | P3 | Een vaste camerastand. |

De nieuwe velden samen (voorstel voor `src/werelden/types.ts`):

```ts
export type Zijde = 'n' | 'o' | 'z' | 'w';

export interface Kamer {
  // … bestaande velden …
  hoogte?: number;                                   // 1
  open?: Zijde[];                                    // 2
  kolommen?: { afstand: number; soort?: 'staal' | 'gietijzer' | 'hout' | 'baksteen'; raster?: [number, number] };
  plafond?: 'vlak' | 'balken' | 'spanten' | 'kap' | 'glas';            // 3
  dak?: 'schild' | 'zadel' | 'piramide' | 'geen' | 'plat' | 'shed' | 'boog';
  vloerY?: number;                                   // 4
  deint?: number;
  rand?: 'heg' | 'hek' | 'reling' | 'muurtje' | 'spijlen' | 'geen' | 'kade';   // 5
  ramen?: 'warm' | 'helder' | 'luiken';              // 6
  vide?: [number, number, number, number][];         // 7  [x0, z0, x1, z1]
  brug?: { soort: 'ophaal' | 'draai'; as: 'x' | 'z'; vanaf?: Fase; klus?: string };   // 8
}

export interface Doorgang {
  // … bestaande velden …
  soort?: 'deur' | 'boog' | 'dubbel' | 'roldeur' | 'schuif' | 'hek';  // 9
  hoog?: number;
  naStations?: string[];                             // 10
}

export interface Trap { /* … */ vanaf?: Fase; klus?: string }    // 11

export interface Grens { van: [number, number]; tot: [number, number]; soort: 'hek' | 'muurtje' | 'reling' | 'kade'; verdieping?: number }
export interface Helling { van: [number, number]; tot: [number, number]; breed: number; y0: number; y1: number; soort?: 'loopbrug' | 'pad' | 'loopplank'; vanaf?: Fase }

export interface Plattegrond {
  // … bestaande velden …
  grenzen?: Grens[];                                 // 12
  hellingen?: Helling[];                             // 13
  water?: { niveau: number; vlakken: [number, number, number, number][]; kleur?: string };   // 14
  kade?: { bolderAfstand?: number; steen?: string; muur?: string };                        // 5
  uitgang: { pos: [number, number]; as: 'x' | 'z'; vrij?: boolean; mast?: number };        // 15
}

export interface WereldDef {
  // … bestaande velden …
  sfeerPerFase?: Partial<Record<Fase, Partial<Sfeer> & { lampen?: boolean; klok?: string }>>;  // 16
  overzicht?: { pad: [number, number, number][]; kijk: [number, number, number]; duur: number }; // 17
}
```

**Wat er al is en waar je op kunt bouwen:** `helling()` en `verhoog()` in `botsing.ts` (nu alleen positieve verhoging), het `Hekje` voor doorgangen in een rand, de vrijstaande poort met twee pijlers bij buiteneilanden, `Vensters` (instanced ramen), trapgaten in `Plafonds` (dezelfde techniek kan voor een vide) en `Statisch` (samenvoegen).

---

## 10. Prestatieplan (i)

**Doelapparaat:** een Chromebook met Intel UHD 600 (Celeron N4020-klasse), stand `midden`, 1366 × 768, DPR 1. Het doel is 30 fps op het drukste punt: het kadeplein, waar bijna alles in beeld is.

| Budget | Grens | Doel |
|---|---|---|
| Tekenstappen (draw calls) in beeld | ≤ 140 | ≈ 110 |
| Driehoeken in beeld | ≤ 250 000 | ≈ 180 000 |
| Unieke materialen | ≤ 16 (+ tekst-atlas) | 14 |
| Texturen op de videokaart | ≤ 20 MB | tegels van 512², één atlas van 2048² voor borden en teksten |
| Lichten | 1 zon met schaduw + hemellicht + max. 4 puntlampen (de dichtstbijzijnde) | rest: emissive en lichtplekken |
| Schaduwkaart | 2048 (hoog), 1024 (midden), uit (laag) | alleen bijwerken bij bewegen en bij een nieuwe fase (zoals nu) |

**Verwachte tekenstappen op het kadeplein:** muren, instanced per materiaal (12) · vloeren (8) · daken en plafonds (6) · ramen en deuren (6) · water (2) · omgeving: terrein, dijk, huisjes en bomen (10) · instanced decorsets (18) · vast decor, samengevoegd per zone (10 zones × 2 = 20) · zichtbare stations (± 12 × 2 = 24) · schip (4) · kranen (4) · brug (2) · meeuwen (2) · borden en tekst (4) · gloed, lucht en mist (4). **Totaal ≈ 126.**

**Instanced (één tekenstap per soort):** bolders (± 40) · lantaarns (24) met gloed-sprites · kolommen (± 30) · spanten (± 12) · relingpaaltjes (± 150) · stootbanden (± 30) · containers (± 70: terrein en schip) · pallets, kratten en viskisten (± 60) · touwrollen (12) · tribunebanken (12) · huisjes op de dijk (14, kleur per instantie) · bomen, boeien en meeuwen (bestaan al).

**Verder:**
- **Samenvoegen:** al het vaste decor per zone gaat via `Statisch`. Steigerplanken, klinkers en baksteen zijn textuur, geen losse vormen.
- **Verbergen:** de inrichting van binnenkamers is weg als je buiten loopt (`Binnen`, bestaat al). Open loodsen en kamers met heldere ramen houden hun inrichting, maar klein decor verdwijnt verder dan 45 m (30 m op `laag`).
- **Verre dingen:** de terminal aan de horizon en de dijkhuisjes zijn vlakke plaatjes of simpele blokken, zonder schaduw.
- **Water:** één shader, zonder echte spiegeling (geen extra render-pass). De glans komt uit het luchtverloop en een fresnel-effect.
- **Beweging:** hooguit 8 bewegende dingen tegelijk: meeuwen, het vuurtorenlicht, de brug, een roldeur (alleen tijdens het openen), drie boten die deinen en de kraan die hijst.
- **Schaduw:** alleen gebouwen, kranen, het schip en groot decor werpen schaduw. Klein decor ontvangt alleen schaduw.
- **Laden:** alle vormen worden in code gemaakt (geen GLB), zoals nu.
- **Meten:** een `?debug`-overlay met `renderer.info` (tekenstappen en driehoeken). Test op een echte Chromebook in alle drie de standen, ook op het kadeplein in het blauwe uur.

---

## 11. Risico's en open punten

- **Motorwerk.** 10 van de 17 wensen zijn P1. Zonder die wensen kan dit ontwerp niet zo gebouwd worden. Voor elke wens staat in § 9 een terugval, zodat we in stappen kunnen bouwen.
- **Steigers lager dan de kade.** De inspectiecamera ("niet onder de tegel door") en het padzoeken gaan nu uit van y = 0. Dat moet rekening houden met `vloerY`.
- **Leesbaarheid in het blauwe uur.** Blok 2 van de eindcheck staat buiten. Daarom zijn de schijnwerpers van de kraan dan aan, en elk station krijgt een eigen lichtplek.
- **Lage zon.** Een zon van 1–8° geeft zeer lange schaduwen en schaduwfouten. Laat de zon voor de schaduw nooit lager dan 12° staan, ook als de lucht hem lager laat zien.
- **Heldere ramen en open loodsen** laten meer zien en kosten dus meer tekenstappen. Gebruik ze alleen in de kaartenkamer, de havenmeesterij, de kantine en de vertrekloods.
- **Zichtlijn naar de poort.** Die is krap (de hoek van de vertrekloods). De seinmast lost dat op. Maak de vertrekloods niet hoger dan 6,5 m.
- **Grootte van het schip.** Met 30 m steekt het schip 6 m voorbij de kop van de kade. Dat is gewoon in echte havens, maar het moet binnen het eiland blijven (x tot 38).
- **Open vraag:** mogen de klusnamen en het intropraatje van Mees zo veranderen? Dat zijn geen werkboekteksten, maar wel teksten die leerlingen zien.

---

## 12. Gebouwd (fase 2): wat anders is geworden

De Ellehaven is gebouwd in `src/world1/`. Dit staat erin:
- `huis.ts`: de plattegrond, de stationsplekken, de kluizen en de lampjes;
- `Omgeving.tsx`: land, water, kades, schip, kranen, brug, vuurtoren, klokkentoren, seinmast, dijk en horizon;
- `Wereld1.tsx`: de inrichting en de botsingen;
- `inrichting.tsx`: de meubels;
- `sfeer.tsx`: het licht per fase en de luchtkoepel;
- `controle.ts`: het controlescript.

De opdrachten, station-id's, koppelingen opdracht → station en de klussen zijn niet veranderd.

**Wat de motor nu zelf doet** (veldnamen uit `docs/motor-bouwdelen.md`, anders dan in § 9 voorgesteld):
- `hoogte` per kamer: visafslag 6,5 m, loodsen 6 m, vertrekloods 6,5 m;
- `open` + `inkijk` + `kolommen` voor de werkplaats (open naar de kade) en de weegloods;
- plafonds: `'glas'` (visafslag), `'glasgewelf'` (vertrekloods) en `'spanten'` (loodsen);
- `dak: 'plat'`;
- doorgangen: `'roldeur'`, `'open'` met een rolhek, `'raam'` (echte ramen) en `hoog`;
- `Trap.vanaf` (de eenhedentrap in het havenkantoor gaat open bij Zelf doen).

**Zelf gebouwd in de wereldmap** (geen motorwerk nodig):
- water, kademuren, bolders en lantaarns;
- hekken tussen buitenruimtes (botsvakken + spijlenhek);
- de ophaalbrug (bewegend, zakt bij de Eindcheck, met bel);
- de seinmast (een lamp per open kluis);
- het poortgebouwtje om de uitgang en de loopplank naar het dek (`helling` + `verhoog`);
- de tribune (`verhoog`);
- de klokkentoren met wijzers die meelopen en een tijdbal die valt bij de Eindcheck.

Het licht per fase (gouden uur → blauw uur) regelt `FaseSfeer`. Die stuurt de kleur van zon, hemellicht en mist bij, en zet de lampen aan bij Zelf doen. Daarbij komt een eigen luchtkoepel met zonnegloed en sterren.

**Afwijkingen van het ontwerp**

| Ontwerp | Gebouwd | Waarom |
|---|---|---|
| Drijvende steigers op −0,8 m met een loopbrug | Vaste houten steigers op palen, op kadehoogte (y = 0); water op −1,0 m; de hoofdsteiger begint direct aan het plein (hek van 3 m) | De motor zet stations, kluizen en lampjes altijd op y = 0 of op een verdieping. Lager zou ze laten zweven. Dit is de terugval uit § 9 (wens 4). |
| Steigermaten | Hoofdsteiger x −1,5..1,5, z −10..6; werkponton x −5,6..−1,5, z −4,6..−1,4; caféponton x 1,5..6,4, z −5..−1; kopponton x −6,4..6,4, z −14,4..−10 | Ruimte voor de stations met 0,9 m vrij ervoor. |
| Vertrekkade x 14..32, z −24..−18 | x 12..32, z −26..−18 (20 × 8 m), met een hek naar de oostkade | De zuil naast de poort staat 2,9 m opzij en moet op de kade staan. Zo is er ook ruimte voor de kraanpoten. |
| Schip met dek op +0,5 m en een romp boven de kade | Romp tot het dek op +1,0 m (hoogwater), reling met een opening voor de loopplank; schip z −33..−26,5 | Je kunt na de poort echt de loopplank op en het dek op. |
| Schuifdeur na blok 1 | `'open'` met rolhek, open vanaf de Eindcheck | `Doorgang.naStations` bestaat niet. Blok 2 blijft wel dicht tot blok 1 klaar is (dat doet de motor). |
| Roldeur visafslag op (−14, 14) | (−14, 10) | Moet binnen de wand naar het plein vallen. De kavels staan nu in een U rond de afslagvloer, open naar de ingang. |
| Seinmast naast de poort (oost) | (12,9, −25,3), west van de poort | Daar is plek, en de mast is zo vanaf de start helemaal te zien. |
| Oude havenkraan op z −9 | Over de pakhuiskade op z −5..−2,6 | Elders blokkeerde hij de werkplaats of het brughek. |
| Zolder met vloerluik (vide) | Groot raam (hijsluik) met hijsbalk, katrol en touw buiten | `vide` betekent in de motor iets anders (hoge ruimte). |
| Trappen 4,4 m | 5,2 m | Minder steil. |
| Lessenaars in de kaartenkamer | Twee rijen (z 16,2 en 18,6), voorkant naar het noorden | Vrije ruimte vóór elke lessenaar en naast het trapgat. |

**Plekken die anders zijn dan in § 7:**
- werkplaats (−21,6, −16,2) · hakken (−17,4, −7,3) · kombuis (−4,4, −3,0) · cocktail (4,4, −3,6) · badje (3,9, −12,2) · smoothie (−3,9, −12,2)
- rijstkom (21,6, 12,6) · klontjes (24,6, −3,6) · weerstation (−11,0, −26,4) · champagne (−20,6, −20,6) · kaart24-3 (−2,8, 12,5)
- lessenaars: x −5,2 / 0 / 5,2 op z 16,2 en 18,6 · koffie (17,4, −8,0) · bessen (21,0, −8,0)
- kluis inhoud (0, −13,2), voorkant naar het zuiden

De rest staat zoals in § 7. Alle plekken staan in `huis.ts` (`PLEKKEN`, `KLUIS_PLEK`, `LAMPJES_HUIS`).

**Paaseitje:** het fotootje van Frank uit het Spookkasteel hangt in de havenmeesterij boven het bureau van havenmeester Fenna, met een koperen plaatje: "Frank · nachtwacht, Spookkasteel".

**Testen (30 oktober 2026):**
- `npx tsc --noEmit -p .` geeft geen fouten in wereld 1, en `npm run verify` geeft 0 fouten.
- `controle()` geeft 0 problemen: kamer, verdieping, muren, overlap, deuren, trappen, kolommen en 0,9 m vrij vóór elk station.
- `bereikbaar()` geeft 0 problemen: alle 45 stations en 3 kluizen zijn met de padzoeker van de motor bereikbaar vanaf de start.
- Rooktest (Playwright, SwiftShader): alle 45 stations en 3 kluizen gaan open, met 0 consolefouten.

**Tekenstappen** (`renderer.info`, stand laag, na 7 s stilstaan):

| Meetpunt | Tekenstappen | Driehoeken |
|---|---:|---:|
| Start | 337 | 569.000 |
| Steiger | 390 | 936.000 |
| Vertrekkade | 267 | 867.000 |

Ter vergelijking: de oude wereld 1 had bij de start 408 tekenstappen en 822.000 driehoeken.

Het budget van 140 uit § 10 was te krap geschat: de motor zelf (stationsiconen, schaduwpasses) telt al flink mee. Alles wat stilstaat is samengevoegd (Statisch), ook de vaste delen van de bewegende brug en de kraankat.

## Bronnen (zoekresultaten; alleen samenvattingen gezien)

- [Harlingen, Netherlands (Wikipedia)](https://en.wikipedia.org/wiki/Harlingen,_Netherlands) · [Noorderhaven Harlingen](https://www.harlingenwelkomaanzee.nl/en/stories/naval-heroes/ports-and-fishery/noorderhaven)
- [Hoisting Beams: Amsterdam](https://forgottengalicia.com/hoisting-beams-amsterdam/) · [Rijksmonument mastenloods Willemsoord](https://monumentenregister.cultureelerfgoed.nl/monumenten/pdf/508469)
- [Helsingør Custom House (Wikipedia)](https://en.wikipedia.org/wiki/Helsing%C3%B8r_Custom_House) · [Clock Tower Table Bay Harbour, Cape Town](https://sahistory.org.za/place/clocktower-table-bay-harbour-cape-town) · [Customhouse Quay clock tower, Greenock](https://www.inverclyde.gov.uk/news/2024/feb/work-is-due-to-start-to-restore-customhouse-quay-clock-tower) · [Harbour Office Belfast](https://discovernorthernireland.com/whats-on/harbour-office-ehod-2023-p760681) · [Wasserschout Bremen](https://www.dsm.museum/en/museum/exhibits/wasserschout)
- [List of busiest container ports (Wikipedia)](https://en.wikipedia.org/wiki/List_of_busiest_container_ports)
- [Toyosu Fish Market](https://cookly.me/magazine/asia/japan/tokyo/tokyos-japan-new-toyosu-fish-market-is-it-worth-a-visit/) · [Visafslag IJmuiden (NH Nieuws)](https://www.nhnieuws.nl/nieuws/306979/visafslag-ijmuiden-leeg-maar-toch-de-grootste) · [Visafslag Scheveningen](https://denhaag.com/nl/visafslag-scheveningen) · [Veilingspel Urk](https://www.kidsproof.nl/Flevoland/eropuit/touristinfourk/veilingspel-urk-ontdek-eropuit-gezin-actief)
- [Gdańsk Crane (Wikipedia)](https://en.wikipedia.org/wiki/Gda%C5%84sk_Crane) · [List of historical harbour cranes (Wikipedia)](https://en.wikipedia.org/wiki/List_of_historical_harbour_cranes)
- [Yokohama Red Brick Warehouse (Wikipedia)](https://en.wikipedia.org/wiki/Yokohama_Red_Brick_Warehouse) · [Kanemori Red Brick Warehouses (Wikipedia)](https://en.wikipedia.org/wiki/Kanemori_Red_Brick_Warehouses) · [Warehouses along Otaru Canal (MLIT)](https://www.mlit.go.jp/tagengo-db/common/001780312.docx)
- [Puerto Madero (ICOMOS Hefte)](https://journals.ub.uni-heidelberg.de/index.php/icomoshefte/article/view/20567/14355) · [Old cranes at Puerto Madero](https://www.thomaskellner.com/info/architectures/argentina-buenos-aires-old-cranes-at-puerto-madero.html)
- [Essaouira Fishing Port](https://www.nomadotravel.app/en/attractions/essaouira-fishing-port) · [Dubai Creek and Deira Wharfage (DP World)](https://www.dpworld.com/uae/ports-and-terminals/dubai-creek-and-deira-wharfage)
- [Salamanca Place, Hobart (Lonely Planet)](https://www.lonelyplanet.com/australia/hobart/attractions/salamanca-place/a/poi-sig/366195/362245) · [Tasmanian Heritage Register, Salamanca Place](https://heritage.tas.gov.au/Documents/THR12029%20Provisional%20Entry.pdf)
