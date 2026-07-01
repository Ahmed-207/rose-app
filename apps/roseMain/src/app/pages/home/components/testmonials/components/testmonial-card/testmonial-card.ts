import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-testmonial-card',
  imports: [],
  templateUrl: './testmonial-card.html',
  styleUrl: './testmonial-card.css',
})
export class TestmonialCard {

  tImage = input<string | null>();
  tRating = input<string | number>();
  tName = input<string>();
  tComment = input<string>();
  tCreatedAt = input.required<string>();
  formattedDate = computed(() => {
    const rawDate = this.tCreatedAt();
    if (!rawDate) return '';
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(rawDate, 'longDate');
  });

  protected readonly Number = Number;


  starsArray = computed(() => {
    const rating = Math.floor(Number(this.tRating() || 0));
    const safeRating = Math.max(0, Math.min(rating, 5));
    return Array(safeRating).fill(0);
  });

  emptyStarsArray = computed(() => {
    const rating = Math.floor(Number(this.tRating() || 0));
    const safeRating = Math.max(0, Math.min(rating, 5));
    return Array(5 - safeRating).fill(0);
  });

}
