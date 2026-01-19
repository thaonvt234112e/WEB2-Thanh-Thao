import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../services/product-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ex13',
  imports: [CommonModule],
  templateUrl: './ex13.html',
  styleUrl: './ex13.css',
})
export class Ex13 implements OnInit {
  products: any = [];
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private ps: ProductService) {}
  
  ngOnInit() {
    this.products = this.ps.GetProducts();
  }
  
  viewDetails(id: any) {
    this.router.navigate(['/ex13', id]);
  }
}
