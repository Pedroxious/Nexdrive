import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellCarComponent } from './sell-car';

describe('SellCarComponent', () => {
  let component: SellCarComponent;
  let fixture: ComponentFixture<SellCarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellCarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SellCarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
