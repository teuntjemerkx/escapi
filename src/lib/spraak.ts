// Voorlezen met de stem van de browser (Nederlands). Voor leerlingen die moeite hebben met lezen:
// de vraag in het rekenpaneel en wat het maatje zegt, worden hardop voorgelezen.

let stem: SpeechSynthesisVoice | null = null;
function kiesStem() {
  if (typeof speechSynthesis === 'undefined') return null;
  const stemmen = speechSynthesis.getVoices();
  stem = stemmen.find((s) => s.lang === 'nl-NL') ?? stemmen.find((s) => s.lang.startsWith('nl')) ?? null;
  return stem;
}
if (typeof speechSynthesis !== 'undefined') speechSynthesis.onvoiceschanged = kiesStem;

/** Kan deze browser voorlezen? */
export const kanVoorlezen = () => typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';

/** Lees een tekst voor (stopt wat er nog werd voorgelezen). Rekentekens worden woorden. */
export function leesVoor(tekst: string) {
  if (!kanVoorlezen()) return;
  speechSynthesis.cancel();
  const zin = tekst
    .replace(/×/g, ' keer ')
    .replace(/(\d)\s*:\s*(\d)/g, '$1 gedeeld door $2')
    .replace(/−/g, ' min ')
    .replace(/m²/g, ' vierkante meter')
    .replace(/cm²/g, ' vierkante centimeter')
    .replace(/m³/g, ' kubieke meter')
    .replace(/cm³/g, ' kubieke centimeter')
    .replace(/dm³/g, ' kubieke decimeter')
    .replace(/€\s*/g, ' euro ');
  const u = new SpeechSynthesisUtterance(zin);
  u.lang = 'nl-NL';
  u.voice = stem ?? kiesStem();
  u.rate = 0.92;
  speechSynthesis.speak(u);
}

export function stopVoorlezen() {
  if (kanVoorlezen()) speechSynthesis.cancel();
}
