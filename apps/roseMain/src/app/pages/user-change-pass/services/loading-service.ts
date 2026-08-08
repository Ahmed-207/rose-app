import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private readonly _isLoading = signal<boolean>(false);
    public readonly isLoading = this._isLoading.asReadonly();

    show(): void {
        this._isLoading.set(true);
    }

    hide(): void {
        this._isLoading.set(false);
    }
}