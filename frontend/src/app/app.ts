import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  type LoginResponse,
  type OrderReceipt,
  type Product,
  type ProductInput,
  StoreApi,
} from './store-api';

type ProductDraft = Omit<ProductInput, 'priceCents'> & { priceDollars: string };

@Component({
  selector: 'app-root',
  imports: [DatePipe, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly api = inject(StoreApi);
  private readonly sessionKey = 'storefront.session';
  private readonly dollars = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  readonly session = signal<LoginResponse | null>(this.restoreSession());
  readonly products = signal<Product[]>([]);
  readonly cart = signal<Record<number, number>>({});
  readonly view = signal<'shop' | 'cart' | 'manage'>('shop');
  readonly authMode = signal<'login' | 'register'>('login');
  readonly authBusy = signal(false);
  readonly productsBusy = signal(false);
  readonly checkoutBusy = signal(false);
  readonly productBusy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly receipt = signal<OrderReceipt | null>(null);
  readonly editingId = signal<number | null>(null);

  readonly isAdmin = computed(() => this.session()?.user.role === 'admin');
  readonly cartEntries = computed(() =>
    this.products()
      .filter((product) => (this.cart()[product.id] ?? 0) > 0)
      .map((product) => ({
        product,
        quantity: this.cart()[product.id],
        lineTotalCents: product.priceCents * this.cart()[product.id],
      })),
  );
  readonly cartCount = computed(() =>
    this.cartEntries().reduce((count, line) => count + line.quantity, 0),
  );
  readonly cartTotalCents = computed(() =>
    this.cartEntries().reduce((total, line) => total + line.lineTotalCents, 0),
  );

  email = '';
  password = '';
  productDraft: ProductDraft = { name: '', priceDollars: '0.00', stock: 0 };

  constructor() {
    if (this.session()) void this.refreshProducts();
  }

  setView(view: 'shop' | 'cart' | 'manage'): void {
    if (view === 'manage' && !this.isAdmin()) return;
    this.view.set(view);
    this.error.set('');
  }

  setAuthMode(mode: 'login' | 'register'): void {
    this.authMode.set(mode);
    this.error.set('');
  }

  async submitAuth(): Promise<void> {
    if (this.authBusy()) return;
    this.authBusy.set(true);
    this.error.set('');
    this.notice.set('');

    try {
      const email = this.email.trim();
      const created = this.authMode() === 'register';
      if (created) await firstValueFrom(this.api.register(email, this.password));

      const session = await firstValueFrom(this.api.login(email, this.password));
      this.session.set(session);
      sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
      this.password = '';
      this.view.set('shop');
      this.notice.set(created ? 'Account created. Welcome to Storefront.' : 'Welcome back.');
      await this.refreshProducts();
    } catch (error) {
      this.error.set(this.describeError(error));
    } finally {
      this.authBusy.set(false);
    }
  }

  logout(): void {
    sessionStorage.removeItem(this.sessionKey);
    this.session.set(null);
    this.products.set([]);
    this.cart.set({});
    this.receipt.set(null);
    this.view.set('shop');
    this.email = '';
    this.password = '';
    this.notice.set('');
  }

  async refreshProducts(): Promise<void> {
    const token = this.session()?.accessToken;
    if (!token) return;
    this.productsBusy.set(true);
    try {
      const products = await firstValueFrom(this.api.listProducts(token));
      this.products.set(products);
      const available = new Map(products.map((product) => [product.id, product.stock]));
      const nextCart: Record<number, number> = {};
      for (const [idText, quantity] of Object.entries(this.cart())) {
        const id = Number(idText);
        const stock = available.get(id) ?? 0;
        if (stock > 0) nextCart[id] = Math.min(quantity, stock);
      }
      this.cart.set(nextCart);
    } catch (error) {
      this.error.set(this.describeError(error));
    } finally {
      this.productsBusy.set(false);
    }
  }

  addToCart(product: Product): void {
    const current = this.cart()[product.id] ?? 0;
    if (current >= product.stock) return;
    this.cart.set({ ...this.cart(), [product.id]: current + 1 });
    this.notice.set(product.name + ' added to your bag.');
    this.error.set('');
  }

  changeQuantity(product: Product, difference: number): void {
    const next = { ...this.cart() };
    const quantity = Math.max(0, Math.min(product.stock, (next[product.id] ?? 0) + difference));
    if (quantity === 0) delete next[product.id];
    else next[product.id] = quantity;
    this.cart.set(next);
  }

  async checkout(): Promise<void> {
    const token = this.session()?.accessToken;
    if (!token || this.checkoutBusy() || this.cartEntries().length === 0) return;
    this.checkoutBusy.set(true);
    this.error.set('');
    this.notice.set('');
    try {
      const items = this.cartEntries().map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      }));
      const receipt = await firstValueFrom(this.api.createOrder(token, items));
      this.receipt.set(receipt);
      this.cart.set({});
      this.view.set('shop');
      this.notice.set('Order #' + receipt.id + ' placed successfully.');
      await this.refreshProducts();
    } catch (error) {
      this.error.set(this.describeError(error));
    } finally {
      this.checkoutBusy.set(false);
    }
  }

  startEdit(product: Product): void {
    this.editingId.set(product.id);
    this.productDraft = {
      name: product.name,
      priceDollars: (product.priceCents / 100).toFixed(2),
      stock: product.stock,
    };
    this.error.set('');
  }

  resetProductForm(): void {
    this.editingId.set(null);
    this.productDraft = { name: '', priceDollars: '0.00', stock: 0 };
  }

  async saveProduct(): Promise<void> {
    const token = this.session()?.accessToken;
    if (!token || !this.isAdmin() || this.productBusy()) return;
    const priceText = this.productDraft.priceDollars.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(priceText)) {
      this.error.set('Enter a dollar price with at most two decimal places.');
      return;
    }
    const [dollars, cents = ''] = priceText.split('.');
    const input: ProductInput = {
      name: this.productDraft.name.trim(),
      priceCents: Number(dollars) * 100 + Number(cents.padEnd(2, '0')),
      stock: Number(this.productDraft.stock),
    };
    if (
      !input.name ||
      input.name.length > 120 ||
      !Number.isSafeInteger(input.priceCents) ||
      input.priceCents > 2_147_483_647 ||
      !Number.isInteger(input.stock) ||
      input.stock < 0 ||
      input.stock > 2_147_483_647
    ) {
      this.error.set('Enter a name, a valid dollar price, and nonnegative whole-number stock.');
      return;
    }
    this.productBusy.set(true);
    this.error.set('');
    try {
      const id = this.editingId();
      if (id === null) await firstValueFrom(this.api.createProduct(token, input));
      else await firstValueFrom(this.api.updateProduct(token, id, input));
      this.notice.set(id === null ? 'Product created.' : 'Product updated.');
      this.resetProductForm();
      await this.refreshProducts();
    } catch (error) {
      this.error.set(this.describeError(error));
    } finally {
      this.productBusy.set(false);
    }
  }

  async deleteProduct(product: Product): Promise<void> {
    const token = this.session()?.accessToken;
    if (!token || !this.isAdmin() || this.productBusy()) return;
    if (!confirm('Delete ' + product.name + '? This cannot be undone.')) return;
    this.productBusy.set(true);
    this.error.set('');
    try {
      await firstValueFrom(this.api.deleteProduct(token, product.id));
      if (this.editingId() === product.id) this.resetProductForm();
      this.notice.set('Product deleted.');
      await this.refreshProducts();
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 500) {
        this.error.set(
          'Could not delete this product. If it belongs to an order, set its stock to 0 instead.',
        );
      } else {
        this.error.set(this.describeError(error));
      }
    } finally {
      this.productBusy.set(false);
    }
  }

  productName(id: number): string {
    return this.products().find((product) => product.id === id)?.name ?? 'Product #' + id;
  }

  formatPrice(cents: number): string {
    return this.dollars.format(cents / 100);
  }

  private restoreSession(): LoginResponse | null {
    try {
      const stored = sessionStorage.getItem(this.sessionKey);
      if (!stored) return null;
      const value: LoginResponse = JSON.parse(stored);
      if (
        typeof value.accessToken === 'string' &&
        typeof value.user?.email === 'string' &&
        (value.user.role === 'customer' || value.user.role === 'admin')
      )
        return value;
    } catch {
      // An invalid saved session simply returns the visitor to sign in.
    }
    sessionStorage.removeItem(this.sessionKey);
    return null;
  }

  private describeError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) return 'Something went wrong. Please try again.';
    if (error.status === 0)
      return 'Cannot reach the backend. Make sure NestJS is running on port 3000.';
    if (error.status === 401 && this.session()) {
      this.logout();
      return 'Your session expired. Please sign in again.';
    }
    const message: unknown = error.error?.message;
    if (Array.isArray(message)) return message.join(' ');
    if (typeof message === 'string') return message;
    return 'The server could not complete the request.';
  }
}
