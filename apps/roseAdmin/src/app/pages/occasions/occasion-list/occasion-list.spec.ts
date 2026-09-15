import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OccasionListComponent } from './occasion-list';
import { OccasionsService } from '../service/occasions.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';

@Pipe({ name: 'translate', standalone: true })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('OccasionListComponent', () => {
  let component: OccasionListComponent;
  let fixture: ComponentFixture<OccasionListComponent>;
  let occasionsServiceSpy: { getOccasionList: any; delete: any };
  let toastrSpy: { success: any; error: any };
  let routerSpy: { navigate: any };
  let translateServiceSpy: { instant: any; get: any };

  beforeEach(async () => {
    occasionsServiceSpy = {
      getOccasionList: vi.fn().mockReturnValue(
        of({ payload: { data: [{ id: '1', title: 'Party' }], metadata: { total: 1 } } })
      ),
      delete: vi.fn(),
    };
    toastrSpy = { success: vi.fn(), error: vi.fn() };
    routerSpy = { navigate: vi.fn() };
    translateServiceSpy = {
      instant: vi.fn((key) => key),
      get: vi.fn((key) => of(key)),
    };

    await TestBed.configureTestingModule({
      imports: [OccasionListComponent, MockTranslatePipe],
      providers: [
        { provide: OccasionsService, useValue: occasionsServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({ page: '1', limit: '10', search: '' }) },
        },
      ],
    })
    .overrideComponent(OccasionListComponent, {
      remove: { imports: [TranslatePipe] },
      add: { imports: [MockTranslatePipe] },
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccasionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load occasions on init', () => {
    expect(component).toBeTruthy();
    expect(occasionsServiceSpy.getOccasionList).toHaveBeenCalledWith(1, 10, '');
    expect(component.occasions.length).toBe(1);
    expect(component.totalRecords).toBe(1);
  });

  it('should navigate to add page on onAddOccasion', () => {
    component.onAddOccasion();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/occasions/add']);
  });

  it('should navigate to edit page on onEdit', () => {
    const mockRow = { id: '123', title: 'Test' } as any;
    component.onEdit(mockRow);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/occasions', '123', 'edit']);
  });

  it('should delete occasion on confirm and show success toastr', () => {
    occasionsServiceSpy.delete.mockReturnValue(of({ message: 'Deleted' }));

    component.onDelete({ id: '123' } as any);
    component.onConfirmDelete();

    expect(occasionsServiceSpy.delete).toHaveBeenCalledWith('123');
    expect(toastrSpy.success).toHaveBeenCalledWith('Occasion deleted successfully.');
  });

  it('should show error toastr if delete fails', () => {
    occasionsServiceSpy.delete.mockReturnValue(throwError(() => new Error('Error')));

    component.onDelete({ id: '123' } as any);
    component.onConfirmDelete();

    expect(toastrSpy.error).toHaveBeenCalledWith('Could not delete occasion.');
  });
});
