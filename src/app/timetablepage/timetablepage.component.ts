import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, Renderer2, Inject, AfterViewInit } from '@angular/core';
import { TimetableService } from '../timetable.service';
import { EdamamService } from '../edamam.service';
import { NgForm } from '@angular/forms';
// import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

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
      carbs: number,
      protein: number,
      fat: number,
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

    mySlideItems = [];

    myCarouselItems = [];

    mySlideOptions = {margin: 20, dots: false, nav: false, responsive: {
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
    //myCarouselOptions = {items: 3, dots: false, nav: true};

    addRecipeToCarousel(recipe) {

      recipe = {
        recipeID: '12891289',
        recipeType: 'Breakfast',
        recipeTypeHTML: 'breakfast',
        name: 'Chicken Avocado ',
        image: 'nvm',
        calories: 50,
        carbs: 12,
        protein: 40,
        fat: 10,
      };

      const recipe2 = {
        recipeID: '12891289',
        recipeType: 'Lunch',
        recipeTypeHTML: 'lunch',
        name: 'Chicken Avocado ',
        image: 'nvm',
        calories: 50,
        carbs: 12,
        protein: 40,
        fat: 10,
      };
      const recipe3 = {
        recipeID: '12891289',
        recipeType: 'Snack',
        recipeTypeHTML: 'snack',
        name: 'Chicken Avocado ',
        image: 'nvm',
        calories: 50,
        carbs: 12,
        protein: 40,
        fat: 10,
      };
      const recipe4 = {
        recipeID: '12891289',
        recipeType: 'Dinner',
        recipeTypeHTML: 'dinner',
        name: 'Lorem ipsum dolor sit amet, consectetur',
        image: 'nvm',
        calories: 50,
        carbs: 12,
        protein: 40,
        fat: 10,
      };

      this.mySlideItems.push(recipe);
      this.mySlideItems.push(recipe2);
      this.mySlideItems.push(recipe3);
      this.mySlideItems.push(recipe4);

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

    printUseRecommended() {

      console.log("Use recommended: " + this.useRecommended);

    }

    ////////////////////////////////////////////////

  constructor(public timetableService: TimetableService, private edamamService: EdamamService, private changeDetector: ChangeDetectorRef ) {

    this.selectedRecipeType = this.recipeTypes[0];

    this.addRecipeToCarousel('Recipe object would be here');

    timetableService.arrayUpdated.subscribe(status => {

      this.allRecipes = timetableService.getAllRecipes();
      this.todayRecipes = timetableService.getTodayRecipes();
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
