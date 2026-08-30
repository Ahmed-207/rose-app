import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-mobile-bottom',
  imports: [ CommonModule , RouterModule , TranslatePipe],
  templateUrl: './mobileBottom.html',
  styleUrl: './mobileBottom.css',
})
export class MobileBottom {

  navItems = [
  { label: 'ADMIN.NAVIGATION.OVERVIEW' , path: 'overview', icon: 'pi pi-th' },
  { label: 'ADMIN.NAVIGATION.CATEGORIES' , path: 'categories', icon: 'pi pi-folder' },
  { label: 'ADMIN.NAVIGATION.OCCASIONS' , path: 'occasions', icon: 'pi pi-calendar' },
  { label: 'ADMIN.NAVIGATION.PRODUCTS' , path: 'products', icon: 'pi pi-box' } 
  ];

}
