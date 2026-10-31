// Controleert een of meer onderdeel-JSON-bestanden tegen het datamodel en rekent
// elke expr na. Gebruik: node scripts/verify-data.mjs src/data/onderdeel1.json [...]
// Exitcode 1 bij fouten. Waarschuwingen blokkeren niet.
import { readFileSync } from 'node:fs';

const SECTIES = ['instap', 'niveau', 'expert', 'praktijk', 'puzzel', 'eindtest'];
const TYPES = ['getal', 'keuze', 'eenheid-kiezen', 'tekst', 'open', 'puzzel', 'koppel'];
const PANELEN = ['stappen', 'deelsommen', 'eenhedentrap', 'verhoudingstabel', 'procentenbalk', 'getallenlijn', 'blokmodel', 'formule', 'tabel', 'grafiek', 'keuze', 'koppel', 'kruissom'];
const AFRONDING = ['geen', 'heel', '1-decimaal', '2-decimalen', 'naar-boven', 'naar-beneden', 'duizendtal'];
const FLAGS = ['notatie', 'tekst', 'dubbelzinnig', 'fout-in-werkboek', 'dubbel', 'auteursrecht', 'onleesbaar', 'niet-automatisch'];
const CODES = { instap: 'INS', niveau: 'NIV', expert: 'EXP', praktijk: 'PRA', puzzel: 'PUZ', eindtest: 'EIN' };

function rond(x, a) {
  switch (a) {
    case 'heel': return Math.round(x);
    case '1-decimaal': return Math.round(x * 10) / 10;
    case '2-decimalen': return Math.round(x * 100) / 100;
    case 'naar-boven': return Math.ceil(x - 1e-9);
    case 'naar-beneden': return Math.floor(x + 1e-9);
    case 'duizendtal': return Math.round(x / 1000) * 1000;
    default: return x;
  }
}

function evalExpr(expr) {
  // Alleen getallen, operatoren, haakjes en Math.* zijn toegestaan.
  if (!/^[\d\s+\-*/().,%<>=?:]*$/.test(expr.replace(/Math\.(round|floor|ceil|sqrt|min|max|abs|PI|pow)/g, ''))) {
    throw new Error(`niet-toegestane tekens in expr "${expr}"`);
  }
  return Function('Math', `"use strict"; return (${expr});`)(Math);
}

const zelfde = (a, b, tol = 0) => Math.abs(a - b) <= Math.max(tol, 1e-9 * Math.max(1, Math.abs(b)));

let fouten = 0;
let waarschuwingen = 0;
const fout = (id, m) => { fouten++; console.log(`  FOUT  ${id}: ${m}`); };
const let_op = (id, m) => { waarschuwingen++; console.log(`  LET OP ${id}: ${m}`); };

function checkStappen(id, stappen, label) {
  if (!Array.isArray(stappen)) return fout(id, `${label} is geen array`);
  stappen.forEach((s, i) => {
    const sid = `${id} ${label}[${i}]`;
    for (const k of ['tekst', 'som', 'invoer']) if (s[k] === undefined) fout(sid, `mist "${k}"`);
    if (!('uitkomst' in s)) fout(sid, 'mist "uitkomst"');
    if (s.afronding && !AFRONDING.includes(s.afronding)) fout(sid, `onbekende afronding ${s.afronding}`);
    if (s.expr) {
      try {
        const v = rond(evalExpr(s.expr), s.afronding);
        if (typeof s.uitkomst !== 'number') fout(sid, `uitkomst is geen getal maar expr bestaat`);
        else if (!zelfde(v, s.uitkomst)) {
          const rel = Math.abs(v - s.uitkomst) / Math.max(1e-9, Math.abs(s.uitkomst));
          if (rel < 0.005) let_op(sid, `expr geeft ${v}, uitkomst ${s.uitkomst} (afgerond zonder "afronding"?)`);
          else fout(sid, `expr "${s.expr}" geeft ${v}, maar uitkomst is ${s.uitkomst}`);
        }
      } catch (e) { fout(sid, e.message); }
    }
  });
}

function checkAntwoord(id, a, label) {
  if (a === null) return;
  if (typeof a !== 'object' || !('waarde' in a)) return fout(id, `${label} mist "waarde"`);
  if (a.afronding && !AFRONDING.includes(a.afronding)) fout(id, `${label}: onbekende afronding ${a.afronding}`);
  if (a.expr) {
    try {
      const v = rond(evalExpr(a.expr), a.afronding);
      if (typeof a.waarde !== 'number') fout(id, `${label}: waarde is geen getal maar expr bestaat`);
      else if (!zelfde(v, a.waarde, 0)) fout(id, `${label}: expr "${a.expr}" geeft ${v}, waarde is ${a.waarde}`);
    } catch (e) { fout(id, `${label}: ${e.message}`); }
  }
}

// Kruissom: vul de oplossing in en controleer elke rij- en kolomsom (x en : gaan voor + en -).
function rekenUit(tokens) {
  const t = [...tokens];
  for (let i = 1; i < t.length; i += 2) {
    if (t[i] === 'x' || t[i] === ':') {
      const v = t[i] === 'x' ? t[i - 1] * t[i + 1] : t[i - 1] / t[i + 1];
      t.splice(i - 1, 3, v);
      i -= 2;
    }
  }
  let v = t[0];
  for (let i = 1; i < t.length; i += 2) v = t[i] === '+' ? v + t[i + 1] : v - t[i + 1];
  return v;
}
export function looptjes(rooster) {
  const rijen = rooster.length;
  const kol = Math.max(...rooster.map((r) => r.length));
  const cel = (r, c) => (rooster[r] && rooster[r][c] !== undefined ? rooster[r][c] : '#');
  const uit = [];
  const verzamel = (cellen) => {
    let huidig = [];
    for (const rc of [...cellen, null]) {
      if (rc && cel(...rc) !== '#') huidig.push(rc);
      else {
        if (huidig.length >= 5) uit.push(huidig);
        huidig = [];
      }
    }
  };
  for (let r = 0; r < rijen; r++) verzamel(Array.from({ length: kol }, (_, c) => [r, c]));
  for (let c = 0; c < kol; c++) verzamel(Array.from({ length: rijen }, (_, r) => [r, c]));
  return uit;
}
function checkKruissom(id, pz, antwoord) {
  const waarden = String(antwoord?.waarde ?? '').split(',').map((x) => Number(x.trim()));
  const vol = pz.rooster.map((r) => [...r]);
  let k = 0;
  vol.forEach((r) => r.forEach((v, c) => { if (v === '') r[c] = String(waarden[k++]); }));
  if (k !== waarden.length) return fout(id, `kruissom: ${k} vakjes, maar ${waarden.length} waarden`);
  const tegels = [...pz.tegels].sort((a, b) => a - b).join(',');
  if (tegels !== [...waarden].sort((a, b) => a - b).join(',')) fout(id, 'kruissom: oplossing gebruikt niet precies de tegels');
  for (const loop of looptjes(vol)) {
    const tok = loop.map(([r, c]) => vol[r][c]);
    const is = tok.indexOf('=');
    if (is !== tok.length - 2) { fout(id, `kruissom: vreemde reeks ${tok.join(' ')}`); continue; }
    const links = tok.slice(0, is).map((x, i) => (i % 2 ? x : Number(x)));
    if (Math.abs(rekenUit(links) - Number(tok[is + 1])) > 1e-9) fout(id, `kruissom klopt niet: ${tok.join(' ')}`);
  }
}

const cijfergroepen = (s) => new Set((s.match(/\d+/g) || []).map((d) => d.replace(/^0+(?=\d)/, '')));

for (const pad of process.argv.slice(2)) {
  console.log(`\n== ${pad}`);
  let data;
  try { data = JSON.parse(readFileSync(pad, 'utf8')); } catch (e) { fout(pad, `geen geldige JSON: ${e.message}`); continue; }
  if (!Array.isArray(data.opdrachten)) { fout(pad, 'mist "opdrachten"'); continue; }
  const ids = new Set();
  const perSectie = {};
  for (const o of data.opdrachten) {
    const id = o.id || '(zonder id)';
    if (ids.has(id)) fout(id, 'dubbel id'); ids.add(id);
    if (o.onderdeel !== data.onderdeel) fout(id, `onderdeel ${o.onderdeel} ≠ ${data.onderdeel}`);
    if (!SECTIES.includes(o.sectie)) fout(id, `onbekende sectie ${o.sectie}`);
    else {
      perSectie[o.sectie] = (perSectie[o.sectie] || 0) + 1;
      const re = new RegExp(`^O${data.onderdeel}-${CODES[o.sectie]}-\\d{2}[a-z]?\\d?$`);
      if (!re.test(id)) fout(id, `id volgt het patroon O${data.onderdeel}-${CODES[o.sectie]}-NN[a] niet`);
    }
    if (!TYPES.includes(o.type)) fout(id, `onbekend type ${o.type}`);
    if (!PANELEN.includes(o.paneel)) fout(id, `onbekend paneel ${o.paneel}`);
    if (typeof o.origineel !== 'string' || !o.origineel.trim()) fout(id, 'mist "origineel"');
    if (!Array.isArray(o.afbeeldingen)) fout(id, 'afbeeldingen is geen array');
    if (!Array.isArray(o.vraag) || !o.vraag.length) fout(id, 'vraag is leeg');
    else o.vraag.forEach((z) => { if (z.split(/\s+/).length > 16) let_op(id, `lange zin (2F?): "${z}"`); });
    if (typeof o.autoCheck !== 'boolean') fout(id, 'autoCheck ontbreekt');
    if (Array.isArray(o.afbeeldingen) && o.afbeeldingen.length) {
      const b = Array.isArray(o.beeld) ? o.beeld : [];
      for (const a of o.afbeeldingen) if (!b.some((x) => x.afbeelding === a)) fout(id, `geen "beeld" voor ${a}`);
      b.forEach((x) => { if (!x.vorm || !x.ontwerp || !Array.isArray(x.toont)) fout(id, `beeld ${x.afbeelding} mist vorm/ontwerp/toont`); });
    }
    if (!Array.isArray(o.flags)) fout(id, 'flags is geen array');
    else o.flags.forEach((f) => { if (!FLAGS.includes(f.soort)) fout(id, `onbekende flag ${f.soort}`); });
    if (o.autoCheck && !o.antwoord) fout(id, 'autoCheck zonder antwoord');
    if ((o.type === 'keuze' || o.type === 'eenheid-kiezen') && (!Array.isArray(o.keuzes) || !o.keuzes.length)) fout(id, 'keuzevraag zonder keuzes');
    if (o.type === 'keuze' && o.antwoord && o.keuzes && !o.keuzes.includes(o.antwoord.waarde)) let_op(id, `antwoord "${o.antwoord.waarde}" staat niet letterlijk in keuzes`);
    checkAntwoord(id, o.antwoord, 'antwoord');
    if (o.type === 'koppel') {
      if (!o.koppel?.items?.length) fout(id, 'koppelvraag zonder items');
      else for (const it of o.koppel.items) if (!o.koppel.opties.includes(it.antwoord)) fout(id, `koppel-antwoord ${it.antwoord} staat niet in opties`);
    }
    if (o.puzzel) checkKruissom(id, o.puzzel, o.antwoord);
    checkStappen(id, o.stappen, 'stappen');
    if (o.type === 'getal' && o.antwoord && typeof o.antwoord.waarde === 'number' && o.stappen?.length) {
      const laatste = o.stappen[o.stappen.length - 1];
      if (typeof laatste.uitkomst === 'number' && !zelfde(rond(laatste.uitkomst, o.antwoord.afronding), o.antwoord.waarde) && !laatste.trap)
        let_op(id, `laatste stap (${laatste.uitkomst}) ≠ antwoord (${o.antwoord.waarde})`);
    }
    if (o.voorbeeld) {
      checkStappen(id, o.voorbeeld.stappen, 'voorbeeld.stappen');
      checkAntwoord(id, o.voorbeeld.antwoord, 'voorbeeld.antwoord');
      if (o.antwoord && o.voorbeeld.antwoord && o.antwoord.waarde === o.voorbeeld.antwoord.waarde && typeof o.antwoord.waarde === 'number')
        let_op(id, 'tweelingsom heeft hetzelfde antwoord als de werkboeksom');
    }
    // Eén-op-één: alle cijfergroepen uit het origineel moeten terugkomen in vraag of context.
    const doel = cijfergroepen([...(o.vraag || []), JSON.stringify(o.context || []), ...(o.keuzes || [])].join(' '));
    const mist = [...cijfergroepen(o.origineel || '')].filter((g) => !doel.has(g));
    if (mist.length) let_op(id, `getallen uit origineel niet terug in vraag/context: ${mist.join(', ')}`);
  }
  console.log(`  ${data.opdrachten.length} opdrachten: ${Object.entries(perSectie).map(([k, v]) => `${k} ${v}`).join(', ')}`);
}
console.log(`\nKlaar: ${fouten} fouten, ${waarschuwingen} waarschuwingen.`);
process.exit(fouten ? 1 : 0);
