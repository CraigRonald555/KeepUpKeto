import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, Renderer2, Inject, AfterViewInit, NgZone } from '@angular/core';
import { TimetableService } from '../timetable.service';
import { EdamamService } from '../edamam.service';
import { NgForm } from '@angular/forms';
import { OwlCarousel } from 'ngx-owl-carousel';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { NavigationExtras, Router } from '@angular/router';

// declare var whisk: any;

@Component({
  selector: 'app-timetablepage',
  templateUrl: './timetablepage.component.html',
  styleUrls: ['./timetablepage.component.css']
})
export class TimetablepageComponent implements AfterViewInit {

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
      ingredients: []
      // isKetoFriendly: boolean, // Recipe is not keto friendly
      // notKetoFriendlyReason: string // Recipe is not keto friendly reason
    }[]
  }[];

  todayRecipes: {
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
    recipes: {
      recipeID: string,
      recipeType: string,
      name: string,
      image: string,
      calories: number,
      carbs: number,
      protein: number,
      fat: number,
      ingredients: []
    }[]
  };

  selectedDayIndex = -1;

  addRecipeOption = 0;
  addRecipeButtonsContentSwitch = 'buttons';

  showHelp = false;

  searchForRecipesAdvanced = false;
  useRecommended = true;
  remainingNutrients;

  @ViewChild('searchForRecipesForm') searchForRecipesForm;
  searchFormError = false;
  recipeTypes = ['Select your recipe', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];
  selectedRecipeType;
  searchResults = [];
  pageNumber = 1;
  maxResults = 50;
  maxPage = Math.floor(this.maxResults / 10);
  resultsReturned = -1; // -1 = false, 0 = searching, 1 = returned

  progressBars = {
    carbsPercentage: 0,
    carbsRemaining: 0,
    proteinPercentage: 0,
    proteinRemaining: 0,
    fatPercentage: 0,
    fatRemaining: 0,
    caloriesPercentage: 0,
    caloriesRemaining: 0
  };

  itemsLoaded = false;
  mySlideItems = [];
  @ViewChild('owlElement') owlElement: OwlCarousel;
  myCarouselItems = [];

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
  // myCarouselOptions = {items: 3, dots: false, nav: true};

  addRecipesToTodayCarousel(recipes) {

    // this.itemsLoaded = false;
    // this.owlElement.reInit();

    this.mySlideItems = [];

    for (let i = 0; i < recipes.length; i++) {

      const currentRecipe = recipes[i];
      currentRecipe.recipeTypeHTML = currentRecipe.recipeType.toLowerCase();
      currentRecipe.isRecipe = true;
      this.mySlideItems.push(currentRecipe);

    }

    this.owlElement.reInit();
    // this.owlElement.refresh();

    // this.itemsLoaded = true;

  }


  retrieveRemainingNutrients() {

    // Get a recipePlan for the selected day
    const recipePlanStructure = this.timetableService.getRecipePlanStructure(this.allRecipes[this.selectedDayIndex]);
    console.log(this.allRecipes[this.selectedDayIndex]);
    console.log(recipePlanStructure);
    let remainingCalories = 0; let remainingCarbs = 0; let remainingFat = 0; let remainingProtein = 0;

    // Add all the nutrients for each element in the recipePlan to retrieve the remaining amounts
    recipePlanStructure.forEach(recipePlan => {

      remainingCalories += recipePlan.calories; remainingCarbs += recipePlan.carbs; remainingFat += recipePlan.fat;
      remainingProtein += recipePlan.protein;

    });

    // Get the length of the recipePlan
    const remainingMealsForDay = recipePlanStructure.length;

    // Divide each nutrient by the amount of meals left to be found to figure out how much we can allocate for when a user tries to find a recipe
    remainingCalories = remainingCalories / remainingMealsForDay; remainingCarbs = remainingCarbs / remainingMealsForDay;
    remainingFat = remainingFat / remainingMealsForDay; remainingProtein = remainingProtein / remainingMealsForDay;

    //this.remainingNutrients = this.timetableService.getRemainingNutrients(this.selectedDayIndex);
    this.remainingNutrients = {caloriesRemaining: remainingCalories,
    carbsRemaining: remainingCarbs, fatRemaining: remainingFat, proteinRemaining: remainingProtein };

    console.log(this.remainingNutrients);
    // this.changeDetector.detectChanges();

  }

  navigateToRecipe(recipeID) {

    this.selectedDayIndex = this.timetableService.getDayIndexByName(this.timetableService.getTodayName());

    let navigationExtras: NavigationExtras = {
      queryParams: { 'selectedDayIndex': this.selectedDayIndex, 'recipeID': recipeID }
    };

    // Use ngZone run to remove the silly 'did you forget to run ngZone' error which would break owlCarousel and not actually navigate to recipe page
    this.ngZone.run(() => this.router.navigate(['recipes/'], { queryParams: { 'selectedDayIndex': this.selectedDayIndex, 'recipeID': recipeID }})).then();

  }

  printUseRecommended() {

    console.log("Use recommended: " + this.useRecommended);

  }

  ////////////////////////////////////////////////

  constructor(public timetableService: TimetableService, private edamamService: EdamamService, private router: Router, private changeDetector: ChangeDetectorRef, private ngZone: NgZone ) {

    this.selectedRecipeType = this.recipeTypes[0];
    // window.localStorage.clear();

    timetableService.arrayUpdated.subscribe(status => {

      this.allRecipes = timetableService.getAllRecipes();
      this.todayRecipes = timetableService.getTodayRecipes();

      this.updateProgress();

      this.changeDetector.detectChanges();

    });

  }

  async searchForRecipes() {

    this.searchForRecipesForm.statusChanges.subscribe(status => {

      if (status === 'VALID' && this.selectedRecipeType !== this.recipeTypes[0]) {

        this.searchFormError = false;
        console.log('Search form changed to valid, selectedRecipeType = ' + this.selectedRecipeType);

      } else {

        this.searchFormError = true;
        console.log('Search form changed is invalid, selectedRecipeType = ' + this.selectedRecipeType);

      }

    });

    // If every value of the form has something in it and the selectedRecipeType is not the default value
    if (this.searchForRecipesForm.valid && this.selectedRecipeType !== this.recipeTypes[0]) {

      this.searchFormError = false;

      // Reset pageNumber back to 1
      this.pageNumber = 1;

      const recipeDetails = {
        calories: this.searchForRecipesForm.value.calories,
        carbs: this.searchForRecipesForm.value.carbs,
        protein: this.searchForRecipesForm.value.protein,
        fat: this.searchForRecipesForm.value.fat
      };

      // Set to 0 as this value means the results are being searched for
      this.resultsReturned = 0;
      this.searchResults = await this.edamamService.searchForRecipes(recipeDetails, this.searchForRecipesForm.value.ingredient, this.maxResults);
      this.maxPage = this.searchResults.length;
      this.resultsReturned = 1;
      console.log(`${this.maxPage}`);

      // The form isn't valid or the recipe type hasn't been selected
    } else {

      // Set the form error value to true to show the help bleck
      this.searchFormError = true;

    }

  }

  addRecipeFromSearch(searchRecipesi, searchRecipesj) {

    const recipeToAdd = this.searchResults[searchRecipesi][searchRecipesj];
    recipeToAdd.recipeType = this.selectedRecipeType;
    console.log(recipeToAdd);
    console.log(this.selectedDayIndex);
    this.timetableService.addRecipeToDay(this.selectedDayIndex, recipeToAdd);

  }

  ngAfterViewInit() {

    this.allRecipes = this.timetableService.getAllRecipes();
    this.todayRecipes = this.timetableService.getTodayRecipes();
    // this.updateProgress();

    this.changeDetector.detectChanges();

  }

  updateProgress() {

    this.addRecipesToTodayCarousel(this.todayRecipes.recipes);

    console.log(`Daily Carbs: ${this.timetableService.dailyCarbs}`);
    console.log(`Used Carbs ${this.todayRecipes.totalCarbs}`);
    console.log(`Daily Protein: ${this.timetableService.dailyProtein}`);
    console.log(`Used Protein ${this.todayRecipes.totalProtein}`);
    console.log(`Daily Fat: ${this.timetableService.dailyFat}`);
    console.log(`Used Fat ${this.todayRecipes.totalFat}`);
    console.log(`Daily Calories: ${this.timetableService.dailyCalories}`);
    console.log(`Used Calories: ${this.todayRecipes.totalCalories}`);

    this.progressBars = {
      carbsPercentage: (this.todayRecipes.totalCarbs / this.timetableService.dailyCarbs) * 100,
      carbsRemaining: Math.floor(this.todayRecipes.carbsRemaining),
      proteinPercentage:(this.todayRecipes.totalProtein / this.timetableService.dailyProtein) * 100,
      proteinRemaining: Math.floor(this.todayRecipes.proteinRemaining),
      fatPercentage: (this.todayRecipes.totalFat / this.timetableService.dailyFat) * 100,
      fatRemaining: Math.floor(this.todayRecipes.fatRemaining),
      caloriesPercentage: (this.todayRecipes.totalCalories / this.timetableService.dailyCalories) * 100,
      caloriesRemaining: Math.floor(this.todayRecipes.caloriesRemaining)
    };

    console.log('Progress');
    console.log(this.progressBars);

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
