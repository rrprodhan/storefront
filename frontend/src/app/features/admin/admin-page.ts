import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiErrorService } from '../../core/api/api-error.service';
import { Product, ProductInput } from '../../core/api/api.models';
import { StoreApi } from '../../core/api/store-api.service';
import { FeedbackService } from '../../shared/feedback/feedback.service';
import { formatPrice, parseDollarPrice } from '../../shared/money';
import { ProductStore } from '../products/product.store';

type ProductDraft = Omit<ProductInput, 'priceCents'> & { priceDollars: string };

@Component({ selector: 'app-admin-page', imports: [FormsModule], templateUrl: './admin-page.html' })
export class AdminPage implements OnInit {
  readonly products = inject(ProductStore);
  readonly busy = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly formatPrice = formatPrice;
  draft: ProductDraft = { name: '', priceDollars: '0.00', stock: 0 };

  private readonly api = inject(StoreApi);
  private readonly errors = inject(ApiErrorService);
  private readonly feedback = inject(FeedbackService);

  ngOnInit(): void {
    if (this.products.products().length === 0) void this.products.refresh();
  }

  startEdit(product: Product): void {
    this.editingId.set(product.id);
    this.draft = {
      name: product.name,
      priceDollars: (product.priceCents / 100).toFixed(2),
      stock: product.stock,
    };
    this.feedback.clear();
  }

  reset(): void {
    this.editingId.set(null);
    this.draft = { name: '', priceDollars: '0.00', stock: 0 };
  }

  async save(): Promise<void> {
    if (this.busy()) return;
    const priceCents = parseDollarPrice(this.draft.priceDollars);
    const input: ProductInput = {
      name: this.draft.name.trim(),
      priceCents: priceCents ?? -1,
      stock: Number(this.draft.stock),
    };
    if (
      !input.name ||
      input.name.length > 120 ||
      priceCents === null ||
      !Number.isInteger(input.stock) ||
      input.stock < 0 ||
      input.stock > 2_147_483_647
    ) {
      this.feedback.failure(
        'Enter a name, a valid dollar price, and nonnegative whole-number stock.',
      );
      return;
    }
    this.busy.set(true);
    this.feedback.clear();
    try {
      const id = this.editingId();
      if (id === null) await firstValueFrom(this.api.createProduct(input));
      else await firstValueFrom(this.api.updateProduct(id, input));
      this.feedback.success(id === null ? 'Product created.' : 'Product updated.');
      this.reset();
      await this.products.refresh();
    } catch (error) {
      this.errors.handle(error);
    } finally {
      this.busy.set(false);
    }
  }

  async delete(product: Product): Promise<void> {
    if (this.busy() || !confirm('Delete ' + product.name + '? This cannot be undone.')) return;
    this.busy.set(true);
    this.feedback.clear();
    try {
      await firstValueFrom(this.api.deleteProduct(product.id));
      if (this.editingId() === product.id) this.reset();
      this.feedback.success('Product deleted.');
      await this.products.refresh();
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 500) {
        this.feedback.failure(
          'Could not delete this product. If it belongs to an order, set its stock to 0 instead.',
        );
      } else {
        this.errors.handle(error);
      }
    } finally {
      this.busy.set(false);
    }
  }
}
