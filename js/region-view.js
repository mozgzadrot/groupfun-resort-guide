import { loadRegions, loadManifest } from './data.js?v=20260521c';
import { escapeHtml } from './format.js?v=20260521c';
import { attach as attachFilters } from './filters.js?v=20260521c';

function cardHtml(r) {
  const bg = r.thumbnail
    ? `background-image:url('${r.thumbnail}');background-size:cover;background-position:center;`
    : `background:${r.card_gradient || 'linear-gradient(135deg, #1a1d2a, #2a2d3a)'};`;
  const sentCol = r.sentiment.positive >= 90 ? 'var(--pos)' : r.sentiment.positive >= 70 ? 'var(--neu)' : 'var(--neg)';
  const tagsAttr = (r.tags || []).join(',');
  const cleanLocation = r.location.split('(')[0].trim();
  const cleanType = r.type.split('·')[0].trim();
  const googleVal = (r.ratings.google || '').split('/')[0].trim();

  return `
  <a class="resort-card" href="/${r.region}/${r.id}/" data-link
     data-id="${r.id}" data-name="${escapeHtml(r.name)}" data-tagline="${escapeHtml(r.tagline)}"
     data-location="${escapeHtml(r.location)}" data-tags="${escapeHtml(tagsAttr)}"
     data-rank="${r.rank}" data-price="${r.price_sort}"
     data-rating="${r.ratings.overall}" data-sentiment="${r.sentiment.polarity}">
    <div class="card-hero">
      <div class="card-hero-bg" style="${bg}"></div>
      <div class="card-hero-overlay"></div>
      <div class="card-rank">${r.rank}</div>
      <div class="card-hero-info">
        <div class="card-tag">${escapeHtml(cleanType)}</div>
        <div class="card-name">${escapeHtml(r.name)}</div>
        <div class="card-location">📍 ${escapeHtml(cleanLocation)}</div>
      </div>
    </div>
    <div class="card-body">
      <div class="card-meta">
        <span class="meta-item"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>${escapeHtml(cleanLocation)}</span>
        <span class="meta-item"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>${escapeHtml(r.rooms)}</span>
      </div>
      <div class="card-ratings">
        <div class="rating-chip">
          <span class="rating-chip-label">Overall</span>
          <span class="rating-chip-val">${escapeHtml(r.ratings.overall)}</span>
          <span class="rating-chip-sub">out of 10</span>
        </div>
        <div class="rating-chip">
          <span class="rating-chip-label">Google</span>
          <span class="rating-chip-val">${escapeHtml(googleVal)}</span>
          <span class="rating-chip-sub">/ 5.0</span>
        </div>
      </div>
      <div class="sentiment-bar">
        <div class="sentiment-label"><span>Positive sentiment</span><span style="color:${sentCol}">${r.sentiment.positive}%</span></div>
        <div class="bar-track"><div class="bar-fill bar-pos" style="width:${r.sentiment.positive}%"></div></div>
      </div>
      <p class="card-excerpt">${escapeHtml(r.tagline)}</p>
      <div class="card-tags">${(r.tags || []).map(t => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('')}</div>
    </div>
    <div class="card-footer">
      <div class="price-range"><span class="price-label">From</span>${escapeHtml(r.price_range)}<span class="price-label"> / night</span></div>
      <span class="view-btn">View Resort →</span>
    </div>
  </a>`;
}

export async function renderRegion(root, slug) {
  const [regions, manifest] = await Promise.all([loadRegions(), loadManifest()]);
  const region = regions.find(r => r.slug === slug);
  if (!region) {
    root.innerHTML = `<div class="empty"><div class="empty-icon">🤷</div><p>Region not found.</p></div>`;
    return null;
  }
  const resorts = manifest.filter(r => r.region === slug).sort((a, b) => a.rank - b.rank);
  const stats = (region.hero_stats || []).map(s =>
    `<div class="stat"><div class="stat-num">${escapeHtml(s.value)}</div><div class="stat-label">${escapeHtml(s.label)}</div></div>`
  ).join('');
  const pills = (region.filter_pills || []).map((p, i) =>
    `<span class="cmp-pill${i === 0 ? ' sel' : ''}" data-tag="${escapeHtml(p.tag)}">${escapeHtml(p.label)}</span>`
  ).join('');

  root.innerHTML = `
    <section class="page active">
      <div class="hero">
        <img class="brand-watermark" src="https://s03.ndcdn.com/sites/groupfun.com/logo_and_text.svg?v=2.401.0.master.20260515092501" alt="GroupFun" aria-hidden="true">
        <div class="hero-badge">${region.hero_copy?.badge || ''}</div>
        <h2>${escapeHtml(region.hero_copy?.title || '')}<br><span>${escapeHtml(region.hero_copy?.subtitle || region.name)}</span></h2>
        <p>${escapeHtml(region.hero_copy?.blurb || region.description)}</p>
        <div class="hero-stats">${stats}</div>
      </div>
      <div class="comparison-row">${pills}</div>
      <div class="toolbar">
        <input type="text" class="search-box" placeholder="Search resorts…" />
        <select class="sort-select">
          <option value="rank">Sort: Region Rank</option>
          <option value="rating">Sort: Overall Rating</option>
          <option value="price-asc">Sort: Price (Low → High)</option>
          <option value="price-desc">Sort: Price (High → Low)</option>
          <option value="sentiment">Sort: Sentiment</option>
        </select>
      </div>
      <div class="resort-grid">${resorts.map(cardHtml).join('')}</div>
    </section>
  `;

  attachFilters({
    pillsRoot: root.querySelector('.comparison-row'),
    searchInput: root.querySelector('.search-box'),
    sortSelect: root.querySelector('.sort-select'),
    grid: root.querySelector('.resort-grid'),
  });

  return region;
}
