import { Component, OnInit } from '@angular/core';
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
    noOfRecipes: number,
    recipes: {
      recipeType: string,
      name: string,
      image: string,
      carbs: number
    }[]
  };

  currentDay: string = this.timetableService.getDayName();

  constructor(private timetableService: TimetableService) { }

  ngOnInit() {

    this.todayRecipes = this.timetableService.getTodayRecipes();

  }

}
