import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'ratingBadge',
    standalone: true,
})
export class RatingBadgePipe implements PipeTransform {
    transform(rating: number | null | undefined, count?: number | null): string {
        const value = rating ?? 0;
        const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1);

        if (count != null) {
            return `${formatted}/5 (${count})`;
        }

        return `${formatted}/5`;
    }
}
