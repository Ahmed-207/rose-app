import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { API_URL } from '@org/auth';
import { RelatedProductsSection } from './relateProductSection';

describe('RelatedProductsSection', () => {
  let component: RelatedProductsSection;
  let fixture: ComponentFixture<RelatedProductsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatedProductsSection],
      providers: [
        provideTranslateService(),
        MessageService,
        { provide: API_URL, useValue: 'https://rose-app.elevate-bootcamp.cloud/api/' },
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RelatedProductsSection);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentProductId', 'product-1');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
