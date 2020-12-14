import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, Renderer2, Inject, AfterViewInit, NgZone, QueryList } from '@angular/core';
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

  // An array of all the recipes in the timetable
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
      contents: [],
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
    edamamFoods: {
      foodID: string,
      foodType: string,
      name: string,
      image: string,
      contents: [],
      measureType: string,
      quantity: number,
      calories: number,
      carbs: number,
      protein: number,
      fat: number
    }[],
    edamamRecipes: {
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

  timetableLoading = false;

  showMealAddedNotification = false;
  selectedDayIndex = -1;

  // Determines what is being shown in the Modal Box
  formStep = 0;
  @ViewChild('closeMainModalButton') public closeMainModalButton: ElementRef; // Used to close Main Modal programtically

  // Search for Recipes, Foods options etc. page
  showHelp = false;

  // Select meal type (breafast, snack, lunch, dinner)
  selectedMealType; // Breakfast, Snack, Lunch, Dinner

  // Search for Recipes
  searchForRecipesAdvanced = false;
  useRecommended = true;
  remainingNutrients;

  // Add food modal
  @ViewChild('closeAddFoodModal') public closeAddFoodModal: ElementRef;
  nutrientsReturned = -1; // -1 = false, 0 = searching, 1 = returned
  quantityDisplay = 100;
  measureTypeDisplay = 'Gram';

  // Search food modal
  @ViewChild('searchForFoodsForm') searchForFoodsForm;
  searchFoodFormError = false;
  foodResultsReturned = -1; // -1 = false, 0 = searching, 1 = returned
  foodPageNumber = 1;
  foodSearchResults = [];
  selectedMeasureType;
  selectedFood = {foodId: '', foodType: '', name: '', image: '', contents: [], calories: 0, carbs: 0, protein: 0, fat: 0, measures: [], defaultMeasure: 'Grams', defaultQuantity: 100, defaultCalories: 0, defaultCarbs: 0, defaultFat: 0, defaultProtein: 0}; // Used for Add Food Modal

  // Search recipe modal
  @ViewChild('searchForRecipesForm') searchForRecipesForm;
  searchFormError = false;
  recipeResultsReturned = -1; // -1 = false, 0 = searching, 1 = returned
  recipeSearchResults = [];
  recipePageNumber = 1;
  maxResults = 50;
  maxPage = Math.floor(this.maxResults / 10);

  // Used to remove food
  selectedMeal: {
    dayName: string,
    edamamType: string,
    mealID: string,
    mealName: string,
    mealType: string
  } = { dayName: 'Default', edamamType: 'Default', mealID: "Default", mealName: "Default", mealType: "Default"};

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

  mySlideItems = [];
  @ViewChild('owlElement') owlElement: OwlCarousel;
  myCarouselItems = [];

  mySlideOptions = {margin: 5, dots: false, nav: false};
  // myCarouselOptions = {items: 3, dots: false, nav: true};

  addMealsToTodayCarousel(recipes, foods) {

    // Reset the slide items
    this.mySlideItems = [];

    // let mergedFoodsRecipes = recipes.concat(foods);
    let mergedFoodsRecipes: {
      genericID: string,
      name: string,
      image: string,
      mealTypeHTML: string,
      edamamType: string,
      mealType: string,
      calories: number,
      carbs: number,
      fat: number,
      protein: number,

      measureType: string,
      quantity: number,

      uri: string,
      url: string,
      ingredients: []
    }[] = [];

    for (let i = 0; i < recipes.length; i++) {

      const currentRecipe = recipes[i];

      const mealToAdd: {
        genericID: string,
        name: string,
        image: string,
        mealTypeHTML: string,
        edamamType: string,
        mealType: string,
        calories: number,
        carbs: number,
        fat: number,
        protein: number,

        measureType: string,
        quantity: number,

        uri: string,
        url: string,
        ingredients: []

      } = {
        genericID: currentRecipe.recipeID,
        name: currentRecipe.name,
        image: currentRecipe.image,
        mealTypeHTML: currentRecipe.recipeType,
        edamamType: 'recipe',
        mealType: currentRecipe.recipeType,
        calories: currentRecipe.calories,
        carbs: currentRecipe.carbs,
        fat: currentRecipe.fat,
        protein: currentRecipe.protein,

        measureType: undefined,
        quantity: undefined,

        uri: currentRecipe.uri,
        url: currentRecipe.url,
        ingredients: currentRecipe.ingredients

      };

      mergedFoodsRecipes.push(mealToAdd);

    }

    for (let i = 0; i < foods.length; i++) {

      console.log('Reached foods loop');

      const currentFood = foods[i];

      const mealToAdd: {
        genericID: string,
        name: string,
        image: string,
        mealTypeHTML: string,
        edamamType: string,
        mealType: string,
        calories: number,
        carbs: number,
        fat: number,
        protein: number,

        measureType: string,
        quantity: number,

        uri: string,
        url: string,
        ingredients: []

      } = {
        genericID: currentFood.foodID,
        name: currentFood.name,
        image: currentFood.image,
        mealTypeHTML: currentFood.foodType,
        edamamType: 'food',
        mealType: currentFood.foodType,
        calories: currentFood.calories,
        carbs: currentFood.carbs,
        fat: currentFood.fat,
        protein: currentFood.protein,

        measureType: undefined,
        quantity: undefined,

        uri: currentFood.uri,
        url: currentFood.url,
        ingredients: currentFood.ingredients

      };

      mergedFoodsRecipes.push(mealToAdd);

    }

    console.log("mergedFoodsRecipes: ");
    console.log(mergedFoodsRecipes);

    // console.log('Merged recipes & foods in Carousel');
    // console.log(mergedFoodsRecipes);

    for (let i = 0; i < mergedFoodsRecipes.length; i++) {

      const currentMeal = mergedFoodsRecipes[i];

      currentMeal.mealTypeHTML = currentMeal.mealType.toLowerCase();

      // Remove any numbers (mainly for meal plans which include 'Snack 1' & 'Snack 2') as this messes up the carousel css class which uses
      // this variable to grab the snack image
      currentMeal.mealTypeHTML = currentMeal.mealTypeHTML.replace(/[0-9]/g, '');
      currentMeal.mealTypeHTML = currentMeal.mealTypeHTML.trim();

      console.log(`mealType = ${currentMeal.mealType.toLowerCase()} | mealTypeHTML: ${currentMeal.mealTypeHTML}`);

      console.log("Current meal before adding to array: ")
      console.log(currentMeal);
      this.mySlideItems.push(currentMeal);

    }

    // Renitialise the owlElement
    this.owlElement.reInit();

    console.log(this.owlElement);

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

  navigateToMeal(genericID, edamamType) {

    this.selectedDayIndex = this.timetableService.getDayIndexByName(this.timetableService.getTodayName());

    if (edamamType === 'recipe') {

      // Use ngZone run to remove the silly 'did you forget to run ngZone' error which would break owlCarousel and not actually navigate to recipe page
      this.ngZone.run(() => this.router.navigate(['recipes/'], { queryParams: { 'selectedDayIndex': this.selectedDayIndex, 'recipeID': genericID }})).then();

    } else {

        // Use ngZone run to remove the silly 'did you forget to run ngZone' error which would break owlCarousel and not actually navigate to recipe page
        this.ngZone.run(() => this.router.navigate(['foods/'], { queryParams: { 'selectedDayIndex': this.selectedDayIndex, 'foodID': genericID }})).then();

    }

  }

  constructor(public timetableService: TimetableService, private edamamService: EdamamService, private router: Router, private changeDetector: ChangeDetectorRef, private ngZone: NgZone ) {

    // window.localStorage.clear();

    timetableService.arrayUpdated.subscribe(status => {

      this.allRecipes = timetableService.getAllRecipes();
      this.todayRecipes = timetableService.getTodayRecipes();

      this.updateProgress();

      try {
        this.changeDetector.detectChanges();
      } catch (error) {
        console.log(error);
      }

    });

    timetableService.loading.subscribe(status => {

      if (status === true) {
        this.timetableLoading = true;
      } else {
        this.timetableLoading = false;
        this.updateProgress();
      }

    });

  }

  async removeMealFromDay(dayName, edamamType, mealID) {

    await this.timetableService.removeRecipeByMealTypeAndID(dayName, edamamType, mealID);

  }

  async updateFoodNutrients(measureForm: NgForm) {

    // Make sure there's a value in the quantity textbox before searching for nutrients
    if (measureForm.value.quantity !== null && measureForm.value.quantity > 0) {

      console.log(this.selectedFood.foodId);
      console.log(this.edamamService.getMeasureURL(this.selectedMeasureType));
      console.log(measureForm);

      this.nutrientsReturned = 0;

      // this.selectedFood.defaultMeasure = this.selectedMeasureType;
      // this.selectedFood.defaultQuantity = measureForm.value.quantity;

      this.quantityDisplay = measureForm.value.quantity;
      this.measureTypeDisplay = this.selectedMeasureType;

      const returnNutrients = await this.edamamService.getFoodNutrients
        (this.selectedFood.foodId,
        this.edamamService.getMeasureURL(this.selectedMeasureType),
        measureForm.value.quantity);

      this.selectedFood.calories = returnNutrients.calories;
      this.selectedFood.carbs = returnNutrients.carbs;
      this.selectedFood.protein = returnNutrients.protein;
      this.selectedFood.fat = returnNutrients.fat;

      this.nutrientsReturned = 1;

      console.log(returnNutrients);

      this.changeDetector.detectChanges();

    }

  }

  goBackMainModal() {

    // As the form steps greater than 2 still proceed step 2, we have to go back to step 2 whenever someone goes back from a step greater than 2
    switch (true) {

      // If we're on the addFood (nutrients) step
      case this.formStep === 4.1:
        // Go back to search for foods step
        this.nutrientsReturned = -1;
        this.formStep = 4;
        this.quantityDisplay = 100;
        console.log('Gone back to formStep 4');
        break;


      case this.formStep <= 2:
        this.formStep = this.formStep - 1;
        break;

      case this.formStep >= 3:
        this.formStep = 2;

        // Reset the search variables
        this.recipeResultsReturned = -1;
        this.recipeSearchResults = [];
        this.foodResultsReturned = -1;
        this.foodSearchResults = [];

        break;

    }

  }

  closeMainModal(saveState) {

    // saveState is passed so we can also close the mainModal without losing the state
    if (!saveState) {

      // Reset form variables
      this.showHelp = false;
      this.formStep = 0;

      // Reset the search variables
      this.recipeResultsReturned = -1;
      this.recipeSearchResults = [];

      this.foodResultsReturned = -1;
      this.foodSearchResults = [];
      this.quantityDisplay = 100;
      this.nutrientsReturned = -1;

    }


  }

  switchBackToMainModal() {

    this.closeAddFoodModal.nativeElement.click();

  }

  async selectMeal(dayName, meal) {

    console.log(dayName);

    this.selectedMeal.dayName = dayName;
    this.selectedMeal.edamamType = meal.edamamType;
    this.selectedMeal.mealID = meal.genericID;
    this.selectedMeal.mealName = meal.name;
    this.selectedMeal.mealType = meal.mealType;

    this.changeDetector.detectChanges();
    // this.timetableService.removeRecipeByMealTypeAndID()

  }



  async selectFood(foodRecipesi, foodRecipesj) {

    // this.closeMainModalButton.nativeElement.click();

    this.selectedFood = this.foodSearchResults[foodRecipesi][foodRecipesj];
    this.selectedMeasureType = this.selectedFood.measures[0].label;

    console.log(this.selectedFood);

  }

  async searchForFoods() {

    this.searchForFoodsForm.statusChanges.subscribe(status => {

      if (status === 'VALID') {

        this.searchFoodFormError = false;

      } else {

        this.searchFoodFormError = true;

      }

    });

    // If every form input is valid
    if (this.searchForFoodsForm.valid) {

      // Reset pageNumber back to 1
      this.foodPageNumber = 1;

      this.foodResultsReturned = 0;
      this.foodSearchResults = await this.edamamService.searchForFoods(this.searchForFoodsForm.value.food);
      this.maxPage = this.foodSearchResults.length;
      this.foodResultsReturned = 1;
      console.log(`${this.maxPage}`);

    } else {

      // Set the form error value to true to show the help bleck
      this.searchFoodFormError = true;

    }

  }

  // Executed when user performs search for recipes
  async searchForRecipes() {

    this.searchForRecipesForm.statusChanges.subscribe(status => {

      if (status === 'VALID') {

        this.searchFormError = false;

      } else {

        this.searchFormError = true;

      }

    });

    // If every form input is valid
    if (this.searchForRecipesForm.valid) {

      this.searchFormError = false;

      // Reset pageNumber back to 1
      this.recipePageNumber = 1;

      const recipeDetails = {
        calories: this.searchForRecipesForm.value.calories,
        carbs: this.searchForRecipesForm.value.carbs,
        protein: this.searchForRecipesForm.value.protein,
        fat: this.searchForRecipesForm.value.fat
      };

      // Set to 0 as this value means the results are being searched for
      this.recipeResultsReturned = 0;
      this.recipeSearchResults = await this.edamamService.searchForRecipes(recipeDetails, this.searchForRecipesForm.value.ingredient, this.maxResults);
      this.maxPage = this.recipeSearchResults.length;
      this.recipeResultsReturned = 1;
      console.log(`${this.maxPage}`);

      // The form isn't valid or the recipe type hasn't been selected
    } else {

      // Set the form error value to true to show the help bleck
      this.searchFormError = true;

    }

  }

  async addRecipeFromSearch(searchRecipesi, searchRecipesj) {

    const recipeToAdd = this.recipeSearchResults[searchRecipesi][searchRecipesj];
    recipeToAdd.recipeType = this.selectedMealType;
    console.log(recipeToAdd);
    console.log(this.selectedDayIndex);
    this.timetableService.addRecipeToDay(this.selectedDayIndex, recipeToAdd);
    this.closeMainModalButton.nativeElement.click();

    // Trigger notification
    this.showMealAddedNotification = true;
    setTimeout(() => this.showMealAddedNotification = false, 2000);

  }

  async addFoodFromSearch() {

    const foodToAdd = {
      foodID: this.selectedFood.foodId,
      foodType: this.selectedMealType,
      name: this.selectedFood.name,
      image: this.selectedFood.image,
      contents: this.selectedFood.contents,
      measureType: this.measureTypeDisplay,
      quantity: this.quantityDisplay,
      calories: this.selectedFood.calories,
      carbs: this.selectedFood.carbs,
      protein: this.selectedFood.protein,
      fat: this.selectedFood.fat
    };
    console.log("Food to add: ");
    console.log(foodToAdd);
    console.log(this.selectedDayIndex);
    await this.timetableService.addFoodToDay(this.selectedDayIndex, foodToAdd);
    this.closeMainModalButton.nativeElement.click();

    // Trigger notification
    this.showMealAddedNotification = true;
    setTimeout(() => this.showMealAddedNotification = false, 2000);

  }

  ngAfterViewInit() {

    console.log("ngAfterViewInit() executed");

    this.allRecipes = this.timetableService.getAllRecipes();
    this.todayRecipes = this.timetableService.getTodayRecipes();
    this.updateProgress();

    this.changeDetector.detectChanges();

  }

  updateProgress() {

    this.addMealsToTodayCarousel(this.todayRecipes.edamamRecipes, this.todayRecipes.edamamFoods);

    // console.log(`Daily Carbs: ${this.timetableService.dailyCarbs}`);
    // console.log(`Used Carbs ${this.todayRecipes.totalCarbs}`);
    // console.log(`Daily Protein: ${this.timetableService.dailyProtein}`);
    // console.log(`Used Protein ${this.todayRecipes.totalProtein}`);
    // console.log(`Daily Fat: ${this.timetableService.dailyFat}`);
    // console.log(`Used Fat ${this.todayRecipes.totalFat}`);
    // console.log(`Daily Calories: ${this.timetableService.dailyCalories}`);
    // console.log(`Used Calories: ${this.todayRecipes.totalCalories}`);

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

    // console.log('Progress');
    // console.log(this.progressBars);

  }

  clear() {

    this.timetableService.clearAll();

  }

  generateTimetable() {

    console.log("Started generating");

    this.timetableService.generate();

  }

}

// { "day": 'Monday', "show": true, "recipes": [{"time": '09:00', "name": 'Pork Shoulder', "image": 'https://www.seriouseats.com/recipes/images/2015/12/20111204-pork-shoulder%20-%2007.jpg', "carbs": 5}] },
  // { "day": 'Wed', "show": true, "recipes": [{time: '12:00', name: 'Chicken Skewers', image: 'https://www.seriouseats.com/recipes/images/20090901skewers.jpg', carbs: 5}] }
