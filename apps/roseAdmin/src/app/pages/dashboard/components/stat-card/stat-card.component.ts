import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardData } from '../../models/dashboard.models';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  @Input({ required: true }) data!: StatCardData;
}
