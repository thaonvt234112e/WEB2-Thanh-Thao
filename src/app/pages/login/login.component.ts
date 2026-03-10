import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, AuthService } from '../../services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width: 440px; margin: 3rem auto;">
      <div class="card" style="padding: 2rem;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🐼</div>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--primary-dark);">Đăng nhập</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Panda Store</p>
        </div>

        <!-- Role select -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
          <button class="btn" [class.btn-primary]="role === 'customer'"
                  [class.btn-outline]="role !== 'customer'"
                  style="flex: 1;" (click)="role = 'customer'">
            👤 Khách hàng
          </button>
          <button class="btn" [class.btn-primary]="role === 'employee'"
                  [class.btn-outline]="role !== 'employee'"
                  style="flex: 1;" (click)="role = 'employee'">
            👔 Nhân viên
          </button>
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="font-weight:600; font-size:0.88rem; color: var(--text-muted); margin-bottom: 0.3rem; display: block;">Email</label>
          <input class="form-control" type="email" [(ngModel)]="email" placeholder="email@example.com"
                 style="width: 100%;" (keyup.enter)="login()" />
        </div>
        <div style="margin-bottom: 1.5rem;">
          <label style="font-weight:600; font-size:0.88rem; color: var(--text-muted); margin-bottom: 0.3rem; display: block;">Mật khẩu</label>
          <input class="form-control" type="password" [(ngModel)]="password" placeholder="••••••••"
                 style="width: 100%;" (keyup.enter)="login()" />
        </div>

        @if(errorMsg) {
          <div class="alert" style="background: #ffd6d6; color: #c0392b; margin-bottom: 1rem;">{{ errorMsg }}</div>
        }

        <button class="btn btn-primary" style="width: 100%; padding: 0.8rem; font-size: 1rem;"
                (click)="login()" [disabled]="loading">
          @if(loading) { ⏳ Đang đăng nhập... }
          @else { 🔑 Đăng nhập }
        </button>

        <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg); border-radius: var(--radius-sm); font-size: 0.82rem;">
          <strong>🧪 Tài khoản test:</strong>
          <div style="margin-top: 0.4rem; color: var(--text-muted);">
            <div>Khách: <code>hoa&#64;gmail.com</code> / <code>customer123</code></div>
            <div>Nhân viên: <code>an.nguyen&#64;pandastore.com</code> / <code>employee123</code></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  role: 'customer' | 'employee' = 'customer';
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Vui lòng nhập đầy đủ email và mật khẩu.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    const obs$ = this.role === 'customer'
      ? this.api.loginCustomer(this.email, this.password)
      : this.api.loginEmployee(this.email, this.password);

    obs$.subscribe({
      next: (res) => {
        this.authService.setUser({ ...res.user, token: res.token });
        this.loading = false;
        this.router.navigate(['/shopping']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Đăng nhập thất bại. Kiểm tra lại email/mật khẩu.';
      }
    });
  }
}
