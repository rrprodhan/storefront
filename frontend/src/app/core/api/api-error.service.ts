import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FeedbackService } from '../../shared/feedback/feedback.service';
import { SessionService } from '../auth/session.service';

@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  private readonly feedback = inject(FeedbackService);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  handle(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 401 && this.session.isLoggedIn()) {
      this.session.clear();
      this.feedback.failure('Your session expired. Please sign in again.');
      void this.router.navigateByUrl('/sign-in');
      return;
    }
    this.feedback.failure(this.message(error));
  }

  message(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) return 'Something went wrong. Please try again.';
    if (error.status === 0)
      return 'Cannot reach the backend. Make sure NestJS is running on port 3000.';
    const message: unknown = error.error?.message;
    if (Array.isArray(message)) return message.join(' ');
    if (typeof message === 'string') return message;
    return 'The server could not complete the request.';
  }
}
