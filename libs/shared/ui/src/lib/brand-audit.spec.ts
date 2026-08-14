import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Brand color audit', () => {
  const files = [
    'card/card.css',
    'spinner/spinner.css',
    'label/label.css',
    'button/button.css',
    'message/message.css',
  ];
  const forbiddenColors = ['#534AB7', '#CECBF6', '#EEEDFE', '#3C3489'];

  it('should not contain off-brand purple hex colors in shared CSS files', () => {
    for (const file of files) {
      const content = readFileSync(
        resolve(__dirname, file),
        'utf-8'
      ).toLowerCase();

      for (const color of forbiddenColors) {
        expect(content).not.toContain(color.toLowerCase());
      }
    }
  });
});
