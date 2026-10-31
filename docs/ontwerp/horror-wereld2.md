# Wereld 2 – Slot Maansteyn als echte horror

De opdrachtgever vond wereld 2 "echt niet eng". Doel: echte horror, passend bij mbo-studenten (16+): spanning en
angst, geen bloed of geweld in beeld, en de rekenopdrachten blijven altijd speelbaar.

## Wat het onderzoek zegt

| Principe | Bron | Wat we ermee doen |
|---|---|---|
| Sfeer maakt meer bang dan schrikmomenten; schrikken werkt alleen spaarzaam (anders went het). | [Dread Script: A Guide To Horror Game Development](https://discourse.weareopen.coop/news/dread-script-a-guide-to), [Morbidly Beautiful](https://morbidlybeautiful.com/the-art-of-engineering-fear-through-structured-game-design/) | De regisseur bouwt spanning op; echte schrikmomenten blijven zeldzaam (eerste na ±45 s, daarna elke 1–1,5 min). Tussendoor alleen dreiging. |
| Geluid is de grootste bron van angst; dubbelzinnige geluiden laten je twijfelen. | [wayline.io: silence is scary](https://www.wayline.io/blog/silence-is-scary-sound-design-horror-games), [The Sound Architect: Alien: Isolation](https://www.thesoundarchitect.co.uk/alienisolation/) | Een lage bromtoon en wind, gefluister, gekraak en bonken uit een willekeurige richting, deuren die ergens dichtslaan. |
| Stilte en afwachten maken de klap groter: bijna-stilte met af en toe één geluid. | [wayline.io: the mute button betrays horror](https://www.wayline.io/blog/mute-button-betrays-horror-silence-kills-scream), [Destructoid](https://www.destructoid.com/?p=207401) | Loert Frank vlakbij om een hoek, dan zakt de bromtoon weg. Daarna één stinger. |
| Lichaamsgeluiden (adem, hartslag) en voetstappen in 3D zijn heel eng. | [Inverse: RE7 sound design](https://inverse.com/article/27260-re7-sound-design-love), [La Hacienda Creative: RE7](https://www.lahaciendacreative.com/works/resident-evil-vii-biohazard) | Franks voetstappen en adem komen uit zijn echte richting (links/rechts, doffer achter je, gedempt van een andere verdieping). Je hartslag gaat sneller als hij dichterbij komt. |
| Een tegenstander die niet vast gescript is maar jaagt op wat hij ziet en hoort, laat je nooit ontspannen. | [Giant Bomb review Alien: Isolation](https://giantbomb.com/user-reviews/uid/9255/a-masterclass-in-sustained-terror-and-reverent-ada), [Audio Technology](https://www.audiotechnology.com/?p=29542) | Frank dwaalt rond, verschijnt in de verte, slaat toe als de spanning hoog is en jaagt soms achter je aan. |
| Weerloos zijn (rennen of verstoppen) en een veilige plek geven ritme. | [Narcosis](https://www.narcosis-the-game.com/?p=75552) | Je kunt alleen rennen. Zijn tuin en de verlichte plekken zijn veilig; daar is Frank rustig en helpt hij zelfs. |

## Wat er in het spel zit

- **Frank** is overdag de tuinman, 's nachts iets anders: lang en mager, holle oogkassen met gloeiende pupillen (ook in de verte te zien), een open mond, te lange armen en vingers en een gehechte nek. Als hij staart, hangt zijn hoofd scheef en schokt het; als hij jaagt, rent hij met zijn armen naar je uitgestoken. Geen grappige teksten meer.
  - *In de verte:* hij staat stil in een gang en kijkt je aan. Schijn je erop of kom je dichterbij, dan is hij weg.
  - *Toeslaan:* om de hoek, achter je als je stilstaat, of als je lamp uitvalt. Stinger, schok, daarna fluistert hij.
  - *Achtervolging (± de helft van de keren):* hij rent je achterna (net iets langzamer dan jij). Ren naar het licht of zijn tuin. Pakt hij je, dan valt je lamp even uit en is hij weg. Je verliest niets.
  - *Helpen:* in zijn tuin, of als je twee keer fout zit, komt hij rustig uitleggen.
- **Geluid** (live gemaakt met Web Audio): bromtoon, wind, gefluister, gekraak, bonken, deuren, Franks voetstappen en adem in 3D, je hartslag, stingers en een snelle puls tijdens de jacht.
- **Beeld:** filmkorrel, kleurranden en een donkere rand die meegroeien met de angst (en meekloppen met je hart). De zaklamp hapert als hij dichtbij is.
- **Het slot:** gekraste tekst op de muren ("HIJ ZIET JE", "BLIJF IN HET LICHT", "TEL DE STAPPEN"). In donkere hoeken kijken soms twee ogen je aan; schijn je erop, dan zijn ze weg.
- **Boo** (het maatje) is geen schattig heksje meer, maar een bleek, doorschijnend laken met holle ogen en een oude lantaarn. Hij helpt nog steeds, maar fluistert.
- **Zaklamp:** een metalen staaflamp in een leren handschoen, met reflector en gloeiende lens.
- **Docent:** "Schrikmomenten" uit = geen toeslaan en geen jacht, wel de sfeer.

Code: `src/world2/horror.tsx` (geluid, angst, muren, ogen), `src/world2/FrankNPC.tsx` (regie), `src/world2/frankModel.tsx` (uiterlijk), `src/game/beeld.ts` (`sfeerFx`).
