import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimetableweeklypageComponent } from './timetableweeklypage.component';

describe('TimetableweeklypageComponent', () => {
  let component: TimetableweeklypageComponent;
  let fixture: ComponentFixture<TimetableweeklypageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimetableweeklypageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimetableweeklypageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
