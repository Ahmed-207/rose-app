

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { MainLayout } from './mainLayout';
import { configureTestingModuleWithTranslate } from '../../../shared/testing/translate-test.providers';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;

  beforeEach(async () => {
    await configureTestingModuleWithTranslate({
      imports: [MainLayout],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render language and theme switchers in the mobile drawer', () => {
    component.isMobileMenuOpen.set(true);
    fixture.detectChanges();

    const drawer = fixture.nativeElement.querySelector('.fixed.inset-0.z-50');
    expect(drawer).toBeTruthy();
    expect(drawer.querySelector('lib-ui-lang-switcher')).toBeTruthy();
    expect(drawer.querySelector('lib-theme-toggler')).toBeTruthy();
  });
});