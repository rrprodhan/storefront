import { Routes } from '@angular/router';
import { adminGuard, guestGuard, signedInGuard } from './core/auth/route.guards';

export const routes: Routes = [
  {
    path: 'sign-in',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/auth-page').then((module) => module.AuthPage),
  },
  {
    path: 'shop',
    canActivate: [signedInGuard],
    loadComponent: () => import('./features/products/shop-page').then((module) => module.ShopPage),
  },
  {
    path: 'bag',
    canActivate: [signedInGuard],
    loadComponent: () => import('./features/cart/cart-page').then((module) => module.CartPage),
  },
  {
    path: 'manage',
    canActivate: [signedInGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-page').then((module) => module.AdminPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'shop' },
  { path: '**', redirectTo: 'shop' },
];
