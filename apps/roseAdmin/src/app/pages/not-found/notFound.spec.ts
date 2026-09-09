import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotFound } from './notFound';
import { provideTranslateService, TranslatePipe } from '@ngx-translate/core';

describe('NotFound', () => {
  let component: NotFound;
  let fixture: ComponentFixture<NotFound>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFound);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and subtitle elements for not found error', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('h1');
    const subtitleElement = compiled.querySelector('p');

    expect(titleElement).toBeTruthy();
    expect(subtitleElement).toBeTruthy();
  });

  it('should render 404 image element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const imgElement = compiled.querySelector('img');

    expect(imgElement).toBeTruthy();
    expect(imgElement?.getAttribute('alt')).toBe('Not Found');
  });
});
