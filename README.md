# Escaπ

De reken-escaperoom voor mbo niveau 2 (rekenen 2F). Een 3D-spel in de browser, alleen in first person, met vijf werelden:

1. **De Ellehaven**: eenheden en grootheden, met Mees
2. **Slot Maansteyn**: oriëntatie in 2D en 3D, met Boo (en Frank)
3. **De Markthal aan de Waag**: verhoudingen, met Mo
4. **Winkelcentrum De Honderd**: procenten, met Sjors
5. **Meetstation Noorderlicht**: tabellen, grafieken en formules, met Bliep

Elke wereld is ontworpen op basis van onderzoek naar 100 echte plekken (zie `docs/ontwerp/`).

## Spelen

Open de website en kies een wereld op de beginpagina. Een directe link naar een wereld: `/#wereld-3`.

## Zelf draaien

```bash
npm ci
npm run dev
```

Bouwen: `npm run build` (uitvoer in `dist/`). Data controleren: `npm run verify`.

## Online

Elke push naar `main` wordt automatisch door Vercel gebouwd en gepubliceerd.

## Beeld en geluid

- **Omgevingslicht:** echte HDRI-opnames van [Poly Haven](https://polyhaven.com/hdris) (CC0), verkleind door [@pmndrs/assets](https://github.com/pmndrs/assets) (CC0). Per wereld: zonsondergang (haven), nacht (spookkasteel), hal (markthal), lobby (winkelcentrum) en lab (controlekamer).
- **Kleur:** AgX-tonemapping (filmische kleurweergave) met lichte contrast- en kleurcorrectie.
- **Geluid in wereld 2:** helemaal live gemaakt met Web Audio, zonder opgenomen geluiden. Zie [docs/ontwerp/horror-wereld2.md](docs/ontwerp/horror-wereld2.md).
