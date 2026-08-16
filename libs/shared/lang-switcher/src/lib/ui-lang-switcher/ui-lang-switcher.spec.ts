import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { UiLangSwitcher } from './ui-lang-switcher';

describe('UiLangSwitcher', () => {
  let component: UiLangSwitcher;
  let fixture: ComponentFixture<UiLangSwitcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiLangSwitcher],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(UiLangSwitcher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
