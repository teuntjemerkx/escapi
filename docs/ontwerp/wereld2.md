# Wereld 2 – Het Spookkasteel: onderzoek en ontwerp van "Slot Maansteyn"

**Fase 1: onderzoek en ontwerp.** Er is geen code veranderd. De plattegrond staat in
[`wereld2-plattegrond.svg`](wereld2-plattegrond.svg). Coördinaten zijn die van het spel: x naar het oosten, z naar het zuiden
(de kant van het bospad), y omhoog. Eén verdieping is 3,5 m. Het spel is first person: ooghoogte 1,55 m, kijkhoek 70°, lopen 4,6 m/s.

## In het kort

- **Onderzoek:** 100 echte kastelen uit 44 landen en zes werelddelen (Antarctica heeft geen kastelen). Per kasteel één kenmerk dat wij gebruiken.
- **Wat het vaakst terugkomt:** een rots (45 van de 100) en water rondom (43). Daarom staat ons kasteel **op een rotseiland in een donker bosmeer**.
- **Slot Maansteyn** is een compacte vierkante burcht (32 × 28 m) zoals Muiderslot, Ammersoyen en Bodiam, op een rots zoals Bran en
  Edinburgh, met een donjon zoals Gravensteen en Vincennes, een open binnenplaats met galerij zoals Bellver en Fénis, een stenen brug zoals
  Eilean Donan en Corvin, en een vlucht per boot zoals Hugo de Groot uit Loevestein.
- **Franks tuin (6 × 6 m) met de vijver (15 × 15 dm)** ligt in het hart: midden op de binnenplaats, in het maanlicht. Model, maten en
  opdrachten blijven precies zoals ze nu zijn. Het is ook de rustige plek van het kasteel: hier laat Frank je nooit schrikken.
- **Kleiner dan nu:** het rotseiland is 44 × 40 m (nu ±59 × 48 m). Zes niveaus: kelder (−3,5 m), begane grond, eerste verdieping en drie donjonverdiepingen tot het dak op 14 m.
- **DIM:** elke fase opent een eigen deel. Samen oefenen is een rondgang over twee verdiepingen (±120 m), Zelf doen is een ster vanuit de
  binnenplaats naar drie klusvleugels, de Eindcheck daalt af in de kelder en eindigt bij de achterpoort aan het meer.
- **Zero Error:** alle 45 station-id's, hun opdrachten en antwoorden blijven gelijk. Alleen plek en zone veranderen. Twintig plekken uit de
  opdrachtteksten ("in de Ridderzaal", "in de gang", "in de galerij", "in de kerker", "op de walgang" …) bestaan echt in het nieuwe kasteel.
- **Motor:** 7 wensen zijn nodig (o.a. `Kamer.hoogte`, kelder op verdieping −1, wenteltrap, `Trap.vanaf`, rand `kantelen`/`balustrade`,
  doorgang `valhek`, open zijden). 9 wensen maken het beter. Elke wens heeft een terugval, zodat bouwen ook stap voor stap kan.

---

## a. Onderzoek: 100 echte kastelen

**Werkwijze.** Negen gerichte zoekopdrachten (bronnen onderaan) om twijfelgevallen te controleren, aangevuld met eigen kennis. Alleen
bestaande kastelen; bij twijfel over een kenmerk is dat kenmerk weggelaten. Per kasteel staat hieronder het ene kenmerk dat ons ontwerp
gebruikt. Voor de telling in deel b zijn per kasteel daarnaast alleen de kenmerken geteld waar het kasteel echt bekend om is (1 tot 6 per
kasteel; script in de bijlage). "Kasteel" is ruim genomen: burchten, waterburchten, rotsburchten, sprookjeskastelen, ruïnes, citadellen,
Japanse kastelen en een paar kustforten waar een werelddeel weinig echte kastelen heeft (Oceanië, Caraïben).

**Een eerlijke kanttekening.** Cape Coast Castle (Ghana) staat in de lijst als echt kasteel, maar het was een plek van de slavenhandel. Zulke
plekken, en echte martelwerktuigen, gebruiken we niet als griezel-element. Ons spookkasteel is Halloween-griezelig, niet wreed. De huidige
"folterkamer" verdwijnt daarom.

| Nr | Kasteel | Plaats | Land | Kenmerk voor ons ontwerp |
|---:|---|---|---|---|
| 1 | Muiderslot | Muiden | Nederland | Vierkante waterburcht met ronde hoektorens en een ophaalbrug |
| 2 | Slot Loevestein | Poederoijen | Nederland | Staatsgevangenis; Hugo de Groot ontsnapte in een boekenkist (1621) |
| 3 | Kasteel De Haar | Haarzuilens | Nederland | Oude binnenplaats overdekt tot een grote hal (neogotiek) |
| 4 | Kasteel Doornenburg | Doornenburg | Nederland | Voorburcht en hoofdburcht, verbonden door een smalle houten brug |
| 5 | Kasteel Radboud | Medemblik | Nederland | Burcht van Floris V (eind 13e eeuw) met ridderzaal |
| 6 | Kasteel Ammersoyen | Ammerzoden | Nederland | Waterburcht met vier zware ronde hoektorens |
| 7 | Kasteel Hernen | Hernen | Nederland | Gaaf bewaarde burcht met woontoren en voorburcht |
| 8 | Kasteel Duurstede | Wijk bij Duurstede | Nederland | Vierkante donjon naast een ronde Bourgondische toren |
| 9 | Ruïne van Brederode | Santpoort-Zuid | Nederland | Ruïne met slotgracht en hoofdtoren |
| 10 | Binnenhof (Ridderzaal) | Den Haag | Nederland | Ridderzaal met houten kapspanten |
| 11 | Gravensteen | Gent | België | Walgang met kantelen boven de stad, en een donjon |
| 12 | Kasteel van Beersel | Beersel | België | Waterburcht met drie torens met trapgevels |
| 13 | Kasteel Vianden | Vianden | Luxemburg | Burcht op een heuvel met grote zalen en een dubbele kapel |
| 14 | Neuschwanstein | Schwangau | Duitsland | Sprookjeskasteel met zangerszaal en een nagemaakte grot |
| 15 | Burg Hohenzollern | Bisingen | Duitsland | Kronkelende oprit omhoog door poorten |
| 16 | Burg Eltz | Wierschem | Duitsland | Torenrijk kasteel verstopt in een bosdal |
| 17 | Burg Frankenstein | Mühltal (Darmstadt) | Duitsland | Ruïne op een heuvel; legendes en een groot Halloweenfeest |
| 18 | Wartburg | Eisenach | Duitsland | Zangerszaal en de studeerkamer van Luther |
| 19 | Marksburg | Braubach | Duitsland | Nooit verwoest; middeleeuwse kruidentuin binnen de muren |
| 20 | Heidelberger Schloss | Heidelberg | Duitsland | Ruïne met een reusachtig wijnvat in de kelder |
| 21 | Burg Hochosterwitz | Launsdorf | Oostenrijk | Veertien poorten op de weg omhoog |
| 22 | Festung Hohensalzburg | Salzburg | Oostenrijk | Grote burcht op een berg met een Gouden Zaal |
| 23 | Château de Chillon | Veytaux | Zwitserland | Op een rots in het meer, met gewelfde kerkerkelders |
| 24 | Castelgrande | Bellinzona | Zwitserland | Muren met zwaluwstaartkantelen dwars door het dal |
| 25 | La Cité de Carcassonne | Carcassonne | Frankrijk | Dubbele ringmuur met tientallen torens |
| 26 | Château de Pierrefonds | Pierrefonds | Frankrijk | Overdekte walgang met werpgaten (machicoulis) |
| 27 | Château de Chambord | Chambord | Frankrijk | Dubbele wenteltrap in het midden |
| 28 | Château de Chenonceau | Chenonceaux | Frankrijk | Galerij als brug over de rivier |
| 29 | Château de Vincennes | Vincennes | Frankrijk | Hoogste donjon van Europa (52 m) |
| 30 | Château d'Angers | Angers | Frankrijk | Zeventien torens en het Apocalyps-wandtapijt |
| 31 | Château du Haut-Kœnigsbourg | Orschwiller | Frankrijk | Rode zandsteenburcht op een bergrug |
| 32 | Tower of London | Londen | Verenigd Koninkrijk | White Tower (donjon) met kapel; de raven |
| 33 | Dover Castle | Dover | Verenigd Koninkrijk | Geheime tunnels in de krijtrots |
| 34 | Caernarfon Castle | Caernarfon | Verenigd Koninkrijk | Veelhoekige torens en gangen ín de muren |
| 35 | Harlech Castle | Harlech | Verenigd Koninkrijk | Trap van de burcht omlaag naar de zee |
| 36 | Bodiam Castle | Robertsbridge | Verenigd Koninkrijk | Waterburcht met origineel houten valhek |
| 37 | Leeds Castle | Maidstone | Verenigd Koninkrijk | Op eilandjes in een meer |
| 38 | Castell Coch | Tongwynlais | Verenigd Koninkrijk | Sprookjesachtige kegeldaken op ronde torens |
| 39 | Edinburgh Castle | Edinburgh | Verenigd Koninkrijk | Op een vulkaanrots; gewelven die gevangenis waren |
| 40 | Stirling Castle | Stirling | Verenigd Koninkrijk | Grote zaal met een houten kap |
| 41 | Eilean Donan | Dornie | Verenigd Koninkrijk | Op een eilandje, met een stenen brug |
| 42 | Glamis Castle | Glamis | Verenigd Koninkrijk | Spookverhalen en een verborgen kamer |
| 43 | Blarney Castle | Blarney | Ierland | Moordgat boven de ingang, en een giftuin |
| 44 | Cahir Castle | Cahir | Ierland | Werkend valhek; op een rotseiland in de rivier |
| 45 | Leap Castle | Coolderry | Ierland | Spookkasteel met de 'bloedige kapel' en een put-kerker |
| 46 | Castel del Monte | Andria | Italië | Achthoek met acht torens rond een binnenplaats |
| 47 | Castel Sant'Angelo | Rome | Italië | Geheime gang (Passetto) naar het Vaticaan |
| 48 | Castello Estense | Ferrara | Italië | Slotgracht met ophaalbruggen, en kerkers |
| 49 | Castello di Fénis | Fénis | Italië | Binnenplaats met houten balkons en fresco's |
| 50 | Alcázar van Segovia | Segovia | Spanje | Op een rotspunt als een scheepsboeg, met spitse leien torens |
| 51 | Castillo de Coca | Coca | Spanje | Bakstenen burcht met een diepe droge gracht |
| 52 | Alhambra | Granada | Spanje | Leeuwenhof met fontein en waterstroompjes |
| 53 | Castell de Bellver | Palma (Mallorca) | Spanje | Rond kasteel met ronde binnenplaats en twee galerijen |
| 54 | Castelo de Almourol | Vila Nova da Barquinha | Portugal | Burcht op een eilandje in de Taag |
| 55 | Kronborg | Helsingør | Denemarken | Kazematten (gewelfde kelders) met het beeld van Holger Danske |
| 56 | Egeskov | Kværndrup | Denemarken | Waterkasteel op eikenpalen in een meer |
| 57 | Kalmar slott | Kalmar | Zweden | Slot met slotgracht en ronde torens |
| 58 | Olavinlinna | Savonlinna | Finland | Burcht met drie torens op een eiland |
| 59 | Trakai | Trakai | Litouwen | Rode baksteenburcht op een eiland, met houten bruggen |
| 60 | Malbork | Malbork | Polen | Grootste bakstenen burcht ter wereld |
| 61 | Wawel | Krakau | Polen | Drakenhol: een grot onder de burchtheuvel |
| 62 | Spišský hrad | Spišské Podhradie | Slowakije | Enorme ruïne op een heuvel |
| 63 | Oravský hrad | Oravský Podzámok | Slowakije | Rotsburcht uit de film Nosferatu (1922) |
| 64 | Karlštejn | Karlštejn | Tsjechië | Kapel van het Heilig Kruis met goud en edelstenen |
| 65 | Kasteel Český Krumlov | Český Krumlov | Tsjechië | Berengracht en een overdekte brug |
| 66 | Houska | Blatce | Tsjechië | Kapel boven een 'poort naar de hel' (legende) |
| 67 | Kasteel Bran | Bran | Roemenië | 'Kasteel van Dracula': op een rots, binnenplaats met waterput |
| 68 | Kasteel Corvin (Hunyad) | Hunedoara | Roemenië | Hoge brug op stenen pijlers naar de poort |
| 69 | Burcht van Râșnov | Râșnov | Roemenië | Burcht op een heuvel met een heel diepe waterput |
| 70 | Predjamski grad | Predjama | Slovenië | Gebouwd in de opening van een grot, met geheime gang |
| 71 | Burcht van Bled | Bled | Slovenië | Op een klif boven een meer |
| 72 | Kamjanets-Podilsky | Kamjanets-Podilsky | Oekraïne | Op een rots in een rivierkloof, met een brug |
| 73 | Krak des Chevaliers | bij Homs | Syrië | Concentrische ringmuren en een lange overdekte oprit |
| 74 | Kerak | Al-Karak | Jordanië | Gewelfde gangen en zalen onder de burcht |
| 75 | Citadel van Aleppo | Aleppo | Syrië | Monumentale poort met een brug over de gracht |
| 76 | Fort van Nizwa | Nizwa | Oman | Reusachtige ronde toren |
| 77 | Arg-e Bam | Bam | Iran | Citadel van leem op een heuvel |
| 78 | Citadel van Qaitbay | Alexandrië | Egypte | Burcht aan zee op de plek van de oude vuurtoren |
| 79 | Fasil Ghebbi | Gondar | Ethiopië | Ommuurd terrein met kastelen met ronde koepeltorens |
| 80 | Cape Coast Castle | Cape Coast | Ghana | Wit zeekasteel met binnenplaats en kanonnenbastion |
| 81 | Castle of Good Hope | Kaapstad | Zuid-Afrika | Vijfhoekig fort met bastions en een gracht |
| 82 | Kasbah van de Oudaya's | Rabat | Marokko | Monumentale poort en een Andalusische tuin |
| 83 | Kasteel Himeji | Himeji | Japan | Witte burcht met een doolhof van poorten en paden |
| 84 | Kasteel Matsumoto | Matsumoto | Japan | Zwarte burcht met maankijktoren (Tsukimi-yagura) en rode brug |
| 85 | Kasteel Osaka | Osaka | Japan | Enorme stenen muren en brede grachten |
| 86 | Kasteel Kumamoto | Kumamoto | Japan | Gebogen stenen muren die je bijna niet kunt beklimmen |
| 87 | Hwaseong | Suwon | Zuid-Korea | Vestingmuur met poorten en wachttorens |
| 88 | Mehrangarh | Jodhpur | India | Op een steile rots; poorten met ijzeren pinnen tegen olifanten |
| 89 | Golconda | Hyderabad | India | Een klap onder de poortkoepel hoor je boven op de burcht |
| 90 | Amber Fort | Amer (Jaipur) | India | Spiegelpaleis en een tuin in het meer |
| 91 | Sigiriya | Sigiriya | Sri Lanka | Rotsvesting met leeuwenpoort en watertuinen |
| 92 | Ark van Buchara | Buchara | Oezbekistan | Grote vesting met schuine muren en een hoge poort |
| 93 | Larnach Castle | Dunedin | Nieuw-Zeeland | Balzaal als verjaardagscadeau, en een grote tuin |
| 94 | Fort Denison | Sydney | Australië | Fort met een ronde (Martello)toren op een eilandje |
| 95 | Castillo de San Marcos | St. Augustine | Verenigde Staten | Stervormig fort van schelpsteen met gracht en ophaalbrug |
| 96 | Casa Loma | Toronto | Canada | Geheime gangen en een tunnel naar de stallen |
| 97 | Castillo de Chapultepec | Mexico-Stad | Mexico | Kasteel op een heuvel met terrassen en tuinen |
| 98 | Castillo San Felipe del Morro | San Juan | Puerto Rico | Wachthuisjes (garitas) op de muren boven zee |
| 99 | Castillo San Felipe de Barajas | Cartagena | Colombia | Netwerk van tunnels onder het fort |
| 100 | Citadelle Laferrière | Milot | Haïti | Bergvesting met stapels kanonskogels |

---

## b. Top-15: wat komt het vaakst terug, en wat doen wij ermee?

Geteld over de 100 kastelen (een kasteel telt per kenmerk één keer). Kantelen en spookverhaal delen plek 15.

| # | Kenmerk | Aantal | Voorbeelden | Wat wij ermee doen in Slot Maansteyn |
|---:|---|---:|---|---|
| 1 | Op een rots, heuvel of klif | 45 | Bran, Edinburgh, Mehrangarh, Spiš, Chillon | Het kasteel staat op een rotseiland, 4 m boven het meer. Vanaf het bospad en de brug kijk je omhoog naar het silhouet. |
| 2 | Water rondom (gracht, meer, rivier, zee) | 43 | Muiderslot, Bodiam, Trakai, Leeds, Matsumoto | Het Nevelmeer is de natuurlijke slotgracht: mist op het water, de maan erin gespiegeld. Steiger met boot = de ontsnapping. |
| 3 | Binnenplaats | 23 | De Haar, Bellver, Fénis, Bran, Malbork | Open binnenplaats van 16 × 14 m: het hart van het kasteel en van alle routes. Hier ligt Franks tuin. |
| 4 | Poortgebouw of reeks poorten (valhek) | 17 | Bodiam, Cahir, Hochosterwitz, Himeji | Poortgebouw met twee valhekken. Het binnenste valhek is het fasehek: je ziet de binnenplaats al, maar komt er pas in bij Samen oefenen. |
| 4 | Donjon of hoofdtoren | 17 | Vincennes, Gravensteen, Duurstede, Tower of London | Donjon van 8 × 8 m, dak op 14 m. Wenteltrap van kelder tot dak. Het hoogste silhouet tegen de maan. |
| 6 | Brug of ophaalbrug als enige toegang | 16 | Eilean Donan, Doornenburg, Corvin, Kamjanets-Podilsky | Stenen brug op pijlers over het meer; de laatste 3 m is een houten ophaalbrug. |
| 6 | Ronde (hoek)torens | 16 | Muiderslot, Ammersoyen, Bellver, Olavinlinna | Torens A, B en C op drie hoeken (straal 3 m, kegeldak). De letters staan ook op de wegwijzer (INS-04: "van toren B naar toren C"). |
| 6 | Tuin of kruidentuin | 16 | Marksburg, Alhambra, Egeskov, Blarney (giftuin) | Franks tuin met vijver (vaste eis), kruidenpotten van de heks, bloembollen langs het kerkhof. |
| 6 | Kapel | 16 | Karlštejn, Houska, Vincennes, Malbork | Kleine, hoge kapel (6,7 m) met glas-in-lood en een crypte eronder. INS-09 noemt "kapel en stallen": beide bestaan. |
| 10 | Ridderzaal of grote zaal | 15 | Binnenhof (Ridderzaal), Stirling, Radboud, Vianden | Ridderzaal van 16 × 8 m en 6,7 m hoog met open kap en spanten. INS-03: "een kist in de Ridderzaal". |
| 11 | Kerker of gewelfde kelders | 11 | Chillon, Kronborg, Edinburgh, Kerak | Kelder in de rots: cisterne, kerker, voorraadkelder en harnaskelder (NIV-11, EIN-04, EIN-05 noemen ze). |
| 11 | Dubbele of lange ringmuur | 11 | Carcassonne, Krak des Chevaliers, Harlech | Eén ringmuur; aan de voorkant is hij de walgang. Een dubbele ring maken we niet: te groot voor het eiland. |
| 11 | Geheime gang, tunnel of grot | 11 | Dover, Castel Sant'Angelo, Predjama, Casa Loma | Ertsgang en spookgang (donker, 14 m lang), de puttrap naar de cisterne en de verborgen trap van de kapel naar de crypte. |
| 14 | Ruïne | 9 | Frankenstein, Brederode, Spiš, Heidelberg | Toren C staat in de steigers en wordt verbouwd (EIN-10: "de oude toren wordt verbouwd"). Geen echte ruïne: in het donker geeft dat te weinig houvast. |
| 15 | Walgang met kantelen | 8 | Gravensteen, Carcassonne, Castelgrande, Coca | Walgang boven de voorgevel en op de donjon: borstwering 1,0 m + kantelen 0,7 m. Op ooghoogte kijk je er net overheen. |
| 15 | Spookverhaal of legende | 8 | Leap, Glamis, Houska, Orava (Nosferatu), Burg Frankenstein | Boo is het spook, Frank het lieve monster. Legendes als decor (de crypte "waar de trap naar beneden nooit ophoudt"), geen gruwel. |

Ook gebruikt, al komen ze minder vaak voor als blikvanger: **galerij/balkons** (5: Bellver, Fénis, Wawel → de galerij met het balkon boven de
binnenplaats), **kegeldaken** (5: Carcassonne, Segovia → torens A, B, C), **waterput** (2: Bran, Râșnov → de put op de binnenplaats met de
cisterne eronder) en de **wenteltrap** (Chambord, en in vrijwel elke toren → wenteltrap B en D).

---

## c. Concept

### Naam en verhaal

**Slot Maansteyn** (verzonnen naam). Diep in het bos ligt het Nevelmeer. Midden in het meer staat een rots, en op die rots staat het slot.
Het is Halloween. De graaf is op reis en Boo, het kasteelspook, past op. Frank woont in zijn tuin op de binnenplaats. Hij ziet er eng uit,
maar hij is heel lief, en hij vindt schrikken het leukste spelletje dat er is. De achterpoort aan het meer zit op slot. Daar ligt de boot
naar huis. Zoek de drie sleutels en vaar weg, net als Hugo de Groot in 1621 uit Slot Loevestein.

De missie in `wereld.tsx` past al ("De achterpoort van het kasteel zit op slot"). Voorstel voor de bouwfase (dit zijn geen opdrachtteksten):
Boo's tweede introzin wordt "Dit kasteel staat op een rots, midden in een meer." en de laatste "Kom! Volg het bospad en loop over de brug
naar de poort." De `hintTerugblik` wordt "Volg het bospad en loop over de brug naar de poort. In het poortgebouw staat de goudkist van de
graaf. Tik op het oranje icoon."

### Sfeer: griezelig, maar gezellig

- Spanning komt uit **donker, geluid, afstand en Frank**, nooit uit bloed of wreedheid. Halloween-dingen (pompoenen, kaarsen, spinnenwebben,
  een plastic-achtige schedel) laten zien: dit is een spel.
- Elke donkere zone heeft een **lichte uitweg** in zicht (een fakkel aan het eind, maanlicht door een deur). Je raakt nooit verdwaald in het zwart.
- Humor: Frank lacht na elke schrik en geeft een tip; Boo schrikt zelf ook. De docent kan schrikken uitzetten (bestaat al).

### Kleuren en materialen

| Onderdeel | Materiaal | Kleur |
|---|---|---|
| Buitenmuren | Grijsbruine natuursteen, lichtere hoekstenen, voet van rots | `#6e665c`, hoeken `#9a9184` |
| Daken | Leien, kegeldaken op de torens, koperen windvaan | lei `#3d4250`, koper `#4f8f80` |
| Binnenmuren | Kalkpleister boven, steen onder (zalen); ruwe steen (gangen) | `#d9d0bf` / `#8e8892` |
| Kelder | Ruwe rots, natte glans | `#5a5550` |
| Hout | Eiken: spanten, galerij, deuren, ophaalbrug | `#5a3f22` |
| IJzer | Valhekken, beslag, tralies | `#2a2a2a` |
| Vloeren | Kinderkopjes (poort, paden), plavuizen (zalen), planken (v1), steen (kelder) | bestaande `Vloer`-soorten |
| Franks tuin | Het enige frisse groen in het kasteel: valt op in het maanlicht | `#4e8a3e`, water `#4fa3c7` |
| Accenten | Pompoen-oranje, kaarsgeel, glas-in-lood rood en blauw | `#e8871e`, `#ffd27a` |
| Nacht | Bos, meer, mist | `#1f342b`, `#16243a`, `#16244a` |

### Licht: licht wijst de weg

| Licht | Waar | Hoe |
|---|---|---|
| Maan (koel blauw-violet) | Buiten, binnenplaats, walgang, donjondak | Richtingslicht zonder schaduw (`schaduw: false`, zoals nu). De maan staat laag in het noorden, iets naar het westen: vanaf de brug precies achter de donjon. |
| Zaklamp (warm) | Overal | De hoofdlamp van het spel (bestaat). In gangen en kelder het enige licht naast fakkels. |
| Ramen (warm) | Ridderzaal, keuken, bibliotheek | Gloeiend glas (bestaat); van buiten zie je waar het "veilig" is. |
| Maanbundels | Ramen in de galerij en de kapel (glas-in-lood gekleurd) | Bestaande maanbundel-shader in `huis.tsx`. |
| Maanzuil | Cisterne | Eén bundel uit de put valt op het zwarte water. Zelfde shader. |
| Fakkels en kaarsen | Gangen, kelder, kapel | Vlammetje + warme lichtvlek op de vloer (`Fakkels`, `Lichtplek`), geen echte lampen. |

Regel: **warm = binnen, veilig of doel; koel = buiten; donker = spanning.** Het doel (de achterpoort) is het hele spel als warm lampje bij de
steiger te zien vanaf de walgang en het donjondak.

### Geluid

Bestaand (in `lib/geluid.ts`): `kraak`, `fluister`, `brul`, `boe`, `lach`, `deur`, `poort`, `kluis`. Nieuw, op dezelfde manier met WebAudio
gemaakt (geen bestanden): wind op de walgang en het donjondak, druppels en een zachte galm in de kelder, kabbelend water bij de brug en de
steiger, uil en krekels in het bos, knappend vuur in de ridderzaal en keuken, heel zacht orgel in de kapel, en kettingen van de ophaalbrug
bij de start. Galm: ruimtes met `hoogte` > 5 m of in de kelder krijgen een korte nagalm op voetstappen.

---

## d. Plattegrond in woorden (maten in meters)

### Ligging en schaal

- **Rotseiland:** 44 × 40 m (x −20,3 … 23,7, z −22 … 18), bovenkant op 0 m, rotswand tot −4,5 m. Past in het huidige eiland van 48 × 40 m.
- **Nevelmeer:** water op −4 m, 5 tot 9 m breed rond het eiland. Daarbuiten bos op 0 m (de oever is een steile wal).
- **Bospad:** 6 m breed, 14 m lang (z 27 … 41). Start op [0, 38,5], kijkrichting noord. Het bos staat er dicht langs; na 10 m gaat het open en zie je het kasteel.
- **Brug:** 4 m breed, 10 m lang (z 17 … 27), op 0 m, borstwering 1 m, twee pijlers in het water. Laatste 3 m (z 17 … 20) is de ophaalbrug.
- **Kasteel:** 32 × 28 m (x −16 … 16, z −14 … 14), poortgebouw steekt 3 m uit (tot z 17). Muurhoogte 3,2 m, verdieping 3,5 m.
- **Torens:** A [−16, 14] en B [16, 14] voor, C [16, −14] achter: rond, straal 3 m, kegeldak tot ±13 m. Donjon in de noordwesthoek (x −16 … −8, z −14 … −6), dak op 14 m.
- **Terrassen op de rots:** kerkhof aan de oostkant (6 × 22 m), bouwplaats aan de noordkant (21 × 7 m). Rotstrap (4 m breed) van de bouwplaats omlaag naar de steiger (8 × 4 m) op het water.

### Zones per verdieping

**Begane grond (v0, vloer 0 m)**

| Zone (id) | x van–tot | z van–tot | Maat (m) | Hoogte (m) | Bijzonder |
|---|---|---|---|---|---|
| Bospad (`bospad`) | −3 … 3 | 27 … 41 | 6 × 14 | open lucht | rustig |
| Stenen brug (`brug`) | −2 … 2 | 17 … 27 | 4 × 10 | open lucht | rustig; laatste 3 m = ophaalbrug |
| Poortzaal (`poortzaal`) | −3 … 3 | 8 … 17 | 6 × 9 | 3,2 | gewelf; valhek buiten en binnen |
| Uitlegkamer (`uitleg`) | −8 … −3 | 8 … 14 | 5 × 6 | 3,2 | – |
| Stallen (`stallen`) | 3 … 8 | 8 … 14 | 5 × 6 | 3,2 | – |
| Smidse (`smidse`) | −16 … −8 | 8 … 14 | 8 × 6 | 3,2 | toren A (rond) op de hoek |
| Torenhal B (`torenhal`) | 8 … 16 | 8 … 14 | 8 × 6 | 3,2 | wenteltrap B in de ronde toren |
| Binnenplaats (`binnenplaats`) | −8 … 8 | −6 … 8 | 16 × 14 | open lucht | open, maanlicht; arcade x −8 … −5,5 |
| Wapenzaal (`wapenzaal`) | −12,5 … −8 | −6 … 8 | 4,5 × 14 | 3,2 | harnassen |
| Ertsgang (`ertsgang`) | −16 … −12,5 | −6 … 8 | 3,5 × 14 | 3,2 | donker; rails naar de smidse |
| Bouwmeester (`bouwmeester`) | 8 … 13 | 0 … 8 | 5 × 8 | 3,2 | – |
| Kapel (`kapel`) | 8 … 13 | −6 … 0 | 5 × 6 | 6,7 (vide) | hoogte 6,7 m; trap naar de crypte |
| Spookgang (`spookgang`) | 13 … 16 | −6 … 8 | 3 × 14 | 3,2 | donker, 14 m lang |
| Schatkamer (`schatkamer`) | −16 … −8 | −14 … −6 | 8 × 8 | 3,2 | wenteltrap D (−1 t/m 4) |
| Ridderzaal (`ridderzaal`) | −8 … 8 | −14 … −6 | 16 × 8 | 6,7 (vide) | hoogte 6,7 m, open kap met spanten |
| Heksenkeuken (`keuken`) | 8 … 16 | −14 … −6 | 8 × 8 | 3,2 | grote schouw |
| Kerkhof (`kerkhof`) | 16 … 22 | −11 … 11 | 6 × 22 | open lucht | rustig; borstwering |
| Bouwplaats (`bouwplaats`) | −8 … 13 | −21 … −14 | 21 × 7 | open lucht | rustig; steigers om toren C |
| Rotstrap (`rotstrap`) | 9 … 13 | −27 … −21 | 4 × 6 | open lucht | helling 0 → −3,6 m |
| Steiger (`steiger`) | 7 … 15 | −31 … −27 | 8 × 4 | open lucht | op het water, de boot |

**Eerste verdieping (v1, vloer 3,5 m)**

| Zone (id) | x van–tot | z van–tot | Maat (m) | Hoogte (m) | Bijzonder |
|---|---|---|---|---|---|
| Torenkamer B (`torenkamerB`) | 8 … 16 | 8 … 14 | 8 × 6 | 3,2 | – |
| Walgang (oost) (`walgangO`) | 3 … 8 | 8 … 14 | 5 × 6 | open lucht | kantelen; rustig |
| Bodekamer (`bodekamer`) | −3 … 3 | 8 … 17 | 6 × 9 | 3,2 | valhekwinde; moordgaten in de vloer |
| Walgang (west) (`walgangW`) | −8 … −3 | 8 … 14 | 5 × 6 | open lucht | kantelen; rustig |
| Bibliotheek (`bibliotheek`) | −16 … −8 | 8 … 14 | 8 × 6 | 3,2 | leeshoek in toren A |
| Galerij (`galerij`) | −16 … −8 | −6 … 8 | 8 × 14 | 3,2 | ramen op de binnenplaats |
| Balkon (`balkon`) | −8 … −5,5 | −6 … 8 | 2,5 × 14 | 3,2 | balustrade, kijkt op Franks tuin |
| Wachtkamer (`wachtkamer`) | −16 … −8 | −14 … −6 | 8 × 8 | 3,2 | – |

**Donjon v2–v4 (7 m, 10,5 m en 14 m)**

| Zone (id) | x van–tot | z van–tot | Maat (m) | Hoogte (m) | Bijzonder |
|---|---|---|---|---|---|
| Torenkamer D (`torenkamerD`) | −16 … −8 | −14 … −6 | 8 × 8 | 3,2 | – |
| Wachtpost (`wachtpost`) | −16 … −8 | −14 … −6 | 8 × 8 | 3,2 | – |
| Uitkijk (`uitkijk`) | −16 … −8 | −14 … −6 | 8 × 8 | open lucht | dak met kantelen; rustig |

**Kelder (v−1, vloer −3,5 m)**

| Zone (id) | x van–tot | z van–tot | Maat (m) | Hoogte (m) | Bijzonder |
|---|---|---|---|---|---|
| Cisterne (`cisterne`) | −8 … 8 | −6 … 1 | 16 × 7 | 3,2 | donker water; maanzuil uit de put |
| Crypte (`crypte`) | 8 … 13 | −6 … 0 | 5 × 6 | 3,2 | donker |
| Voorraadkelder (`voorraadkelder`) | −8 … 8 | −14 … −6 | 16 × 8 | 3,2 | gewelf op zuilen |
| Kerker (`kerker`) | −16 … −8 | −6 … 1 | 8 × 7 | 3,2 | lege cellen met tralies |
| Harnaskelder (`harnaskelder`) | −16 … −8 | −14 … −6 | 8 × 8 | 3,2 | voet van wenteltrap D; rijen oude harnassen |

### Binnenplaats en Franks tuin (vaste eis)

- **Franks tuin** ligt midden op de binnenplaats, op [0, 1]: het huidige station `tuin-frank` (model `N.TuinFrank`, schaal 1), dus
  gras van 6 × 6 m, lage haag van 6,4 m met een opening aan de zuidkant, vier bolbomen, twee struiken en de **vijver van 15 × 15 dm** met
  twee vissen. Na NIV-07 groeit het witte hekje om de vijver (bestaat). Botsvak 6,8 × 6,8 m.
- **Waarom hier:** vanaf de poort kijk je door twee valhekken recht in de opening van de haag, naar de vijver met de maan erin. Het is de
  eerste "wow" en de plek waar je steeds weer langs komt. Vanaf het balkon op 3,5 m zie je de tuin van boven, net als op de plattegrond van
  de opdracht: zo verbindt de plek het onderwerp (2D en 3D) met de wereld.
- **Eén vijver.** Er komt geen tweede vijver of fontein op de binnenplaats: NIV-08a zegt "de vijver is geen gras", dus de student moet
  zonder twijfel weten welke vijver bedoeld is. Het meer buiten is een meer, de cisterne is een kelder.
- **Rest van de binnenplaats:** arcade langs de westkant (x −8 … −5,5; vier zuilen op z −3,5, −0,5, 2,5, 5,5; kluis water eronder), waterput
  op [5,5, −4] met de cisterne eronder, waterkubus onder een waterspuwer op [5,6, 5,9], puttrap langs de noordmuur (x −7,8 … −2,2), twee
  bankjes, lantaarns en pompoenen. Paden van kinderkopjes, verder gras. Frank heeft hier zijn vaste plekjes (zie e).

### Trappen

| Trap | Soort | Plek | Verdiepingen | Open vanaf |
|---|---|---|---|---|
| Wenteltrap B | wentel, straal 1,6 m, in toren B | [16,6, 14,6] | 0 → 1 | begeleid |
| Wenteltrap D | wentel, straal 1,7 m, in de donjon | [−13,6, −11,6] | −1 → 0 → 1 → 2 → 3 → 4 | −1→0 evaluatie; 0→1 begeleid; 1→2 en hoger zelfstandig |
| Puttrap | recht, langs de noordmuur van de binnenplaats | midden [−5, −5,2], as x, lengte 5,6, breed 1,5, richting +1 (boven bij x −2,2) | −1 → 0 | zelfstandig |
| Cryptetrap | recht, langs de noordmuur van de kapel | midden [10,5, −5,1], as x, lengte 4,6, breed 1,4, richting −1 (boven bij x 8,2) | −1 → 0 | evaluatie |
| Rotstrap | helling (geen `Trap`) | x 9 … 13, z −21 … −27 | 0 → −3,6 (steiger) | klaar |

### Doorgangen

Alle doorgangen met hun fase. Deuren staan expres 1,5 tot 2 m uit een hoek: daar kan Frank "om de hoek" staan, buiten je zaklampbundel.
"Altijd" betekent: open zodra je er kunt komen. De zone zelf zit dan achter een trap of deur met een fase (de eerste verdieping
bijvoorbeeld achter wenteltrap B en D, die bij Samen oefenen opengaan). Wenteltrap B staat in toren B en is bereikbaar vanuit torenhal B.

| Waar (pos, as, verdieping) | Tussen | Soort | Open vanaf |
|---|---|---|---|
| [0, 17] as x, v0 | Stenen brug ↔ Poortzaal | valhek | start |
| [−3, 11] as z, v0 | Poortzaal ↔ Uitlegkamer | deur | instructie |
| [0, 8] as x, v0 | Poortzaal ↔ Binnenplaats | valhek | begeleid |
| [0, −6] as x, v0 | Binnenplaats ↔ Ridderzaal | dubbel | begeleid |
| [8, −10] as z, v0 | Ridderzaal ↔ Heksenkeuken | deur | begeleid |
| [14,5, −6] as x, v0 | Spookgang ↔ Heksenkeuken | deur | begeleid |
| [14,5, 8] as x, v0 | Torenhal B ↔ Spookgang | boog | begeleid |
| [−8, −10] as z, v0 | Schatkamer ↔ Ridderzaal | deur | begeleid |
| [−14,25, −6] as x, v0 | Ertsgang ↔ Schatkamer | deur | zelfstandig |
| [−10,25, −6] as x, v0 | Wapenzaal ↔ Schatkamer | deur | zelfstandig |
| [−8, 3] as z, v0 | Binnenplaats ↔ Wapenzaal | deur | zelfstandig |
| [−12,5, −1] as z, v0 | Wapenzaal ↔ Ertsgang | boog | altijd |
| [−12,5, 5] as z, v0 | Wapenzaal ↔ Ertsgang | boog | altijd |
| [−14,25, 8] as x, v0 | Smidse ↔ Ertsgang | boog | altijd |
| [−10,25, 8] as x, v0 | Smidse ↔ Wapenzaal | deur | altijd |
| [−8, 11] as z, v0 | Uitlegkamer ↔ Smidse | deur | zelfstandig |
| [3, 11] as z, v0 | Poortzaal ↔ Stallen | deur | zelfstandig |
| [8, 11] as z, v0 | Stallen ↔ Torenhal B | deur | zelfstandig |
| [8, 4] as z, v0 | Binnenplaats ↔ Bouwmeester | deur | zelfstandig |
| [13, 6,6] as z, v0 | Bouwmeester ↔ Spookgang | deur | zelfstandig |
| [8, −3] as z, v0 | Binnenplaats ↔ Kapel | dubbel | evaluatie |
| [13, −1] as z, v0 | Kapel ↔ Spookgang | deur | evaluatie |
| [16, 0] as z, v0 | Spookgang ↔ Kerkhof | deur | zelfstandig |
| [10, −14] as x, v0 | Heksenkeuken ↔ Bouwplaats | deur | zelfstandig |
| [8, 11] as z, v1 | Torenkamer B ↔ Walgang (oost) | deur | altijd |
| [3, 11] as z, v1 | Walgang (oost) ↔ Bodekamer | deur | altijd |
| [−3, 11] as z, v1 | Bodekamer ↔ Walgang (west) | deur | altijd |
| [−8, 11] as z, v1 | Walgang (west) ↔ Bibliotheek | deur | altijd |
| [−12, 8] as x, v1 | Bibliotheek ↔ Galerij | boog | altijd |
| [−8, −2] as z, v1 | Galerij ↔ Balkon | boog | altijd |
| [−8, 4,5] as z, v1 | Galerij ↔ Balkon | boog | altijd |
| [−6,75, 8] as x, v1 | Walgang (west) ↔ Balkon | boog | altijd |
| [−12, −6] as x, v1 | Galerij ↔ Wachtkamer | deur | altijd |
| [8, −2,5] as z, v−1 | Cisterne ↔ Crypte | valhek | evaluatie |
| [−8, −2,5] as z, v−1 | Cisterne ↔ Kerker | deur | evaluatie |
| [3, −6] as x, v−1 | Cisterne ↔ Voorraadkelder | deur | evaluatie |
| [−8, −10] as z, v−1 | Voorraadkelder ↔ Harnaskelder | deur | evaluatie |
| [11, −21] as x, v0 | Bouwplaats ↔ rotstrap | **uitgang** (poort met 3 sleutelgaten) | klaar |

---

## e. De route per fase, en waarom het spannend blijft

| Fase | Wat gaat open | Route (pijlen in de SVG) | Stations | Spanning en rust |
|---|---|---|---|---|
| Start en Terugblik | Bospad, brug, poortgebouw (buitenste valhek staat open) | Bospad → brug → poortgebouw (±30 m, 6 s lopen) | T | Boo springt achter de grote den vandaan (bestaat). Door het binnenste valhek zie je Frank in zijn tuin zwaaien. Geen schrik. |
| Doel | – | – | – | Boo vertelt de missie; je kijkt door het valhek naar de binnenplaats. |
| Instructie | Deur poortzaal → uitlegkamer | 6 m | I | Warm en rustig. |
| Samen oefenen | Binnenste valhek, ridderzaal, keuken, spookgang, toren B, de hele eerste verdieping, wenteltrap D omlaag | Binnenplaats → ridderzaal (1, 2, 3) → keuken → **spookgang** (4) → wenteltrap B → torenkamer B (5) → walgang → bodekamer (6) → walgang → bibliotheek (7, 8) → galerij (9, 10, 11) met het balkon → wachtkamer in de donjon (12) → wenteltrap D → ridderzaal. ±120 m. | 1–12 | De eerste schrik is gepland in de spookgang: na de warme keuken een donkere gang van 14 m. Daarna de walgang als adempauze (maan, wind, uitzicht). Vanaf het balkon naast de galerij kijk je omlaag op Franks tuin. |
| Zelf doen | Westvleugel (wapenzaal, ertsgang, smidse), bouwmeester, puttrap → cisterne, stallen, kerkhof, bouwplaats, donjon omhoog | Ster vanuit de binnenplaats: west = klus spoor, midden en omlaag = klus water, oost = klus bouw. Keuze hoog in de donjon, op de walgang, buiten. | S1–S3, W1–W3, M1–M2, K1–K10, P1–P3 | Frank kiest zelf (regie). Franks tuin is de veilige uitvalsbasis: daar staat hij als je hulp nodig hebt. |
| Eindcheck | Kapel, cryptetrap, crypte, kerker, voorraadkelder, harnaskelder, wenteltrap D vanaf de kelder | Ridderzaal (E1) → keuken → spookgang → kerkhof (E2) → kapel (E3) → **omlaag** → crypte → cisterne → kerker (E4) → voorraadkelder (E5) → harnaskelder (E6) → wenteltrap D **omhoog** → ridderzaal → keuken (E7, E8) → bouwplaats (E9, E10) → achterpoort. ±135 m. | E1–E10 | De afdaling in de rots is het donkerste deel; de maanzuil in de cisterne is je baken. Na een fout eerst rust (bestaat). |
| Klaar | Achterpoort | Rotstrap omlaag → steiger → boot | – | Ontlading: de maan op het meer. Frank en Boo zwaaien vanaf de walgang. |

### Waarom het spannend blijft

1. **Spreiden.** Nergens meer dan 3 stations per ruimte per fase; 29 verschillende ruimtes hebben een station. De binnenplaats is de hub:
   elke fase brengt je er weer langs, telkens via een andere deur.
2. **Ritme van warm, koud en donker.** Poort (warm) → binnenplaats (maan) → ridderzaal (vuur) → spookgang (donker) → walgang (maan, wind)
   → bibliotheek (kaarsen) → galerij (donker, portretten) → wachtkamer in de donjon (fakkel). Nooit twee donkere ruimtes zonder een lichte ertussen,
   behalve in de kelder, en daar is de maanzuil.
3. **Zichtlijnen op ooghoogte** (die maken het groot zonder dat het groot is):
   - bospad → donjon met de maan erachter (de "poster" van de wereld);
   - brug → poortgebouw met valhek, en onder je het zwarte water;
   - poort → door twee valhekken → Franks tuin → de gloeiende ramen van de ridderzaal;
   - balkon → Franks tuin van boven (2D!);
   - walgang → de brug en het bos waar je vandaan kwam;
   - donjondak → het hele kasteel als een plattegrond, en de boot bij de steiger waar je heen moet;
   - cisterne → de maanzuil uit de put;
   - achterpoort → steiger, boot en maan op het meer.
4. **Franks hinderlagen.** De regie (`FrankNPC.tsx`) gebruikt deuropeningen op je route. Het ontwerp geeft hem goede plekken:
   spookgang (deuren naar kapel en bouwmeester halverwege), ertsgang ↔ wapenzaal (twee bogen), galerij ↔ wachtkamer, de kelderdeuren
   en torenhal B. Lange zalen (ridderzaal, galerij, voorraadkelder met zuilen) geven ruimte voor "achter je". De lamp-truc werkt overal.
5. **Rustige zones** (Frank schrikt hier nooit, nu als `RUSTIG` in `FrankNPC.tsx`, voorstel: veld `Kamer.rustig`): bospad, brug,
   poortzaal, uitlegkamer, **binnenplaats**, walgang west en oost, donjondak, kerkhof, bouwplaats, rotstrap en steiger.
   Franks vaste plekjes op de binnenplaats (nu `TUIN`): [−5, 6,8], [4,8, 6,6], [−4,5, −3], [5, 0,5].
6. **Niet te eng.** Je kunt altijd terug naar het maanlicht; elke schrik eindigt met een lach en een tip; de docent kan het uitzetten.

---

## f. Elk station naar een nieuwe zone

Nr = label in de SVG (T, I, 1–12 Samen oefenen, S/W/M = klus spoor/water/bouw, K = keuze, P = geheime vloer, E = eindcheck). "Nu" komt uit
`huis.ts` (`PLEKKEN`) en `docs/wijzigingslijst-wereld2.md`. Plekken zijn een voorstel (± 0,5 m); tafels, schaal en tafelsoort blijven
zoals in `PLEKKEN`, tenzij de ruimte daar te klein voor is. **Opdrachten, teksten en antwoorden veranderen niet.**

| Nr | Station-id | Titel | Opdracht(en) | Fase | Nu (zone, v) | Nieuw (zone, v) | Plek [x, z] | Waarom hier |
|---|---|---|---|---|---|---|---|---|
| T | `terugblik` | Goudkist | W2-TERUG | terugblik | Poortzaal, 0 | **Poortzaal, 0** | [−1,9, 14,2] | Poortzaal, de eerste ruimte na de brug. Achter de goudkist zie je door het binnenste valhek de binnenplaats al liggen. |
| I | `instructie` | Uitleg | W2-INSTR | instructie | Uitlegkamer, 0 | **Uitlegkamer, 0** | [−5,5, 10,6] | Uitlegkamer naast de poortzaal: warm, rustig, deur open bij Uitleg. |
| 1 | `kaarttafel` | Schatkaart | O2-INS-01 | begeleid | Ridderzaal, 0 | **Ridderzaal, 0** | [−4,5, −9] | Rondgang begint tegenover de poort: eerst over de maanverlichte binnenplaats, langs Franks tuin. |
| 2 | `moestuin` | Kruidentuin | O2-INS-02 | begeleid | Ridderzaal, 0 | **Ridderzaal, 0** | [4, −9,2] | Maquette van de kruidentuin van de heks, in dezelfde zaal als haar kist. |
| 3 | `verhuisdoos` | Heksenkist | O2-INS-03 | begeleid | Ridderzaal, 0 | **Ridderzaal, 0** | [0,5, −12,6] | Tekst: "De heks heeft een kist in de Ridderzaal gezet." |
| 4 | `wegwijzer` | Wegwijzer | O2-INS-04 | begeleid | Spookgang, 0 | **Spookgang, 0** | [15,2, 4,6] | Tekst: "De wegwijzer in de gang wijst naar de torens." Eind van de spookgang, vlak voor toren B. |
| 5 | `laminaat` | Torenvloer | O2-INS-05 | begeleid | Torenkamer, 2 | **Torenkamer B, 1** | [11,5, 11,2] | Tekst: torenkamer. Eerste kamer boven aan wenteltrap B; de vloer ligt half. |
| 6 | `fiets` | De bode | O2-INS-06 | begeleid | Zolder, 2 | **Bodekamer, 1** | [0, 10,2] | Bodekamer boven de poort: hier vertrekt de bode, door het raam zie je de brug naar het dorp. |
| 7 | `blikje` | Toverdrank | O2-INS-07 | begeleid | Toverbibliotheek, 1 | **Bibliotheek, 1** | [−14,2, 12,6] | Tekst: "In de bibliotheek staat een flesje toverdrank." |
| 8 | `tuinzwembad` | Badhuis | O2-INS-08 | begeleid | Toverbibliotheek, 1 | **Bibliotheek, 1** | [−10,8, 10,4] | Maquette van het badhuis op de leestafel (zoals nu). |
| 9 | `plattegrond` | Plattegrond | O2-INS-09 | begeleid | Portrettengalerij, 1 | **Galerij, 1** | [−15,5, 4,5] | Kapel en stallen uit de tekst bestaan echt in dit kasteel. Hangt in de galerij. |
| 10 | `abri` | Schilderij | O2-INS-10 | begeleid | Portrettengalerij, 1 | **Galerij, 1** | [−15,4, −1,5] | Tekst: "In de galerij hangt een schilderij van graaf Dracul." |
| 11 | `bloemperken` | Bloemperken | O2-INS-11 | begeleid | Heksenkeuken, 1 | **Galerij, 1** | [−10, −3,8] | Tuin van de graaf als maquette bij het raam: buiten zie je Franks tuin van boven (2D en 3D). |
| 12 | `speeltuin` | Ridderspelen | O2-INS-12 | begeleid | Wachtkamer donjon, 1 | **Wachtkamer, 1** | [−10,1, −9] | Laatste station van de rondgang; daarna wenteltrap D omlaag naar de ridderzaal. |
| S1 | `dobbelsteen` | Toverdobbelsteen | O2-NIV-01 | zelfstandig (klus spoor) | Wapenzaal, 0 | **Wapenzaal, 0** | [−10,25, 1] | Klus spoor: wapenzaal tussen binnenplaats en ertsgang. |
| S2 | `uitslag-balk` | Werkbank van de smid | O2-NIV-02 | zelfstandig (klus spoor) | Smidse, 0 | **Smidse, 0** | [−10,5, 12,9] | Tekst: de smid. Werkbank in de smidse, kluis spoor ernaast. |
| S3 | `goederenwagon` | Ertswagen | O2-NIV-10 | zelfstandig (klus spoor) | Spookgang, 0 | **Ertsgang, 0** | [−15, 1,5] | Tekst: "brengt ijzererts naar de smidse": de rails lopen door de ertsgang de smidse in. |
| W1 | `tuin-frank` | Tuin van Frank | O2-NIV-07, 08a, 08b | zelfstandig (klus water) | Kasteeltuin, 0 | **Binnenplaats, 0** | [0, 1] | VASTE EIS. Midden op de binnenplaats, op ware grootte, in het maanlicht. Model en maten ongewijzigd. |
| W2 | `waterkubus` | Waterkubus | O2-NIV-09 | zelfstandig (klus water) | Kasteeltuin, 0 | **Binnenplaats, 0** | [5,6, 5,9] | Klus water: onder een waterspuwer in de hoek van de binnenplaats (Frank vangt regenwater). |
| W3 | `zwembad` | Waterkelder | O2-NIV-11a, 11b | zelfstandig (klus water) | Kerker, 0 | **Cisterne, −1** | [5,6, −0,4] | Tekst: "Onder het kasteel ligt een waterkelder." In de cisterne onder de binnenplaats, via de puttrap. |
| M1 | `terras` | Terras | O2-NIV-03 | zelfstandig (klus bouw) | Bouwmeester, 0 | **Bouwmeester, 0** | [10,5, 2,4] | Klus bouw: maquette bij de bouwmeester; het echte terras komt bij de bouwplaats. |
| M2 | `huis-lucas` | Vleugel van de graaf | O2-NIV-04, 05, 06 | zelfstandig (klus bouw) | Bouwmeester, 0 | **Bouwmeester, 0** | [10,5, 6,4] | Klus bouw: vleugel van de graaf op de tekentafel van de bouwmeester. |
| K1 | `ramenhuis` | Poortgebouw | O2-EXP-01 | zelfstandig (keuze) | Poortzaal, 0 | **Poortzaal, 0** | [1,9, 10,9] | Tekst: poortgebouw met 6 ramen. De maquette staat ín het poortgebouw, dat echt 6 ramen heeft. |
| K2 | `verfmuur` | Muur verven | O2-EXP-02 | zelfstandig (keuze) | Torenkamer, 2 | **Torenkamer B, 1** | [12,6, 8,5] | Tekst: torenkamer. Tweede bezoek aan torenkamer B (keuze). |
| K3 | `stoepbord` | Krijtbord | O2-EXP-03 | zelfstandig (keuze) | Portrettengalerij, 1 | **Heksenkeuken, 0** | [14,6, −7] | Tekst: "Bij de heksenkeuken staat een krijtbord." |
| K4 | `bloembak` | Bloembak | O2-EXP-04 | zelfstandig (keuze) | Walgang donjon, 6 | **Walgang (west), 1** | [−5,5, 13,3] | Tekst: "op de walgang". Walgang west, zicht op het meer. |
| K5 | `grote-doos` | Schatkist | O2-EXP-05 | zelfstandig (keuze) | Klokkenkamer donjon, 3 | **Schatkamer, 0** | [−9,4, −12,6] | Tekst: "In de schatkamer". Onderste zaal van de donjon, achter een ijzeren deur. |
| K6 | `studentenkamer` | Torenkamer huren | O2-EXP-06 | zelfstandig (keuze) | Torenzolder donjon, 4 | **Torenkamer D, 2** | [−10,1, −9] | Tekst: torenkamer te huur. Donjon, tweede verdieping. |
| K7 | `tuinhuizen` | Tuinhuisjes | O2-EXP-07 | zelfstandig (keuze) | Zolder, 2 | **Stallen, 0** | [5,5, 11,6] | De tuinman van het kasteel heeft zijn hok bij de stallen. |
| K8 | `bouwkavels` | Bouwkavels | O2-EXP-08 | zelfstandig (keuze) | Bouwplaats, 0 | **Bouwplaats, 0** | [−3, −17,5] | Tekst: "naast het kasteel". Bouwplaats achter het kasteel, uitzicht op het meer. |
| K9 | `ananaspak` | Kikkersap | O2-EXP-09 | zelfstandig (keuze) | Heksenkeuken, 1 | **Walgang (oost), 1** | [5,5, 12,6] | Pak uit de heksenkeuken, meegenomen naar de walgang (keuze, hoog en buiten). |
| K10 | `tinyhouse` | Wachtershuisje | O2-PRA-01 | zelfstandig (keuze) | Wachtpost donjon, 5 | **Wachtpost, 3** | [−10,1, −9] | Wachtershuisje voor de kasteelwacht: in de wachtpost van de donjon. |
| P1 | `kruissom-1` | Geheime vloer 1 | O2-PUZ-01 | zelfstandig (keuze) | Kerkhof, 0 | **Kerkhof, 0** | [19, −4] | Geheime vloer tussen de graven (zoals nu). |
| P2 | `kruissom-2` | Geheime vloer 2 | O2-PUZ-02 | zelfstandig (keuze) | Smidse, 0 | **Smidse, 0** | [−12,3, 10,6] | Geheime vloer in de smidse (zoals nu). |
| P3 | `kruissom-3` | Geheime vloer 3 | O2-PUZ-03 | zelfstandig (keuze) | Zolder, 2 | **Uitkijk, 4** | [−10,1, −9] | Geheime vloer op het dak van de donjon, onder de maan. |
| E1 | `tegelvloer` | Tegelvloer | O2-EIN-01 | evaluatie | Troonzaal, 0 | **Ridderzaal, 0** | [−4,5, −12,4] | Woonkamer van de graaf als maquette: eindcheck begint in de grote zaal. |
| E2 | `bloembollen` | Bloembollen | O2-EIN-02 | evaluatie | Kerkhof, 0 | **Kerkhof, 0** | [19, 7] | Tekst: "langs het kerkhof". |
| E3 | `ring` | Zegelring | O2-EIN-03 | evaluatie | Wapenzaal, 0 | **Kapel, 0** | [10,8, −2,2] | Zegelring in een vitrine in de kapel; daarna de trap naar de crypte. |
| E4 | `aquarium` | Spookvissen | O2-EIN-04 | evaluatie | Kerker, 0 | **Kerker, −1** | [−12, −2,4] | Tekst: "In de kerker staat een aquarium." |
| E5 | `aardappelkisten` | Kelderkisten | O2-EIN-05 | evaluatie | Kerkergang, 0 | **Voorraadkelder, −1** | [−3,5, −12,6] | Tekst: "In de kasteelkelder". Voorraadkelder onder de ridderzaal. |
| E6 | `spijkerbroek` | Broek van de ridder | O2-EIN-06 | evaluatie | Troonzaal, 0 | **Harnaskelder, −1** | [−10,2, −8] | Broek voor onder het harnas: tussen de oude harnassen in de harnaskelder. |
| E7 | `melk` | Heksenmelk | O2-EIN-07 | evaluatie | Kerkergang, 0 | **Heksenkeuken, 0** | [12, −10,8] | Heksenmelk in de heksenkeuken, weer boven. |
| E8 | `stationsbord` | Treinreis | O2-EIN-08 | evaluatie | Troonzaal, 0 | **Heksenkeuken, 0** | [15,5, −9] | Boo's treinreis: reisbord aan de keukenmuur, bij de deur naar buiten. |
| E9 | `pakket` | Pakket | O2-EIN-09 | evaluatie | Kerkergang, 0 | **Bouwplaats, 0** | [5, −15,6] | Pakket voor de neef staat klaar bij de achterpoort, voor de boot (knipoog naar Hugo de Groot). |
| E10 | `container` | Puincontainer | O2-EIN-10 | evaluatie | Kerkhof, 0 | **Bouwplaats, 0** | [8, −19] | Tekst: "De oude toren wordt verbouwd": container bij toren C in de steigers. |

**Kluizen** (`KLUIS_PLEK` in `huis.ts`, alle op verdieping 0):

| Klus (id) | Naam nu | Stations (gelijk) | Nu | Nieuw | Plek [x, z] | Waarom |
|---|---|---|---|---|---|---|
| `spoor` | De westvleugel | goederenwagon, uitslag-balk, dobbelsteen | Smidse | **Smidse** | [−8,8, 9,2] | Naast de werkbank en de deur van de uitlegkamer. Naam blijft kloppen. |
| `water` | Tuin en kerker | tuin-frank, waterkubus, zwembad | Kasteeltuin | **Binnenplaats, onder de arcade** | [−6,8, 6,0] | Droog onder de arcade, bij Franks tuin. Naam voorstel: "Tuin en waterkelder". |
| `bouw` | De bouwmeester | huis-lucas, terras | Bouwmeester | **Bouwmeester** | [12,4, 0,9] | Naast de tekentafel. Naam blijft. |

**Lampjes** (9, een beetje uit het zicht): smidse achter het smidsvuur [−15,4, 13,4]; noordeind spookgang [15,4, −5,4]; kerkhof achter
een graf [21,4, 10,4]; bouwplaats bij de keet [−7,4, −20,4]; hoek onder de arcade [−7,6, 7,6]; naast het buitenste valhek [2,6, 16,4];
leeshoek in toren A [−15,4, 13,4, 1]; torenkamer B bij de wenteltrap [15,4, 13,4, 1]; donjon-torenkamer [−15,4, −13,4, 2].

**Wat er in de bouwfase verandert (en wat niet).** Wel: `huis.ts` (`PLAN`, `PLEKKEN`, `KLUIS_PLEK`, `LAMPJES_HUIS`, `SPAWN`, `BOS_DIEPTE`
vervalt), `Omgeving.tsx` (meer, rotseiland, brug, steiger, bos), `Wereld2.tsx` (decor en botsingen), `bran.tsx` (onderdelen hergebruiken:
`RondeToren`, `Waterput`, `Galerij`, `DonjonKroon`), `FrankNPC.tsx` (`TUIN`, `RUSTIG`, startplek), in `wereld.tsx` de introzinnen en
hints (zie c). Niet: `stations.tsx` (de plek komt al uit `PLEKKEN`), `onderdeel2.json`, `strategie.ts`, de modellen. Let op in `frankTips.ts`:
`waar(-1)` geeft nu "boven in de hoge toren"; voor de kelder moet dat "in de kelder" worden, en bij buitenruimtes "op de walgang" in
plaats van "in de walgang". Daarom zijn de zonenamen kort en leesbaar gekozen ("in de galerij", "in de schatkamer"). Een kleine controle bij de bouw: elk station-id heeft een plek, ligt binnen zijn zone, en de lijst
opdrachten per station is gelijk aan nu.

---

## g. Acht beelden op ooghoogte

Camera op 1,55 m boven de vloer, kijkhoek 70°. Tussen haken: plek [x, y, z] en kijkrichting.

1. **De onthulling** ([0, 1,55, 31], noord). Tussen twee dikke dennen gaat het bos open. Het meer ligt 4 m lager, zwart met een strook mist.
   Op de rots het slot: links de donjon (14 m + kantelen), precies voor de maan; rechts de kegel van toren B. Warme ramen. Een uil.
2. **Op de brug** ([0, 1,55, 23], noord). Borstwering op heuphoogte, onder je water. Het poortgebouw vult het beeld: twee torentjes,
   kantelen, het opgetrokken valhek met ijzeren punten. De ophaalbrug kraakt onder je voeten; kettingen lopen schuin omhoog in het donker.
3. **Onder het valhek** ([0, 1,55, 15], noord, iets omhoog). Een stenen gewelf, in het plafond twee moordgaten (je ziet licht uit de
   bodekamer). Links op een tafel de goudkist. Recht vooruit een tweede valhek: daarachter de binnenplaats in maanlicht en Franks haag.
4. **De binnenplaats** ([0, 1,55, 7], noord). De opening in de haag, de vijver met de maan erin, vier bolbomen. Links de arcade met
   lantaarns, rechts de put. Achter de tuin de hoge spitsboogramen van de ridderzaal, warm verlicht; links daarboven de donjon. Frank zwaait.
5. **De lange spookgang** ([14,5, 1,55, −5], zuid). 3 m breed, 14 m lang, plafond 3,2 m. Je zaklamp raakt een harnas, een spinnenweb,
   een halfopen deur rechts (kapel). Helemaal aan het eind één fakkel en de voet van de wenteltrap. De vloer kraakt.
6. **De walgang** ([−5,5, 5,05, 12], zuid; v1). De kantelen komen tot je kin: je kijkt er net overheen naar de brug, het meer en de
   donkere bosrand waar je begon. Draai je om, dan zie je de binnenplaats van boven: Franks tuin als een klein vierkant met een blauw vlak.
7. **De ridderzaal** ([0, 1,55, −7], noord, omhoog). Een zaal van 16 m lang en 6,7 m hoog; de spanten verdwijnen in het donker. Vuur in de
   schouw, de lange tafel, de schatkaart, de kist van de heks. Hoog in de muur maanlicht door smalle ramen.
8. **De cisterne** ([−7, −1,95, −5], oost; v−1). Onder aan de puttrap: zwart water, druppels, galm. Een zuil maanlicht valt uit de put
   op het water. De zaklamp verdwijnt over het water onder lage bogen (de rest van de waterkelder staat onder water). Op een sokkel de maquette.

---

## h. Motorwensen

Wat `Plattegrond` en `game/huis.tsx` nu niet kunnen, maar dit ontwerp nodig heeft. Elk veld is optioneel: zonder het veld werkt alles zoals
nu. Waar een andere wereld (zie `docs/ontwerp/wereld1.md` en `wereld5.md`) hetzelfde vraagt, is dezelfde naam gekozen.
Prioriteit: **M** = nodig, **S** = maakt het veel beter, **C** = mooi meegenomen.

| # | Veld (`types.ts`) | Type | Gedrag | Ook voor | Prio | Terugval |
|---:|---|---|---|---|---|---|
| 1 | `Kamer.hoogte?` (zelfde als wereld 1 en 5) | `number` | Eigen hoogte van de kamer in m. Groter dan `verdiepingHoogte`: een vide. Muren, bovenstukken boven deuren en dak lopen door tot `hoogte`, het plafond hangt op `hoogte`, op de verdieping erboven mag op die plek geen kamer liggen (wel een balkon, #6). | Hallen, kerken, fabriekshallen | M | Ridderzaal en kapel 3,2 m hoog; de spanten als decor. Veel minder indrukwekkend. |
| 2 | Kelder: `Kamer.verdieping` mag negatief zijn | `number` (−1, −2) | `verdiepingen()` neemt −1 mee; `Verdieping nr={-1}` zet alles op −`verdiepingHoogte`. Botsing per laag werkt al met een `Map`. Kelderkamers hebben geen gevel en geen ramen (rots erachter). Zichtbaar alleen als je op −1 staat of bij een trapgat (prestatie). Stations, lampjes en `Fakkels` werken op −1. | Kelders, metro, parkeergarage, mijn | M | Kelder op v0 achter de ridderzaal, "donker" en 1 trede lager als decor; de afdaling verdwijnt. |
| 3 | `Trap.vorm?`, `Trap.straal?`, `Trap.draai?`, `Trap.hoek?`, `Trap.tot?` | `'recht' \| 'wentel'`, `number`, `1 \| -1`, `number`, `number` | `wentel`: treden rond een spil op `pos` met `straal`; één volle draai per verdieping, `draai` = met of tegen de klok, `hoek` = waar je instapt. `tot` = aantal verdiepingen in één schacht (wenteltrap D: van −1 met `tot: 5`). Botsing: een ring, je hoogte volgt de hoek. Het gat in vloer en plafond is rond. (`vorm` en niet `soort`, omdat wereld 5 `soort` voor het materiaal gebruikt.) | Torens, vuurtoren, scheepsruim | M | Rechte trappen heen en weer (zoals de donjon nu), 6,4 m lang; neemt de helft van de donjon in. |
| 4 | `Trap.vanaf?`, `Trap.klus?` (zelfde als wereld 1) | `Fase`, `string` | Tot dan staat er een hekje met ketting en bordje (fasenaam) voor de trap, plus een botsvak. | Elke wereld met verdiepingen | M | Een deur in een muurtje vlak voor de trap. |
| 5 | `Kamer.rand` uitbreiden | `'kantelen' \| 'balustrade'` | `kantelen`: borstwering 1,0 m met merlons van 0,7 × 0,5 m om de 1,0 m (instanced). `balustrade`: stenen leuning 1,0 m met balusters. | Walgang, stadsmuur, dakterras, brug, balkon | M | `muurtje`; de kantelen als decor in `Levend`. |
| 6 | `Kamer.open?` (zelfde als wereld 1) + randregel | `('n' \| 'o' \| 'z' \| 'w')[]` | Een binnenkamer zonder muur aan die zijden. Heeft hij ook `rand`, dan komt die rand op de open zijden (balkon met balustrade). Plafond en binnenlicht blijven. Onderkant van de vloer zichtbaar met balken. | Galerijen, tribunes, balkons, entresols | M | Galerij als buitenruimte met `rand: 'reling'` (dan zonder dak). |
| 7 | `Doorgang.soort` uitbreiden | `'valhek'` | IJzeren rooster in de opening waar je doorheen kijkt. Bij `vanaf` of `klus` schuift het in 2,5 s omhoog in de muur (geluid `poort`); daarna is de opening vrij. Botsvak tot het open is. | Poorten, stadspoort, kooi, garage | M | Gewone dubbele deur; je ziet de binnenplaats dan niet vooraf. |
| 8 | `Kamer.plafond?` (zelfde veld als wereld 1 en 5) uitbreiden | `'tongewelf' \| 'kruisgewelf' \| 'spanten'` | `tongewelf`: halfronde stenen boog over de korte kant (gangen, kelder). `kruisgewelf`: vier kappen per vak van ±4 m (poort, kapel, crypte). `spanten`: open kap tot in de nok met houten spanten om de 3 m. | Kerken, kelders, stations, schuren | S | Vlak plafond van steen of hout (zoals nu). |
| 9 | `Kamer.kolommen?` (zelfde als wereld 1) + soort `'steen'` | `{ afstand: number; soort?: ...; raster?: [number, number] }` | Zuilen met voet en kapiteel; botsing als cirkel. Voor de arcade, de voorraadkelder en de crypte. | Hallen, perrons, markten | S | Zuilen als decor met losse `cirkel`-botsing. |
| 10 | `Plattegrond.torens?` | `{ id: string; naam?: string; pos: [number, number]; r: number; van: number; tot: number; dak?: 'kegel' \| 'kantelen' \| 'geen'; deuren?: { verdieping: number; hoek: number }[] }[]` | Ronde toren als echte ruimte: ronde muur (segmenten), vloer per verdieping, deuren als boog op een `hoek`. Werkt samen met een wenteltrap (#3) op `pos`. Dak `kegel` met leien en windvaan. | Vuurtoren, watertoren, molen, silo | S | Ronde toren als decor (bestaand `RondeToren`/`Toren`); wenteltrap B in de hoek van torenhal B. |
| 11 | `Kamer.rustig?` | `boolean` | NPC's laten je hier nooit schrikken. Vervangt de vaste set `RUSTIG` in `FrankNPC.tsx`. | Elke wereld met een schrik-NPC of verrassingen | S | De set in `FrankNPC.tsx` met de nieuwe zone-id's vullen. |
| 12 | `WereldDef.overzicht?` (zelfde als wereld 1) | `{ pad: [number, number, number][]; kijk: [number, number, number]; duur: number }` | Filmisch overzicht achter het startscherm: de camera vliegt langzaam rond het eiland en eindigt achter de start. | Alle werelden | S | Vaste camera achter de start. |
| 13 | `Kamer.brug?` (zelfde als wereld 1) | `{ soort: 'ophaal' \| 'draai'; as: 'x' \| 'z'; vanaf?: Fase; klus?: string }` | Ophaalbrug: hier alleen als beeld bij de start (zakt in 4 s, kettingen ratelen) en blijft daarna liggen. | Haven, kanaal | C | Brugdek ligt al; kettingen als decor. |
| 14 | `Plattegrond.muurDikte?`, `Kamer.muurDikte?` | `number` | Dikke kasteelmuren (1,2 m buiten, 0,6 m binnen): diepe vensternissen en doorgangen als korte tunnels; botsing en kozijnen schuiven mee. | Bunker, kerk, fort | C | Dunne muren (0,3 m) met een dikke rand om de ramen. |
| 15 | `Kamer.ramen?` (zelfde veld als wereld 1) uitbreiden | `'schietgat' \| 'spitsboog' \| 'glas-in-lood'` | Raamsoort per kamer: smalle schietgaten (gangen), hoge spitsbogen (ridderzaal), gekleurd glas met gekleurde maanbundel (kapel). | Kerk, kasteel, station | C | Bestaande `Vensters` met de huidige raamvorm. |
| 16 | `Klus.kluis.verdieping?` (zelfde als wereld 5) | `number` | Kluis op een andere verdieping. Niet nodig in dit ontwerp (alle kluizen op 0), wel handig bij latere wijzigingen. | Alle werelden | C | Kluis op 0. |

Niet nodig in dit ontwerp, bewust: de uitgang op een andere verdieping (de achterpoort staat op 0, de rotstrap is een helling erachter) en
een vloer op eigen hoogte per kamer.

---

## i. Prestatieplan (Chromebooks)

**Doel:** 30 beelden per seconde op een Chromebook (Intel UHD 600) in de stand "laag", 60 op een gewone laptop in "midden". Meten met
`renderer.info` en `__kwaliteit` (bestaat, alleen in DEV).

| Budget | Grens | Hoe |
|---|---|---|
| Tekenopdrachten in beeld | ≤ 150 (laag), ≤ 250 (hoog) | Vast decor samenvoegen (`Statisch`); herhaling instanced: kantelen, zuilen, harnassen, graven, bomen, treden. |
| Driehoeken totaal | ≤ 350.000 | Torens met 24 segmenten, bomen in 2 detailniveaus, geen losse stenen in de muren (reliëf in de textuur). |
| Echte lampen | Zaklamp + maan + hemellicht | Fakkels, kaarsen, ramen en lantaarns zijn gloed + `Lichtplek` (textuur op de vloer), geen `PointLight`. |
| Schaduw | Alleen de zaklamp, en alleen op "hoog" | Maan zonder schaduw (`schaduw: false`, zoals nu). |
| Texturen | Getekend in code (`texturen.ts`), max. 512 px | Eén atlas per materiaalsoort; geen nieuwe afbeeldingen. |
| Water | 2 vlakken (meer, cisterne) | Bestaande `Water`-shader; geen echte spiegeling, wel een maanstreep in de textuur. |

**Minder tekenen wat je niet ziet.**
1. **Per verdieping** (bestaat): kelder alleen zichtbaar als je op −1 bent of binnen 6 m van een trapgat; donjon v2–v4 alleen van binnen
   als je in de donjon bent (van buiten alleen de buitenkant).
2. **Binnen/buiten** (bestaat, `Binnen`): inrichting weg als je buiten loopt; met het kasteel kleiner dan nu scheelt dat meer.
3. **Zones:** meubels en stations van een zaal alleen tekenen als je in die zaal bent of in een zaal ernaast (via de doorgangen). Dit is
   een motorverbetering zonder nieuw veld.
4. **Mist** verbergt het bos achter het meer: minder bomen nodig (±180 in een ring in plaats van 320 + 120 nu).
5. **Gras** alleen in Franks tuin, op de binnenplaats en het kerkhof; uit in de stand "laag".
6. **Kleiner kasteel:** 36 zones (nu 31), maar op een veel kleiner grondvlak: binnenruimte op de begane grond ±690 m² tegen ±1.680 m² nu.
   Wat erbij komt, ligt boven elkaar (kelder, donjon) en wordt per verdieping weggelaten.

**Proef vóór de bouw van het decor:** eerst het kale plan (vloeren, muren, trappen) laden en meten op het traagste apparaat. Pas als dat
binnen de helft van het budget blijft, komt het decor erbij.

---

## Bronnen

Gebruikt om twijfelgevallen te controleren (de rest uit eigen kennis; bij twijfel is een kenmerk weggelaten):

- De Haar: [Wikipedia](https://en.wikipedia.org/wiki/De_Haar_Castle), [KNOB-bulletin over de glazen overkapping](https://bulletin.knob.nl/index.php/knob/article/download/vandenheuvel52/620/669), [Rijksmonumentenregister](https://monumentenregister.cultureelerfgoed.nl/monumenten/pdf/527892)
- Doornenburg: [Rijksmonumentenregister](https://monumentenregister.cultureelerfgoed.nl/monumenten/pdf/8942), [Kidsproof](https://www.kidsproof.nl/Nijmegen/eropuit/Kasteel-Doornenburg/familiekasteel-Doornenburg-rondleiding)
- Loevestein: [Rijksmuseum, ontsnapping in de boekenkist](https://www.rijksmuseum.nl/en/collection/RP-P-OB-80.936), [Museum Prinsenhof Delft](https://www.museumprinsenhofdelft.nl/en/collectie/103414)
- Muiderslot: [Muiderslot](https://muiderslot.nl/en/?p=24512), [Rijksmonumentenregister](https://monumentenregister.cultureelerfgoed.nl/monumenten/pdf/30107)
- Radboud: [Wikipedia](https://en.wikipedia.org/wiki/Radboud_Castle), [Kasteel Radboud](https://kasteelradboud.nl/en/over-ons/het-kasteel/)
- Ammersoyen: [Rijksmonumentenregister](https://monumentenregister.cultureelerfgoed.nl/monumenten/pdf/8104), [castles.nl](https://castles.nl/ammersoyen-castle)
- Matsumoto: [Lonely Planet](https://www.lonelyplanet.com/points-of-interest/matsumoto-jo/1237423), [Jaanus: tsukimi yagura](https://projects.mcah.columbia.edu/jaanus/node/509); Himeji: [Muza-chan](https://muza-chan.net/japan/index.php/blog/himeji-castle-largest-gate)
- Hochosterwitz: [Wikipedia](https://en.wikipedia.org/wiki/Hochosterwitz_Castle), [14 poorten](https://www.burg-hochosterwitz.com/en/castle/14-gates/)
- Bellver: [Wikipedia](https://en.wikipedia.org/wiki/Bellver_Castle), [Illes Balears](https://www.illesbalears.travel/en/mallorca/castle-bellver)
- Orava: [Wikipedia](https://en.wikipedia.org/wiki/Orava_Castle); Houska: [Wikipedia](https://en.wikipedia.org/wiki/Houska_Castle); Burg Frankenstein: [great-castles.com](https://www.great-castles.com/frankenstein.html), [Travelbook](https://www.travelbook.de/orte/scary-places/burg-frankenstein-geburtsort-einer-legende)
- Golconda: [Wikipedia](https://en.wikipedia.org/wiki/Golconda), [Deccan Herald](https://www.deccanherald.com/archives/an-enigma-ruins-2086339)
- Larnach: [Wikipedia](https://en.wikipedia.org/wiki/Larnach_Castle)

## Bijlage: hoe de telling is gemaakt

Het script `kastelen.py` (in de werkmap van deze ontwerpronde, niet in het project) bevat de 100 kastelen met per kasteel het hoofdkenmerk
en de zekere kenmerken. Het controleert dat er precies 100 unieke kastelen zijn, telt de kenmerken en maakt de tabel van deel a. De
plattegrond (SVG) en de tabellen in d en f komen uit één ontwerpbestand met zones, doorgangen, trappen en stations; een controle daarin
kijkt of elk station binnen zijn zone ligt, of niets elkaar overlapt (stations, kluizen, trappen, put) en of elke doorgang op een gedeelde muur ligt.

---

## Gebouwd (fase 2): wat anders is geworden

Gebouwd in `src/world2/`: `huis.ts` (plattegrond, stationsplekken, kluizen, lampjes), `kasteel.tsx` (nieuw: rotseiland,
hoektorens, brug, rotstrap, steiger, steigers, arcade, schouw, smidsvuur, altaar met glas-in-lood, kroonluchters, cisterne
met maanzuil), `Omgeving.tsx` (bos, Nevelmeer, eiland, torens), `Wereld2.tsx` (inrichting en botsingen), `klussen.ts`,
`wereld.tsx` (missie, intro, hint, maan), `FrankNPC.tsx` (rustige zones en lievelingsplekken) en `frankTips.ts`.
Niet veranderd: `stations.tsx`, de opdrachten (`onderdeel2.json`, `strategie.ts`) en de modellen. Exacte plekken: `PLEKKEN` in `huis.ts`.

| Ontwerp | Gebouwd | Waarom |
|---|---|---|
| Wenteltrappen B en D | Rechte trappen: trap B in torenhal B (5,2 m), donjon heen en weer langs de noordmuur (5 m per verdieping), puttrap (5 m), cryptetrap (4 m, steil) | De motor heeft geen wenteltrap. |
| Donjon 8 × 8 m | Donjon 9 × 9 m (x −17 … −8, z −15 … −6), steekt 1 m uit | Twee trappen met overloop én een maquettetafel per verdieping. |
| Kelder: kerker onder de donjon, uitgang via wenteltrap D | Kerker onder de westvleugel, nieuwe **harnaskelder** onder de donjon; je gaat via de kapel omlaag en via de puttrap weer omhoog | Volgorde van de eindcheck (E4 kerker → E5 voorraadkelder → E6 harnaskelder) zonder extra trap. |
| Ronde torens als ruimtes | Torens A, B, C als massief decor, 1,9 m schuin buiten de hoeken; toren C in de steigers | De motor maakt alleen rechthoekige kamers; zo blijven de hoekkamers heel. |
| Galerij als overdekt balkon | **Weergang**: open loopgang met kantelen boven de arcade; vanuit de galerij kijk je door ramen op Franks tuin | Een balkon met balustrade kan in de motor alleen boven een binnenruimte. |
| Kapel ook bereikbaar vanuit de spookgang | Alleen vanaf de binnenplaats | De cryptetrap zou die deur blokkeren. |
| Deuren overal | Doorgangen die altijd open zijn, zijn stenen bogen | Past bij een burcht en scheelt tekenstappen. |
| Rotseiland 44 × 40 m | 45 × 43 m (inclusief torens en brughoofd) | Torens staan buiten de hoeken. |
| Zichtbaarheid per verdieping (motorwens) | In de wereld zelf (`OpVerdieping`): inrichting van een verdieping wordt alleen getekend als je daar bent of bij een trap ernaartoe staat | Werkt zonder de motor te veranderen. |
| Budget 150–250 tekenstappen | Gemeten op stand 'laag': 489 (start), 547 (binnenplaats), 416 (spookgang); 0,9–1,2 mln driehoeken. Eerste versie van dit slot: 490–770; oude wereld 2 bij de start: 642 | Grootste posten zitten in de motor (deuren, stations, iconen, de schaduwronde van de zaklamp) en het bos. Het budget uit het ontwerp is niet gehaald. |

Ook veranderd voor de first-person speelbaarheid: een paar maquettetafels staan anders dan in tabel f
(bloemperken en tuinzwembad verder van de doorgangen, laminaat en verfmuur in torenkamer B anders ingedeeld,
speeltuin verder van de deur), zodat er overal minstens 0,9 m vrij is voor een station en padzoeken overal past.
Opdrachtteksten die een plek noemen, kloppen nog steeds (kist in de ridderzaal, wegwijzer in de gang, aquarium in de kerker,
schatkist in de schatkamer, torenkamer, walgang, heksenkeuken, kerkhof, bouwplaats, waterkelder onder het slot).
Franks tuin met de vijver ligt midden op de binnenplaats, met hetzelfde model (`tuin-frank`, schaal 1).

**Getest** (Chromium met SwiftShader, 960 × 540): `tsc` schoon voor wereld 2; `npm run verify` 0 fouten; opdrachten, station-id's,
opdrachten per station en klussen gelijk aan vóór de bouw. Padzoeken vanaf de start (via de trappen): 48 van 48 bereikbaar
(45 stations en 3 kluizen, ook in de kelder en hoog in de donjon). Alle 48 geopend zonder consolefouten. Frank loopt rond en zet in
de nieuwe indeling een hinderlaag op ('om de hoek' bij de keukendeur). Tekenstappen op 'hoog': 338 (ridderzaal) tot 578 (binnenplaats).
