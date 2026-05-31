import { loadRegions, loadManifest } from './data.js?v=20260521e';
import { escapeHtml } from './format.js?v=20260521e';

const FLAG_ISO = {
  'riviera-maya': 'mx',
  'punta-cana': 'do',
  'nassau-bahamas': 'bs',
  'spain': 'es',
  'jamaica': 'jm',
};

export async function renderHome(main) {
  const [regions, manifest] = await Promise.all([loadRegions(), loadManifest()]);

  const countByRegion = new Map();
  for (const r of manifest) {
    countByRegion.set(r.region, (countByRegion.get(r.region) || 0) + 1);
  }

  const totalResorts = manifest.length;
  const totalRegions = regions.length;
  const allTags = new Set();
  manifest.forEach(r => (r.tags || []).forEach(t => allTags.add(t)));

  const regionCards = regions.map(reg => {
    const iso = FLAG_ISO[reg.slug] || '';
    const count = countByRegion.get(reg.slug) || 0;
    const regionLabel = reg.name.split(',')[0];
    const countryLabel = reg.name.split(',')[1]?.trim() || '';
    return `
      <a class="home-region-card" href="/${reg.slug}/" data-link>
        <div class="home-region-flag">
          ${iso ? `<img src="https://flagcdn.com/w160/${iso}.png" alt="${escapeHtml(countryLabel || regionLabel)}">` : ''}
        </div>
        <div class="home-region-body">
          <div class="home-region-country">${escapeHtml(countryLabel || regionLabel)}</div>
          <h3 class="home-region-name">${escapeHtml(regionLabel)}</h3>
          <p class="home-region-desc">${escapeHtml(reg.description || '')}</p>
          <div class="home-region-meta">
            <span class="home-region-count">${count} resort${count === 1 ? '' : 's'}</span>
            <span class="home-region-cta">Explore →</span>
          </div>
        </div>
      </a>
    `;
  }).join('');

  main.innerHTML = `
    <div class="page active home-page">
      <section class="home-hero">
        <img class="brand-watermark" src="https://groupfun.com/blog/wp-content/uploads/2026/04/logo_black_new_tagline_1.png" alt="">
        <div class="home-hero-badge">Resort Guide · Curated for Groups</div>
        <h1 class="home-hero-title">Find the right all-inclusive for your crew.</h1>
        <p class="home-hero-blurb">
          ${totalResorts} hand-vetted adults-only and lifestyle resorts across ${totalRegions} regions — ranked,
          reviewed, and compared on the dimensions that actually matter when you're booking with a group.
        </p>
        <div class="home-hero-stats">
          <div class="home-stat"><div class="home-stat-num">${totalResorts}</div><div class="home-stat-label">Resorts</div></div>
          <div class="home-stat"><div class="home-stat-num">${totalRegions}</div><div class="home-stat-label">Regions</div></div>
          <div class="home-stat"><div class="home-stat-num">${allTags.size}</div><div class="home-stat-label">Filter Tags</div></div>
        </div>
      </section>

      <section class="home-section">
        <div class="home-section-head">
          <h2 class="home-section-title">Browse by region</h2>
          <p class="home-section-sub">Pick a coast to see ranked resorts, filters, and full breakdowns.</p>
        </div>
        <div class="home-region-grid">${regionCards}</div>
      </section>

      <section class="home-footer-note">
        <div class="home-footer-meta">
          <span>${totalResorts} resorts · ${totalRegions} regions</span>
          <span class="home-footer-dot">·</span>
          <span>Editorial guide</span>
        </div>
        <p class="home-footer-disclaimer">
          <strong>Disclaimer.</strong> Resort ratings, reviews, descriptions, photos, pricing, and contact details on this site are aggregated from third-party review platforms and resort websites. This content is not produced or independently verified by GroupFun, and GroupFun makes no representation or warranty as to its accuracy, completeness, or currency. GroupFun accepts no responsibility or liability for travel decisions made on the basis of information presented here. Always confirm rooms, rates, policies, availability, and travel requirements directly with each resort before booking.
        </p>
      </section>
 