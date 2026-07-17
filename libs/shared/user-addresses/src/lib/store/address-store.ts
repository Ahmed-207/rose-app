import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { AddressState } from './../models/address-state';
import { addEntity, removeEntity, setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Address, EditAddressReq } from '../models/edit-address';
import { inject } from '@angular/core';
import { AddressService } from '../services/address-service';
import { pipe, switchMap, tap } from 'rxjs';

const addressInitialState: AddressState = {
    isLoading: false,
    error: null
}

export const addressStore = signalStore(
    { providedIn: "root" },

    withEntities<Address>(),

    withState<AddressState>(addressInitialState),

    withMethods(
        (store) => {
            const svc = inject(AddressService);

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

            }

        }
    )
)