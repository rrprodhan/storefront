import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SessionService } from '../../core/auth/session.service';
import { CartStore } from '../../features/cart/cart.store';
import { ReceiptStore } from '../../features/orders/receipt.store';
import { ProductStore } from '../../features/products/product.store';
import { FeedbackService } from '../feedback/feedback.service';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-header.html',
})
export class SiteHeader {
  readonly session = inject(SessionService);
  readonly cart = inject(CartStore);

  private readonly products = inject(ProductStore);
  private readonly receipt = inject(ReceiptStore);
  private readonly feedback = inject(FeedbackService);
  private readonly router = inject(Router);

  signOut(): void {
    this.session.clear();
    this.cart.clear();
    this.products.clear();
    this.receipt.dismiss();
    this.feedback.clear();
    void this.router.navigateByUrl('/sign-in');
  }
}
