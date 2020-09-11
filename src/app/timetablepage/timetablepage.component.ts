import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, Renderer2, Inject, AfterViewInit } from '@angular/core';
import { TimetableService } from '../timetable.service';
import { EdamamService } from '../edamam.service';
import { NgForm } from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

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

    selectedDayIndex = -1;

    addRecipeOption = 0;
    addRecipeButtonsContentSwitch = 'buttons';

    showHelp = false;

    searchForRecipesAdvanced = false;
    useRecommended = true;
    remainingNutrients;
    recommendedNutrientsForSelectedDay = { calories: 0, carbs: 0, fat: 0, protein: 0 };

    @ViewChild('searchForRecipesForm') searchForRecipesForm;
    selectedRecipeType;
    searchResults = [];
    pageNumber = 1;
    maxResults = 50;
    maxPage = Math.floor(this.maxResults / 10);
    resultsReturned = -1; // -1 = false, 0 = searching, 1 = returned

    retrieveRemainingNutrients() {

      this.remainingNutrients = this.timetableService.getRemainingNutrients(this.selectedDayIndex);
      this.recommendedNutrientsForSelectedDay = {calories: this.remainingNutrients.caloriesRemaining, carbs: this.remainingNutrients.carbsRemaining,
      fat: this.remainingNutrients.fatRemaining, protein: this.remainingNutrients.proteinRemaining};
      console.log(this.remainingNutrients);
      // this.changeDetector.detectChanges();

    }

    printUseRecommended() {

      console.log("Use recommended: " + this.useRecommended);

    }

    ////////////////////////////////////////////////

  constructor(public timetableService: TimetableService, private edamamService: EdamamService, private changeDetector: ChangeDetectorRef ) {

    timetableService.arrayUpdated.subscribe(status => {

      this.allRecipes = timetableService.getAllRecipes();
      this.todayRecipes = timetableService.getTodayRecipes();
      this.changeDetector.detectChanges();

    });

  }

  async searchForRecipes() {

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
