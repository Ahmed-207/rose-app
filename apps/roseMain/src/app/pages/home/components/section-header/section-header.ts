import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  imports: [TitleCasePipe, UpperCasePipe],
  templateUrl: './section-header.html',
  styleUrl: './section-header.css',
})
export class SectionHeader {

  header = input.required<string>();
  quote = input.required<string>();

}
