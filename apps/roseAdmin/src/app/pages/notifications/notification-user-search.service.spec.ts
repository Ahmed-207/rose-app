import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { API_URL } from '@org/auth';
import {
  dedupeRecipients,
  NotificationUserSearchService,
} from './notification-user-search.service';

describe('dedupeRecipients', () => {
  it('should return unique users from order results', () => {
    const results = dedupeRecipients([
      {
        user: {
          id: 'user-1',
          username: 'rose122042',
          email: 'a@example.com',
        },
      },
      {
        user: {
          id: 'user-1',
          username: 'rose122042',
          email: 'a@example.com',
        },
      },
      {
        user: {
          id: 'user-2',
          username: 'other',
          email: 'b@example.com',
        },
      },
    ]);

    expect(results).toEqual([
      {
        id: 'user-1',
        username: 'rose122042',
        email: 'a@example.com',
      },
      {
        id: 'user-2',
        username: 'other',
        email: 'b@example.com',
      },
    ]);
  });
});

describe('NotificationUserSearchService', () => {
  let service: NotificationUserSearchService;
  let http: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    http = { get: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        NotificationUserSearchService,
        { provide: HttpClient, useValue: http },
        { provide: API_URL, useValue: 'https://api.test/' },
      ],
    });

    service = TestBed.inject(NotificationUserSearchService);
  });

  it('should search orders and return deduped recipients', () => {
    http.get.mockReturnValue(
      of({
        payload: {
          data: [
            {
              user: {
                id: 'user-1',
                username: 'rose122042',
                email: 'a@example.com',
              },
            },
          ],
        },
      }),
    );

    service.searchUsers('rose122042').subscribe((results) => {
      expect(results).toEqual([
        {
          id: 'user-1',
          username: 'rose122042',
          email: 'a@example.com',
        },
      ]);
    });

    expect(http.get).toHaveBeenCalled();
  });
});
