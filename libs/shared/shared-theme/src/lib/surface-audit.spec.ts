import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(here, '../../../../..');

const cssFiles = {
  label: resolve(workspaceRoot, 'libs/shared/ui/src/lib/label/label.css'),
  message: resolve(workspaceRoot, 'libs/shared/ui/src/lib/message/message.css'),
  spinner: resolve(workspaceRoot, 'libs/shared/ui/src/lib/spinner/spinner.css'),
  libButton: resolve(workspaceRoot, 'libs/shared/ui/src/lib/button/button.css'),
  appButton: resolve(workspaceRoot, 'apps/shared/components/button/button.css'),
};

const chipHexLiterals = [
  '#E6F1FB',
  '#0C447C',
  '#EAF3DE',
  '#27500A',
  '#FAEEDA',
  '#633806',
  '#FCEBEB',
  '#791F1F',
  '#E24B4A',
  '#F7C1C1',
  '#3B6D11',
  '#C0DD97',
];

describe('surface-audit', () => {
  for (const [name, path] of Object.entries(cssFiles)) {
    it(`does not contain hardcoded semantic chip/spinner hex literals in ${name}`, () => {
      const css = readFileSync(path, 'utf-8');
      for (const hex of chipHexLiterals) {
        expect(css).not.toContain(hex);
      }
    });
  }

  it('does not contain hardcoded danger hex in button .btn-danger variants', () => {
    for (const path of [cssFiles.libButton, cssFiles.appButton]) {
      const css = readFileSync(path, 'utf-8');
      expect(css).not.toContain('#a6252a');
    }
  });
});
