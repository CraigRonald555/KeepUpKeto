import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodaytableComponent } from './todaytable.component';

describe('TodaytableComponent', () => {
  let component: TodaytableComponent;
  let fixture: ComponentFixture<TodaytableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodaytableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodaytableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
