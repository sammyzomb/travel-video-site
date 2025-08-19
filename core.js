// core.js：共用 UI（漢堡選單 / 主題切換）
document.addEventListener('DOMContentLoaded', () => {
  // === 漢堡選單 ===
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const sideMenu = document.getElementById('side-menu');
  const menuOverlay = document.getElementById('menu-overlay');
  const body = document.body;

  function toggleMenu() {
    sideMenu?.classList.toggle('active');
    menuOverlay?.classList.toggle('active');
    body.classList.toggle('menu-open');
  }
  hamburgerBtn?.addEventListener('click', toggleMenu);
  menuOverlay?.addEventListener('click', toggleMenu);

  // === 主題切換 ===
  const themeSwitcher = document.getElementById('theme-switcher');
  const themeIconSun = document.getElementById('theme-icon-sun');
  const themeIconMoon = document.getElementById('theme-icon-moon');

  function updateThemeIcon(theme) {
    if (!themeIconSun || !themeIconMoon) return;
    if (theme === 'dark-theme') {
      themeIconSun.style.display = 'none';
      themeIconMoon.style.display = 'inline-block';
    } else {
      themeIconSun.style.display = 'inline-block';
      themeIconMoon.style.display = 'none';
    }
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) document.body.classList.add(savedTheme);
  else {
    const h = new Date().getHours();
    if (h >= 18 || h < 6) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark-theme');
    }
  }
  updateThemeIcon(document.body.classList.contains('dark-theme') ? 'dark-theme' : '');

  themeSwitcher?.addEventListener('click', e => {
    e.preventDefault();
    document.body.classList.toggle('dark-theme');
    const cur = document.body.classList.contains('dark-theme') ? 'dark-theme' : '';
    localStorage.setItem('theme', cur);
    updateThemeIcon(cur);
  });
});
