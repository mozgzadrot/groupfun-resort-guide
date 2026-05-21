import { loadResort, loadRegions } from './data.js?v=20260521d';
import {
  escapeHtml, sentimentChip, CONTACT_ICONS, CONTACT_LABELS, RATING_LABELS,
} from './format.js?v=20260521d';

function hero(r, regionName) {
  const bg = r.hero
    ? `background-image:url('${r.hero}');background-size:cover;background-position:center top;`
    : `background:${r.detail_gradient || 'linear-gradient(135deg, #1a1d2a, #2a2d3a)'};`;
  return `
    <div class="detail-hero">
      <div class="detail-hero-bg" style="${bg}"></div>
      <div class="detail-hero-overlay"></div>
      <div class="detail-hero-content">
        <a class="back-btn" href="/${r.region}/" data-link>← Back to ${escapeHtml(regionName || 'Resorts')}</a>
        <div class="detail-name">${escapeHtml(r.name)}</div>
        <div class="detail-loc">📍 ${escapeHtml(r.location)}</div>
        <div class="detail-badges">
          <span class="badge badge-gold">Rank #${r.rank} in Region</span>
          <span class="badge badge-teal">${escapeHtml(r.type)}</span>
          <span class="badge badge-green">${escapeHtml(r.sentiment.label)}</span>
          <span class="badge badge-gold">${escapeHtml(r.price_range)}/night</span>
        </div>
      </div>
    </div>`;
}

function overview(r) {
  const boxes = Object.entries(r.ratings)
    .filter(([, v]) => v && v !== '—')
    .map(([k, v]) => {
      const m = v.match(/\(([^)]+)\)/);
      const val = v.split('/')[0].trim();
      return `<div class="rating-box">
        <div class="rating-box-val">${escapeHtml(val)}</div>
        <div class="rating-box-label">${escapeHtml(RATING_LABELS[k] || k)}</div>
        <div class="rating-box-src">${m ? escapeHtml(m[1]) : ''}</div>
      </div>`;
    }).join('');
  return `
    <div class="section-block">
      <div class="section-header"><div class="section-title"><span class="section-title-icon">🏨</span> Overview</div></div>
      <div class="section-body">
        <p style="font-size:.9rem;color:var(--muted);line-height:1.7;margin-bottom:20px">${escapeHtml(r.description)}</p>
        <div class="rating-grid">${boxes}</div>
      </div>
    </div>`;
}

function categoryScores(r) {
  const rows = Object.entries(r.category_ratings).map(([k, v]) => {
    const pct = (parseFloat(v) / 10 * 100).toFixed(0);
    return `<div class="sent-row">
      <span class="sent-label">${escapeHtml(k)}</span>
      <div class="sent-bar"><div class="sent-fill" style="width:${pct}%;background:var(--teal)"></div></div>
      <span class="sent-pct" style="color:var(--gold)">${escapeHtml(v)}</span>
    </div>`;
  }).join('');
  return `
    <div class="section-block">
      <div class="section-header"><div class="section-title"><span class="section-title-icon">📊</span> Category Scores</div></div>
      <div class="section-body"><div class="sentiment-summary">${rows}</div></div>
    </div>`;
}

function highlights(r) {
  const hi = r.highlights.map(h => `<div class="feature-item"><div class="feature-dot"></div><span>${escapeHtml(h)}</span></div>`).join('');
  const co = r.considerations.map(c => `<div class="feature-item con"><div class="feature-dot"></div><span>${escapeHtml(c)}</span></div>`).join('');
  return `
    <div class="section-block">
      <div class="section-header"><div class="section-title"><span class="section-title-icon">✅</span> Highlights</div></div>
      <div class="section-body">
        <div class="feature-list">${hi}</div>
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
          <div style="font-size:.8rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">⚠ Considerations</div>
          <div class="feature-list">${co}</div>
        </div>
      </div>
    </div>`;
}

function photoGallery(r) {
  const photos = (r.photos || []).map(p => {
    if (p.url) {
      const badge = p.user ? '<span class="user-photo-badge">Guest Photo</span>' : '';
      const fallback = `this.parentElement.innerHTML='<div class=\\'photo-placeholder\\'><span>🏖️</span>${escapeHtml(p.label).replace(/'/g, "\\'")}</div>'`;
      return `<div class="photo-slot">${badge}<img src="${p.url}" alt="${escapeHtml(p.label)}" loading="lazy" onerror="${fallback}"><div class="photo-label">${escapeHtml(p.label)}</div></div>`;
    }
    return `<div class="photo-slot"><div class="photo-placeholder"><span>📸</span><span>${escapeHtml(p.label)}</span></div></div>`;
  }).join('');
  return `
    <div class="section-block">
      <div class="section-header">
        <div class="section-title"><span class="section-title-icon">📸</span> Photo Gallery</div>
        <span style="font-size:.72rem;color:var(--muted)">Resort + Guest review photos</span>
      </div>
      <div class="section-body">
        <div class="photo-grid">${photos}</div>
      </div>
    </div>`;
}

function reviews(r) {
  const items = r.reviews.map(rev => `
    <div class="review-card">
      <div class="review-header">
        <div class="reviewer-avatar">${escapeHtml(rev.initials)}</div>
        <div class="reviewer-info">
          <div class="reviewer-name">${escapeHtml(rev.name)}</div>
          <div class="reviewer-meta">${escapeHtml(rev.date)} · via ${escapeHtml(rev.platform)}</div>
        </div>
        <div class="review-rating">
          <div class="review-stars" style="color:var(--gold)">${'★'.repeat(rev.stars)}${'☆'.repeat(5 - rev.stars)}</div>
          <div style="font-size:.7rem;color:var(--muted);text-align:right;margin-top:2px">${escapeHtml(rev.rating_text)}</div>
        </div>
      </div>
      <div class="review-body">
        <div class="review-text">${escapeHtml(rev.text)}</div>
        ${sentimentChip(rev.sentiment)}
        ${rev.url ? `<div style="margin-top:8px"><a href="${rev.url}" target="_blank" rel="noopener" style="font-size:.72rem;color:var(--teal);text-decoration:none;opacity:.8">🔗 View original review →</a></div>` : ''}
      </div>
      ${rev.response ? `<div class="resort-response">
        <div class="response-label">🏨 Resort Response — ${escapeHtml(rev.response.by)}</div>
        <div class="response-text">${escapeHtml(rev.response.text)}</div>
      </div>` : ''}
    </div>`).join('');
  return `
    <div class="section-block">
      <div class="section-header">
        <div class="section-title"><span class="section-title-icon">💬</span> Guest Reviews &amp; Sentiment</div>
        <span style="font-size:.72rem;color:var(--muted)">${r.reviews.length} reviews shown · Sources: Google, TripAdvisor, Booking.com</span>
      </div>
      <div class="section-body"><div class="reviews-list">${items}</div></div>
    </div>`;
}

function quickFacts(r, regionName) {
  const rows = [
    ['📍', 'Location', r.location],
    ['🏷', 'Type', r.type],
    ['💰', 'Price Range', r.price_range + '/night'],
    ['🛏', 'Rooms', r.rooms],
    ['🎯', 'Best For', r.best_for],
    ['🌊', 'Region', regionName || r.region],
  ].map(([ic, lb, vl]) => `
    <div class="contact-row">
      <div class="contact-icon">${ic}</div>
      <div><div class="contact-label">${lb}</div><div class="contact-value">${escapeHtml(vl)}</div></div>
    </div>`).join('');
  return `
    <div class="section-block">
      <div class="section-header"><div class="section-title"><span class="section-title-icon">⚡</span> Quick Facts</div></div>
      <div class="section-body" style="padding:14px 16px">${rows}</div>
    </div>`;
}

function sentimentPanel(r) {
  const row = (label, value, color) => `
    <div class="sent-row">
      <span class="sent-label">${label}</span>
      <div class="sent-bar"><div class="sent-fill" style="width:${value}%;background:${color}"></div></div>
      <span class="sent-pct" style="color:${color}">${value}%</span>
    </div>`;
  return `
    <div class="section-block">
      <div class="section-header"><div class="section-title"><span class="section-title-icon">🧠</span> Sentiment Analysis</div></div>
      <div class="section-body">
        <div class="sentiment-summary">
          ${row('Positive', r.sentiment.positive, 'var(--pos)')}
          ${row('Neutral',  r.sentiment.neutral,  'var(--neu)')}
          ${row('Negative', r.sentiment.negative, 'var(--neg)')}
        </div>
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:.75rem;color:var(--muted)">Polarity Score</span>
          <span style="font-size:1rem;font-weight:800;color:var(--gold)">${(+r.sentiment.polarity).toFixed(3)}</span>
        </div>
        <div style="font-size:.68rem;color:var(--muted);margin-top:6px">TextBlob NLP · Scale: −1.0 to +1.0</div>
      </div>
    </div>`;
}

function contact(r) {
  const rows = Object.entries(r.contact)
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const ic = CONTACT_ICONS[k] || '📋';
      const lb = CONTACT_LABELS[k] || k;
      let val;
      if (k === 'website') val = `<a href="https://${v}" target="_blank" rel="noopener" style="color:var(--teal)">${escapeHtml(v)}</a>`;
      else if (k === 'email') val = `<a href="mailto:${v}" style="color:var(--teal)">${escapeHtml(v)}</a>`;
      else val = escapeHtml(v);
      return `
        <div class="contact-row">
          <div class="contact-icon">${ic}</div>
          <div><div class="contact-label">${lb}</div><div class="contact-value">${val}</div></div>
        </div>`;
    }).join('');
  return `
    <div class="section-block">
      <div class="section-header"><div class="section-title"><span class="section-title-icon">📞</span> Contact Information</div></div>
      <div class="section-body" style="padding:14px 16px">${rows}</div>
    </div>`;
}

export async function renderResort(root, id) {
  const [r, regions] = await Promise.all([loadResort(id), loadRegions()]);
  const region = regions.find(x => x.slug === r.region);
  const regionName = region ? region.name : r.region;
  root.innerHTML = `
    ${hero(r, regionName)}
    <div class="detail-grid">
      <div class="detail-main">
        ${overview(r)}
        ${categoryScores(r)}
        ${highlights(r)}
        ${photoGallery(r)}
        ${reviews(r)}
      </div>
      <div class="detail-sidebar-panel">
        ${quickFacts(r, regionName)}
        ${sentimentPanel(r)}
        ${contact(r)}
      </div>
    </div>
  `;
  return r;
}
