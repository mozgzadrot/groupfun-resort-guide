import { loadRegions } from './data.js?v=20260521e';
import { renderRegion } from './region-view.js?v=20260521e';
import { renderResort } from './resort-view.js?v=20260521e';
import { renderHome } from './home-view.js?v=20260521e';
import { highlightActive } from './sidebar.js?v=20260521e';

function parsePath(path) {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return { type: 'root' };
  if (parts.length === 1) return { type: 'region', region: parts[0] };
  return { type: 'resort', region: parts[0], resort: parts[1] };
}

async function render() {
  const main = document.getElementById('main');
  const route = parsePath(location.pathname);
  if (document.body.classList.contains('drawer-open')) {
    document.body.classList.remove('drawer-open');
    document.body.style.top = '';
    const ham = document.getElementById('ham');
    if (ham) ham.classList.remove('is-open');
  }

  if (route.type === 'root') {
    await renderHome(main);
    document.title = 'GroupFun Resort Guide';
    highlightActive(location.pathname);
    window.scrollTo(0, 0);
    return;
  }
  if (route.type === 'region') {
    const region = await renderRegion(main, route.region);
    document.title = region ? `${region.name} — GroupFun Resort Guide` : 'GroupFun Resort Guide';
  } else {
    try {
      const resort = await renderResort(main, route.resort);
      document.title = `${resort.name} — GroupFun Resort Guide`;
    } catch (e) {
      main.innerHTML = `<div class="empty"><div class="empty-icon">🤷</div><p>Resort not found.</p></div>`;
      document.title = 'Not found — GroupFun Resort Guide';
    }
  }
  highlightActive(location.pathname);
  window.scrollTo(0, 0);
}

export function navigate(href, replace = false) {
  if (replace) history.replaceState({}, '', href);
  else history.pushState({}, '', href);
  render();
}

export function start() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[data-link]');
    if (!link) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http')) return;
    e.preventDefault();
    if (href !== location.pathname) navigate(href);
  });
  window.addEventListener('popstate', render);
  render();
}
