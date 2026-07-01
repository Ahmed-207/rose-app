import { Component, inject, OnInit } from '@angular/core';
import { SectionHeader } from "../section-header/section-header";
import { TestmonialCard } from "./components/testmonial-card/testmonial-card";
import { TestmonialStore } from './store/testmonial-store';
import { Spinner, Message } from "@org/shared-ui-components";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-testmonials',
  imports: [SectionHeader, TestmonialCard, Spinner, Message, TranslatePipe],
  templateUrl: './testmonials.html',
  styleUrl: './testmonials.css',
})
export class Testmonials implements OnInit {

  readonly _tStore = inject(TestmonialStore);


  ngOnInit(): void {
    this._tStore.loadTestmonials()
  }


}
