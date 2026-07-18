import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteModal } from './delete-modal';

describe('DeleteModal', () => {
  let component: DeleteModal;
  let fixture: ComponentFixture<DeleteModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteModal],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
