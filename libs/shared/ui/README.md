# shared-ui-components

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test shared-ui-components` to execute the unit tests.
# label

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test label` to execute the unit tests.


# Component Shared UI

Centralized component library for the Rose app. All components are standalone Angular components, configurable via inputs, and reusable across all remote apps (`roseMain`, `roseAuth`, `roseAdmin`).

---

## Setup

### 1. Register the path alias in `tsconfig.base.json`

```json
"paths": {
  "@org/shared-ui-components": ["libs/shared/ui/src/index.ts"]
}
```

### 2. Import in any standalone component

```typescript
import { Button, Card } from '@org/shared-ui-components';

@Component({
  standalone: true,
  imports: [Button, Card],
})
export class MyComponent {}
```
//Use in any remote app component
// In roseMain, roseAuth, roseAdmin — any component
import {
  Button,
  Card,
  Spinner
 
} from '@org/shared-ui-components';

@Component({
  standalone: true,
  imports: [
    Button,
    Card,
    Spinner,
  ],
  template: `
    <lib-card title="Users">
      <lib-spinner *ngIf="loading" color="primary" />
      <lib-button variant="primary" (clicked)="save()">Save</lib-button>
    </lib-card>
  `
})
export class MyComponent {}
---

## Components

### `<lib-button>`

| Input      | Type                                          | Default       | Description                        |
|------------|-----------------------------------------------|---------------|------------------------------------|
| `variant`  | `'primary'\|'secondary'\|'danger'\|'ghost'`   | `'secondary'` | Visual style                       |
| `size`     | `'sm'\|'md'\|'lg'`                            | `'md'`        | Button height and padding          |
| `disabled` | `boolean`                                     | `false`       | Disables interaction               |
| `loading`  | `boolean`                                     | `false`       | Shows spinner, blocks clicks       |
| `icon`     | `string`                                      | —             | Tabler icon name e.g. `'ti-check'` |

| Output    | Type                | Description              |
|-----------|---------------------|--------------------------|
| `clicked` | `EventEmitter<void>`| Emits on valid click     |

```html
<lib-button variant="primary" icon="ti-check" (clicked)="save()">Save changes</lib-button>
<lib-button variant="danger" [loading]="isDeleting" (clicked)="delete()">Delete</lib-button>
```

---

### `<lib-label>`

| Input     | Type                                                       | Default     | Description          |
|-----------|------------------------------------------------------------|-------------|----------------------|
| `variant` | `'default'\|'info'\|'success'\|'warning'\|'danger'\|'purple'` | `'default'` | Color variant    |
| `dot`     | `boolean`                                                  | `false`     | Shows colored dot    |

```html
<lib-label variant="success" [dot]="true">Active</lib-label>
<lib-label variant="warning">Pending</lib-label>
```

---

### `<lib-message>`

| Input    | Type                                    | Default   | Description                        |
|----------|-----------------------------------------|-----------|------------------------------------|
| `type`   | `'error'\|'warning'\|'success'\|'info'` | `'error'` | Semantic message type              |
| `title`  | `string`                                | —         | Optional bold heading              |
| `inline` | `boolean`                               | `false`   | Compact inline style for fields    |

| Output      | Type                 | Description                         |
|-------------|----------------------|-------------------------------------|
| `dismissed` | `EventEmitter<void>` | If observed, shows × dismiss button |

```html
<!-- Field error -->
<lib-message type="error" [inline]="true">Email is required.</lib-message>

<!-- Banner -->
<lib-message type="error" title="Save failed" (dismissed)="clearError()">
  Please check your input and try again.
</lib-message>
```

---

### `<lib-spinner>`

| Input     | Type                                        | Default     | Description                         |
|-----------|---------------------------------------------|-------------|-------------------------------------|
| `size`    | `'sm'\|'md'\|'lg'`                          | `'md'`      | Spinner diameter                    |
| `color`   | `'default'\|'primary'\|'danger'\|'success'` | `'default'` | Color variant                       |
| `overlay` | `boolean`                                   | `false`     | Wraps in centered card with label   |
| `label`   | `string`                                    | —           | Visible text (overlay) / aria-label |

```html
<lib-spinner size="md" color="primary" />
<lib-spinner [overlay]="true" label="Loading users…" color="primary" />
```

---

### `<lib-card>`

| Input     | Type                                   | Default     | Description                      |
|-----------|----------------------------------------|-------------|----------------------------------|
| `title`   | `string`                               | —           | Header title                     |
| `subtitle`| `string`                               | —           | Muted subtitle below title       |
| `variant` | `'default'\|'flat'\|'accent'\|'metric'`| `'default'` | Visual style                     |
| `footer`  | `boolean`                              | `false`     | Enables footer slot              |
| `padding` | `'none'\|'sm'\|'md'\|'lg'`             | `'md'`      | Body padding                     |

**Slots:**
- Default → card body content
- `slot="header-action"` → button shown in header right
- `slot="footer"` → actions shown in footer (requires `[footer]="true"`)

```html
<lib-card title="Users" subtitle="All accounts" [footer]="true">
  <lib-spinner *ngIf="loading" color="primary" />
  <lib-message *ngIf="error" type="error">{{ error }}</lib-message>

  <lib-button slot="header-action" variant="secondary" size="sm" icon="ti-plus">
    Add user
  </lib-button>

  <ng-container slot="footer">
    <lib-button variant="ghost">Cancel</lib-button>
    <lib-button variant="primary" (clicked)="confirm()">Confirm</lib-button>
  </ng-container>
</lib-card>
```

---

## Accessibility

- All interactive elements have proper `aria-*` attributes
- Loading buttons expose `aria-busy="true"` and visually hide text
- Spinners have `role="status"` with `aria-label`
- Message banners use `role="alert"` for screen reader announcement
- Focus styles inherited from host application

## Adding new components

1. Create `libs/shared/ui/src/lib/<name>/<name>.component.ts`
2. Export from `libs/shared/ui/src/index.ts`
3. Use selector prefix `lib-` consistently
