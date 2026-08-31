import { Component } from '@angular/core';
import { LucideBellOff } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-notification-empty-state',
  imports: [LucideBellOff, TranslatePipe],
  templateUrl: './notification-empty-state.html',
  styleUrl: './notification-empty-state.css',
})
export class NotificationEmptyState {}
