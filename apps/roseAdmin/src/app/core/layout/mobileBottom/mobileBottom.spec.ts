

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MobileBottom } from './mobileBottom';
import { provideTestTranslate } from '../../../shared/testing/translate-test.providers';

describe('MobileBottom', () => {
  let component: MobileBottom;
  let fixture: ComponentFixture<MobileBottom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileBottom],
      providers: [provideTestTranslate(), provideRouter([])] 
    }).compileComponents();

    fixture = TestBed.createComponent(MobileBottom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});