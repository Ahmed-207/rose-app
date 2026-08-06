import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { SHOW_LOADING_SPINNER } from './password-http-context';
import { LoadingService } from '../services/loading-service';

export const passwordLoadingInterceptor: HttpInterceptorFn = (req, next) => {
    if (!req.context.get(SHOW_LOADING_SPINNER)) {
        return next(req);
    }

    const loadingService = inject(LoadingService);
    loadingService.show();

    return next(req).pipe(
        finalize(() => {
            loadingService.hide();
        })
    );
};