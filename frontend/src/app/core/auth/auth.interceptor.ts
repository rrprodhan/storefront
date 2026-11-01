import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from './session.service';
import { AUTHENTICATED_REQUEST } from './auth-request.context';

/** Add the token only when the API client marks a request as protected. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(SessionService).current()?.accessToken;
  if (!token || !request.context.get(AUTHENTICATED_REQUEST)) return next(request);

  return next(
    request.clone({
      setHeaders: { Authorization: 'Bearer ' + token },
    }),
  );
};
