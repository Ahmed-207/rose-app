import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { UiLangSwitcher } from '@org/ui-lang-switcher';
import { ThemeToggler } from "@org/shared-theme";

@Component({
    providers: [MessageService],
    selector: 'app-secondry-navbar',
    imports: [MenuModule, ButtonModule, CommonModule, TranslatePipe, UiLangSwitcher, ThemeToggler],
    templateUrl: './secondryNavbar.html',
    styleUrl: './secondryNavbar.css',
})
export class SecondryNavbar implements OnInit {
    userName = input<string | undefined>('')
    private messageService = inject(MessageService);
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'Documents',
                items: [
                    {
                        label: 'Account',
                        icon: 'pi pi-user'
                    },
                    {
                        label: 'Adress',
                        icon: 'pi pi-plus'
                    },
                    {
                        label: 'Orders',
                        icon: 'pi pi-cart-shopping'
                    },
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-cog'
                    },
                    {
                        label: 'Logout',
                        icon: 'pi pi-sign-out'
                    }
                ]
            }
        ];
    }
}

