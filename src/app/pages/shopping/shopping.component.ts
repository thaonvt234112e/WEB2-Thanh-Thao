import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, CartService, AuthService } from '../../services';
import { Product } from '../../models';

@Component({
  selector: 'app-shopping',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-title">🛍️ Shopping</div>

    <!-- Filter Bar (Q8 - search by price) -->
    <div style="background: var(--surface); border-radius: var(--radius); padding: 1rem 1.5rem; margin-bottom: 1.5rem; box-shadow: var(--shadow);">
      <!-- Row 1: Tên + Khoảng giá -->
      <div style="display: flex; gap: 0.8rem; align-items: center; margin-bottom: 0.8rem; flex-wrap: wrap;">
        <label style="font-weight:600; color: var(--primary-dark); white-space:nowrap;">🔍 Tìm kiếm:</label>
        <input class="form-control" [(ngModel)]="searchName" placeholder="Tên sản phẩm..." style="flex: 1; min-width: 150px;" />
        <select class="form-control" (change)="onPriceRange($event)" style="min-width:170px;">
          <option value="">-- Khoảng giá --</option>
          <option value="0-300000">Dưới 300.000đ</option>
          <option value="300000-500000">300.000đ – 500.000đ</option>
          <option value="500000-1000000">500.000đ – 1.000.000đ</option>
          <option value="1000000-2000000">1tr – 2tr</option>
          <option value="2000000-99999999">Trên 2.000.000đ</option>
        </select>
      </div>
      <!-- Row 2: Giá min/max + Sắp xếp + Buttons -->
      <div style="display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap;">
        <input class="form-control" type="number" [(ngModel)]="priceMin" placeholder="Giá từ" min="0" style="width:110px" />
        <span style="color: var(--text-muted);">→</span>
        <input class="form-control" type="number" [(ngModel)]="priceMax" placeholder="Giá đến" min="0" style="width:110px" />
        <select class="form-control" [(ngModel)]="sortOption" style="min-width:140px;">
          <option value="">-- Sắp xếp --</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
        </select>
        <button class="btn btn-primary" (click)="loadProducts()">🔍 Tìm</button>
        <button class="btn btn-outline" (click)="resetFilter()">↺ Reset</button>
      </div>
    </div>

    <!-- Loading -->
    @if(loading) { <div class="spinner"></div> }

    <!-- Product Grid (Q7 - nice UI) -->
    @if(!loading) {
      @if(products.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">👗</div>
          <p>Không tìm thấy sản phẩm nào</p>
        </div>
      } @else {
        <div style="margin-bottom: 0.8rem; color: var(--text-muted); font-size: 0.88rem;">
          Hiển thị {{ products.length }} sản phẩm
        </div>
        <div class="grid-3">
          @for(product of products; track product._id) {
            <div class="card">
              <img [src]="product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'"
                   [alt]="product.name" class="product-img"
                   onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'" />
              <div class="card-body">
                <div class="card-title">{{ product.name }}</div>
                <div class="card-subtitle">{{ product.madeBy }}</div>
                <div>
                  <span class="card-badge">{{ product.model }}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 0.8rem;">
                  <span class="card-price">{{ formatPrice(product.price) }}</span>
                  <span style="font-size:0.78rem; color: var(--text-muted)">Còn: {{ product.stock }}</span>
                </div>
                <!-- Q9: BUY button (chỉ khi đã login là customer) -->
                <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem; align-items: center;">
                  @if(authService.isCustomer()) {
                    <input type="number" [(ngModel)]="quantities[product._id!]" min="1" max="{{ product.stock }}"
                           class="form-control btn-sm" style="width: 60px;" />
                    <button class="btn btn-accent btn-sm" (click)="addToCart(product)">
                      🛒 Mua
                    </button>
                  } @else {
                    <button class="btn btn-outline btn-sm" style="width:100%" (click)="goLogin()">
                      🔑 Đăng nhập để mua
                    </button>
                  }
                </div>
                @if(addedMap[product._id!]) {
                  <div style="color: var(--primary); font-size: 0.8rem; margin-top: 0.5rem; font-weight: 600;">
                    ✅ Đã thêm vào giỏ!
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    }
  `
})
export class ShoppingComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  searchName = '';
  priceMin: number | null = null;
  priceMax: number | null = null;
  sortOption = '';
  quantities: Record<string, number> = {};
  addedMap: Record<string, boolean> = {};

  constructor(
    private api: ApiService,
    public cartService: CartService,
    public authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    const params: any = {};
    if (this.searchName) params.name = this.searchName;
    if (this.priceMin) params.price_min = this.priceMin;
    if (this.priceMax) params.price_max = this.priceMax;
    if (this.sortOption) params.sort = this.sortOption;

    this.api.getProducts(params).subscribe({
      next: (data) => {
        this.products = data;
        this.quantities = {};
        data.forEach(p => { if (p._id) this.quantities[p._id] = 1; });
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => { this.loading = false; this.cd.detectChanges(); }
    });
  }

  resetFilter() {
    this.searchName = '';
    this.priceMin = null;
    this.priceMax = null;
    this.sortOption = '';
    this.loadProducts();
  }

  onPriceRange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    if (!val) {
      this.priceMin = null;
      this.priceMax = null;
    } else {
      const [min, max] = val.split('-').map(Number);
      this.priceMin = min;
      this.priceMax = max;
    }
    this.loadProducts();
  }

  addToCart(product: Product) {
    const qty = this.quantities[product._id!] || 1;
    this.cartService.addToCart(product, qty);
    this.addedMap[product._id!] = true;
    setTimeout(() => { this.addedMap[product._id!] = false; }, 2000);
  }

  goLogin() {
    this.router.navigate(['/login']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
}
