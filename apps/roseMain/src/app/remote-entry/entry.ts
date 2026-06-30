import { Component } from '@angular/core';
import { MainLayout } from "../core/layout/Main layout/mainLayout";
import { HomePage } from '../features/home/pages/homePage';

@Component({
  imports: [ HomePage],
  selector: 'app-rose-main-entry',
  template: `<app-home-page></app-home-page>`,
})
export class RemoteEntry {}
