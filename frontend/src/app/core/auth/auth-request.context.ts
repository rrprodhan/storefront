import { HttpContextToken } from '@angular/common/http';

/** Mark API calls that need the current session's bearer token. */
export const AUTHENTICATED_REQUEST = new HttpContextToken<boolean>(() => false);
