// Regenerates favicons and the default Open Graph image from the logo SVGs.
// Run after changing src/assets/brand/*.svg:  npm run brand-assets
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = (...p) => path.join(root, ...p);

// favicons + OG image from the brand mark
const mark = await readFile(out('src/assets/brand/logo-mark.svg'));
await sharp(mark).resize(32, 32).png().toFile(out('public/favicon-32.png'));
await sharp(mark).resize(180, 180).png().toFile(out('public/apple-touch-icon.png'));
const word = (await readFile(out('src/assets/brand/logo-wordmark.svg'), 'utf8'));
const wordInner = word.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title>.*?<\/title>/, '');
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="100%" height="100%" fill="#F4F2EE"/>
<svg x="96" y="200" width="460" height="222" viewBox="-6 -6 232 112">${wordInner}</svg>
<text x="96" y="530" font-family="Inter" font-size="30" fill="#6B6B6B">Designing clear, considered digital products &amp; brands.</text></svg>`;
await sharp(Buffer.from(og)).png().toFile(out('public/og-default.png'));
console.log('brand assets generated');
