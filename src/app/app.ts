import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, CartService } from './services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'Panda Store';
  cartCount = 0;
  cartDropdownOpen = false;
  showCart = false;

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    public router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.updateCartCount();
  }

  updateCartCount() {
    this.cartCount = this.cartService.getCount();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/shopping']);
  }

  getUser() {
    return this.authService.getUser();
  }
}
