import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/shopping', pathMatch: 'full' },
  {
    path: 'shopping',
    loadComponent: () => import('./pages/shopping/shopping.component').then(m => m.ShoppingComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'revenue',
    loadComponent: () => import('./pages/revenue/revenue.component').then(m => m.RevenueComponent)
  },
  {
    path: 'vip',
    loadComponent: () => import('./pages/vip/vip.component').then(m => m.VipComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  { path: '**', redirectTo: '/shopping' }
];
