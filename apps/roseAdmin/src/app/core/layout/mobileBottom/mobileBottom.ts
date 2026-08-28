import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mobile-bottom',
  imports: [ CommonModule , RouterModule],
  templateUrl: './mobileBottom.html',
  styleUrl: './mobileBottom.css',
})
export class MobileBottom {

  navItems = [
  { label: 'Overview', path: 'overview', icon: 'pi pi-th-large' },
  { label: 'Categories', path: 'categories', icon: 'pi pi-folder' },
  { label: 'Occasions', path: 'occasions', icon: 'pi pi-calendar' },
  { label: 'Products', path: 'products', icon: 'pi pi-box' } 
  ];

}
