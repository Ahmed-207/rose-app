import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { API_URL } from '@org/auth';
import { WishlistPage } from './wishlistPage';

describe('WishlistPage', () => {
  let component: WishlistPage;
  let fixture: ComponentFixture<WishlistPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistPage],
      providers: [
        provideTranslateService(),
        MessageService,
        { provide: API_URL, useValue: 'https://rose-app.elevate-bootcamp.cloud/api/' },
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WishlistPage);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', {
      id: 'p1',
      name: 'Rose Bouquet',
      image: 'https://example.com/rose.jpg',
      price: 25,
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
