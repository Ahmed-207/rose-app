import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListRowItem } from '../../models/dashboard.models';

@Component({
  selector: 'app-list-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-panel.component.html',
  styleUrl: './list-panel.component.scss'
})
export class ListPanelComponent {

  @Input({ required: true }) title!: string;
  @Input({ required: true }) items: ListRowItem[] = [];
  @Input() showImage = false;
  @Input() defaultIcon = 'pi pi-tag';
  @Input() maxHeight = 268;

  toneClass(item: ListRowItem): string {
    return 'list-row__value--' + (item.valueTone ?? 'neutral');
  }
}
