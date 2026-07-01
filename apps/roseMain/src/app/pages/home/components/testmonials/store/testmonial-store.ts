import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { TestmonialState } from "../models/testmonial-state";
import { setAllEntities, withEntities } from "@ngrx/signals/entities";
import { Testmonial } from "../models/testmonial";
import { computed, inject } from "@angular/core";
import { TestmonialService } from "../services/testmonials-service/testmonial-service";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";

const testmonialInitialState: TestmonialState = {
    isLoading: false,
    error: null,
    totalResults: 0
}

export const TestmonialStore = signalStore(
    { providedIn: 'root' },
    withEntities<Testmonial>(),
    withState<TestmonialState>(testmonialInitialState),
    withComputed((store) => ({
        totalTestmonials: computed(() => store.totalResults()),
        hasTestmonials: computed(() => store.entities().length > 0),
    })),
    withMethods((store) => {
        const _tService = inject(TestmonialService);

        return {
            loadTestmonials: rxMethod<void>(
                pipe(
                    tap(() => patchState(store, { isLoading: true })),
                    switchMap(() =>
                        _tService.getTestmonials().pipe(
                            tap({
                                next: (res) => {
                                    const trueTotal = res.payload?.metadata.total || 0;

                                    patchState(store,
                                        setAllEntities(res.payload.data),
                                        {
                                            totalResults: trueTotal,
                                            isLoading: false
                                        }
                                    );
                                },
                                error: (e) => patchState(store, { error: e.message, isLoading: false })
                            })
                        )
                    )
                )
            )
        };
    })
);