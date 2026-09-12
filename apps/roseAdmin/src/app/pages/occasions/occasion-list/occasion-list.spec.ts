import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OccasionListComponent } from './occasion-list';
import { OccasionsService } from '../service/occasions.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { OccasionListResponse } from '../models/occasion.models';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('OccasionListComponent', () => {
  let component: OccasionListComponent;
  let fixture: ComponentFixture<OccasionListComponent>;
  let occasionsServiceMock: {
    getOccasionList: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let toastrMock: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const mockListResponse: OccasionListResponse = {
    status: true,
    code: 200,
    payload: {
      data: [
        {
          id: '1',
          title: 'Wedding',
          description: 'Wedding gifts',
          image: 'img.png',
          immutable: false,
          createdAt: '',
          updatedAt: '',
        },
      ],
      metadata: { page: 1, limit: 20, total: 1, totalPages: 1 },
    },
  };

  beforeEach(async () => {
    occasionsServiceMock = {
      getOccasionList: vi.fn().mockReturnValue(of(mockListResponse)),
      delete: vi.fn(),
    };
    routerMock = { navigate: vi.fn() };
    toastrMock = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [OccasionListComponent],
      providers: [
        provideTranslateService(),
        { provide: OccasionsService, useValue: occasionsServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ToastrService, useValue: toastrMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OccasionListComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load occasions on init', () => {
    fixture.detectChanges();

    expect(component.occasions.length).toBe(1);
    expect(component.totalRecords).toBe(1);
    expect(component.isLoading).toBe(false);
  });

  it('should navigate to edit page on onEdit', () => {
    const row = mockListResponse.payload.data[0];
    component.onEdit(row);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/occasions/edit', '1']);
  });

  it('should delete occasion when confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    occasionsServiceMock.delete.mockReturnValue(of({ status: true, code: 200, message: '' }));

    component.onDelete(mockListResponse.payload.data[0]);

    expect(occasionsServiceMock.delete).toHaveBeenCalledWith('1');
    expect(toastrMock.success).toHaveBeenCalledWith('Occasion deleted successfully.');
  });
});