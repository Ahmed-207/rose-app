import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-about-us',
  imports: [TranslatePipe],
  templateUrl: './aboutUs.html',
  styleUrl: './aboutUs.css',
})
export class AboutUs {}
