import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export function providePrimeNGTheme() {
    return providePrimeNG({
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: '.dark'
            }
        }
    });
}