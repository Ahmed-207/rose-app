import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddEditOccasionsComponent } from './add-edit-occasions';
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

describe('AddEditOccasionsComponent', () => {
  let component: AddEditOccasionsComponent;
  let fixture: ComponentFixture<AddEditOccasionsComponent>;
  let occasionsServiceSpy: { getById: any; create: any; update: any; uploadImage: any };
  let toastrSpy: { success: any; error: any };
  let routerSpy: { navigate: any };
  let translateServiceSpy: { instant: any; get: any };

  beforeEach(async () => {
    occasionsServiceSpy = {
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      uploadImage: vi.fn(),
    };
    toastrSpy = { success: vi.fn(), error: vi.fn() };
    routerSpy = { navigate: vi.fn() };
    translateServiceSpy = {
      instant: vi.fn((key) => key),
      get: vi.fn((key) => of(key)),
    };

    await TestBed.configureTestingModule({
      imports: [AddEditOccasionsComponent, MockTranslatePipe],
      providers: [
        { provide: OccasionsService, useValue: occasionsServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null } },
          },
        },
      ],
    })
    .overrideComponent(AddEditOccasionsComponent, {
      remove: { imports: [TranslatePipe] },
      add: { imports: [MockTranslatePipe] },
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditOccasionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize in create mode', () => {
    expect(component).toBeTruthy();
    expect(component.title).toBe('Add New Occasion');
    expect(component.occasionId).toBeNull();
  });

  it('should upload image first then create occasion when selectedImage is a File', () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    const mockPayload = { title: 'Birthday', description: 'Party', image: mockFile };

    occasionsServiceSpy.uploadImage.mockReturnValue(of({ url: 'http://img.png' }));
    occasionsServiceSpy.create.mockReturnValue(of({ id: '1' } as any));

    component.submit(mockPayload);

    expect(occasionsServiceSpy.uploadImage).toHaveBeenCalledWith(mockFile);
    expect(occasionsServiceSpy.create).toHaveBeenCalledWith({
      title: 'Birthday',
      description: 'Party',
      image: 'http://img.png',
    });
    expect(toastrSpy.success).toHaveBeenCalledWith('Occasion created successfully.');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/occasions']);
  });

  it('should handle error when submit fails', () => {
    const mockPayload = { title: 'Birthday', description: 'Party' };
    occasionsServiceSpy.create.mockReturnValue(throwError(() => new Error('Failed')));

    component.submit(mockPayload);

    expect(component.isSubmitting).toBeFalsy();
    expect(component.errorMessage).toBeTruthy();
  });
});