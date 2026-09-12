import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddEditOccasionsComponent } from './add-edit-occasions';
import { OccasionsService } from '../service/occasions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('AddEditOccasionsComponent', () => {
  let component: AddEditOccasionsComponent;
  let fixture: ComponentFixture<AddEditOccasionsComponent>;
  let occasionsServiceMock: {
    getById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let toastrMock: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    occasionsServiceMock = {
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    routerMock = { navigate: vi.fn() };
    toastrMock = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AddEditOccasionsComponent],
      providers: [
        provideTranslateService(),
        { provide: OccasionsService, useValue: occasionsServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ToastrService, useValue: toastrMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditOccasionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in Add mode', () => {
    expect(component).toBeTruthy();
    expect(component.title).toBe('Add New Occasion');
    expect(component.fields.length).toBe(3);
  });

  it('should submit new occasion payload successfully', () => {
    const mockOccasion = { id: '1', title: 'Test', description: 'Desc', image: '', immutable: false, createdAt: '', updatedAt: '' };
    occasionsServiceMock.create.mockReturnValue(of(mockOccasion));

    component.submit({ title: 'Test', description: 'Desc' });

    expect(occasionsServiceMock.create).toHaveBeenCalled();
    expect(toastrMock.success).toHaveBeenCalledWith('Occasion created successfully.');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/occasions']);
  });
});