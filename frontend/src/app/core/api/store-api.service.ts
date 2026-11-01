import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AUTHENTICATED_REQUEST } from '../auth/auth-request.context';
import { LoginResponse, OrderReceipt, Product, ProductInput, StoreUser } from './api.models';

/** The backend contract lives here; components do not build HTTP requests. */
@Injectable({ providedIn: 'root' })
export class StoreApi {
  private readonly http = inject(HttpClient);
  private readonly authenticated = { context: new HttpContext().set(AUTHENTICATED_REQUEST, true) };

  register(email: string, password: string) {
    return this.http.post<StoreUser>('/auth/register', { email, password });
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>('/auth/login', { email, password });
  }

  listProducts() {
    return this.http.get<Product[]>('/products', this.authenticated);
  }

  createOrder(items: { productId: number; quantity: number }[]) {
    return this.http.post<OrderReceipt>('/orders', { items }, this.authenticated);
  }

  createProduct(input: ProductInput) {
    return this.http.post<Product>('/products', input, this.authenticated);
  }

  updateProduct(id: number, input: ProductInput) {
    return this.http.put<Product>('/products/' + id, input, this.authenticated);
  }

  deleteProduct(id: number) {
    return this.http.delete<void>('/products/' + id, this.authenticated);
  }
}
