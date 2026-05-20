#!/usr/bin/env node
// One-time extraction: pulls REGIONS and RESORTS out of _legacy/index.html,
// folds the per-id gradient lookups into each resort, and writes
//   data/regions.json
//   data/resorts/<id>.json (one per resort)
//
// Run once after the legacy file is moved to _legacy/, then delete this script.

import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SRC  = path.join(ROOT, '_legacy', 'index.html');

const html = await fs.readFile(SRC, 'utf8');

// Slice the data block: from `const REGIONS = {` through the end of the
// RESORTS array literal, identified by the trailing `];` that ends the array
// before the next banner comment.
const startIdx = html.indexOf('const REGIONS =');
if (startIdx < 0) throw new Error('Could not find `const REGIONS =`');
const banner = '// ═══════════════════════════════════════════════════════════════════════════\n//  RENDER FUNCTIONS';
const endIdx = html.indexOf(banner, startIdx);
if (endIdx < 0) throw new Error('Could not find RENDER FUNCTIONS banner');
const dataSrc = html.slice(startIdx, endIdx);

const ctx = {};
vm.createContext(ctx);
vm.runInContext(dataSrc + '\nthis.REGIONS = REGIONS; this.RESORTS = RESORTS;', ctx);
const { REGIONS, RESORTS } = ctx;

// Pull the two gradient lookup tables from the render functions.
function extractGradientMap(label) {
  const fnIdx = html.indexOf(`function ${label}`);
  if (fnIdx < 0) throw new Error(`No function ${label}`);
  const open = html.indexOf('const gradients = {', fnIdx);
  if (open < 0) throw new Error(`No gradients map in ${label}`);
  const close = html.indexOf('};', open);
  const literal = html.slice(open + 'const gradients = '.length, close + 1);
  // eslint-disable-next-line no-new-func
  return new Function(`return ${literal}`)();
}
const cardGradients   = extractGradientMap('renderResortCard');
const detailGradients = extractGradientMap('renderDetailPage');

// Per-region filter-pill markup and hero stats — these aren't in REGIONS,
// they're hard-coded in the <section class="page"> blocks. Extract by regex.
function pillsForRegion(suffix) {
  // suffix is '' for riviera-maya or like ",'punta-cana'" etc.
  const re = suffix
    ? new RegExp(`filterResorts\\('([^']+)',this,'${suffix}'\\)">([^<]+)<`, 'g')
    : new RegExp(`filterResorts\\('([^']+)',this\\)">([^<]+)<`, 'g');
  const pills = [];
  for (const m of html.matchAll(re)) pills.push({ tag: m[1], label: m[2].replace(/&amp;/g, '&').trim() });
  return pills;
}
const regionPills = {
  'riviera-maya':   pillsForRegion(''),
  'punta-cana':     pillsForRegion('punta-cana'),
  'nassau-bahamas': pillsForRegion('nassau-bahamas'),
  'spain':          pillsForRegion('spain'),
};

function heroStatsFor(regionId) {
  const sectionStart = html.indexOf(`id="region-${regionId}"`);
  if (sectionStart < 0) return [];
  const heroStart = html.indexOf('class="hero-stats"', sectionStart);
  if (heroStart < 0) return [];
  // .hero-stats closes with `        </div>` on its own line in the source.
  const heroEnd = html.indexOf('\n        </div>', heroStart);
  const block = html.slice(heroStart, heroEnd);
  const stats = [];
  const re = /<div class="stat-num">([^<]+)<\/div><div class="stat-label">([^<]+)</g;
  for (const m of block.matchAll(re)) stats.push({ value: m[1], label: m[2] });
  return stats;
}

// Per-region hero blurb (heading line 2 + paragraph).
function heroCopyFor(regionId) {
  const s = html.indexOf(`id="region-${regionId}"`);
  if (s < 0) return {};
  const sliceTo = html.indexOf('</section>', s);
  const slice = html.slice(s, sliceTo);
  const badge = slice.match(/hero-badge">([^<]+)</)?.[1].trim() ?? '';
  const h2    = slice.match(/<h2>([^<]+)<br>\s*<span>([^<]+)<\/span><\/h2>/);
  const para  = slice.match(/<p>([^<]+)<\/p>/);
  return {
    badge,
    title: h2 ? h2[1].trim() : '',
    subtitle: h2 ? h2[2].trim() : '',
    blurb: para ? para[1].trim() : '',
  };
}

// Build regions.json
const regionsOut = Object.entries(REGIONS).map(([slug, r]) => ({
  slug,
  name: r.name,
  flag: r.flag,
  description: r.description,
  filter_pills: regionPills[slug] || [],
  hero_stats: heroStatsFor(slug),
  hero_copy: heroCopyFor(slug),
}));

await fs.mkdir(path.join(ROOT, 'data', 'resorts'), { recursive: true });
await fs.writeFile(
  path.join(ROOT, 'data', 'regions.json'),
  JSON.stringify(regionsOut, null, 2) + '\n'
);

// Write per-resort JSON files with gradients folded in.
let missingCard = 0, missingDetail = 0;
for (const r of RESORTS) {
  const out = {
    ...r,
    card_gradient:   cardGradients[r.id]   ?? detailGradients[r.id] ?? null,
    detail_gradient: detailGradients[r.id] ?? cardGradients[r.id]   ?? null,
  };
  if (!out.card_gradient)   missingCard++;
  if (!out.detail_gradient) missingDetail++;
  await fs.writeFile(
    path.join(ROOT, 'data', 'resorts', `${r.id}.json`),
    JSON.stringify(out, null, 2) + '\n'
  );
}

// Assertions
const regionSlugs = new Set(regionsOut.map(r => r.slug));
const badRegion = RESORTS.filter(r => !regionSlugs.has(r.region));
if (badRegion.length) throw new Error(`Resorts referencing unknown regions: ${badRegion.map(r => r.id).join(', ')}`);

console.log(`✓ Regions: ${regionsOut.length}`);
console.log(`✓ Resorts: ${RESORTS.length}`);
console.log(`  - missing card_gradient: ${missingCard}`);
console.log(`  - missing detail_gradient: ${missingDetail}`);
console.log(`✓ wrote data/regions.json and data/resorts/*.json`);
