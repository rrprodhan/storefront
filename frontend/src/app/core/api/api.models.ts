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
