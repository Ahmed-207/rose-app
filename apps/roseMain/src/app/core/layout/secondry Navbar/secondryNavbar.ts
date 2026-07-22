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
import { TranslatePipe } from '@ngx-translate/core';
import { UiLangSwitcher } from '@org/ui-lang-switcher';
import { ThemeToggler } from "@org/shared-theme";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { CartService } from '../../../pages/cart-page/services/cart.service';
import { WishlistService } from '@org/products';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { addressStore } from '@org/user-addresses';
import { MyAddressesModal } from "../../../pages/cart-page/components/addresses/components/my-addresses-modal/my-addresses-modal";


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
        LucideMapPinPen
    ],
    templateUrl: './secondryNavbar.html',
    styleUrl: './secondryNavbar.css',
})
export class SecondryNavbar implements OnInit {
    userName = input<string | undefined>('')
    private messageService = inject(MessageService);
    private readonly cartService = inject(CartService);
    readonly _addressStore = inject(addressStore);
    readonly cartCount = this.cartService.itemCount;
    isAddressModalOpened: WritableSignal<boolean> = signal<boolean>(false);
    items: MenuItem[] | undefined;


    public readonly wishlistService = inject(WishlistService);
    private destroyRef = inject(DestroyRef);



    ngOnInit() {
        this.cartService.refreshCount();

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