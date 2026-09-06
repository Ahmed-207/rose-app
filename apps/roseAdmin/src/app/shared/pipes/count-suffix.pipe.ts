import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'countSuffix',
    standalone: true,
})
export class CountSuffixPipe implements PipeTransform {
    transform(value: number | null | undefined, singular: string, plural?: string): string {
        const count = value ?? 0;
        const suffix = count === 1 ? singular : (plural ?? `${singular}s`);
        return `${count} ${suffix}`;
    }
}
