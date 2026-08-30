import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  removeAllEntities,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { Notification } from '../models/notification.model';
import { NotificationState } from '../models/notification-state';
import { NotificationService } from '../services/notification.service';

const notificationInitialState: NotificationState = {
  isLoading: false,
  error: null,
  unreadCount: 0,
  totalResults: 0,
  searchQuery: '',
};

export const NotificationStore = signalStore(
  { providedIn: 'root' },
  withEntities<Notification>(),
  withState<NotificationState>(notificationInitialState),
  withComputed((store) => ({
    hasUnread: computed(() => store.unreadCount() > 0),
    unreadNotifications: computed(() =>
      store.entities().filter((notification) => !notification.isRead),
    ),
    hasNotifications: computed(() => store.entities().length > 0),
  })),
  withMethods((store) => {
    const svc = inject(NotificationService);
    const toastr = inject(ToastrService);

    const showError = (message: string): void => {
      patchState(store, { error: message });
      toastr.error(message);
    };

    const loadNotifications = rxMethod<{ page?: number; limit?: number } | void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((params) =>
          svc
            .getNotifications(
              params?.page ?? 1,
              params?.limit ?? 20,
              store.searchQuery() || undefined,
            )
            .pipe(
              tap({
                next: (res) =>
                  patchState(store, setAllEntities(res.payload.data ?? []), {
                    isLoading: false,
                    totalResults: res.payload.metadata?.total ?? 0,
                  }),
                error: (e: { message?: string }) => {
                  const message = e.message || 'Failed to load notifications';
                  patchState(store, { isLoading: false, error: message });
                  toastr.error(message);
                },
              }),
              catchError(() => EMPTY),
            ),
        ),
      ),
    );

    const refreshUnreadCount = rxMethod<void>(
      pipe(
        switchMap(() =>
          svc.getUnreadCount().pipe(
            tap({
              next: (res) =>
                patchState(store, { unreadCount: res.payload.unreadCount ?? 0 }),
              error: () => undefined,
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    );

    const markAsRead = rxMethod<string>(
      pipe(
        switchMap((id) => {
          const notification = store.entityMap()[id];
          if (!notification || notification.isRead) {
            return EMPTY;
          }

          return svc.markAsRead(id).pipe(
            tap({
              next: () => {
                patchState(store, updateEntity({ id, changes: { isRead: true } }));
                patchState(store, {
                  unreadCount: Math.max(0, store.unreadCount() - 1),
                });
              },
              error: (e: { message?: string }) =>
                showError(e.message || 'Failed to mark notification as read'),
            }),
            catchError(() => EMPTY),
          );
        }),
      ),
    );

    const markAllAsRead = rxMethod<void>(
      pipe(
        switchMap(() =>
          svc.markAllAsRead().pipe(
            tap({
              next: () => {
                const updated = store.entities().map((notification) => ({
                  ...notification,
                  isRead: true,
                }));
                patchState(store, setAllEntities(updated), { unreadCount: 0 });
              },
              error: (e: { message?: string }) =>
                showError(e.message || 'Failed to mark all notifications as read'),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    );

    const deleteNotification = rxMethod<string>(
      pipe(
        switchMap((id) => {
          const notification = store.entityMap()[id];

          return svc.deleteNotification(id).pipe(
            tap({
              next: () => {
                patchState(store, removeEntity(id), {
                  totalResults: Math.max(0, store.totalResults() - 1),
                  unreadCount:
                    notification && !notification.isRead
                      ? Math.max(0, store.unreadCount() - 1)
                      : store.unreadCount(),
                });
              },
              error: (e: { message?: string }) =>
                showError(e.message || 'Failed to delete notification'),
            }),
            catchError(() => EMPTY),
          );
        }),
      ),
    );

    const clearAll = rxMethod<void>(
      pipe(
        switchMap(() =>
          svc.clearAll().pipe(
            tap({
              next: () =>
                patchState(store, removeAllEntities(), {
                  totalResults: 0,
                  unreadCount: 0,
                }),
              error: (e: { message?: string }) =>
                showError(e.message || 'Failed to clear notifications'),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    );

    const setSearch = (searchQuery: string): void => {
      patchState(store, { searchQuery });
    };

    return {
      loadNotifications,
      refreshUnreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      setSearch,
    };
  }),
);
