// Vaste beelden (gemaakt met het spel zelf): een sfeerbeeld per wereld en een portret per maatje.
// Ze zitten in de bundel, zodat de beginpagina meteen compleet is en het spel de portretten niet eerst hoeft te tekenen.
import wereld1 from '../assets/begin/wereld1.webp';
import wereld2 from '../assets/begin/wereld2.webp';
import wereld3 from '../assets/begin/wereld3.webp';
import wereld4 from '../assets/begin/wereld4.webp';
import wereld5 from '../assets/begin/wereld5.webp';
import maatje0 from '../assets/begin/maatje0.webp';
import maatje1 from '../assets/begin/maatje1.webp';
import maatje2 from '../assets/begin/maatje2.webp';
import maatje3 from '../assets/begin/maatje3.webp';
import maatje4 from '../assets/begin/maatje4.webp';
import maatje5 from '../assets/begin/maatje5.webp';

export const WERELD_BEELD: Record<number, string> = { 1: wereld1, 2: wereld2, 3: wereld3, 4: wereld4, 5: wereld5 };
/** Portret per wereld (0 = het standaardspookje). */
export const PORTRET: Record<number, string> = { 0: maatje0, 1: maatje1, 2: maatje2, 3: maatje3, 4: maatje4, 5: maatje5 };
