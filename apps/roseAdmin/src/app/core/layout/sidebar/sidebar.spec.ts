
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have user menu closed initially', () => {
    expect(component.isUserMenuOpen).toBeFalsy();
  });

  it('should toggle user menu state when toggleUserMenu is called', () => {
    component.toggleUserMenu();
    expect(component.isUserMenuOpen).toBeTruthy();

    component.toggleUserMenu();
    expect(component.isUserMenuOpen).toBeFalsy();
  });
});