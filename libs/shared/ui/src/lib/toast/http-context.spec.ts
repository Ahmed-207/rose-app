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
