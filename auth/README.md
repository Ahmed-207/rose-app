# @org/auth

Shared authentication library for the Rose app. It handles API calls, session storage, route guards, and the HTTP interceptor for the auth endpoints on `https://rose-app.elevate-bootcamp.cloud`.

## Import

```typescript
import {
  provideAuth,
  AuthActions,
  authGuard,
  guestGuard,
  roleGuard,
  Role,
  LoginRequest,
  AuthenticatedSession,
} from '@org/auth';
```

## Setup

Add `provideAuth()` to your app config (host or remote):

```typescript
// app.config.ts
import { provideAuth } from '@org/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAuth(),
    provideRouter(appRoutes),
  ],
};
```

This registers `HttpClient` with the auth interceptor, which attaches `Authorization: Bearer <token>` from the stored session.

## API actions

Inject `AuthActions` in your components or services:

```typescript
private readonly authActions = inject(AuthActions);
```

| Method | Endpoint | Notes |
|--------|----------|-------|
| `sendEmailVerification({ email })` | `POST /api/auth/send-email-verification` | Step 1 of registration |
| `confirmEmailVerification({ email, code })` | `POST /api/auth/confirm-email-verification` | Step 2 of registration |
| `register({ username, email, password, confirmPassword, firstName, lastName })` | `POST /api/auth/register` | Saves session on success |
| `login({ username, password })` | `POST /api/auth/login` | Saves session on success |
| `forgotPassword({ email, host })` | `POST /api/auth/forgot-password` | Sends reset email; `host` is the frontend origin for the reset link |
| `resetPassword({ token, newPassword, confirmPassword })` | `POST /api/auth/reset-password` | Uses token from email |
| `logout()` | — | Clears stored session |
| `getSession()` | — | Returns `AuthenticatedSession` or `null` |
| `isAuthenticated()` | — | `true` if a session exists |
| `getRole()` | — | Reads role from JWT (`user` or `admin`) |

### Registration flow

```
sendEmailVerification → confirmEmailVerification → register
```

### Password reset flow

```
forgotPassword → resetPassword
```

### Example: login

```typescript
this.authActions.login({ username, password }).subscribe({
  next: () => this.router.navigate(['/home']),
  error: (err) => console.error(err.message),
});
```

## Route guards

```typescript
import { authGuard, guestGuard, roleGuard, Role } from '@org/auth';

export const routes: Route[] = [
  {
    path: 'home',
    canActivate: [authGuard],
    loadChildren: () => loadRemote('roseMain/Routes')...,
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard([Role.Admin])],
    loadChildren: () => loadRemote('roseAdmin/Routes')...,
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => loadRemote('roseAuth/Routes')...,
  },
];
```

| Guard | Behavior |
|-------|----------|
| `authGuard` | Blocks unauthenticated users → redirects to `/auth` |
| `guestGuard` | Blocks authenticated users on auth pages → redirects to `/home` |
| `roleGuard([Role.Admin])` | Allows only users with the given role |

## Session

After login or register, the session is stored in `sessionStorage`:

```typescript
interface AuthenticatedSession {
  id: string;
  username: string;
  email: string;
  token: string;
}
```

## Library structure

```
auth/src/lib/auth/
├── config/        API URL, endpoints enum, roles, provideAuth()
├── models/        Request/response interfaces
├── services/      AuthActions (API calls)
├── storage/       SessionStorage
├── interceptors/  Bearer token interceptor
├── guards/        auth, guest, role guards
└── utils/         Adapters + JWT helpers
```

## Development

```bash
# Run tests
npx nx test auth

# Lint
npx nx lint auth

# Typecheck
npx nx typecheck auth
```

## API base URL

Configured in `config/api.ts`:

```typescript
export const API_URL = 'https://rose-app.elevate-bootcamp.cloud';
```

All auth endpoints are built from `AUTH_API_BASE` (`/api/auth/...`) in `config/enums.ts`.
