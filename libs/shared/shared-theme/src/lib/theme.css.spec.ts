import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const cssPath = resolve(dirname(fileURLToPath(import.meta.url)), 'theme.css');
const css = readFileSync(cssPath, 'utf-8');

describe('theme.css', () => {
  it('declares brand primitives and font inside @theme', () => {
    expect(css).toContain('--color-maroon-500: #cd2e33');
    expect(css).toContain('--color-soft-pink-300: #ffa3b9');
    expect(css).toContain("--font-primary: 'Sarabun'");
  });

  it('declares light semantic tokens in :root', () => {
    expect(css).toContain(':root');
    expect(css).toContain('--primary: #501419');
  });

  it('declares dark semantic tokens in .dark', () => {
    expect(css).toContain('.dark');
    expect(css).toContain('--primary: #ffa3b9');
    expect(css).toContain('--bg-muted: #18181b');
  });

  it('maps legacy color variables', () => {
    expect(css).toContain('--color-text-primary: var(--text-inverse)');
    expect(css).toContain('--color-background-primary:');
  });
});
