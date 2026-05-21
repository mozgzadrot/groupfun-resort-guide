import { renderSidebar } from './sidebar.js';
import { start } from './router.js';

console.log('[GroupFun] main.js loaded · build=20260521a');

const sidebar = document.getElementById('sidebar');
const ham = document.getElementById('ham');
if (!ham) console.warn('[GroupFun] hamburger #ham not found in DOM');

const backdrop = document.createElement('div');
backdrop.className = 'sidebar-backdrop';
document.body.appendChild(backdrop);

const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

let savedScrollY = 0;

function openDrawer() {
  if (document.body.classList.contains('drawer-open')) return;
  savedScrollY = window.scrollY || 0;
  document.body.classList.add('drawer-open');
  if (ham) ham.style.display = 'none';
  if (isMobile()) {
    document.body.style.top = `-${savedScrollY}px`;
  }
}

function closeDrawer() {
  if (!document.body.classList.contains('drawer-open')) return;
  document.body.classList.remove('drawer-open');
  document.body.style.top = '';
  if (ham) ham.style.display = '';
  window.scrollTo(0, savedScrollY);
}

ham?.addEventListener('click', () => {
  document.body.classList.contains('drawer-open') ? closeDrawer() : openDrawer();
});

backdrop.addEventListener('click', closeDrawer);

sidebar.addEventListener('click', (e) => {
  if (e.target.closest('#sidebar-close')) {
    e.preventDefault();
    closeDrawer();
    return;
  }
  if (e.target.closest('a[data-link]') && isMobile()) closeDrawer();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDrawer();
});

window.addEventListener('resize', () => {
  if (!isMobile()) closeDrawer();
});

await renderSidebar(sidebar);
start();
