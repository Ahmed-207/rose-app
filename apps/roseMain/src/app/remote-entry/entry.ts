import { Component } from '@angular/core';
import { MainLayout } from '../core/layout/Main layout/mainLayout';
@Component({
  imports: [MainLayout],
  selector: 'app-rose-main-entry',
  template: `<app-main-layout></app-main-layout>`,
})
export class RemoteEntry { }
