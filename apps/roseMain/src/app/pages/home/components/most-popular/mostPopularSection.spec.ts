import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { API_URL } from '@org/auth';
import { MostPopularSection } from './mostPopularSection';

describe('MostPopularSection', () => {
  let component: MostPopularSection;
  let fixture: ComponentFixture<MostPopularSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostPopularSection],
      providers: [
        provideTranslateService(),
        MessageService,
        { provide: API_URL, useValue: 'https://rose-app.elevate-bootcamp.cloud/api/' },
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MostPopularSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
