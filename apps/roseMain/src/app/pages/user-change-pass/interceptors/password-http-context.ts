import { HttpContextToken } from '@angular/common/http';
export const SHOW_LOADING_SPINNER = new HttpContextToken<boolean>(() => false);