import { Injectable, signal } from '@angular/core';
import { OrderReceipt } from '../../core/api/api.models';

@Injectable({ providedIn: 'root' })
export class ReceiptStore {
  private readonly receiptState = signal<OrderReceipt | null>(null);
  readonly receipt = this.receiptState.asReadonly();

  show(receipt: OrderReceipt): void {
    this.receiptState.set(receipt);
  }

  dismiss(): void {
    this.receiptState.set(null);
  }
}
