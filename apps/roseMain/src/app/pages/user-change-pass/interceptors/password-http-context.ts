import { HttpContextToken } from '@angular/common/http';

export const IS_PASSWORD_REQUEST = new HttpContextToken<boolean>(() => false);