import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { Login } from "../../../pages/login/login";
import { UiLangSwitcher } from "@org/ui-lang-switcher";


@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, Login, UiLangSwitcher],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {
  
}
