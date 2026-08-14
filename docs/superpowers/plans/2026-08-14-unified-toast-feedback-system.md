# Unified Toast Feedback System — Implementation Plan (Phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every mutation in Rose App clear success + failure feedback via one consistent PrimeNG toast (`key="app"`), backed by a global error-toast interceptor, and remove the dead `ngx-toastr`/`MessageService` code.

**Architecture:** A shared `AppToastService` (wrapping PrimeNG `MessageService`) + a `toastErrorInterceptor` HTTP interceptor that auto-shows an error toast for failed `POST/PUT/PATCH/DELETE` requests unless opted out via `SKIP_ERROR_TOAST`. Success toasts are added at each mutation's success point. All four apps consolidate to a single `provideHttpClient` chain (via an extended `provideAuth({ extraInterceptors })`), and each app root layout mounts one `<p-toast key="app" />`.

**Tech Stack:** Angular 21.2.9, PrimeNG 21.1.9 (`primeng/toast`, `primeng/api`), RxJS 7.8, `@ngx-translate/core` 18, `@ngrx/signals`, Nx 22.7.5 (Vitest via `@analogjs/vitest-angular`). npm is the package manager.

**Spec:** `docs/superpowers/specs/2026-08-14-ui-feedback-and-design-unification-design.md` — §6 (Phase 1), §4.7 (toast design tokens), §10 (testing).

> **Note:** This plan covers **Phase 1 only**. Phases 2–4 of the spec get their own plans.

## Global Constraints

- Toast key is always `'app'`; lifecycle `life: 3500`.
- Toast severity types: `success | error | info | warn`.
- The error-toast interceptor must be the **last** interceptor in every HTTP chain so it observes error responses first.
- `MessageService` is **not** root-provided in PrimeNG 21 — it must be registered via `provideAppToast()` in every app config.
- Module Federation: each remote app has its own root injector, so each app's `AppToastService`/`MessageService` are separate instances — therefore every app that renders user-facing HTTP needs its own `<p-toast key="app" />` (shell root, `MainLayout`, `AuthLayout`). No shared singleton list changes are needed for primeng/`@org/shared-ui-components`/`@ngx-translate/core` (already shared).
- Shared-ui lib (`shared-ui-components`) imports `primeng/toast`, `primeng/api`, and `@ngx-translate/core` — all already singleton-shared with it.
- Auth mutations (`AuthActions.executeRequest`) swallow errors via `catchError(() => EMPTY)` — the toast interceptor fires **before** that, so auth error toasts still appear.
- Tests run with `npx nx test shared-ui-components` (Vitest, jsdom, TestBed with `zoneless: false`).
- Translation keys: literal strings that match an i18n key are translated by `AppToastService`; unknown keys and raw backend messages are shown as-is.
- Use `TranslatePipe` for templates; never show raw i18n keys to users.
- After every task: run affected `lint` + `test` (or `typecheck` where noted) before committing.

---

### Task 1: AppToastService + provideAppToast helper

**Files:**
- Create: `libs/shared/ui/src/lib/toast/app-toast.service.ts`
- Create: `libs/shared/ui/src/lib/toast/provide-app-toast.ts`
- Test: `libs/shared/ui/src/lib/toast/app-toast.service.spec.ts`

**Interfaces:**
- Produces:
  - `export type AppToastType = 'success' | 'error' | 'info' | 'warn';`
  - `@Injectable({ providedIn: 'root' }) export class AppToastService` with `success(message: string): void`, `error(message: string): void`, `info(message: string): void`, `warn(message: string): void`.
  - `export function provideAppToast(): EnvironmentProviders`

- [ ] **Step 1: Write the failing test**

Create `libs/shared/ui/src/lib/toast/app-toast.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { AppToastService } from './app-toast.service';

describe('AppToastService', () => {
  let service: AppToastService;
  const add = vi.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MessageService, useValue: { add } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
      ],
    });
    service = TestBed.inject(AppToastService);
  });

  it('success() adds a success toast on the app key', () => {
    service.success('Saved');
    expect(add).toHaveBeenCalledWith({ key: 'app', severity: 'success', summary: 'Saved', life: 3500 });
  });

  it('error() adds an error toast', () => {
    service.error('Failed');
    expect(add).toHaveBeenCalledWith({ key: 'app', severity: 'error', summary: 'Failed', life: 3500 });
  });

  it('translates message when it is an i18n key', () => {
    const instant = vi.fn((key: string) => (key === 'auth.LOGIN_SUCCESS' ? 'Logged in!' : key));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: MessageService, useValue: { add } },
        { provide: TranslateService, useValue: { instant } },
      ],
    });
    service = TestBed.inject(AppToastService);
    service.success('auth.LOGIN_SUCCESS');
    expect(add).toHaveBeenCalledWith({ key: 'app', severity: 'success', summary: 'Logged in!', life: 3500 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx nx test shared-ui-components`
Expected: FAIL — `Cannot find module './app-toast.service'`.

- [ ] **Step 3: Write the implementation**

Create `libs/shared/ui/src/lib/toast/app-toast.service.ts`:

```ts
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

export type AppToastType = 'success' | 'error' | 'info' | 'warn';

@Injectable({ providedIn: 'root' })
export class AppToastService {
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  warn(message: string): void {
    this.show('warn', message);
  }

  private show(severity: AppToastType, message: string): void {
    this.messageService.add({
      key: 'app',
      severity,
      summary: this.translate.instant(message),
      life: 3500,
    });
  }
}
```

Create `libs/shared/ui/src/lib/toast/provide-app-toast.ts`:

```ts
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { MessageService } from 'primeng/api';

export function provideAppToast(): EnvironmentProviders {
  return makeEnvironmentProviders([MessageService]);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx nx test shared-ui-components`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/shared/ui/src/lib/toast
git commit -m "feat(shared-ui): add AppToastService and provideAppToast"
```

---

### Task 2: SKIP_ERROR_TOAST HttpContext token

**Files:**
- Create: `libs/shared/ui/src/lib/toast/http-context.ts`
- Test: `libs/shared/ui/src/lib/toast/http-context.spec.ts`

**Interfaces:**
- Produces: `export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);`

- [ ] **Step 1: Write the failing test**

Create `libs/shared/ui/src/lib/toast/http-context.spec.ts`:

```ts
import { HttpContext } from '@angular/common/http';
import { SKIP_ERROR_TOAST } from './http-context';

describe('SKIP_ERROR_TOAST', () => {
  it('defaults to false', () => {
    expect(new HttpContext().get(SKIP_ERROR_TOAST)).toBe(false);
  });

  it('can be set to true', () => {
    expect(new HttpContext().set(SKIP_ERROR_TOAST, true).get(SKIP_ERROR_TOAST)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx nx test shared-ui-components`
Expected: FAIL — `Cannot find module './http-context'`.

- [ ] **Step 3: Write the implementation**

Create `libs/shared/ui/src/lib/toast/http-context.ts`:

```ts
import { HttpContextToken } from '@angular/common/http';

export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx nx test shared-ui-components`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/shared/ui/src/lib/toast
git commit -m "feat(shared-ui): add SKIP_ERROR_TOAST http context token"
```

---

### Task 3: toastErrorInterceptor

**Files:**
- Create: `libs/shared/ui/src/lib/toast/toast-error.interceptor.ts`
- Test: `libs/shared/ui/src/lib/toast/toast-error.interceptor.spec.ts`

**Interfaces:**
- Consumes: `AppToastService.error(message)` (Task 1), `SKIP_ERROR_TOAST` (Task 2).
- Produces: `export const toastErrorInterceptor: HttpInterceptorFn`

**Behavior:**
- Only acts on `POST`, `PUT`, `PATCH`, `DELETE`.
- Skips when `req.context.get(SKIP_ERROR_TOAST)` is true.
- On `HttpErrorResponse`: if body has a string `message`, toast that; else toast `common.REQUEST_FAILED` (HTTP status present) or `common.NETWORK_ERROR` (`status === 0`).
- Always rethrows the original error (`throwError`).

- [ ] **Step 1: Write the failing test**

Create `libs/shared/ui/src/lib/toast/toast-error.interceptor.spec.ts`:

```ts
import { HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { AppToastService } from './app-toast.service';
import { SKIP_ERROR_TOAST } from './http-context';
import { toastErrorInterceptor } from './toast-error.interceptor';

describe('toastErrorInterceptor', () => {
  const error = vi.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([toastErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: AppToastService, useValue: { error } },
      ],
    });
    error.mockClear();
  });

  it('toasts the backend message on a failed POST', () => {
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);

    http.post('/api/x', {}).subscribe({ error: () => undefined });
    controller.expectOne('/api/x').flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(error).toHaveBeenCalledWith('boom');
  });

  it('does not toast on GET', () => {
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);

    http.get('/api/x').subscribe({ error: () => undefined });
    controller.expectOne('/api/x').flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(error).not.toHaveBeenCalled();
  });

  it('respects SKIP_ERROR_TOAST', () => {
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);

    http
      .post('/api/x', {}, { context: new HttpContext().set(SKIP_ERROR_TOAST, true) })
      .subscribe({ error: () => undefined });
    controller.expectOne('/api/x').flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(error).not.toHaveBeenCalled();
  });

  it('falls back to common.REQUEST_FAILED when no message present', () => {
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);

    http.post('/api/x', {}).subscribe({ error: () => undefined });
    controller.expectOne('/api/x').flush({}, { status: 400, statusText: 'Bad Request' });

    expect(error).toHaveBeenCalledWith('common.REQUEST_FAILED');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx nx test shared-ui-components`
Expected: FAIL — `Cannot find module './toast-error.interceptor'`.

- [ ] **Step 3: Write the implementation**

Create `libs/shared/ui/src/lib/toast/toast-error.interceptor.ts`:

```ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppToastService } from './app-toast.service';
import { SKIP_ERROR_TOAST } from './http-context';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const toastErrorInterceptor: HttpInterceptorFn = (req, next) => {
  if (!MUTATING_METHODS.has(req.method) || req.context.get(SKIP_ERROR_TOAST)) {
    return next(req);
  }

  const toast = inject(AppToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        toast.error(resolveToastMessage(error));
      }
      return throwError(() => error);
    }),
  );
};

function resolveToastMessage(error: HttpErrorResponse): string {
  const body = error.error as { message?: unknown } | null;
  if (body && typeof body.message === 'string' && body.message) {
    return body.message;
  }
  return error.status === 0 ? 'common.NETWORK_ERROR' : 'common.REQUEST_FAILED';
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx nx test shared-ui-components`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/shared/ui/src/lib/toast
git commit -m "feat(shared-ui): add toastErrorInterceptor for mutating requests"
```

---

### Task 4: toast.css (design-spec styles)

**Files:**
- Create: `libs/shared/ui/src/lib/toast/toast.css`

**Interfaces:**
- Produces: global CSS targeting `.p-toast`, `.p-toast-message` with keys `info/success/error/warn`, auto-switching on `.dark` (values from spec §4.7).

- [ ] **Step 1: Write the stylesheet**

Create `libs/shared/ui/src/lib/toast/toast.css`:

```css
.p-toast {
  width: 22rem;
}

.p-toast .p-toast-message {
  border-radius: 8px;
  border-width: 1px;
  border-style: solid;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.07);
}

.p-toast .p-toast-message .p-toast-message-text {
  color: #27272a;
  font-size: 0.875rem;
  line-height: 1.4;
}

.p-toast .p-toast-message .p-toast-icon-close {
  color: #71717a;
}

.p-toast .p-toast-message.p-toast-message-info {
  background: #f4f4f5;
  border-color: #d4d4d8;
}

.p-toast .p-toast-message.p-toast-message-info .p-toast-icon-close {
  color: #71717a;
}

.p-toast .p-toast-message.p-toast-message-success {
  background: #ecfdf5;
  border-color: #00bc7d;
}

.p-toast .p-toast-message.p-toast-message-success .p-toast-icon {
  color: #00bc7d;
}

.p-toast .p-toast-message.p-toast-message-error {
  background: #fef2f2;
  border-color: #dc2626;
}

.p-toast .p-toast-message.p-toast-message-error .p-toast-icon {
  color: #dc2626;
}

.p-toast .p-toast-message.p-toast-message-warn {
  background: #fffbeb;
  border-color: #facc15;
}

.p-toast .p-toast-message.p-toast-message-warn .p-toast-icon {
  color: #facc15;
}

html.dark .p-toast .p-toast-message {
  box-shadow: none;
}

html.dark .p-toast .p-toast-message .p-toast-message-text {
  color: #fafafa;
}

html.dark .p-toast .p-toast-message .p-toast-icon-close {
  color: #d9d9d9;
}

html.dark .p-toast .p-toast-message.p-toast-message-info {
  background: #18181b;
  border-color: #52525b;
}

html.dark .p-toast .p-toast-message.p-toast-message-success {
  background: #073627;
  border-color: #00bc7d;
}

html.dark .p-toast .p-toast-message.p-toast-message-success .p-toast-icon {
  color: #00bc7d;
}

html.dark .p-toast .p-toast-message.p-toast-message-error {
  background: #431819;
  border-color: #ef4444;
}

html.dark .p-toast .p-toast-message.p-toast-message-error .p-toast-icon {
  color: #ef4444;
}

html.dark .p-toast .p-toast-message.p-toast-message-warn {
  background: #1c1803;
  border-color: #eab308;
}

html.dark .p-toast .p-toast-message.p-toast-message-warn .p-toast-icon {
  color: #eab308;
}
```

- [ ] **Step 2: Verify it loads with no lint errors**

Run: `npx nx lint shared-ui-components`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add libs/shared/ui/src/lib/toast/toast.css
git commit -m "feat(shared-ui): add design-spec toast styles"
```

---

### Task 5: Export the toast API from shared-ui

**Files:**
- Modify: `libs/shared/ui/src/index.ts`

- [ ] **Step 1: Add exports**

Append to `libs/shared/ui/src/index.ts`:

```ts
// toast

export * from './lib/toast/app-toast.service';
export * from './lib/toast/provide-app-toast';
export * from './lib/toast/http-context';
export * from './lib/toast/toast-error.interceptor';
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npx nx typecheck roseMain`
Expected: PASS (confirms the barrel resolves from a consuming app).

- [ ] **Step 3: Commit**

```bash
git add libs/shared/ui/src/index.ts
git commit -m "feat(shared-ui): export toast api from public barrel"
```

---

### Task 6: Extend provideAuth with extraInterceptors + withFetch

**Files:**
- Modify: `auth/src/lib/auth/config/provide-auth.ts`

**Interfaces:**
- Consumes: `AuthConfig.apiUrl` (unchanged).
- Produces:
  - `AuthConfig.extraInterceptors?: HttpInterceptorFn[]` (appended after `errorInterceptor`).
  - `provideAuth` now always includes `withFetch()`.

**Rationale:** This is the single consolidation point so each app ends up with exactly one `provideHttpClient` (fixes the duplicate in `roseMain/app.config.ts:24,38` and the shell's standalone client). `toastErrorInterceptor` is passed here by every app as the last interceptor.

- [ ] **Step 1: Modify provide-auth.ts**

```ts
import {
  EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { errorInterceptor } from '../interceptors/error.interceptor';
import { API_URL } from './api';

export interface AuthConfig {
  apiUrl: string;
  extraInterceptors?: HttpInterceptorFn[];
}

export function provideAuth(config: AuthConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: API_URL, useValue: config.apiUrl },
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        ...(config.extraInterceptors ?? []),
      ]),
    ),
  ]);
}
```

- [ ] **Step 2: Verify auth lib typechecks and existing consumers still compile**

Run: `npx nx typecheck roseAuth`
Expected: PASS (no callers use `extraInterceptors` yet, so this is non-breaking).

- [ ] **Step 3: Commit**

```bash
git add auth/src/lib/auth/config/provide-auth.ts
git commit -m "feat(auth): allow extra interceptors and withFetch in provideAuth"
```

---

### Task 7: Consolidate app HTTP providers & register the toast interceptor

**Files:**
- Modify: `apps/roseMain/src/app/app.config.ts`
- Modify: `apps/roseAppShell/src/app/app.config.ts`
- Modify: `apps/roseAuth/src/app/app.config.ts`
- Modify: `apps/roseAdmin/src/app/app.config.ts`

**Interfaces:**
- Consumes: `toastErrorInterceptor` (Task 3), `provideAuth({ extraInterceptors })` (Task 6).
- Produces: each app has **one** `provideHttpClient`, with `toastErrorInterceptor` last.

- [ ] **Step 1: roseMain — merge the duplicate provideHttpClient**

Replace `apps/roseMain/src/app/app.config.ts` (lines 15–24 and 38) so it reads:

```ts
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideTranslateService } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";
import { provideAuth, toastErrorInterceptor } from '@org/auth';
import { environment } from '../environments/environment';
import { LangService } from '@org/ui-lang-switcher';
import { providePrimeNGTheme } from '@org/shared-theme';
import { addressInterceptor } from '@org/user-addresses';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    providePrimeNGTheme(),
    provideAuth({
      apiUrl: environment.apiUrl,
      extraInterceptors: [addressInterceptor, toastErrorInterceptor],
    }),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: `${environment.shellUrl}/assets/i18n/`,
        suffix: '.json'
      }),
      fallbackLang: 'en',
      lang: 'en'
    }),
    provideAppInitializer(() => {
      const langService = inject(LangService);
      langService.init();
    }),
  ]
};
```

Notes:
- Delete the `provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor]))` line and the trailing `provideHttpClient(withInterceptors([addressInterceptor, authInterceptor]))` line.
- Remove imports `authInterceptor`, `errorInterceptor`, `provideHttpClient`, `withFetch`, `withInterceptors`; keep `inject`, `provideAppInitializer`, `provideBrowserGlobalErrorListeners`.
- `toastErrorInterceptor` is imported from `@org/auth` only if it is re-exported there (see Task 6b below). If not, import it from `@org/shared-ui-components` instead.

- [ ] **Step 2: Re-export toastErrorInterceptor from @org/auth**

Create/update `auth/src/lib/auth/index.ts` (or the package entry used by `@org/auth`) to add:

```ts
export { toastErrorInterceptor } from '@org/shared-ui-components';
```

> **Alternative (if @org/auth must not depend on shared-ui):** import `toastErrorInterceptor` from `@org/shared-ui-components` in each app config instead, and skip this step. Prefer re-exporting only if a dependency edge auth→shared-ui is acceptable; the app-config import is the safe default. **Choose the app-config import** to keep the auth lib dependency-free.

- [ ] **Step 3: roseAppShell — remove ngx-toastr and use one client**

Replace `apps/roseAppShell/src/app/app.config.ts` so that:
- Remove `import { provideToastr } from 'ngx-toastr';`
- Remove the `provideToastr({ ... })` call.
- Replace `provideHttpClient(withInterceptors([addressInterceptor, authInterceptor]))` + `provideAuth({ apiUrl })` with a single consolidated `provideAuth({ apiUrl: environment.apiUrl, extraInterceptors: [addressInterceptor, toastErrorInterceptor] })`.
- Remove now-unused imports (`provideHttpClient`, `withInterceptors`, `authInterceptor`).

- [ ] **Step 4: roseAuth — single client with toast interceptor**

Replace `apps/roseAuth/src/app/app.config.ts` line 21:

```ts
provideAuth({
  apiUrl: environment.apiUrl,
  extraInterceptors: [toastErrorInterceptor],
}),
```

Add `import { toastErrorInterceptor } from '@org/shared-ui-components';`.

- [ ] **Step 5: roseAdmin — same treatment**

Replace `apps/roseAdmin/src/app/app.config.ts` line 21 to match roseAuth (add `extraInterceptors: [toastErrorInterceptor]`). Read the file first and preserve its other providers.

- [ ] **Step 6: Typecheck all apps**

Run: `npx nx run-many -t typecheck -p roseMain roseAppShell roseAuth roseAdmin`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/roseMain/src/app/app.config.ts apps/roseAppShell/src/app/app.config.ts apps/roseAuth/src/app/app.config.ts apps/roseAdmin/src/app/app.config.ts
git commit -m "refactor: consolidate http providers and enable toastErrorInterceptor"
```

---

### Task 8: Mount p-toast + register provideAppToast in every app

**Files:**
- Modify: `apps/roseAppShell/src/app/app.ts`, `apps/roseAppShell/src/app/app.html`
- Modify: `apps/roseMain/src/app/core/layout/Main layout/mainLayout.ts`, `mainLayout.html`
- Modify: `apps/roseAuth/src/app/core/layout/auth-layout/auth-layout.ts`, `auth-layout.html`
- Modify: all four app config files (add `provideAppToast()`)

**Interfaces:**
- Consumes: `provideAppToast()` (Task 1), PrimeNG `ToastModule`.

- [ ] **Step 1: Add provideAppToast() to every app config**

In each of `roseMain`, `roseAppShell`, `roseAuth`, `roseAdmin` `app.config.ts` add to `providers`:

```ts
provideAppToast(),
```

and add `import { provideAppToast } from '@org/shared-ui-components';`.

- [ ] **Step 2: Mount the toast in the shell root**

`apps/roseAppShell/src/app/app.ts` — add `ToastModule` to `imports`:

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.html',
})
export class App {}
```

`apps/roseAppShell/src/app/app.html`:

```html
<p-toast key="app" />
<router-outlet></router-outlet>
```

- [ ] **Step 3: Mount the toast in roseMain MainLayout**

`apps/roseMain/src/app/core/layout/Main layout/mainLayout.ts` — add `ToastModule` to imports (add `import { ToastModule } from 'primeng/toast';`). In `mainLayout.html`, add `<p-toast key="app" />` as the first child element.

- [ ] **Step 4: Mount the toast in roseAuth AuthLayout**

`apps/roseAuth/src/app/core/layout/auth-layout/auth-layout.ts` — add `ToastModule` to imports. In `auth-layout.html`, add `<p-toast key="app" />` as the first child element.

- [ ] **Step 5: Verify all apps compile**

Run: `npx nx run-many -t typecheck -p roseMain roseAppShell roseAuth roseAdmin`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/roseAppShell/src/app apps/roseMain/src/app/core/layout "apps/roseMain/src/app" apps/roseAuth/src/app/core/layout apps/roseAuth/src/app apps/roseAdmin/src/app
git commit -m "feat: mount app-level p-toast and provideAppToast in all apps"
```

---

### Task 9: Add i18n toast keys

**Files:**
- Modify: `apps/roseAppShell/public/assets/i18n/en.json`
- Modify: `apps/roseAppShell/public/assets/i18n/ar.json`

- [ ] **Step 1: English keys**

Add to `en.json` under `common`:

```json
"NETWORK_ERROR": "Network error. Please check your connection.",
"REQUEST_FAILED": "Something went wrong. Please try again."
```

Add a top-level `toast` section:

```json
"toast": {
  "LOGIN_SUCCESS": "Welcome back!",
  "REGISTER_SUCCESS": "Account created successfully!",
  "EMAIL_SENT": "Verification code sent.",
  "EMAIL_VERIFIED": "Email verified successfully.",
  "OTP_INVALID": "The OTP code is invalid.",
  "PASSWORD_RESET_SUCCESS": "Your password has been reset. You can now log in.",
  "RESET_LINK_SENT": "If an account exists for that email, a reset link has been sent.",
  "ADDED_TO_CART": "Added to cart.",
  "REMOVED_FROM_CART": "Removed from cart.",
  "CART_CLEARED": "Cart cleared.",
  "ADDED_TO_WISHLIST": "Added to wishlist.",
  "REMOVED_FROM_WISHLIST": "Removed from wishlist.",
  "WISHLIST_CLEARED": "Wishlist cleared.",
  "ORDER_PLACED": "Your order has been placed.",
  "PAYMENT_SUCCEEDED": "Payment successful.",
  "PAYMENT_FAILED": "Payment failed.",
  "REVIEW_ADDED": "Review submitted. Thank you!",
  "PROFILE_UPDATED": "Your profile has been updated.",
  "PASSWORD_CHANGED": "Your password has been changed.",
  "EMAIL_CHANGE_REQUESTED": "A verification code was sent to your new email.",
  "EMAIL_CHANGED": "Your email has been updated.",
  "ACCOUNT_DELETED": "Your account has been deleted.",
  "ADDRESS_ADDED": "Address added.",
  "ADDRESS_UPDATED": "Address updated.",
  "ADDRESS_DELETED": "Address deleted."
}
```

- [ ] **Step 2: Arabic keys**

Mirror the same structure in `ar.json` with Arabic translations (keep existing keys untouched; use `dir` value already present). Translate:
- `NETWORK_ERROR`: "خطأ في الشبكة. تحقق من اتصالك."
- `REQUEST_FAILED`: "حدث خطأ ما. حاول مرة أخرى."
- `LOGIN_SUCCESS`: "مرحبًا بعودتك!"
- `REGISTER_SUCCESS`: "تم إنشاء الحساب بنجاح!"
- `EMAIL_SENT`: "تم إرسال رمز التحقق."
- `EMAIL_VERIFIED`: "تم التحقق من البريد الإلكتروني بنجاح."
- `OTP_INVALID`: "رمز التحقق غير صالح."
- `PASSWORD_RESET_SUCCESS`: "تمت إعادة تعيين كلمة المرور. يمكنك الآن تسجيل الدخول."
- `RESET_LINK_SENT`: "إذا كان هناك حساب بهذا البريد، فقد تم إرسال رابط إعادة التعيين."
- `ADDED_TO_CART`: "تمت الإضافة إلى السلة."
- `REMOVED_FROM_CART`: "تمت الإزالة من السلة."
- `CART_CLEARED`: "تم مسح السلة."
- `ADDED_TO_WISHLIST`: "تمت الإضافة إلى المفضلة."
- `REMOVED_FROM_WISHLIST`: "تمت الإزالة من المفضلة."
- `WISHLIST_CLEARED`: "تم مسح المفضلة."
- `ORDER_PLACED`: "تم إنشاء طلبك."
- `PAYMENT_SUCCEEDED`: "تم الدفع بنجاح."
- `PAYMENT_FAILED`: "فشل الدفع."
- `REVIEW_ADDED`: "تم إرسال التقييم. شكرًا لك!"
- `PROFILE_UPDATED`: "تم تحديث ملفك الشخصي."
- `PASSWORD_CHANGED`: "تم تغيير كلمة المرور."
- `EMAIL_CHANGE_REQUESTED`: "تم إرسال رمز التحقق إلى بريدك الجديد."
- `EMAIL_CHANGED`: "تم تحديث بريدك الإلكتروني."
- `ACCOUNT_DELETED`: "تم حذف حسابك."
- `ADDRESS_ADDED`: "تمت إضافة العنوان."
- `ADDRESS_UPDATED`: "تم تحديث العنوان."
- `ADDRESS_DELETED`: "تم حذف العنوان."

- [ ] **Step 3: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('apps/roseAppShell/public/assets/i18n/en.json')); JSON.parse(require('fs').readFileSync('apps/roseAppShell/public/assets/i18n/ar.json')); console.log('valid')"`
Expected: `valid`.

- [ ] **Step 4: Commit**

```bash
git add apps/roseAppShell/public/assets/i18n
git commit -m "feat(i18n): add toast translation keys"
```

---

### Task 10: Auth flows (login, register, forgot/reset)

**Files:**
- Modify: `apps/roseAuth/src/app/pages/login/login.ts`
- Modify: `apps/roseAuth/src/app/pages/register/registerForm/register.ts`
- Modify: `apps/roseAuth/src/app/pages/forgot-password/forgot-password.ts`
- Modify: `apps/roseAuth/src/app/pages/reset-password/reset-password.ts`

**Notes:**
- Auth `POST` failures are auto-toasted by the interceptor (they are swallowed by `AuthActions.executeRequest` AFTER the interceptor fires), so only success toasts + removal of dead inline feedback are needed here.

- [ ] **Step 1: login.ts — success toast + remove invisible error plumbing**

Replace `apps/roseAuth/src/app/pages/login/login.ts`:
- Add `import { AppToastService } from '@org/shared-ui-components';`
- Add field `private readonly toast = inject(AppToastService);`
- Remove `private readonly authErrorService = inject(AuthErrorService);`, `readonly errorMessage = this.authErrorService.message;`, `import { AuthErrorService }` from the `@org/auth` import, and the `this.authErrorService.clear();` line in `submitLogin`.
- In the `next` callback of `submitLogin`, before `navigateAfterLogin`:

```ts
next: () => {
  this.toast.success('toast.LOGIN_SUCCESS');
  const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
  void this.navigateAfterLogin(returnUrl);
},
```

- [ ] **Step 2: register.ts — remove debugger + unify toasts**

In `apps/roseAuth/src/app/pages/register/registerForm/register.ts`:
- Remove `debugger` statements at lines 122 and 138.
- Add `import { AppToastService } from '@org/shared-ui-components';`
- Add `private readonly toast = inject(AppToastService);`
- Remove `MessageService` / `ToastModule` imports and usage: remove `import { ToastModule } from 'primeng/toast';`, `import { MessageService } from 'primeng/api';`, `providers: [MessageService]`, and `private messageService = inject(MessageService);`.
- In `submitEmail` `next`: on success add `this.toast.success('toast.EMAIL_SENT');` before `activate(2)`; on the non-status branch, keep setting `this.errorMessage` (inline is intentional here) — but also add `this.toast.error(res.message);` so it's never silent. Remove the `error` callback body (dead code; errors are swallowed → toast via interceptor) and delete `this.errorMessage.set(err.error?.message ?? 'Something went wrong. Please try again.');`.
- In `submitOtp`: replace the invalid-OTP `this.messageService.add({ ... })` with `this.toast.error('toast.OTP_INVALID');`. On success add `this.toast.success('toast.EMAIL_VERIFIED');` before `activate(3)`. Remove the dead `error` callback body.
- In `submitDetails` `next`: add `this.toast.success('toast.REGISTER_SUCCESS');` before `navigate(['/home'])`. Remove the dead `error` callback body.

- [ ] **Step 3: forgot-password.ts**

Read the file, then in the submit success path add `this.toast.success('toast.RESET_LINK_SENT');`. Remove any inline error rendering that duplicates the auto error toast (keep `errorMessage` only if it renders field-specific validation).

- [ ] **Step 4: reset-password.ts**

Read the file, then in the submit success path add `this.toast.success('toast.PASSWORD_RESET_SUCCESS');`. Remove any duplicate inline error rendering.

- [ ] **Step 5: Verify typecheck**

Run: `npx nx typecheck roseAuth`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/roseAuth/src/app/pages
git commit -m "feat(roseAuth): unified toast feedback for auth flows"
```

---

### Task 11: Cart flows

**Files:**
- Modify: `apps/roseMain/src/app/pages/products-page/products-page.ts` (line 80)
- Modify: `apps/roseMain/src/app/pages/home/components/best-selling/bestSellingSection.ts` (line 64)
- Modify: `apps/roseMain/src/app/pages/home/components/most-popular/mostPopularSection.ts` (line 45)
- Modify: `apps/roseMain/src/app/pages/product-details/components/related-products/relateProductSection.ts` (line 74)
- Modify: `apps/roseMain/src/app/pages/product-details/productDetailPage.ts` (line 82)
- Modify: `apps/roseMain/src/app/pages/cart-page/cart-page.ts` (line 270, remove-item, clear-cart)
- Modify: `apps/roseMain/src/app/pages/cart-page/services/cart.service.ts` (unchanged — errors auto-toast)

**Pattern** (apply to each add-to-cart call site). Add to each component:
```ts
import { AppToastService } from '@org/shared-ui-components';
// in class body:
private readonly toast = inject(AppToastService);
```

For each `cartService.addToCart(...).subscribe()` call, change the `next`/`error` handlers so the success path toasts:

```ts
this.cartService.addToCart({ productId: product.id as string, quantity: 1 }).subscribe({
  next: () => this.toast.success('toast.ADDED_TO_CART'),
  error: () => undefined,
});
```

- [ ] **Step 1: products-page.ts (line 80)** — apply the pattern above.
- [ ] **Step 2: bestSellingSection.ts (line 64)** — apply the pattern (currently `.subscribe()` with no args).
- [ ] **Step 3: mostPopularSection.ts (line 45)** — apply the pattern.
- [ ] **Step 4: relateProductSection.ts (line 74)** — apply the pattern.
- [ ] **Step 5: productDetailPage.ts (line 82)** — apply the pattern (inspect the current subscribe; it may pass handlers — extend `next`).
- [ ] **Step 6: cart-page.ts (line 270)** — recommended-items add-to-cart: apply the pattern.
- [ ] **Step 7: cart-page.ts remove-item + clear-cart** — find the remove/clear handlers and add success toasts:
  - remove item success → `this.toast.success('toast.REMOVED_FROM_CART');`
  - clear cart success → `this.toast.success('toast.CART_CLEARED');`
  (Errors auto-toast; do not add error handlers that show toasts.)

- [ ] **Step 8: Verify typecheck**

Run: `npx nx typecheck roseMain`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add apps/roseMain/src/app/pages
git commit -m "feat(roseMain): toast feedback for cart operations"
```

---

### Task 12: Wishlist flows

**Files:**
- Modify: `apps/shared/components/product-card/productCard.ts` (lines 81–110)
- Modify: `apps/roseMain/src/app/pages/product-details/components/product-info/productInfo.ts`
- Modify: `apps/roseMain/src/app/pages/wishlist/wishlistPage.ts`

- [ ] **Step 1: productCard.ts**

Add `import { AppToastService } from '@org/shared-ui-components';` and `private readonly toast = inject(AppToastService);`. In `addToWishlist`, after the success subscription, add `this.toast.success('toast.ADDED_TO_WISHLIST');`. In `remveFromWishlist`, add `this.toast.success('toast.REMOVED_FROM_WISHLIST');` in the success path. (Errors auto-toast.)

- [ ] **Step 2: productInfo.ts**

Read the wishlist handlers; add success toasts:
- add → `this.toast.success('toast.ADDED_TO_WISHLIST');`
- remove → `this.toast.success('toast.REMOVED_FROM_WISHLIST');`

- [ ] **Step 3: wishlistPage.ts**

Read the clear-wishlist handler; add `this.toast.success('toast.WISHLIST_CLEARED');` on success. For the per-item "Add to Cart" click that currently has no handler (spec §6.1.3), add a handler that emits/creates the cart item and toasts `'toast.ADDED_TO_CART'` — inspect the template binding first to confirm the missing handler.

- [ ] **Step 4: Verify typecheck**

Run: `npx nx typecheck roseMain`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/shared/components/product-card apps/roseMain/src/app/pages
git commit -m "feat: toast feedback for wishlist operations"
```

---

### Task 13: Orders / checkout

**Files:**
- Modify: `libs/shared/user-orders/src/lib/store/orders.store.ts`

- [ ] **Step 1: Replace dead ToastrService with AppToastService**

In `orders.store.ts`:
- Remove line 12: `import { ToastrService } from 'ngx-toastr'; // عدّلي الـ import ده حسب المكتبة اللي بتستخدميها فعليًا`
- Remove `import { TranslateService } from '@ngx-translate/core';` (line 13) if unused after the change.
- Add `import { AppToastService } from '@org/shared-ui-components';`
- Replace line 40 `const toastr = inject(ToastrService);` with `const toast = inject(AppToastService);`
- Remove `let translate = inject(TranslateService);` if unused.

- [ ] **Step 2: Cash order success toast**

In `createOrder`'s `tap.next`, inside the `if (req.paymentMethod === "CASH_ON_DELIVERY")` branch, before `router.navigate(...)`:

```ts
toast.success('toast.ORDER_PLACED');
```

- [ ] **Step 3: Payment toasts**

In `payOrder`'s `tap.next`:
- In the `if (isSucceeded)` branch, before `router.navigate(...)`: `toast.success('toast.PAYMENT_SUCCEEDED');`
- In the `else` branch, before `router.navigate(...)`: `toast.error('toast.PAYMENT_FAILED');`
- In the `tap.error` branch, before `router.navigate(...)`: `toast.error(e.message ?? 'toast.PAYMENT_FAILED');`

- [ ] **Step 4: Prevent double-submit on order creation**

In `apps/roseMain/src/app/pages/cart-page/cart-page.ts` `handleOrderCreation()`, guard with the store's loading flag:

```ts
handleOrderCreation(): void {
  if (this.orderStore.isLoading()) return;
  const addressId = this.recievedAddressId();
  if (!addressId) return;

  const payload: AddOrderReq = {
    addressId,
    paymentMethod: this.confirmedPaymentMethod(),
    couponCode: this.appliedCoupon()?.coupon.code,
  };

  this.orderStore.createOrder(payload);
}
```

Verify `this.orderStore.isLoading()` exists (it is part of `OrderState` via `withState`). If the signal is not directly exposed as `isLoading`, use `this.orderStore.isLoading()` after checking the store's computed state.

- [ ] **Step 5: Verify typecheck + tests**

Run: `npx nx run-many -t typecheck -p roseMain user-orders`
Expected: PASS. Run existing order tests if any: `npx nx test user-orders`.

- [ ] **Step 6: Commit**

```bash
git add libs/shared/user-orders/src/lib/store/orders.store.ts apps/roseMain/src/app/pages/cart-page/cart-page.ts
git commit -m "feat: toast feedback for orders and prevent checkout double-submit"
```

---

### Task 14: Reviews

**Files:**
- Modify: `apps/roseMain/src/app/pages/product-details/components/product-review/productReviews.ts` (line 117)

- [ ] **Step 1: Add success toast**

Add `import { AppToastService } from '@org/shared-ui-components';` and inject it. In the review-create success path (after `this.reviewAdded.emit(createdReview)` / `this.reviewForm.reset()`), add:

```ts
this.toast.success('toast.REVIEW_ADDED');
```

Remove any inline `submitError` display that duplicates the auto error toast for the HTTP failure path (keep the "Please sign in first to add a review" message — that is client-side, not an HTTP error).

- [ ] **Step 2: Verify typecheck**

Run: `npx nx typecheck roseMain`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/roseMain/src/app/pages/product-details/components/product-review
git commit -m "feat(roseMain): toast feedback for review submission"
```

---

### Task 15: Account settings

**Files:**
- Modify: `apps/roseMain/src/app/pages/account-settings/components/profile-form/profileForm.ts` (+ `profileForm.html`)
- Modify: `apps/roseMain/src/app/pages/account-settings/components/change-password-form/changePasswordForm.ts` (+ `changePasswordForm.html`)

- [ ] **Step 1: changePasswordForm.ts**

Replace the file's feedback logic (see `apps/roseMain/src/app/pages/account-settings/components/change-password-form/changePasswordForm.ts`):
- Add `import { AppToastService } from '@org/shared-ui-components';`
- Remove `AuthErrorService` import and `private readonly authErrorService = inject(AuthErrorService);`
- Remove signals `errorMessage`, `successMessage`, `statusMessage` and the template bindings that use them.
- Replace `submit()` body with:

```ts
submit(): void {
  if (this.isSaving()) {
    return;
  }

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.toast.error('account.FORM_INVALID');
    return;
  }

  const value = this.form.getRawValue();
  const request: ChangePasswordRequest = {
    currentPassword: value.oldPassword,
    newPassword: value.newPassword,
    confirmPassword: value.confirmPassword,
  };

  this.isSaving.set(true);
  this.authActions
    .changePassword(request)
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isSaving.set(false)),
    )
    .subscribe(() => {
      this.form.reset();
      this.toast.success('toast.PASSWORD_CHANGED');
    });
}
```

Add `private readonly toast = inject(AppToastService);`.

- [ ] **Step 2: changePasswordForm.html**

Remove the `@if (errorMessage()) ...` and `@if (successMessage()) ...` blocks (lines 16–23) that referenced the removed signals.

- [ ] **Step 3: profileForm.ts**

Read the file first (423 lines). For each `successMessage.set('...')` call (lines 193, 242, 269, 354), replace with the equivalent toast:
- `this.successMessage.set('account.SAVE_SUCCESS');` → `this.toast.success('toast.PROFILE_UPDATED');`
- `this.successMessage.set('account.EMAIL_CHANGE_SUCCESS');` → `this.toast.success('toast.EMAIL_CHANGED');`
- `this.successMessage.set('account.EMAIL_CODE_SENT');` → `this.toast.success('toast.EMAIL_CHANGE_REQUESTED');`
- `this.successMessage.set('account.EMAIL_CODE_SENT');` (resend) → `this.toast.success('toast.EMAIL_CHANGE_REQUESTED');`
Then remove the `successMessage` signal and any now-unused `errorMessage` signal if it was only inline (keep it if the template still renders it — but the auto error toast now covers HTTP failures; prefer removing inline error banners to avoid duplication). Add `private readonly toast = inject(AppToastService);`.
In `deleteAccount()` (line 296), add `this.toast.success('toast.ACCOUNT_DELETED');` on success (before/after the logout the service performs).

- [ ] **Step 4: profileForm.html**

Remove the `@if (successMessage()) ...` block (around line 89) and the inline `@if (errorMessage()) ...` block (around line 83) if `errorMessage` was removed.

- [ ] **Step 5: Verify typecheck**

Run: `npx nx typecheck roseMain`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/roseMain/src/app/pages/account-settings
git commit -m "feat(roseMain): toast feedback for account settings"
```

---

### Task 16: Addresses

**Files:**
- Modify: `libs/shared/user-addresses/src/lib/store/address-store.ts`

- [ ] **Step 1: Add success toasts**

Add `import { AppToastService } from '@org/shared-ui-components';`. Inside `withMethods`, add `const toast = inject(AppToastService);`. Then:
- In `addAddress`'s `tap.next`, add `toast.success('toast.ADDRESS_ADDED');`
- In `updateAddress`'s `tap.next` (currently `next: () => { }`), change to `next: () => toast.success('toast.ADDRESS_UPDATED')`
- In `deleteAddress`'s `tap.next` (currently `next: () => { }`), change to `next: () => toast.success('toast.ADDRESS_DELETED')`

(Errors auto-toast via the interceptor; keep the optimistic rollback logic unchanged.)

- [ ] **Step 2: Verify typecheck + tests**

Run: `npx nx run-many -t typecheck -p roseMain user-addresses`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add libs/shared/user-addresses/src/lib/store/address-store.ts
git commit -m "feat(user-addresses): toast feedback for address mutations"
```

---

### Task 17: Remove ngx-toastr

**Files:**
- Modify: `apps/roseAppShell/module-federation.config.ts`
- Modify: `apps/roseAppShell/project.json`
- Modify: `apps/roseAppShell/src/styles.css` (if it imports `ngx-toastr/toastr.css`)
- Modify: `package.json` + `package-lock.json`

- [ ] **Step 1: Remove from module-federation singleton list**

In `apps/roseAppShell/module-federation.config.ts`, remove the `libraryName === 'ngx-toastr'` line (keep the trailing `||` chain valid on the previous line).

- [ ] **Step 2: Remove from build styles**

In `apps/roseAppShell/project.json`, remove `"node_modules/ngx-toastr/toastr.css"` from the `styles` array (line 28).

- [ ] **Step 3: Remove any styles.css import**

Check `apps/roseAppShell/src/styles.css` for `@import 'ngx-toastr/toastr.css'` (or similar) and delete the line.

- [ ] **Step 4: Uninstall the package**

Run: `npm uninstall ngx-toastr`
Expected: updates `package.json` and `package-lock.json`.

- [ ] **Step 5: Grep for leftovers**

Run: `grep -rn "ngx-toastr" apps libs auth --include="*.ts" --include="*.json" --include="*.css" | grep -v node_modules`
Expected: no matches (only `package-lock.json` resolved-path remnants are acceptable if any; if present, run `npm install` to clean).

- [ ] **Step 6: Verify shell builds**

Run: `npx nx build roseAppShell`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/roseAppShell/module-federation.config.ts apps/roseAppShell/project.json apps/roseAppShell/src/styles.css package.json package-lock.json
git commit -m "chore: remove unused ngx-toastr"
```

---

### Task 18: Dead code cleanup sweep

**Files:**
- Modify: `apps/roseMain/src/app/core/layout/secondry Navbar/secondryNavbar.ts`
- Modify: `apps/roseAppShell/src/app/app.config.ts` (verify `addressInterceptor` still used)

- [ ] **Step 1: secondryNavbar.ts**

Remove the unused `MessageService` bits: `import { MenuItem, MessageService } from 'primeng/api';` → `import { MenuItem } from 'primeng/api';`, remove `providers: [MessageService]` from the component decorator, and remove `private messageService = inject(MessageService);` (confirmed unused — no `messageService.` call sites).

- [ ] **Step 2: Verify no dead imports remain**

Run: `grep -rn "ToastrService\|toastr\b" apps libs auth --include="*.ts" | grep -v node_modules | grep -v "ngx-toastr"`
Expected: no matches.

- [ ] **Step 3: Typecheck**

Run: `npx nx typecheck roseMain`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/roseMain/src/app/core/layout
git commit -m "chore: remove dead MessageService injection from secondry navbar"
```

---

### Task 19: Final verification

- [ ] **Step 1: Lint + test + typecheck (affected projects)**

Run: `npx nx run-many -t lint test typecheck -p roseMain roseAppShell roseAuth roseAdmin shared-ui-components user-orders user-addresses`
Expected: all PASS. Fix any failures before proceeding.

- [ ] **Step 2: Full workspace CI check**

Run: `npx nx run-many -t lint test build typecheck`
Expected: PASS (may take several minutes; `roseAppShell` build also validates module federation config).

- [ ] **Step 3: Manual smoke (both themes)**

With remotes + shell served (`npx nx serve roseAuth`, `roseMain`, `roseAppShell`), verify:
- Failed login → error toast, light + dark.
- Successful register (step 3) → success toast then redirect.
- Add/remove cart → success toasts.
- Add/remove wishlist → success toasts.
- Place cash order → success toast; checkout-result page still renders.
- Profile save / password change → success toasts; no inline banners remain.
- Add/update/delete address → success toasts.
- No duplicate toasts (each action shows exactly one).
- No `debugger` breakpoints (DevTools won't pause) and no `ngx-toastr` references in network/bundle.

- [ ] **Step 4: Update the spec status**

In `docs/superpowers/specs/2026-08-14-ui-feedback-and-design-unification-design.md`:
- Set §5 Phase 1 status to `Done`.
- Tick all §6 checkboxes.
- Add a §2 Change Log row: `2026-08-14 | Phase 1 (unified toasts) implemented — see plans/2026-08-14-unified-toast-feedback-system.md`.

- [ ] **Step 5: Final commit**

```bash
git add docs/superpowers/specs
git commit -m "docs: mark Phase 1 (unified toasts) complete"
```

---

## Self-Review Notes

- **Spec coverage (Phase 1 §6.1–§6.2):** toast core (T1–T4), exports (T5), provider consolidation (T6–T7), mounts (T8), i18n (T9), auth (T10), cart (T11), wishlist (T12), orders/checkout incl. double-submit guard (T13), reviews (T14), account (T15), addresses (T16), ngx-toastr removal (T17), dead-code sweep (T18), DoD (T19). All §6.1.4 items covered (T13 removes dead ToastrService, T18 removes MessageService/debugger, T7 fixes duplicate provideHttpClient, T17 removes provideToastr).
- **Placeholder scan:** Every code step contains concrete code or an exact file/line target. Steps that read a file first (forgot/reset, wishlist handlers, profileForm) give the exact signal/message to touch and the fallback behavior.
- **Type consistency:** `AppToastService.success/error/info/warn(message: string)`, `SKIP_ERROR_TOAST`, `toastErrorInterceptor`, `provideAppToast()`, `provideAuth({ apiUrl, extraInterceptors })` are used consistently across all tasks. Toast i18n keys referenced in wiring tasks are all defined in Task 9.
