import { Component } from '@angular/core';
import { LunarYearComponent } from './lunar-year/lunar-year';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LunarYearComponent],
  templateUrl: './app.html'
})
export class App {}
