import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, CartService, AuthService } from '../../services';
import { Product } from '../../models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-title">🛒 Giỏ hàng của tôi</div>

    <!-- Yêu cầu đăng nhập (Q9) -->
    @if(!authService.isLoggedIn()) {
      <div class="alert alert-warning">
        ⚠️ Bạn cần <strong><a href="/login" style="color: var(--accent)">đăng nhập</a></strong>
        để xem và quản lý giỏ hàng.
      </div>
    }

    <!-- Giỏ hàng trống -->
    @if(authService.isLoggedIn() && cart.length === 0) {
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <p>Giỏ hàng trống. <a href="/shopping" style="color: var(--primary)">Tiếp tục mua sắm →</a></p>
      </div>
    }

    <!-- Danh sách sản phẩm trong giỏ (Q10) -->
    @if(authService.isLoggedIn() && cart.length > 0) {
      <div style="display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem;">
        <!-- Left: Cart items -->
        <div>
          @for(item of cart; track item.product._id) {
            <div class="card" style="margin-bottom: 1rem; display: flex; align-items: center; padding: 1rem; gap: 1rem;">
              <img [src]="item.product.imageUrl || 'https://via.placeholder.com/80x80'"
                   [alt]="item.product.name"
                   style="width:80px; height:80px; object-fit:cover; border-radius: 8px; flex-shrink:0;"
                   onerror="this.src='https://via.placeholder.com/80x80'" />
              <div style="flex: 1;">
                <div class="card-title">{{ item.product.name }}</div>
                <div class="card-subtitle">{{ item.product.madeBy }}</div>
                <div class="card-price">{{ formatPrice(item.product.price) }}</div>
              </div>
              <!-- Cập nhật số lượng (Q10) -->
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn btn-outline btn-sm" (click)="updateQty(item.product._id!, item.quantity - 1)">−</button>
                <span style="font-weight: 700; min-width: 2rem; text-align: center;">{{ item.quantity }}</span>
                <button class="btn btn-outline btn-sm" (click)="updateQty(item.product._id!, item.quantity + 1)">+</button>
              </div>
              <div style="font-weight: 700; color: var(--primary); min-width: 100px; text-align: right;">
                {{ formatPrice(item.product.price * item.quantity) }}
              </div>
              <!-- Xóa sản phẩm (Q10) -->
              <button class="btn btn-danger btn-sm" (click)="removeItem(item.product._id!)">🗑️</button>
            </div>
          }
        </div>

        <!-- Right: Order Summary -->
        <div>
          <div class="card" style="padding: 1.5rem; position: sticky; top: 80px;">
            <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: var(--primary-dark);">
              📋 Tóm tắt đơn hàng
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
              <span>Số lượng sản phẩm:</span>
              <strong>{{ cartService.getCount() }}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.9rem;">
              <span>Tạm tính:</span>
              <strong>{{ formatPrice(cartService.getTotal()) }}</strong>
            </div>
            <hr style="border-color: var(--border); margin-bottom: 1rem;" />
            <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem;">
              <span>Tổng cộng:</span>
              <span style="color: var(--primary)">{{ formatPrice(cartService.getTotal()) }}</span>
            </div>

            <!-- Note -->
            <textarea class="form-control" [(ngModel)]="note" placeholder="Ghi chú..." rows="2"
                      style="width: 100%; margin-bottom: 1rem; resize: none;"></textarea>

            <!-- Thanh toán (Q10) -->
            <button class="btn btn-primary" style="width: 100%; font-size: 1rem; padding: 0.8rem;"
                    (click)="checkout()" [disabled]="loading || cart.length === 0">
              @if(loading) { ⏳ Đang xử lý... }
              @else { 💳 Thanh toán ngay }
            </button>

            @if(successMsg) {
              <div class="alert alert-success" style="margin-top: 1rem;">{{ successMsg }}</div>
            }
            @if(errorMsg) {
              <div class="alert" style="background: #ffd6d6; color: #c0392b; margin-top: 1rem;">{{ errorMsg }}</div>
            }

            <button class="btn btn-outline" style="width: 100%; margin-top: 0.8rem;"
                    (click)="cartService.clearCart(); loadCart()">
              🗑️ Xóa giỏ hàng
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class CartComponent implements OnInit {
  cart: { product: Product; quantity: number }[] = [];
  note = '';
  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private api: ApiService,
    public cartService: CartService,
    public authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cart = this.cartService.getCart();
  }

  updateQty(productId: string, qty: number) {
    this.cartService.updateQty(productId, qty);
    this.loadCart();
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
    this.loadCart();
  }

  checkout() {
    if (!this.authService.isCustomer()) {
      this.router.navigate(['/login']);
      return;
    }
    const user = this.authService.getUser()!;
    const items = this.cart.map(i => ({
      productId: i.product._id!,
      quantity: i.quantity,
      unitPrice: i.product.price
    }));

    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';

    // Tạo order và thanh toán cùng lúc
    this.api.createOrder(user._id, this.note, items).subscribe({
      next: (order) => {
        this.api.updateOrder(order._id!, { status: 'paid' }).subscribe({
          next: () => {
            this.cartService.clearCart();
            this.loadCart();
            this.loading = false;
            this.successMsg = '🎉 Thanh toán thành công! Đơn hàng đã được ghi nhận.';
            this.cd.detectChanges();
          },
          error: () => {
            // Dù lỗi paid, order vẫn đã tạo
            this.cartService.clearCart();
            this.loadCart();
            this.loading = false;
            this.successMsg = '✅ Đơn hàng đã tạo, đang chờ xử lý.';
            this.cd.detectChanges();
          }
        });
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Có lỗi xảy ra. Vui lòng thử lại!';
        this.cd.detectChanges();
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
}
