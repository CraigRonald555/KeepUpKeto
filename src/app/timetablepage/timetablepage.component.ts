import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, Renderer2, Inject, AfterViewInit } from '@angular/core';
import { TimetableService } from '../timetable.service';

// declare var whisk: any;

@Component({
  selector: 'app-timetablepage',
  templateUrl: './timetablepage.component.html',
  styleUrls: ['./timetablepage.component.css']
})
export class TimetablepageComponent implements OnInit {

  showDaily = true;
  monShow = true;

  allRecipes: {
    day: string,
    show: boolean,
    totalCarbs: number,
    carbsRemaining: number,
    totalProtein: number,
    proteinRemaining: number,
    totalFat: number,
    fatRemaining: number,
    totalCalories: number,
    caloriesRemaining: number,
    noOfRecipes: number,
    // isKetoFriendly: boolean, // Day is not keto friendly
    // notKetoFriendlyReason: string, // Day is not keto friendly reason
    recipes: {
      recipeID: string,
      recipeType: string,
      name: string,
      image: string,
      calories: number,
      carbs: number,
      protein: number,
      fat: number,
      // isKetoFriendly: boolean, // Recipe is not keto friendly
      // notKetoFriendlyReason: string // Recipe is not keto friendly reason
    }[]
  }[];

  todayRecipes: {
    day: string,
    show: boolean,
    caloriesRemaining: number,
    noOfRecipes: number,
    recipes: {
      recipeID: string,
      recipeType: string,
      name: string,
      image: string,
      calories: number,
      carbs: number
    }[]
  };


  constructor(public timetableService: TimetableService, private changeDetector: ChangeDetectorRef ) {

    timetableService.arrayUpdated.subscribe(status => {

      this.allRecipes = timetableService.getAllRecipes();
      this.todayRecipes = timetableService.getTodayRecipes();
      this.changeDetector.detectChanges();

    });

  }

  ngOnInit() {

    this.allRecipes = this.timetableService.getAllRecipes();
    this.todayRecipes = this.timetableService.getTodayRecipes();
    this.changeDetector.detectChanges();

  }

  clear() {

    this.timetableService.clearAll();

  }

  generateTimetable() {

    this.timetableService.generate();

  }

}

// { "day": 'Monday', "show": true, "recipes": [{"time": '09:00', "name": 'Pork Shoulder', "image": 'https://www.seriouseats.com/recipes/images/2015/12/20111204-pork-shoulder%20-%2007.jpg', "carbs": 5}] },
  // { "day": 'Wed', "show": true, "recipes": [{time: '12:00', name: 'Chicken Skewers', image: 'https://www.seriouseats.com/recipes/images/20090901skewers.jpg', carbs: 5}] }
