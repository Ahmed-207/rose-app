import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardData } from '../../models/dashboard.models';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule,TranslatePipe],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  @Input({ required: true }) data!: StatCardData;
}
