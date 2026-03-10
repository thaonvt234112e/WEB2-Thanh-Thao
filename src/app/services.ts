import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product, Category, Customer, Employee, Order, OrderDetail, AuthUser } from './models';

const BASE_URL = 'http://localhost:5000';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // ======= CATEGORIES =======
  getCategories(): Observable<Category[]> {
    return this.http.get<any>(`${BASE_URL}/categories`).pipe(map(r => r.data));
  }

  // ======= PRODUCTS =======
  getProducts(params?: { price_min?: number; price_max?: number; model?: string; madeBy?: string; sort?: string; name?: string }): Observable<Product[]> {
    let httpParams = new HttpParams();
    if (params?.price_min) httpParams = httpParams.set('price_min', params.price_min);
    if (params?.price_max) httpParams = httpParams.set('price_max', params.price_max);
    if (params?.model) httpParams = httpParams.set('model', params.model);
    if (params?.madeBy) httpParams = httpParams.set('madeBy', params.madeBy);
    if (params?.sort) httpParams = httpParams.set('sort', params.sort);
    if (params?.name) httpParams = httpParams.set('name', params.name);
    return this.http.get<any>(`${BASE_URL}/products`, { params: httpParams }).pipe(map(r => r.data));
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<any>(`${BASE_URL}/products/${id}`).pipe(map(r => r.data));
  }

  // ======= AUTH =======
  loginCustomer(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${BASE_URL}/customers/login`, { email, password });
  }

  loginEmployee(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${BASE_URL}/employees/login`, { email, password });
  }

  // ======= CUSTOMERS =======
  getVipCustomers(limit = 5): Observable<Customer[]> {
    return this.http.get<any>(`${BASE_URL}/customers/vip?limit=${limit}`).pipe(map(r => r.data));
  }

  // ======= ORDERS =======
  createOrder(customerId: string, note: string, items: { productId: string; quantity: number; unitPrice: number }[]): Observable<Order> {
    return this.http.post<any>(`${BASE_URL}/orders`, { customerId, note, items }).pipe(map(r => r.data));
  }

  getOrdersByCustomer(customerId: string): Observable<Order[]> {
    return this.http.get<any>(`${BASE_URL}/orders?customerId=${customerId}`).pipe(map(r => r.data));
  }

  getOrderDetail(orderId: string): Observable<Order> {
    return this.http.get<any>(`${BASE_URL}/orders/${orderId}`).pipe(map(r => r.data));
  }

  updateOrder(orderId: string, data: Partial<Order>): Observable<Order> {
    return this.http.put<any>(`${BASE_URL}/orders/${orderId}`, data).pipe(map(r => r.data));
  }

  // ======= ORDER DETAILS =======
  addOrderDetail(detail: { orderId: string; productId: string; quantity: number; unitPrice: number }): Observable<OrderDetail> {
    return this.http.post<any>(`${BASE_URL}/orderdetails`, detail).pipe(map(r => r.data));
  }

  updateOrderDetail(id: string, data: { quantity?: number; unitPrice?: number }): Observable<OrderDetail> {
    return this.http.put<any>(`${BASE_URL}/orderdetails/${id}`, data).pipe(map(r => r.data));
  }

  deleteOrderDetail(id: string): Observable<any> {
    return this.http.delete<any>(`${BASE_URL}/orderdetails/${id}`);
  }

  // ======= REVENUE =======
  getRevenue(year?: number): Observable<any> {
    const url = year ? `${BASE_URL}/orders/revenue?year=${year}` : `${BASE_URL}/orders/revenue`;
    return this.http.get<any>(url).pipe(map(r => r.data));
  }
}


// ======= AUTH SERVICE =======
@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'panda_user';

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : null;
  }

  setUser(user: AuthUser): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  isEmployee(): boolean {
    return this.getUser()?.role === 'employee';
  }

  isCustomer(): boolean {
    return this.getUser()?.role === 'customer';
  }
}

// ======= CART SERVICE =======
@Injectable({ providedIn: 'root' })
export class CartService {
  private storageKey = 'panda_cart';

  getCart(): { product: Product; quantity: number }[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : [];
  }

  addToCart(product: Product, qty: number = 1): void {
    const cart = this.getCart();
    const idx = cart.findIndex(i => i.product._id === product._id);
    if (idx >= 0) cart[idx].quantity += qty;
    else cart.push({ product, quantity: qty });
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
  }

  updateQty(productId: string, qty: number): void {
    const cart = this.getCart();
    const idx = cart.findIndex(i => i.product._id === productId);
    if (idx >= 0) {
      if (qty <= 0) cart.splice(idx, 1);
      else cart[idx].quantity = qty;
    }
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
  }

  removeFromCart(productId: string): void {
    const cart = this.getCart().filter(i => i.product._id !== productId);
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
  }

  clearCart(): void {
    localStorage.removeItem(this.storageKey);
  }

  getTotal(): number {
    return this.getCart().reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  }

  getCount(): number {
    return this.getCart().reduce((sum, i) => sum + i.quantity, 0);
  }
}
