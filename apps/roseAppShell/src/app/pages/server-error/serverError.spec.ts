import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServerError } from './serverError';
import { provideTranslateService, TranslatePipe } from '@ngx-translate/core';

describe('ServerError', () => {
  let component: ServerError;
  let fixture: ComponentFixture<ServerError>;

 beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerError],
      providers:[ provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(ServerError);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render server error image', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const imgElement = compiled.querySelector('img');
    expect(imgElement).toBeTruthy();
    expect(imgElement?.getAttribute('alt')).toBe('server error');
  });

  it('should render error description paragraph', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const paragraphElement = compiled.querySelector('p');
    expect(paragraphElement).toBeTruthy();
  });
});
