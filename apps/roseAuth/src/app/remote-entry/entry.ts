import { Component } from '@angular/core';
import { AuthLayout } from "../core/layout/auth-layout/auth-layout";


@Component({
  imports: [AuthLayout],
  selector: 'app-rose-auth-entry',
  template: `<app-auth-layout></app-auth-layout>`,
})
export class RemoteEntry {}
