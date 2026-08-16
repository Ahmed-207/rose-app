import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { Testmonials } from './testmonials';

describe('Testmonials', () => {
  let component: Testmonials;
  let fixture: ComponentFixture<Testmonials>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Testmonials],
      providers: [provideTranslateService(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Testmonials);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
