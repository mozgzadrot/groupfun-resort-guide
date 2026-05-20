#!/usr/bin/env node
// Reads data/resorts/*.json and writes data/index.json — a manifest of
// card-sized fields used by the region grid view. Run after editing any
// resort file:  `node scripts/build-index.mjs`

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'data', 'resorts');
const OUT  = path.join(ROOT, 'data', 'index.json');

const FIELDS = [
  'id', 'region', 'rank', 'name', 'tagline', 'location', 'type', 'tags',
  'price_range', 'price_sort', 'rooms', 'best_for',
  'ratings', 'sentiment', 'thumbnail', 'card_gradient',
];

const files = (await fs.readdir(SRC)).filter(f => f.endsWith('.json')).sort();
const manifest = [];
for (const f of files) {
  const r = JSON.parse(await fs.readFile(path.join(SRC, f), 'utf8'));
  const entry = {};
  for (const k of FIELDS) entry[k] = r[k];
  manifest.push(entry);
}
manifest.sort((a, b) => a.region.localeCompare(b.region) || a.rank - b.rank);
await fs.writeFile(OUT, JSON.stringify(manifest, null, 2) + '\n');
console.log(`✓ wrote data/index.json (${manifest.length} resorts)`);
