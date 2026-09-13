#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'dist', 'demo');

const APPS = {
  roseAppShell: { deployUrl: '/', subPath: null },
  roseMain: { deployUrl: '/roseMain/', subPath: 'roseMain' },
  roseAuth: { deployUrl: '/roseAuth/', subPath: 'roseAuth' },
  roseAdmin: { deployUrl: '/roseAdmin/', subPath: 'roseAdmin' },
};

const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || 'rose-app-demo.vercel.app';
const environment = {
  production: true,
  shellUrl: process.env.SHELL_URL || `https://${productionUrl}`,
  apiUrl: process.env.API_URL || 'https://rose-app.elevate-bootcamp.cloud/api/',
  mapApiKey: process.env.MAPS_API_KEY || '',
};

const envFileContent = `export const environment = {
  production: true,
  shellUrl: '${environment.shellUrl}',
  apiUrl: '${environment.apiUrl}',
  mapApiKey: '${environment.mapApiKey}'
};`;

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd: root, stdio: 'inherit' });
}

console.log('=== Rocket Rose App: prepare Vercel bundle ===');
console.log('Environment:', environment);

for (const app of Object.keys(APPS)) {
  const sourceEnv = join(root, 'apps', app, 'src', 'environments', 'environment.ts');
  if (!existsSync(sourceEnv)) {
    throw new Error(`Missing environment file: ${sourceEnv}`);
  }
  writeFileSync(sourceEnv, envFileContent);
  console.log(`* overrode ${sourceEnv}`);
}

for (const [app, { deployUrl }] of Object.entries(APPS)) {
  const args = ['--configuration=production'];
  if (deployUrl !== '/') {
    args.push(`--deployUrl=${deployUrl}`);
  }
  run(`npx nx run ${app}:build ${args.join(' ')}`);
}

console.log('=== Merging built apps into dist/demo ===');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const [app, { subPath }] of Object.entries(APPS)) {
  const source = join(root, 'dist', 'apps', app);
  const target = subPath ? join(outDir, subPath) : outDir;
  if (!existsSync(source)) {
    throw new Error(`Build output missing: ${source}`);
  }
  cpSync(source, target, { recursive: true });
  console.log(`* ${app} -> ${target}`);
}

const manifest = {
  roseMain: '/roseMain/mf-manifest.json',
  roseAuth: '/roseAuth/mf-manifest.json',
  roseAdmin: '/roseAdmin/mf-manifest.json',
};
const manifestPath = join(outDir, 'module-federation.manifest.json');
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`* wrote ${manifestPath}`);

for (const sub of ['roseMain', 'roseAuth', 'roseAdmin']) {
  const dir = join(outDir, sub);
  const mfManifest = join(dir, 'mf-manifest.json');
  const remoteEntry = ['remoteEntry.mjs', 'remoteEntry.js']
    .map((f) => join(dir, f))
    .find((f) => existsSync(f));
  if (!existsSync(mfManifest) || !remoteEntry) {
    throw new Error(`Verification failed in ${dir}: missing mf-manifest.json or remoteEntry file`);
  }
  console.log(`* verified ${sub}: remoteEntry = ${remoteEntry}`);
}

if (!existsSync(join(outDir, 'index.html'))) {
  throw new Error('Verification failed: dist/demo/index.html not found');
}

console.log('=== Done. dist/demo ready for Vercel. ===');