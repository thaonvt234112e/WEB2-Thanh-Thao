import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ex13 } from './ex13';

describe('Ex13', () => {
  let component: Ex13;
  let fixture: ComponentFixture<Ex13>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ex13]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ex13);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
