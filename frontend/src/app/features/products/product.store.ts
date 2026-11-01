import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiErrorService } from '../../core/api/api-error.service';
import { Product } from '../../core/api/api.models';
import { StoreApi } from '../../core/api/store-api.service';

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private readonly api = inject(StoreApi);
  private readonly errors = inject(ApiErrorService);
  private readonly productState = signal<Product[]>([]);
  private readonly loadingState = signal(false);

  readonly products = this.productState.asReadonly();
  readonly loading = this.loadingState.asReadonly();

  async refresh(): Promise<void> {
    if (this.loadingState()) return;
    this.loadingState.set(true);
    try {
      this.productState.set(await firstValueFrom(this.api.listProducts()));
    } catch (error) {
      this.errors.handle(error);
    } finally {
      this.loadingState.set(false);
    }
  }

  clear(): void {
    this.productState.set([]);
  }

  nameFor(id: number): string {
    return this.products().find((product) => product.id === id)?.name ?? 'Product #' + id;
  }
}
