import { HttpContextToken } from '@angular/common/http';

export const IS_ADDRESS_REQUEST = new HttpContextToken<boolean>(() => false);