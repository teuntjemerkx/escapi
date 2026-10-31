// Bouwt de app en zet alles (JS + CSS) in één HTML-bestand voor de Artifact-pagina.
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

execSync('npx vite build', { stdio: 'inherit', env: { ...process.env, EEN_BESTAND: '1' } });
const assets = readdirSync('dist/assets');
const js = assets.filter((f) => f.endsWith('.js')).map((f) => readFileSync(`dist/assets/${f}`, 'utf8')).join('\n');
const css = assets.filter((f) => f.endsWith('.css')).map((f) => readFileSync(`dist/assets/${f}`, 'utf8')).join('\n');
const veiligJs = js.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const html = `<title>Escaπ · de reken-escaperoom</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Escaπ: 3D reken-escaperoom voor mbo niveau 2. Vijf werelden, elke som is een sleutel. Kies je wereld op de beginpagina.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fredoka:wght@500;600;700&family=Sora:wght@600;700;800&display=swap">
<style>${css}</style>
<div id="root"></div>
<script type="module">${veiligJs}</script>
`;
mkdirSync('artifact', { recursive: true });
writeFileSync('artifact/reken-escaperoom.html', html);
console.log(`artifact/reken-escaperoom.html: ${(html.length / 1024 / 1024).toFixed(2)} MB`);
