import { registerRemotes } from '@module-federation/enhanced/runtime';
import { environment } from './environments/environment';

const savedTheme = localStorage.getItem('rose-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
  document.documentElement.classList.add('dark');
}

let ready: Promise<unknown> = Promise.resolve();

if (environment.remoteMode) {
  ready = fetch('/module-federation.manifest.json')
    .then((res) => res.json())
    .then((remotes: Record<string, string>) =>
      Object.entries(remotes).map(([name, entry]) => ({ name, entry })),
    )
    .then((remotes) => registerRemotes(remotes));
}

ready.then(() => import('./bootstrap').catch((err) => console.error(err)));