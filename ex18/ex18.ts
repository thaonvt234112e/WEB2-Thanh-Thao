import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../services/customer-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ex18',
  imports: [CommonModule],
  templateUrl: './ex18.html',
  styleUrl: './ex18.css',
})
export class Ex18 implements OnInit {
  customers: any = [];
  constructor(private cs: CustomerService, private router: Router) {}
  ngOnInit() {
    console.log('ngOnInit called');
    this.cs.GetCustomers().subscribe({
      next: (data) => {
        console.log('Data received:', data);
        this.customers = data;
      },
      error: (err) => {
        console.error('Error loading customers:', err);
      }
    });
  }
}


