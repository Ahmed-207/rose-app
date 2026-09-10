import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  imports: [CommonModule , TranslatePipe ],
  templateUrl: './notFound.html',
  styleUrl: './notFound.css',
})
export class NotFound {}
