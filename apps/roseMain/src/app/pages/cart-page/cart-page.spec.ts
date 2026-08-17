import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { API_URL } from '@org/auth';
import { ProductsStore } from '@org/products';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartPage } from './cart-page';
import { CartService } from './services/cart.service';
import { signal } from '@angular/core';

const mockApiProduct = {
  id: 'p1',
  title: 'Rose',
  price: '100',
  discountValue: '0',
  rating: 4.5,
  ratings: 10,
  stock: 0,
  cover: '/img/rose.jpg',
  createdAt: new Date().toISOString(),
  _count: {},
};

describe('CartPage', () => {
  let component: CartPage;
  let fixture: ComponentFixture<CartPage>;
  let cartService: CartService;

  beforeEach(async () => {
    cartService = {
      getCart: vi.fn().mockReturnValue(of({ cartItems: [] })),
      getCoupons: vi.fn().mockReturnValue(of({ data: [] })),
      addToCart: vi.fn().mockReturnValue(of({})),
      clearCart: vi.fn().mockReturnValue(of({ status: true, code: 200 })),
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      refreshCount: vi.fn(),
      itemCount: signal(0),
    } as unknown as CartService;

    const productsStore = {
      bestProducts: signal([mockApiProduct]),
      isBestLoading: signal(false),
      loadBestProducts: vi.fn(),
    } as unknown as ProductsStore;

    await TestBed.configureTestingModule({
      imports: [CartPage],
      providers: [
        provideTranslateService(),
        MessageService,
        { provide: API_URL, useValue: 'https://rose-app.elevate-bootcamp.cloud/api/' },
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: CartService, useValue: cartService },
        { provide: ProductsStore, useValue: productsStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should map recommended products with isOutOfStock when stock is zero', () => {
    const recommended = component.recommended();
    expect(recommended.length).toBe(1);
    expect(recommended[0].isOutOfStock).toBe(true);
  });

  it('should not set page error when addToCart fails for a recommended product', () => {
    cartService.addToCart = vi.fn().mockReturnValue(throwError(() => new Error('insufficient stock')));
    component.error.set(null);
    component.onAddRecommended(component.recommended()[0]);
    expect(cartService.addToCart).toHaveBeenCalled();
    expect(component.error()).toBeNull();
  });

  it('should reset page error after clearCart succeeds', () => {
    component.error.set('Failed to add product to cart. Please sign in and try again.');
    component.items.set([{ id: 'ci1', product: {} as any, quantity: 1 }]);
    component.clearCart();
    expect(component.error()).toBeNull();
    expect(component.items().length).toBe(0);
  });
});
