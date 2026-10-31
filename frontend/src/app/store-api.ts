import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type UserRole = 'customer' | 'admin';

export interface StoreUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: StoreUser;
}

export interface Product {
  id: number;
  name: string;
  priceCents: number;
  stock: number;
}

export type ProductInput = Omit<Product, 'id'>;

export interface OrderLine {
  productId: number;
  quantity: number;
  unitPriceCents: number;
}

export interface OrderReceipt {
  id: number;
  customerId: number;
  createdAt: string;
  items: OrderLine[];
}

@Injectable({ providedIn: 'root' })
export class StoreApi {
  private readonly http = inject(HttpClient);

  register(email: string, password: string) {
    return this.http.post<StoreUser>('/auth/register', { email, password });
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>('/auth/login', { email, password });
  }

  listProducts(token: string) {
    return this.http.get<Product[]>('/products', { headers: this.auth(token) });
  }

  createOrder(token: string, items: { productId: number; quantity: number }[]) {
    return this.http.post<OrderReceipt>('/orders', { items }, { headers: this.auth(token) });
  }

  createProduct(token: string, input: ProductInput) {
    return this.http.post<Product>('/products', input, { headers: this.auth(token) });
  }

  updateProduct(token: string, id: number, input: ProductInput) {
    return this.http.put<Product>(`/products/${id}`, input, { headers: this.auth(token) });
  }

  deleteProduct(token: string, id: number) {
    return this.http.delete<void>(`/products/${id}`, { headers: this.auth(token) });
  }

  private auth(token: string) {
    return { Authorization: `Bearer ${token}` };
  }
}
