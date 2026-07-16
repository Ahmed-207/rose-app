import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { UiLangSwitcher } from '@org/ui-lang-switcher';
import { ThemeToggler } from "@org/shared-theme";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { WishlistService } from '@org/products';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
    providers: [MessageService],
    selector: 'app-secondry-navbar',
    imports: [MenuModule, ButtonModule, CommonModule, TranslatePipe, UiLangSwitcher, ThemeToggler, RouterLink, RouterLinkActive],
    templateUrl: './secondryNavbar.html',
    styleUrl: './secondryNavbar.css',
})
export class SecondryNavbar implements OnInit {
    userName = input<string | undefined>('')
    private messageService = inject(MessageService);
    items: MenuItem[] | undefined;

  public readonly wishlistService = inject(WishlistService);
  private destroyRef = inject(DestroyRef);



    ngOnInit() {
        this.items = [
            {
                label: 'Documents',
                items: [
                    { label: 'Account', icon: 'pi pi-user' },
                    { label: 'Adress', icon: 'pi pi-plus' },
                    { label: 'Orders', icon: 'pi pi-cart-shopping' },
                    { label: 'Dashboard', icon: 'pi pi-cog' },
                    { label: 'Logout', icon: 'pi pi-sign-out' }
                ]
            }
        ];
    }

    isMobileMenuOpen = signal(false);

    toggleMobileMenu(): void {
        this.isMobileMenuOpen.update(v => !v);
    }

    closeMobileMenu(): void {
        this.isMobileMenuOpen.set(false);
    }


    getLoggedUserWishlist(){
      this.wishlistService.getLoggedUserWishlist()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe( res =>{
        console.log('WishlistPage Response:', res)
       
        
    })
  }
}