import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { EmptyPage } from './empty-page';

describe('EmptyPage', () => {
  let component: EmptyPage;
  let fixture: ComponentFixture<EmptyPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyPage],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
