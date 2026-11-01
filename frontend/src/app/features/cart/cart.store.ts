import { computed, inject, Injectable, signal } from '@angular/core';
import { Product } from '../../core/api/api.models';
import { ProductStore } from '../products/product.store';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly products = inject(ProductStore);
  private readonly quantityState = signal<Record<number, number>>({});

  readonly quantities = this.quantityState.asReadonly();
  readonly entries = computed(() =>
    this.products
      .products()
      .map((product) => ({
        product,
        quantity: Math.min(this.quantityState()[product.id] ?? 0, product.stock),
      }))
      .filter((line) => line.quantity > 0)
      .map((line) => ({
        ...line,
        lineTotalCents: line.product.priceCents * line.quantity,
      })),
  );
  readonly count = computed(() => this.entries().reduce((total, line) => total + line.quantity, 0));
  readonly totalCents = computed(() =>
    this.entries().reduce((total, line) => total + line.lineTotalCents, 0),
  );

  quantityFor(product: Product): number {
    return Math.min(this.quantityState()[product.id] ?? 0, product.stock);
  }

  add(product: Product): boolean {
    const current = this.quantityFor(product);
    if (current >= product.stock) return false;
    this.quantityState.set({ ...this.quantityState(), [product.id]: current + 1 });
    return true;
  }

  change(product: Product, difference: number): void {
    const next = { ...this.quantityState() };
    const quantity = Math.max(0, Math.min(product.stock, this.quantityFor(product) + difference));
    if (quantity === 0) delete next[product.id];
    else next[product.id] = quantity;
    this.quantityState.set(next);
  }

  clear(): void {
    this.quantityState.set({});
  }
}
