
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { Navbar } from './navbar';
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

describe('NavbarComponent', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await configureTestingModuleWithTranslate({
      imports: [Navbar],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the navbar component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle mobile user dropdown menu', () => {
    expect(component.isUserMenuOpen).toBeFalsy();

    const mobileButtons = fixture.nativeElement.querySelectorAll('.md\\:hidden button');
    const userMenuButton = mobileButtons[0];
    userMenuButton.click();

    expect(component.isUserMenuOpen).toBeTruthy();
  });

  it('should render desktop language and theme switchers', () => {
    const desktopControls = fixture.nativeElement.querySelector('.hidden.md\\:flex');
    expect(desktopControls).toBeTruthy();
    expect(desktopControls.querySelector('lib-ui-lang-switcher')).toBeTruthy();
    expect(desktopControls.querySelector('lib-theme-toggler')).toBeTruthy();
  });

  it('should place the user dropdown at the inline end', () => {
    const mobileButtons = fixture.nativeElement.querySelectorAll('.md\\:hidden button');
    const userMenuButton = mobileButtons[0];
    userMenuButton.click();
    fixture.detectChanges();

    const dropdown = fixture.nativeElement.querySelector('.absolute.end-0');
    expect(dropdown).toBeTruthy();
  });
});