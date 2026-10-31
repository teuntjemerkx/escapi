# Motor: bouwdelen voor echte gebouwen (first person)

Het spel is alleen nog first person (ooghoogte 1,55 m, FOV 70; `cam.yaw = 0` kijkt naar −z, `yaw = π/2` naar −x).
De motor (`src/game/huis.tsx` + `src/game/bouwdelen.tsx`) kan nu grote, echte ruimtes maken. Alles hieronder is
optioneel en werkt via de plattegrond (`Plattegrond` in `src/werelden/types.ts`). Werelden zonder deze velden zien er
precies hetzelfde uit als eerst.

De vijf werelden gebruiken samen alle onderdelen; kijk daar voor voorbeelden (vooral `src/world4/huis.ts`).

## Kamer

| veld | wat het doet |
| --- | --- |
| `hoogte: 9` | Hoogte van deze ruimte (muren + plafond). Standaard `plan.muurHoogte`. Een muur tussen twee kamers is zo hoog als de hoogste. Ligt er op die plek een kamer op de verdieping erboven, dan stopt de muur bij die vloer (`verdiepingHoogte`). Daken komen vanzelf op de goede hoogte. |
| `vide: true` | Hoge ruimte die boven lagere buren open is (atrium, hal met galerij). De muur naar een lagere binnenkamer gaat maar tot de hoogte van die buur; daarboven kijk je vrij de ruimte in. |
| `galerij: true` | Voor een kamer op een verdieping. Waar geen kamer naast ligt én er een binnenkamer onder ligt (de vide), staat een **glazen balustrade** in plaats van een muur (met botsing). Naar buiten (niets eronder) blijft het een muur. Galerijkamers mogen **binnen** de vloer van een hoge vide-kamer liggen (bv. een ring van 3 m breed boven de rand van een atrium van 10 m hoog): de onderkant van de galerijvloer wordt dan als plafond getekend. |
| `open: ['n', 'z', 'w', 'o']` | Geen muur aan die zijden (en geen botsing): open loods, galerijstroken die in elkaar overlopen, een hal die overgaat in een plein. `'n'` = kant −z, `'z'` = kant +z, `'w'` = kant −x, `'o'` = kant +x. Het is genoeg als één van de twee kamers de zijde open heeft. |
| `plafond` | `'vlak'` (standaard) · `'glas'` (vlakke glazen kap met stalen roeden) · `'open'` (geen plafond, de lucht) · `'gewelf'` (tongewelf langs de lange kant met gordelbogen; steen bij `muurSoort: 'steen'`, anders stuc) · `'glasgewelf'` (glazen tongewelf met stalen bogen om de 2 m: galleria) · `'koepel'` / `'glaskoepel'` (koepel boven het midden met oculus, op een vlak plafond) · `'spanten'` (vlak met zware balken) · `'systeem'` (systeemplafond met lichtpanelen). Bij glas/open/glasgewelf/(glas)koepel komt er geen pannendak. Een gewelf blijft onder een verdieping erboven. |
| `plafondKleur: '#f2efe9'` | Zonder kleur: houten balkenplafond (of steen). Met kleur: glad stucwerk in die kleur. |
| `dak: 'plat'` | Plat dak met grind en een opstaande dakrand (werkt ook zonder `plan.daken`). |
| `kolommen: { afstand: [6, 6], rand?: [3, 3], dikte?: 0.45, rond?: true, kleur?: '#ddd' }` | Kolommen in een raster, met botsing. Let op doorgangen en stations. |
| `inkijk: true` | De inrichting binnen blijft zichtbaar als je buiten staat (etalages, open loodsen, grote ramen). |
| `verdieping: -1` | Kelder: werkt (trap met `van: -1` naar boven). Zorg dat de grond van je omgeving het trapgat niet afdekt. |

Vloeren: naast de bestaande ook `'terrazzo'` (lichte steen met korrels en messing naden), `'rooster'` (stalen roostervloer) en `'rubber'` (noppenrubber).

## Doorgang (`soort`)

| soort | wat het doet |
| --- | --- |
| `'open'` | Helemaal open tot het plafond (geen bovenstuk). Met `vanaf`/`klus` zit er een doorzichtig **rolhek** voor dat omhoog rolt. Standaardbreedte 3 m. Met `hoog` krijgt de opening een bovenstuk op die hoogte (en is het rolhek zo hoog). |
| `'pui'` | **Etalagepui**: glas van de vloer tot 3 m, in het midden glazen schuifdeuren (`deurBreed`, standaard 2 m), daarboven muur (plek voor het naambord). Standaardbreedte 5 m. Met `vanaf`/`klus` blijven de schuifdeuren dicht. Een smalle pui (`breed` ≈ `deurBreed`) = alleen glazen schuifdeuren. |
| `'roldeur'` | Brede opening (3,6 m, 3,4 m hoog) met een stalen roldeur die omhoog rolt. |
| `'valhek'` | IJzeren valhek dat omhoog schuift (kasteelpoort; 3 m breed, 3,2 m hoog). Je kijkt erdoorheen. |
| `'raam'` | Glas in de muur, géén doorgang. `borst` = borstwering (standaard 0,9 m; `0` = glaswand tot de vloer), `hoog` = bovenkant (standaard 2,4 m). Breed mag (raamwand, controlezaal). |
| `'deur'`, `'dubbel'`, `'boog'` | Zoals eerder. `hoog` werkt voor alle soorten. |

## Trap

- `soort: 'roltrap'` — metalen treden, zijbak, glazen balustrades met zwarte leuning. Je loopt erop zoals op een trap.
- `vanaf: 'zelfstandig'` / `klus: 'k2'` — dicht (rood-wit afzetlint onder- en bovenaan, je kunt er niet op, padzoeken gaat er niet overheen) tot die fase of tot die kluis open is.
- Komt een trap bovenaan uit tegen een galerijrand of muur, dan zit daar vanzelf een opening. Laat `trapOp(tr, 1)` precies op de randlijn uitkomen.
- Er is geen wenteltrap: gebruik een rechte trap (eventueel in een toren langs de muur).

## Klus

`kluis: { pos, rot, verdieping: 1 }` — een kluis op een andere verdieping.

## Rand van een buitenruimte

`rand: 'balustrade'` (glas) naast `'heg' | 'hek' | 'reling' | 'muurtje' | 'spijlen' | 'geen'`. Met `plan.kantelen` krijgt een `'muurtje'` kantelen.

## Zelf iets bijbouwen (in je eigen wereldmap)

- Decor en lampen: `Decor` (vast, wordt samengevoegd) en `Levend` (beweegt) in je wereld.
- Botsing en hoogte in `registreer()`: `box`, `cirkel` (botsvakken), `verhoog(x, z, w, d, h)` (verhoogde vloer, tribune, podium) en `helling(a, b, breed, h0, h1)` (loopbrug, loopplank, helling) uit `src/game/botsing.ts`.
- Iets aan een muur: `OpMuur` uit `huis.tsx`.

## Tips voor first person

- Ooghoogte 1,55 m: borden op 2,2–3 m, toonbanken op 0,8–1,2 m.
- Grote ruimtes voelen groot door hoogte (8–12 m) en lange zichtlijnen, niet door een enorme vloer.
- De speler heeft een zachte lamp boven en achter zich. Zet `lampen` (lichtplekken op de vloer) waar het warm moet voelen.
- Glas schrijft geen diepte: veel glas over elkaar kan flikkeren. Houd glas in één laag waar je doorheen kijkt.
