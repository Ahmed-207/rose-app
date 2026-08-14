import { definePreset } from '@primeuix/themes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const MAROON_PALETTE = {
    50: '#fbeaea', 100: '#f3c5c7', 200: '#ea9fa2', 300: '#e07a7d', 400: '#d75458',
    500: '#cd2e33', 600: '#a6252a', 700: '#741c21', 800: '#501419', 900: '#2c0c10', 950: '#20090c',
};
export const SOFT_PINK_PALETTE = {
    50: '#fff1f5', 100: '#ffe0e7', 200: '#ffc2d0', 300: '#ffa3b9', 400: '#ff85a2',
};

export const RoseAura = definePreset(Aura, {
    primitive: { maroon: MAROON_PALETTE, softPink: SOFT_PINK_PALETTE },
    semantic: {
        primary: MAROON_PALETTE,
        colorScheme: {
            dark: {
                primary: {
                    color: '{softPink.300}',
                    hoverColor: '{softPink.200}',
                    activeColor: '{softPink.400}',
                },
            },
        },
    },
});

export function providePrimeNGTheme() {
    return providePrimeNG({
        theme: { preset: RoseAura, options: { darkModeSelector: '.dark' } },
    });
}
