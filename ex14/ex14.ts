import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../services/catalog-service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ex14',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './ex14.html',
  styleUrl: './ex14.css',
})
export class Ex14 {
  cate: any;
  constructor(private cs: CatalogService) {
    this.cate=cs.GetCatalog();  
  }

}
