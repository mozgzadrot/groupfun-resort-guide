import { renderSidebar } from './sidebar.js?v=20260521c';
import { start } from './router.js?v=20260521c';

const BUILD = '20260521c';
console.log(`[GroupFun] main.js loaded · build=${BUILD}`);

const sidebar = document.getElementById('sidebar');
const ham = document.getElementById('ham');

const backdrop = document.createElement('div');
backdrop.className = 'sidebar-backdrop';
document.body.appendChild(backdrop);

const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

let savedScrollY = 0;

function openDrawer() {
  if (document.body.classList.contains('drawer-open')) return;
  console.log('[GroupFun] openDrawer');
  savedScrollY = window.scrollY || 0;
  document.body.classList.add('drawer-open');
  if (ham) ham.classList.add('is-open');
  if (isMobile()) {
    document.body.style.top = `-${savedScrollY}px`;
  }
}

function closeDrawer() {
  if (!document.body.classList.contains('drawer-open')) return;
  console.log('[GroupFun] closeDrawer');
  document.body.classList.remove('drawer-open');
  document.body.style.top = '';
  if (ham) ham.classList.remove('is-open');
  window.scrollTo(0, savedScrollY);
}

ham?.addEventListener('click', () => {
  document.body.classList.contains('drawer-open') ? closeDrawer() : openDrawer();
});

backdrop.addEventListener('click', closeDrawer);

sidebar.addEventListener('click', (e) => {
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
