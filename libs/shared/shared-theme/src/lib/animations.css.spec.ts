import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const cssPath = resolve(dirname(fileURLToPath(import.meta.url)), 'animations.css');
const css = readFileSync(cssPath, 'utf-8');

describe('animations.css', () => {
  it('declares fade-in, slide-up and stagger animations', () => {
    expect(css).toContain('.animate-fade-in');
    expect(css).toContain('.animate-slide-up');
    expect(css).toContain('.animate-stagger');
    expect(css).toContain('@keyframes fade-in');
    expect(css).toContain('@keyframes slide-up');
  });
});
