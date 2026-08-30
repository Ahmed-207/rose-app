
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Navbar } from './navbar';

describe('NavbarComponent', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(component.isUserMenuOpen).toBeTruthy();
  });
});