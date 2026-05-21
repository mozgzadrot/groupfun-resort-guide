import { loadRegions, loadManifest } from './data.js?v=20260521e';
import { escapeHtml } from './format.js?v=20260521e';

// Country-code icons (matches flagcdn URLs in legacy code).
const FLAG_ISO = {
  'riviera-maya': 'mx',
  'punta-cana': 'do',
  'nassau-bahamas': 'bs',
  'spain': 'es',
};

// Short country labels for the sidebar (legacy used "Dominican Rep.").
const COUNTRY_SHORT = {
  'riviera-maya': 'Mexico',
  'punta-cana': 'Dominican Rep.',
  'nassau-bahamas': 'Bahamas',
  'spain': 'Spain',
};

const REGION_SHORT = {
  'riviera-maya': 'Riviera Maya',
  'punta-cana': 'Punta Cana',
  'nassau-bahamas': 'Nassau & Paradise Island',
  'spain': 'Naturist Resorts',
};

export async function renderSidebar(root) {
  const [regions, manifest] = await Promise.all([loadRegions(), loadManifest()]);
  const byRegion = new Map();
  for (const r of manifest) {
    if (!byRegion.has(r.region)) byRegion.set(r.region, []);
    byRegion.get(r.region).push(r);
  }
  for (const list of byRegion.values()) list.sort((a, b) => a.rank - b.rank);

  const regionBlocks = regions.map(reg => {
    const iso = FLAG_ISO[reg.slug] || '';
    const country = COUNTRY_SHORT[reg.slug] || reg.name.split(',')[1]?.trim() || reg.name;
    const regionName = REGION_SHORT[reg.slug] || reg.name.split(',')[0];
    const resorts = byRegion.get(reg.slug) || [];
    return `
      <a class="region-btn" href="/${reg.slug}/" data-link data-region="${reg.slug}" title="${escapeHtml(reg.name)}">
        <span class="flag">${iso ? `<img src="https://flagcdn.com/w80/${iso}.png" alt="${escapeHtml(country)}">` : ''}</span>
        <span class="region-label">
          <span class="region-country">${escapeHtml(country)}</span>
          <span class="region-name">${escapeHtml(regionName)}</span>
        </span>
      </a>
      <div class="region-resorts" data-region-resorts="${reg.slug}">
        ${resorts.map(r => `<a class="resort-link" href="/${reg.slug}/${r.id}/" data-link data-resort="${r.id}">${escapeHtml(r.name)}</a>`).join('')}
      </div>
    `;
  }).join('');

  root.innerHTML = `
    <div class="sidebar-logo">
      <a class="brand-lockup" href="/" data-link aria-label="GroupFun Resort Guide">
        <img class="brand-mark" src="https://groupfun.com/blog/wp-content/uploads/2026/04/logo_black_new_tagline_1.png" alt="GroupFun" />
      </a>
      <p class="brand-tag"><span>Resort Guide</span><span class="brand-dot">·</span><span>Riviera Maya &amp; Beyond</span></p>
    </div>
    <div class="sidebar-section">Regions</div>
    ${regionBlocks}
    <div style="height:8px"></div>
    <div style="padding:0 20px"><div style="border-top:1px solid var(--border)"></div></div>
    <div class="sidebar-footer">
      <div class="footer-stat">${manifest.length} resorts · ${regions.length} regions</div>
      <div class="footer-disclaimer">
        Ratings, descriptions, and pricing are aggregated from third-party review sites and resort websites; this content is not produced or verified by GroupFun. GroupFun makes no warranty as to accuracy and accepts no responsibility for booking decisions made on its basis &mdash; confirm every detail directly with the resort before you book.
      </div>
    </div>
  `;
}

export function highlightActive(path) {
  const root = document.getElementById('sidebar');
  if (!root) return;
  root.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
  root.querySelectorAll('.resort-link').forEach(b => b.classList.remove('active'));
  root.querySelectorAll('[data-region-resorts]').forEach(d => d.style.display = 'none');

  const parts = path.split('/').filter(Boolean);
  const [region, resort] = parts;
  if (!region) return;
  const regionBtn = root.querySelector(`.region-btn[data-region="${region}"]`);
  if (regionBtn) regionBtn.classList.add('active');
  const list = root.querySelector(`[data-region-resorts="${region}"]`);
  if (list) list.style.display = 'block';
  if (resort) {
    const link = root.querySelector(`.resort-link[data-resort="${resort}"]`);
    if (link) link.classList.add('active');
  }
}
