import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppinglistpageComponent } from './shoppinglistpage.component';

describe('ShoppinglistpageComponent', () => {
  let component: ShoppinglistpageComponent;
  let fixture: ComponentFixture<ShoppinglistpageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShoppinglistpageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppinglistpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
