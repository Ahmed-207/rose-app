import { MainLayout } from '../core/layout/mainLayout/mainLayout';
import { Component } from '@angular/core';

@Component({
  imports: [MainLayout],
  selector: 'app-rose-admin-entry',
  template: `<app-main-layout></app-main-layout>`,
})
export class RemoteEntry {}
