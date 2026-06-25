import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'section-header',
  imports: [CommonModule,TranslatePipe],
  templateUrl: './sectionHeader.html',
  styleUrl: './sectionHeader.css',
})
export class SectionHeader {
    @Input() subtitle = '';
  @Input() title = '';
  @Input() align: 'left' | 'center' | 'right' = 'center';
  @Input() showUnderline = true;
}
