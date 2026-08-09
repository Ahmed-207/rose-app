import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AccountSidebar } from './components/account-sidebar/accountSidebar';

@Component({
  selector: 'app-account-settings-page',
  imports: [RouterOutlet, TranslatePipe, AccountSidebar],
  templateUrl: './accountSettingsPage.html',
  styleUrl: './accountSettingsPage.css',
})
export class AccountSettingsPage {}
