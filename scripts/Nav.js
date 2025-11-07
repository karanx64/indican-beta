// Nav.js — safer toggling & a11y niceties
const header = document.querySelector('header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');

if (header && menuToggle && nav) {
  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('active');
    header.classList.remove('open');
  };

  const openMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.classList.add('active');
    header.classList.add('open');
  };

  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    expanded ? closeMenu() : openMenu();
  });

  // Close on nav link click (mobile)
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => closeMenu());
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Click outside to close (mobile)
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target) && header.classList.contains('open')) closeMenu();
  });
}
