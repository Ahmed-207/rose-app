import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { UiLangSwitcher } from "@org/ui-lang-switcher";
import { ThemeToggler } from "@org/shared-theme";
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, UiLangSwitcher, ThemeToggler, ToastModule],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {

}
