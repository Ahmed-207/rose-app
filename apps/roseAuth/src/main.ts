const savedTheme = localStorage.getItem('rose-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
  document.documentElement.classList.add('dark');
}

import('./bootstrap').catch((err) => console.error(err));
