import { renderSidebar } from './sidebar.js';
import { start } from './router.js';

const sidebar = document.getElementById('sidebar');
const ham = document.getElementById('ham');
ham?.addEventListener('click', () => sidebar.classList.toggle('open'));

await renderSidebar(sidebar);
start();
