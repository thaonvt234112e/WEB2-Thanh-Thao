import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ex18 } from './ex18';

describe('Ex18', () => {
  let component: Ex18;
  let fixture: ComponentFixture<Ex18>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ex18]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ex18);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
