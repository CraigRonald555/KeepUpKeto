import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MealsForTodayComponent } from './meals-for-today.component';

describe('MealsForTodayComponent', () => {
  let component: MealsForTodayComponent;
  let fixture: ComponentFixture<MealsForTodayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MealsForTodayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MealsForTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
