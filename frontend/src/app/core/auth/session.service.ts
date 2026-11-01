import { computed, Injectable, signal } from '@angular/core';
import { LoginResponse } from '../api/api.models';

const SESSION_KEY = 'storefront.session';

@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly current = signal<LoginResponse | null>(this.restore());
  readonly user = computed(() => this.current()?.user ?? null);
  readonly isLoggedIn = computed(() => this.current() !== null);
  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  save(session: LoginResponse): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.current.set(session);
  }

  clear(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.current.set(null);
  }

  private restore(): LoginResponse | null {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      const session: LoginResponse = JSON.parse(stored);
      if (
        typeof session.accessToken === 'string' &&
        typeof session.user?.email === 'string' &&
        (session.user.role === 'customer' || session.user.role === 'admin')
      ) {
        return session;
      }
    } catch {
      // A malformed browser session should not prevent the app from loading.
    }
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}
