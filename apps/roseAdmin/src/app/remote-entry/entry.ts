import { Component } from '@angular/core';
import { MainLayout } from '../core/layout/mainLayout/mainLayout';

@Component({
  imports: [MainLayout],
  selector: 'app-rose-admin-entry',
  template: `<app-main-layout></app-main-layout>`,
})
export class RemoteEntry {}
