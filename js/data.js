const cache = {
  regions: null,
  manifest: null,
  resorts: new Map(),
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

export function loadRegions() {
  cache.regions ??= fetchJson('/data/regions.json');
  return cache.regions;
}

export function loadManifest() {
  cache.manifest ??= fetchJson('/data/index.json');
  return cache.manifest;
}

export function loadResort(id) {
  if (!cache.resorts.has(id)) {
    cache.resorts.set(id, fetchJson(`/data/resorts/${id}.json`));
  }
  return cache.resorts.get(id);
}
