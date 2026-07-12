import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WishlistPage } from './wishlistPage';

describe('WishlistPage', () => {
  let component: WishlistPage;
  let fixture: ComponentFixture<WishlistPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistPage],
    }).compileComponents();

    fixture = TestBed.createComponent(WishlistPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
