import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { AddressState } from './../models/address-state';
import { addEntity, removeEntity, setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { Address, EditAddressReq } from '../models/edit-address';
import { inject } from '@angular/core';
import { AddressService } from '../services/address-service';
import { pipe, switchMap, tap } from 'rxjs';
import { AuthActions } from '@org/auth';
import { getUserScopedCookie } from '../utilities/helpers';

const addressInitialState: AddressState = {
    isLoading: false,
    error: null,
    lastSelectedAddressCity: 'Cairo'
}

export const addressStore = signalStore(
    { providedIn: "root" },

    withEntities<Address>(),

    withState<AddressState>(addressInitialState),

    withMethods(
        (store) => {
            const svc = inject(AddressService);
            const authActions = inject(AuthActions); // <-- Gain access to current logged-in session

            // Helper function to build the user-specific cookie key string
            const getCookieKey = (): string | null => {
                const session = authActions.getSession();
                return session?.id ? `lastSelectedCity_${session.id}` : null;
            };

            return {

                loadAddresses: rxMethod<void>(pipe(
                    tap(() => patchState(store, { isLoading: true })),
                    switchMap(() => svc.getAddresses().pipe(
                        tap({ next: (res) => patchState(store, setAllEntities(res.payload.addresses), { isLoading: false }), error: (e) => patchState(store, { error: e.message || 'failed to load addresses', isLoading: false }) })
                    ))
                )),

                addAddress: rxMethod<EditAddressReq>(pipe(
                    switchMap((a) => svc.addAddress(a).pipe(
                        tap({ next: (res) => patchState(store, addEntity(res.payload.address)), error: (e) => patchState(store, { error: e.message || 'failed to add the new address' }) })
                    ))
                )),

                updateAddress: rxMethod<{ id: string; changes: Partial<EditAddressReq> }>(pipe(
                    switchMap(({ id, changes }) => {
                        const original = store.entityMap()[id]; // snapshot

                        // Cast the changes safely to Partial<Address> for the local signal entity state
                        patchState(store, updateEntity({ id, changes: changes as Partial<Address> }));

                        return svc.updateAddress(changes, id).pipe(
                            tap({
                                next: () => { },
                                error: (e) => {
                                    if (original) patchState(store, updateEntity({ id, changes: original }));
                                    patchState(store, { error: e.message || 'failed to update the address' });
                                }
                            })
                        );
                    })
                )),

                deleteAddress: rxMethod<string>(pipe(
                    switchMap((id) => {
                        const snap = store.entityMap()[id]; // snapshot
                        patchState(store, removeEntity(id));
                        return svc.deleteAddress(id).pipe(
                            tap({
                                next: () => { },
                                error: (e) => {
                                    if (snap) patchState(store, addEntity(snap));
                                    patchState(store, { error: e.message || `the address can't be deleted` });
                                }
                            })
                        );
                    })
                )),
                changeLastSelected: rxMethod<string>(pipe(
                    switchMap((id) => svc.getAddressById(id).pipe(
                        tap({
                            next: (res) => {
                                const city = res.payload.address.city;
                                patchState(store, { lastSelectedAddressCity: city });

                                // Save cookie scoped to this specific user ID
                                const cookieKey = getCookieKey();
                                if (cookieKey) {
                                    const maxAge = 30 * 24 * 60 * 60; // 30 days
                                    document.cookie = `${cookieKey}=${encodeURIComponent(city)}; max-age=${maxAge}; path=/; SameSite=Lax`;
                                }
                            },
                            error: (e) => patchState(store, { error: e.message || 'failed to load city selection' })
                        })
                    ))
                )),

                // Method to read the correct user cookie and sync state on component load
                syncUserPreferences(): void {
                    const session = authActions.getSession();
                    if (session?.id) {
                        const savedCity = getUserScopedCookie(session.id);
                        patchState(store, { lastSelectedAddressCity: savedCity || 'Cairo' });
                    } else {
                        patchState(store, { lastSelectedAddressCity: 'Cairo' });
                    }
                }
            }

        }
    ),
    withHooks({
        onInit(store) {
            store.syncUserPreferences();
        }
    })
)