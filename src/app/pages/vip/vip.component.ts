import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, AuthService } from '../../services';
import { Customer } from '../../models';

@Component({
  selector: 'app-vip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-title">⭐ Khách hàng VIP</div>

    <!-- Kiểm tra quyền (Q12) -->
    @if(!authService.isEmployee()) {
      <div class="alert alert-warning">
        🔒 Chức năng này chỉ dành cho <strong>nhân viên đã đăng nhập</strong>.
      </div>
    }

    @if(authService.isEmployee()) {
      <div class="filter-bar">
        <label style="font-weight:600;">🏆 Số lượng VIP top:</label>
        <select class="form-control" [(ngModel)]="limit" (change)="loadVip()">
          <option [value]="3">Top 3</option>
          <option [value]="5">Top 5</option>
          <option [value]="10">Top 10</option>
        </select>
        <button class="btn btn-primary" (click)="loadVip()">⭐ Xem VIP</button>
      </div>

      @if(loading) { <div class="spinner"></div> }

      @if(!loading) {
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">Hạng</th>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Tổng mua</th>
              </tr>
            </thead>
            <tbody>
              @if(customers.length === 0) {
                <tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 2rem;">
                  Không có dữ liệu
                </td></tr>
              }
              @for(c of customers; track c._id; let i = $index) {
                <tr>
                  <td>
                    @if(i === 0) { <span style="font-size: 1.4rem;">🥇</span> }
                    @else if(i === 1) { <span style="font-size: 1.4rem;">🥈</span> }
                    @else if(i === 2) { <span style="font-size: 1.4rem;">🥉</span> }
                    @else { <span style="font-weight: 700; color: var(--text-muted);">{{ i + 1 }}</span> }
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                      <div style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-light), var(--primary)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.9rem; flex-shrink: 0;">
                        {{ c.name.charAt(0) }}
                      </div>
                      <strong>{{ c.name }}</strong>
                    </div>
                  </td>
                  <td>{{ c.email }}</td>
                  <td>{{ c.phone || '—' }}</td>
                  <td>{{ c.address || '—' }}</td>
                  <td><span style="font-weight: 700; color: var(--primary);">{{ formatPrice(c.totalPurchase || 0) }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    }
  `
})
export class VipComponent implements OnInit {
  customers: Customer[] = [];
  limit = 5;
  loading = false;

  constructor(
    private api: ApiService,
    public authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.authService.isEmployee()) return;
    this.loadVip();
  }

  loadVip() {
    if (!this.authService.isEmployee()) return;
    this.loading = true;
    this.api.getVipCustomers(this.limit).subscribe({
      next: (data) => { this.customers = data; this.loading = false; this.cd.detectChanges(); },
      error: () => { this.loading = false; this.cd.detectChanges(); }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
}
