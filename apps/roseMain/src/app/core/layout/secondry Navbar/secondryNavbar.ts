// import { Component } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem, MessageService } from 'primeng/api';

import { CommonModule } from '@angular/common';
import { Component ,inject, OnInit} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Translate } from '../../services/Translate/translate';
@Component({
  template: `
        <div class="text-right">
                    <p class="text-xs text-gray-400 dark:text-gray-500 leading-tight">Hello</p>
                    <p class="text-sm font-bold leading-tight flex items-center gap-1">
                        user
                        <i class="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
                    </p>
                </div>
    `,
     providers: [MessageService],
  selector: 'app-secondry-navbar',
  imports: [MenuModule,ButtonModule , CommonModule, TranslatePipe],
  templateUrl: './secondryNavbar.html',
  styleUrl: './secondryNavbar.css',
})
export class SecondryNavbar implements OnInit {
  mytranclateService:Translate =inject(Translate);
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

// export class SecondryNavbar  {
//   mytranclateService:Translate =inject(Translate);
  
// }
