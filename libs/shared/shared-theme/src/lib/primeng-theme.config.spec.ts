import { describe, expect, it } from 'vitest';
import { RoseAura } from './primeng-theme.config';

describe('RoseAura', () => {
  it('uses the brand maroon palette as semantic primary', () => {
    expect(RoseAura.semantic.primary['500']).toBe('#cd2e33');
    expect(RoseAura.semantic.primary['800']).toBe('#501419');
    expect(Object.values(RoseAura.semantic.primary)).not.toContain('#10b981');
  });

  it('keeps the Aura light scheme primary intact', () => {
    expect(RoseAura.semantic.colorScheme.light.primary.color).toBe('{primary.500}');
    expect(RoseAura.semantic.colorScheme.light.primary.contrastColor).toBe('#ffffff');
  });

  it('overrides the dark scheme primary with the soft-pink palette', () => {
    expect(RoseAura.semantic.colorScheme.dark.primary.color).toBe('{softPink.300}');
    expect(RoseAura.semantic.colorScheme.dark.primary.hoverColor).toBe('{softPink.200}');
    expect(RoseAura.semantic.colorScheme.dark.primary.contrastColor).toBe('{surface.900}');
  });
});
