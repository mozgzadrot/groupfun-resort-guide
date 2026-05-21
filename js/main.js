import { renderSidebar } from './sidebar.js';
import { start } from './router.js';

const sidebar = document.getElementById('sidebar');
const ham = document.getElementById('ham');
const backdrop = document.createElement('div');
backdrop.className = 'sidebar-backdrop';
document.body.appendChild(backdrop);

const closeSidebar = () => {
  sidebar.classList.remove('open');
  backdrop.classList.remove('show');
  document.body.classList.remove('no-scroll');
};
const openSidebar = () => {
  sidebar.classList.add('open');
  backdrop.classList.add('show');
  document.body.classList.add('no-scroll');
};
const toggleSidebar = () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
};

ham?.addEventListener('click', toggleSidebar);
backdrop.addEventListener('click', closeSidebar);

sidebar.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-link]');
  if (link && window.matchMedia('(max-width: 900px)').matches) closeSidebar();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) closeSidebar();
});

await renderSidebar(sidebar);
start();
