import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../core/api/api.models';
import { FeedbackService } from '../../shared/feedback/feedback.service';
import { formatPrice } from '../../shared/money';
import { CartStore } from '../cart/cart.store';
import { ReceiptStore } from '../orders/receipt.store';
import { ProductStore } from './product.store';

@Component({ selector: 'app-shop-page', imports: [DatePipe], templateUrl: './shop-page.html' })
export class ShopPage implements OnInit {
  readonly products = inject(ProductStore);
  readonly cart = inject(CartStore);
  readonly receipt = inject(ReceiptStore);
  private readonly feedback = inject(FeedbackService);
  readonly formatPrice = formatPrice;

  ngOnInit(): void {
    void this.products.refresh();
  }

  addToCart(product: Product): void {
    if (this.cart.add(product)) this.feedback.success(product.name + ' added to your bag.');
  }
}
