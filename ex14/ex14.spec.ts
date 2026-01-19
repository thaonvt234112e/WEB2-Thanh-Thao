import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ex14 } from './ex14';

describe('Ex14', () => {
  let component: Ex14;
  let fixture: ComponentFixture<Ex14>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ex14]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ex14);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
