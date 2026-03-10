import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, AuthService } from '../../services';

@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-title">📊 Thống kê doanh thu</div>

    @if(!authService.isEmployee()) {
      <div class="alert alert-warning">
        🔒 Chức năng này chỉ dành cho <strong>nhân viên đã đăng nhập</strong>.
        <a href="/login" style="color: var(--accent); margin-left: 0.5rem;">Đăng nhập tại đây</a>
      </div>
    }

    @if(authService.isEmployee()) {
      <div class="filter-bar">
        <label style="font-weight: 600;">📅 Năm thống kê:</label>
        <select class="form-control" [(ngModel)]="selectedYear">
          <option [value]="2023">2023</option>
          <option [value]="2024">2024</option>
          <option [value]="2025">2025</option>
          <option [value]="2026">2026</option>
        </select>
        <button class="btn btn-primary" (click)="loadRevenue()">📊 Xem thống kê</button>
      </div>

      @if(loading) { <div class="spinner"></div> }

      @if(!loading && data) {
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
          <div class="card" style="padding: 1.5rem; text-align: center;">
            <div style="font-size: 2rem;">💰</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Tổng doanh thu</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">{{ formatPrice(data.totalRevenue) }}</div>
          </div>
          <div class="card" style="padding: 1.5rem; text-align: center;">
            <div style="font-size: 2rem;">📦</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Đơn hàng đã thanh toán</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">{{ data.totalOrders }}</div>
          </div>
          <div class="card" style="padding: 1.5rem; text-align: center;">
            <div style="font-size: 2rem;">📅</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Năm thống kê</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">{{ selectedYear }}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div class="card" style="padding: 1.5rem;">
            <div style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem; color: var(--primary-dark);">
              📅 Doanh thu theo tháng ({{ selectedYear }})
            </div>
            @if(data.revenueByMonth.length === 0) {
              <p style="color: var(--text-muted);">Không có dữ liệu cho năm này</p>
            }
            @for(item of data.revenueByMonth; track item._id.month) {
              <div style="display:flex; justify-content:space-between; padding:0.5rem 0; border-bottom:1px solid var(--border);">
                <span>Tháng {{ item._id.month }}/{{ item._id.year }}</span>
                <div style="text-align:right;">
                  <div style="font-weight:700; color:var(--primary)">{{ formatPrice(item.totalRevenue) }}</div>
                  <div style="font-size:0.78rem; color:var(--text-muted)">{{ item.orderCount }} đơn</div>
                </div>
              </div>
            }
          </div>
          <div class="card" style="padding: 1.5rem;">
            <div style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem; color: var(--primary-dark);">
              🏷️ Doanh thu theo danh mục
            </div>
            @if(data.revenueByCategory.length === 0) {
              <p style="color: var(--text-muted);">Không có dữ liệu</p>
            }
            @for(item of data.revenueByCategory; track item.categoryName) {
              <div style="display:flex; justify-content:space-between; padding:0.5rem 0; border-bottom:1px solid var(--border);">
                <span>{{ item.categoryName }}</span>
                <div style="text-align:right;">
                  <div style="font-weight:700; color:var(--primary)">{{ formatPrice(item.totalRevenue) }}</div>
                  <div style="font-size:0.78rem; color:var(--text-muted)">{{ item.itemsSold }} sản phẩm</div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    }
  `
})
export class RevenueComponent implements OnInit {
  selectedYear = new Date().getFullYear();
  loading = false;
  data: any = null;

  constructor(
    private api: ApiService,
    public authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.authService.isEmployee()) return;
    this.loadRevenue();
  }

  loadRevenue() {
    if (!this.authService.isEmployee()) return;
    this.loading = true;
    this.api.getRevenue(this.selectedYear).subscribe({
      next: (d) => {
        this.data = d;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => { this.loading = false; this.cd.detectChanges(); }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
}
