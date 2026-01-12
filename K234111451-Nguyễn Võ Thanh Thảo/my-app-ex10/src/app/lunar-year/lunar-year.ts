import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lunar-year',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './lunar-year.html',
  styleUrls: ['./lunar-year.css']
})
export class LunarYearComponent {

  days = Array.from({ length: 31 }, (_, i) => i + 1);
  months = Array.from({ length: 12 }, (_, i) => i + 1);
  years = Array.from({ length: 50 }, (_, i) => 1980 + i);

  day: number = 1;
  month: number = 1;
  year: number = 2024;

  result: string | null = null;

  convert() {
    this.result = `Ngày ${this.day}/${this.month}/${this.year} (Âm lịch)`;
  }
}
