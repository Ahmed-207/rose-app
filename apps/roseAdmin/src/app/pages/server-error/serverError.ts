import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-server-error',
  imports: [CommonModule , TranslatePipe],
  templateUrl: './serverError.html',
  styleUrl: './serverError.css',
})
export class ServerError {}
