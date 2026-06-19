import { CommonModule } from '@angular/common';
import { Component ,inject} from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import  { LangService, UiLangSwitcher } from '@org/ui-lang-switcher';
 


@Component({
  selector: 'app-navbar',
  imports: [CommonModule, TranslatePipe, UiLangSwitcher],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router);


  goToLogin():void{
    this.router.navigateByUrl('/auth/login');
  }


}
