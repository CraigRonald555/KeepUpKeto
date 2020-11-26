import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TimetableService } from '../timetable.service';

@Component({
  selector: 'app-food',
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.css']
})
export class FoodComponent {

  foodDetails;
  dataLoaded = false;

  progressBars = {
    carbsPercentage: 0,
    carbsTotal: 0,
    carbsDaily: 0,
    proteinPercentage: 0,
    proteinTotal: 0,
    proteinDaily: 0,
    fatPercentage: 0,
    fatTotal: 0,
    fatDaily: 0,
    caloriesPercentage: 0,
    caloriesTotal: 0,
    caloriesDaily: 0
  };

  constructor(private timetableService: TimetableService, private router: Router, private route: ActivatedRoute, private ngZone: NgZone ,private changeDetector: ChangeDetectorRef) {

    if (this.timetableService.dataLoaded) {

      // Retrieve food details

      const selectedDayWithFoods = this.timetableService.getDayByIndex(+this.route.snapshot.queryParams.selectedDayIndex).edamamFoods;
      console.log(selectedDayWithFoods);

      this.foodDetails = this.findFoodInFoodsArray(selectedDayWithFoods, this.route.snapshot.queryParams['foodID']);
      console.log(this.foodDetails);

      this.fillProgressBars();
      this.dataLoaded = true;

  }

    this.timetableService.arrayUpdated.subscribe(status => {

      // If the params change whilst user is on food page (e.g. if they refresh)
      this.route.queryParams.subscribe((params: Params) => {

        // Convert selectedDayIndex back to integer using '+' before the variable
        const selectedDayWithFoods = this.timetableService.getDayByIndex(+params['selectedDayIndex']).edamamFoods;

        console.log(selectedDayWithFoods);

        console.log(`Query params: ${params['selectedDayIndex']} and ${params['foodID']}`);

        this.foodDetails = this.findFoodInFoodsArray(selectedDayWithFoods, params['foodID']);

        this.fillProgressBars();
        this.dataLoaded = true;

      });


      this.changeDetector.detectChanges();

    });

  }

  fillProgressBars() {

    // Fill in progress bars

    this.progressBars = {
      carbsPercentage: (this.foodDetails.carbs / this.timetableService.dailyCarbs) * 100,
      carbsTotal: this.foodDetails.carbs,
      carbsDaily: this.timetableService.dailyCarbs,
      proteinPercentage: (this.foodDetails.protein / this.timetableService.dailyProtein) * 100,
      proteinTotal: this.foodDetails.protein,
      proteinDaily: this.timetableService.dailyProtein,
      fatPercentage: (this.foodDetails.fat / this.timetableService.dailyFat) * 100,
      fatTotal: this.foodDetails.fat,
      fatDaily: this.timetableService.dailyFat,
      caloriesPercentage: (this.foodDetails.calories / this.timetableService.dailyCalories) * 100,
      caloriesTotal: this.foodDetails.calories,
      caloriesDaily: this.timetableService.dailyCalories,

    }

  }

  findFoodInFoodsArray(foodsArray, foodIDToFind) {

    let foundFood = '';

    // Loop through foodsArray
    for (let i = 0; i < foodsArray.length; i++) {

      // The current food in array
      const currentFood = foodsArray[i];

      // If the current food's ID is equal to the one passed (usually from params) then assign it to the foundFood
      if (currentFood.foodID === foodIDToFind) {

        foundFood = currentFood;

      }

    }

    return foundFood;

  }

  // navigateToIntructions() {

  //   // Use ngZone run to remove the silly 'did you forget to run ngZone' error which would break owlCarousel and not actually navigate to recipe page
  //   this.ngZone.run(() => this.router.navigate(['instructions/'], { queryParams: { 'url': this.recipeDetails.url}})).then();

  // }

}
