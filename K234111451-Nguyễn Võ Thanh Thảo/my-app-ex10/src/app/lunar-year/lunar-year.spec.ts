import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LunarYear } from './lunar-year';

describe('LunarYear', () => {
  let component: LunarYear;
  let fixture: ComponentFixture<LunarYear>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LunarYear]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LunarYear);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
