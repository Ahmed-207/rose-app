import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { UiLangSwitcher } from "@org/ui-lang-switcher";


@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, UiLangSwitcher],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {

}

