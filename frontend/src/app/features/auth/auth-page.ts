import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiErrorService } from '../../core/api/api-error.service';
import { StoreApi } from '../../core/api/store-api.service';
import { SessionService } from '../../core/auth/session.service';
import { CartStore } from '../cart/cart.store';
import { ReceiptStore } from '../orders/receipt.store';
import { ProductStore } from '../products/product.store';
import { FeedbackService } from '../../shared/feedback/feedback.service';

@Component({ selector: 'app-auth-page', imports: [FormsModule], templateUrl: './auth-page.html' })
export class AuthPage {
  private readonly api = inject(StoreApi);
  private readonly errors = inject(ApiErrorService);
  private readonly session = inject(SessionService);
  private readonly cart = inject(CartStore);
  private readonly products = inject(ProductStore);
  private readonly receipt = inject(ReceiptStore);
  private readonly feedback = inject(FeedbackService);
  private readonly router = inject(Router);

  readonly mode = signal<'login' | 'register'>('login');
  readonly busy = signal(false);
  email = '';
  password = '';

  setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.feedback.clear();
  }

  async submit(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.feedback.clear();
    try {
      const email = this.email.trim();
      const created = this.mode() === 'register';
      if (created) await firstValueFrom(this.api.register(email, this.password));
      const session = await firstValueFrom(this.api.login(email, this.password));
      this.cart.clear();
      this.products.clear();
      this.receipt.dismiss();
      this.session.save(session);
      this.password = '';
      this.feedback.success(created ? 'Account created. Welcome to Storefront.' : 'Welcome back.');
      await this.router.navigateByUrl('/shop');
    } catch (error) {
      this.feedback.failure(this.errors.message(error));
    } finally {
      this.busy.set(false);
    }
  }
}
