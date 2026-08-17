import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { patchState } from '@ngrx/signals';
import { API_URL } from '@org/auth';
import { ProductsStore } from '@org/products';
import { ProductsPageComponent } from './products-page';

describe('ProductsPageComponent', () => {
  let component: ProductsPageComponent;
  let fixture: ComponentFixture<ProductsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsPageComponent],
      providers: [
        provideTranslateService(),
        MessageService,
        { provide: API_URL, useValue: 'https://rose-app.elevate-bootcamp.cloud/api/' },
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render the spinner container while refetching after first load', () => {
    const store = TestBed.inject(ProductsStore);
    patchState(store, { isLoading: true, hasLoaded: true, error: null });
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('.spinner-container');
    const productsContainer = fixture.nativeElement.querySelector('.products-container');

    expect(spinner).toBeNull();
    expect(productsContainer).toBeTruthy();
  });
});
