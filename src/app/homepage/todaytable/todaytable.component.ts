import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TimetableService } from 'src/app/timetable.service';
import { stringify } from 'querystring';

@Component({
  selector: 'app-todaytable',
  templateUrl: './todaytable.component.html',
  styleUrls: ['./todaytable.component.css']
})
export class TodaytableComponent implements OnInit {

  todayRecipes: {
    day: string,
    show: boolean,
    caloriesRemaining: number,
    edamamRecipes: {
      recipeType: string,
      name: string,
      image: string,
      carbs: number
    }[]
  };

  currentDay: string;

  constructor(private timetableService: TimetableService, private changeDetector: ChangeDetectorRef) {

  }

  ngOnInit() {

    this.todayRecipes = this.timetableService.getTodayRecipes();
    this.currentDay = this.timetableService.getTodayName();
    this.changeDetector.detectChanges();
    console.log(this.currentDay);

  }

}
