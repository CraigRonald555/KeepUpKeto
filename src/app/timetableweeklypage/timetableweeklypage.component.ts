import { AfterViewInit, ChangeDetectorRef, Component, NgZone, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { OwlCarousel } from 'ngx-owl-carousel';
import { EdamamService } from '../edamam.service';
import { TimetableService } from '../timetable.service';

@Component({
  selector: 'app-timetableweeklypage',
  templateUrl: './timetableweeklypage.component.html',
  styleUrls: ['./timetableweeklypage.component.css']
})
export class TimetableweeklypageComponent implements AfterViewInit {

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
    isKetoFriendly: boolean, // Day is not keto friendly
    notKetoFriendlyReason: string, // Day is not keto friendly reason
    edamamFoods: {
      foodID: string,
      foodType: string,
      name: string,
      image: string,
      measureType: string,
      quantity: number,
      calories: number,
      carbs: number,
      protein: number,
      fat: number,
      isKetoFriendly: boolean,
      notKetoFriendlyReason: string
    }[],
    edamamRecipes: {
      recipeID: string,
      recipeType: string,
      name: string,
      image: string,
      url: string,
      uri: string,
      calories: number,
      carbs: number,
      protein: number,
      fat: number,
      ingredients: [],
      isKetoFriendly: boolean, // Recipe is not keto friendly
      notKetoFriendlyReason: string // Recipe is not keto friendly reason
    }[]
  }[];

  mySlideOptions = {margin: 5, dots: false, nav: false, responsive: {
    0: {
      items: 1,
      autoplay: false,
    },
      361: {
      items: 2,
      autoplay: false,
    },
    600: {
      items: 2,
      autoplay: false,
    },
    680: {
      items: 3,
      autoplay: false,
    },

  }};

  myCarouselItems = [];
  mySlideItems = [[]];

  @ViewChildren('owlElement') owlElements: QueryList<OwlCarousel>;
  selectedDayIndex;

  progressBars = [
    {carbsPercentage: 0,carbsRemaining: 0,proteinPercentage: 0,proteinRemaining: 0,fatPercentage: 0,fatRemaining: 0,caloriesPercentage: 0,caloriesRemaining: 0},
    {carbsPercentage: 0,carbsRemaining: 0,proteinPercentage: 0,proteinRemaining: 0,fatPercentage: 0,fatRemaining: 0,caloriesPercentage: 0,caloriesRemaining: 0},
    {carbsPercentage: 0,carbsRemaining: 0,proteinPercentage: 0,proteinRemaining: 0,fatPercentage: 0,fatRemaining: 0,caloriesPercentage: 0,caloriesRemaining: 0},
    {carbsPercentage: 0,carbsRemaining: 0,proteinPercentage: 0,proteinRemaining: 0,fatPercentage: 0,fatRemaining: 0,caloriesPercentage: 0,caloriesRemaining: 0},
    {carbsPercentage: 0,carbsRemaining: 0,proteinPercentage: 0,proteinRemaining: 0,fatPercentage: 0,fatRemaining: 0,caloriesPercentage: 0,caloriesRemaining: 0},
    {carbsPercentage: 0,carbsRemaining: 0,proteinPercentage: 0,proteinRemaining: 0,fatPercentage: 0,fatRemaining: 0,caloriesPercentage: 0,caloriesRemaining: 0},
    {carbsPercentage: 0,carbsRemaining: 0,proteinPercentage: 0,proteinRemaining: 0,fatPercentage: 0,fatRemaining: 0,caloriesPercentage: 0,caloriesRemaining: 0}
  ];

  constructor(public timetableService: TimetableService, private edamamService: EdamamService, private router: Router, private changeDetector: ChangeDetectorRef, private ngZone: NgZone ) {

    // this.selectedRecipeType = this.recipeTypes[0];

    timetableService.arrayUpdated.subscribe(status => {

      this.allRecipes = timetableService.getAllRecipes();

      this.updateProgress();
      console.log(this.owlElements);

      this.changeDetector.detectChanges();

    });

  }

  generate() {

    this.timetableService.generate();

  }

  clearAll() {

    this.timetableService.clearAll();

  }

  updateProgress() {

    for (let i = 0; i < this.allRecipes.length; i++) {

      const currentDayWithRecipes = this.allRecipes[i];

      this.addMealsToCarousel(i, currentDayWithRecipes.edamamRecipes, currentDayWithRecipes.edamamFoods);

      this.progressBars[i] = {
        carbsPercentage: (currentDayWithRecipes.totalCarbs / this.timetableService.dailyCarbs) * 100,
        carbsRemaining: Math.floor(currentDayWithRecipes.carbsRemaining),
        proteinPercentage: (currentDayWithRecipes.totalProtein / this.timetableService.dailyProtein) * 100,
        proteinRemaining: Math.floor(currentDayWithRecipes.proteinRemaining),
        fatPercentage: (currentDayWithRecipes.totalFat / this.timetableService.dailyFat) * 100,
        fatRemaining: Math.floor(currentDayWithRecipes.fatRemaining),
        caloriesPercentage: (currentDayWithRecipes.totalCalories / this.timetableService.dailyCalories) * 100,
        caloriesRemaining: Math.floor(currentDayWithRecipes.caloriesRemaining)
      }

    }

    console.log('Progress');
    console.log(this.progressBars);

  }

  async removeMealFromDay(dayName, edamamType, mealID) {

    await this.timetableService.removeRecipeByMealTypeAndID(dayName, edamamType, mealID);

  }

  addMealsToCarousel(dayIndex, recipes, foods) {

    // Resets/Initialise array for this day
    this.mySlideItems[dayIndex] = [];

    let mergedFoodsRecipes = foods.concat(recipes);

    for (let i = 0; i < mergedFoodsRecipes.length; i++) {

      const currentMeal = mergedFoodsRecipes[i];

      if (currentMeal.recipeType === undefined) {

        console.log(`Food type: ${currentMeal.foodType}`);
        currentMeal.mealType = currentMeal.foodType;
        currentMeal.edamamType = 'food';
        currentMeal.genericID = currentMeal.foodID;

      } else {

        console.log(`Recipe type: ${currentMeal.recipeType}`);
        currentMeal.mealType = currentMeal.recipeType;
        currentMeal.edamamType = 'recipe';
        currentMeal.genericID = currentMeal.recipeID;

      }

      currentMeal.mealTypeHTML = currentMeal.mealType.toLowerCase();

      // Remove any numbers (mainly for meal plans which include 'Snack 1' & 'Snack 2') as this messes up the carousel css class which uses
      // this variable to grab the snack image
      currentMeal.mealTypeHTML = currentMeal.mealTypeHTML.replace(/[0-9]/g, '');
      currentMeal.mealTypeHTML = currentMeal.mealTypeHTML.trim();

      this.mySlideItems[dayIndex].push(currentMeal);

    }

    try {
      const owlElementsArray = this.owlElements.toArray();
      owlElementsArray[dayIndex].reInit();
    } catch (error) {
      console.log(error);
    }

  }

  navigateToRecipe(recipeID, dayIndex) {

    this.selectedDayIndex = dayIndex;

    // Use ngZone run to remove the silly 'did you forget to run ngZone' error which would break owlCarousel and not actually navigate to recipe page
    this.ngZone.run(() => this.router.navigate(['recipes/'], { queryParams: { 'selectedDayIndex': this.selectedDayIndex, 'recipeID': recipeID }})).then();

  }

  ngAfterViewInit(): void {

    this.allRecipes = this.timetableService.getAllRecipes();
    this.updateProgress();

    this.changeDetector.detectChanges();

  }

}
