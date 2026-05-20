// Operates on already-rendered .resort-card nodes using their data-* attributes.
// No re-render, no data fetch.

let state = { tag: 'all', q: '', sort: 'rank' };

function applyTo(grid) {
  const cards = Array.from(grid.querySelectorAll('.resort-card'));
  const q = state.q.toLowerCase();
  for (const card of cards) {
    const tags = (card.dataset.tags || '').split(',');
    const name = (card.dataset.name || '').toLowerCase();
    const tagline = (card.dataset.tagline || '').toLowerCase();
    const location = (card.dataset.location || '').toLowerCase();
    const okTag = state.tag === 'all' || tags.includes(state.tag);
    const okSearch = !q || name.includes(q) || tagline.includes(q) || location.includes(q) || tags.some(t => t.includes(q));
    card.style.display = okTag && okSearch ? '' : 'none';
  }
  const visible = cards.filter(c => c.style.display !== 'none');
  visible.sort((a, b) => {
    switch (state.sort) {
      case 'rank':       return (+a.dataset.rank) - (+b.dataset.rank);
      case 'rating':     return (+b.dataset.rating) - (+a.dataset.rating);
      case 'price-asc':  return (+a.dataset.price) - (+b.dataset.price);
      case 'price-desc': return (+b.dataset.price) - (+a.dataset.price);
      case 'sentiment':  return (+b.dataset.sentiment) - (+a.dataset.sentiment);
      default: return 0;
    }
  });
  for (const card of visible) grid.appendChild(card);

  let empty = grid.querySelector('.empty');
  if (visible.length === 0) {
    if (!empty) {
      empty = document.createElement('div');
      empty.className = 'empty';
      empty.style.gridColumn = '1/-1';
      empty.innerHTML = `<div class="empty-icon">🔍</div><p>No resorts match your filter.</p>`;
      grid.appendChild(empty);
    }
  } else if (empty) {
    empty.remove();
  }
}

export function attach({ pillsRoot, searchInput, sortSelect, grid }) {
  state = { tag: 'all', q: '', sort: 'rank' };

  if (pillsRoot) {
    pillsRoot.addEventListener('click', e => {
      const pill = e.target.closest('.cmp-pill');
      if (!pill) return;
      pillsRoot.querySelectorAll('.cmp-pill').forEach(p => p.classList.remove('sel'));
      pill.classList.add('sel');
      state.tag = pill.dataset.tag || 'all';
      applyTo(grid);
    });
  }
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.q = searchInput.value;
      applyTo(grid);
    });
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      state.sort = sortSelect.value;
      applyTo(grid);
    });
  }
  applyTo(grid);
}
