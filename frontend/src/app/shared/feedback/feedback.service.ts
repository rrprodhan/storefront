import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  readonly notice = signal('');
  readonly error = signal('');

  success(message: string): void {
    this.error.set('');
    this.notice.set(message);
  }

  failure(message: string): void {
    this.notice.set('');
    this.error.set(message);
  }

  clear(): void {
    this.notice.set('');
    this.error.set('');
  }
}
