import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'feature-service-section',
  imports: [TranslatePipe],
  templateUrl: './featureServiceSection.html',
  styleUrl: './featureServiceSection.css',
})
export class FeatureServiceSection {}
