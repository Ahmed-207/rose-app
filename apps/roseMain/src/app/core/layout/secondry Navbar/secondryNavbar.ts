import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input, OnInit, signal, WritableSignal } from '@angular/core';
import {
    LucideBell,
    LucideChevronDown,
    LucideMapPinPen,
    LucideShoppingCart,
} from '@lucide/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UiLangSwitcher } from '@org/ui-lang-switcher';
import { ThemeToggler } from "@org/shared-theme";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthActions } from '@org/auth';
import { CartService } from '../../../pages/cart-page/services/cart.service';
import { WishlistService } from '@org/products';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { addressStore } from '@org/user-addresses';
import { MyAddressesModal } from "../../../pages/cart-page/components/addresses/components/my-addresses-modal/my-addresses-modal";
import { SearchBar } from "../search-bar/search-bar";


@Component({
    providers: [MessageService],
    selector: 'app-secondry-navbar',
    imports: [
    MenuModule,
    ButtonModule,
    CommonModule,
    TranslatePipe,
    UiLangSwitcher,
    ThemeToggler,
    RouterLink,
    RouterLinkActive,
    LucideShoppingCart,
    LucideBell,
    LucideChevronDown,
    MyAddressesModal,
    LucideMapPinPen,
    SearchBar
],
    templateUrl: './secondryNavbar.html',
    styleUrl: './secondryNavbar.css',
})
export class SecondryNavbar implements OnInit {

    userName = input<string | undefined>('')
    private messageService = inject(MessageService);
    private readonly cartService = inject(CartService);
    private readonly router = inject(Router);
    private readonly authActions = inject(AuthActions);
    private readonly translate = inject(TranslateService);
    readonly _addressStore = inject(addressStore);
    readonly cartCount = this.cartService.itemCount;
    isAddressModalOpened: WritableSignal<boolean> = signal<boolean>(false);
    items: MenuItem[] | undefined;


    public readonly wishlistService = inject(WishlistService);
    private destroyRef = inject(DestroyRef);



    ngOnInit() {
        this.cartService.refreshCount();
        this.buildMenuItems();
        this.translate.onLangChange
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.buildMenuItems());
    }

    private buildMenuItems(): void {
        this.items = [
            {
                label: this.translate.instant('navbar.ACCOUNT_SECTION'),
                items: [
                    {
                        label: this.translate.instant('navbar.Account'),
                        icon: 'pi pi-user',
                        command: () => {
                            void this.router.navigateByUrl('/home/account/profile');
                        },
                    },
                    {
                        label: this.translate.instant('navbar.Address'),
                        icon: 'pi pi-plus',
                        command: () => this.openAddressModal(),
                    },
                    {
                        label: this.translate.instant('navbar.Orders'),
                        icon: 'pi pi-shopping-bag',
                        routerLink: ['/home/orders'],
                    },
                    {
                        label: this.translate.instant('navbar.Dashboard'),
                        icon: 'pi pi-cog',
                        routerLink: ['/admin'],

                    },
                    {
                        label: this.translate.instant('navbar.Logout'),
                        icon: 'pi pi-sign-out',
                        command: () => this.logout(),
                    },
                ]
            }
        ];
    }

    logout(): void {
        this.authActions.logout();
        this.closeMobileMenu();
        void this.router.navigateByUrl('/auth/login');
    }

    isMobileMenuOpen = signal(false);

    toggleMobileMenu(): void {
        this.isMobileMenuOpen.update(v => !v);
    }

    closeMobileMenu(): void {
        this.isMobileMenuOpen.set(false);
    }


    getLoggedUserWishlist() {
        this.wishlistService.getLoggedUserWishlist()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(res => {
                console.log('WishlistPage Response:', res)


            })
    }

    openAddressModal(): void {
        this.isAddressModalOpened.set(true);
    }

    closeAddressModal(newModalState: boolean): void {
        this.isAddressModalOpened.set(newModalState);
    }
}
