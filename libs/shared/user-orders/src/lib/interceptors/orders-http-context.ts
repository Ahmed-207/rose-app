import { HttpContextToken } from '@angular/common/http';

export const IS_ORDER_REQUEST = new HttpContextToken<boolean>(() => false);