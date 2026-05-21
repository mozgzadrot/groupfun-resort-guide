import { renderSidebar } from './sidebar.js';
import { start } from './router.js';

const sidebar = document.getElementById('sidebar');
const ham = document.getElementById('ham');
const backdrop = document.createElement('div');
backdrop.className = 'sidebar-backdrop';
document.body.appendChild(backdrop);

let lockedScrollY = 0;

const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

const lockScroll = () => {
  lockedScrollY = window.scrollY || window.pageYOffset || 0;
  document.body.classList.add('menu-open');
  if (isMobile()) {
    document.body.classList.add('scroll-locked');
    document.body.style.top = `-${lockedScrollY}px`;
  }
};

const unlockScroll = () => {
  const wasLocked = document.body.classList.contains('scroll-locked');
  document.body.classList.remove('menu-open', 'scroll-locked');
  document.body.style.top = '';
  if (wasLocked) window.scrollTo(0, lockedScrollY);
};

const closeSidebar = () => {
  sidebar.classList.remove('open');
  backdrop.classList.remove('show');
  unlockScroll();
};
const openSidebar = () => {
  sidebar.classList.add('open');
  backdrop.classList.add('show');
  lockScroll();
};
const toggleSidebar = () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
};

ham?.addEventListener('click', toggleSidebar);
backdrop.addEventListener('click', closeSidebar);

sidebar.addEventListener('click', (e) => {
  if (e.target.closest('#sidebar-close')) {
    e.preventDefault();
    closeSidebar();
    return;
  }
  const link = e.target.closest('a[data-link]');
  if (link && isMobile()) closeSidebar();
});

window.addEventListener('resize', () => {
  if (!isMobile()) closeSidebar();
});

// Router may remove .open from the sidebar during render — keep the
// body/backdrop state in sync so they don't get stranded.
new MutationObserver(() => {
  const open = sidebar.classList.contains('open');
  const bodyOpen = document.body.classList.contains('menu-open');
  if (!open && bodyOpen) {
    backdrop.classList.remove('show');
    unlockScroll();
  }
}).observe(sidebar, { attributes: true, attributeFilter: ['class'] });

await renderSidebar(sidebar);
start();
