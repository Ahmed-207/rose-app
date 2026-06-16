import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-auth-card',
  imports: [ TranslatePipe],
  templateUrl: './auth-card.component.html',
  styleUrl: './auth-card.component.scss',
  // //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCardComponent {
  readonly translationKey = input.required<string>();
  readonly alternateRoute = input.required<string>();
}
