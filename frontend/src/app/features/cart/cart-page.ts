import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiErrorService } from '../../core/api/api-error.service';
import { Product } from '../../core/api/api.models';
import { StoreApi } from '../../core/api/store-api.service';
import { FeedbackService } from '../../shared/feedback/feedback.service';
import { formatPrice } from '../../shared/money';
import { ReceiptStore } from '../orders/receipt.store';
import { ProductStore } from '../products/product.store';
import { CartStore } from './cart.store';

@Component({ selector: 'app-cart-page', imports: [RouterLink], templateUrl: './cart-page.html' })
export class CartPage implements OnInit {
  readonly cart = inject(CartStore);
  readonly busy = signal(false);
  readonly formatPrice = formatPrice;
  private readonly products = inject(ProductStore);
  private readonly api = inject(StoreApi);
  private readonly errors = inject(ApiErrorService);
  private readonly feedback = inject(FeedbackService);
  private readonly receipt = inject(ReceiptStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (this.products.products().length === 0) void this.products.refresh();
  }

  changeQuantity(product: Product, difference: number): void {
    this.cart.change(product, difference);
  }

  async checkout(): Promise<void> {
    if (this.busy() || this.cart.entries().length === 0) return;
    this.busy.set(true);
    this.feedback.clear();
    try {
      const items = this.cart.entries().map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      }));
      const receipt = await firstValueFrom(this.api.createOrder(items));
      this.receipt.show(receipt);
      this.cart.clear();
      this.feedback.success('Order #' + receipt.id + ' placed successfully.');
      await this.router.navigateByUrl('/shop');
      await this.products.refresh();
    } catch (error) {
      this.errors.handle(error);
    } finally {
      this.busy.set(false);
    }
  }
}
