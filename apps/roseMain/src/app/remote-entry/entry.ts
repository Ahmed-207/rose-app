import { Component } from '@angular/core';
import { HomePage } from '../pages/home/homePage';
@Component({
  imports: [ HomePage],
  selector: 'app-rose-main-entry',
  template: `<app-home-page></app-home-page>`,
})
export class RemoteEntry {}
