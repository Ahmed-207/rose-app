import { Component } from '@angular/core';
import { LucideMapPinPlus } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'empty-page',
  imports: [LucideMapPinPlus, TranslatePipe],
  templateUrl: './empty-page.html',
  styleUrl: './empty-page.css',
})
export class EmptyPage { }
