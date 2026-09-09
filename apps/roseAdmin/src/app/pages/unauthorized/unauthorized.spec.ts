import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Unauthorized } from './unauthorized';
import { provideTranslateService, TranslatePipe } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('Unauthorized', () => {
  let component: Unauthorized;
  let fixture: ComponentFixture<Unauthorized>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Unauthorized],
      providers: [provideRouter([]) , provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(Unauthorized);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render title element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement).toBeTruthy();
  });

  it('should contain routerLink for redirection', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const linkElement = compiled.querySelector('a');
    expect(linkElement).toBeTruthy();
  });
});
