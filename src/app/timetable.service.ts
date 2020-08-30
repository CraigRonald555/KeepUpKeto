import { OnInit, EventEmitter, Injectable} from '@angular/core';
import { AccountService } from './account.service';
import {HttpClient} from '@angular/common/http';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { EdamamService } from './edamam.service';

@Injectable()
export class TimetableService {

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
    recipes: {
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
      isKetoFriendly: boolean, // Recipe is not keto friendly
      notKetoFriendlyReason: string // Recipe is not keto friendly reason
    }[]
  }[];


  currentDate = new Date();
  currentDayIndex = this.currentDate.getDay(); // with Index on the end because it returns an ID not the actual name
  arrayUpdated = new EventEmitter<string>();
  dayToAddRecipeTo = -1; // This value gets updated in the timetablepage.component (currently)

  // Get user's daily calorie and macro requirements from accountDetails service
  dailyCalories;
  dailyCarbs;
  dailyProtein;
  dailyFat;

  userIngredients;
  baseIngredients = ['chicken', 'beef', 'ribs', 'fish', 'pork', 'fish', 'lamb', 'veal', 'eggs', 'avocado', 'nuts', 'berries'];

  constructor(private accountService: AccountService, private auth: AuthService, private edamam: EdamamService, private storageService: StorageService) {

    // window.localStorage.clear();

    // Make sure allRecipes is initiated
    if (typeof this.allRecipes === 'undefined') {
      this.allRecipes = [];
    }

    this.accountService.accountDetailsUpdated.subscribe(async status => {

      console.log(window.localStorage);

      this.dailyCalories = this.accountService.accountDetails.dailyCalories;
      this.dailyCarbs = this.accountService.accountDetails.macros.carbs;
      this.dailyProtein = this.accountService.accountDetails.macros.protein;
      this.dailyFat = this.accountService.accountDetails.macros.fat;
      this.userIngredients = this.accountService.accountDetails.ingredientPreferences;

      this.auth.listenToTimetableChanges(this.accountService.getUserID());
      await this.checkStorage();
      this.updateWeeklyTotals();

      console.log('Updated account details in timetable service');

    });

  }

  activateDayChangeListeners() {

    this.auth.mondayChanged.subscribe(async snapshotValue => {console.log(snapshotValue); await this.checkStorage(); this.storageService.setDayIsUpToDate('Monday', true); });
    this.auth.tuesdayChanged.subscribe(async snapshotValue => {console.log(snapshotValue); await this.checkStorage(); this.storageService.setDayIsUpToDate('Tuesday', true); });
    this.auth.wednesdayChanged.subscribe(async snapshotValue => {console.log(snapshotValue); await this.checkStorage(); this.storageService.setDayIsUpToDate('Wednesday', true); });
    this.auth.thursdayChanged.subscribe(async snapshotValue => {console.log(snapshotValue); await this.checkStorage(); this.storageService.setDayIsUpToDate('Thursday', true); });
    this.auth.fridayChanged.subscribe(async snapshotValue => {console.log(snapshotValue); await this.checkStorage(); this.storageService.setDayIsUpToDate('Friday', true); });
    this.auth.saturdayChanged.subscribe(async snapshotValue => {console.log(snapshotValue); await this.checkStorage(); this.storageService.setDayIsUpToDate('Saturday', true); });
    this.auth.sundayChanged.subscribe(async snapshotValue => {console.log(snapshotValue); await this.checkStorage(); this.storageService.setDayIsUpToDate('Sunday', true); });

  }

  getAllRecipes(): any {

    return this.allRecipes;

  }

  getTodayRecipes() {

    console.log('Request received at timetable.service getTodayRecipes()')

    const currentDayName: string = this.getDayName();

    let todayRecipes: {
      day: string,
      show: boolean,
      caloriesRemaining: number,
      noOfRecipes: number,
      recipes: {
        recipeID: string
        recipeType: string,
        name: string,
        image: string,
        calories: number,
        carbs: number,
        fat: number,
        protein: number,
        url: string
      }[]
    };

    this.allRecipes.forEach(element => {

       if (element.day === currentDayName) {

        todayRecipes = element;

       }

    });

    return todayRecipes;

  }

  getDayName(): string {

    let currentDayName;

    switch (this.currentDayIndex) {
      case 0: currentDayName = 'Sunday'; break;
      case 1: currentDayName = 'Monday'; break;
      case 2: currentDayName = 'Tuesday'; break;
      case 3: currentDayName = 'Wednesday'; break;
      case 4: currentDayName = 'Thursday'; break;
      case 5: currentDayName = 'Friday'; break;
      case 6: currentDayName = 'Saturday'; break;
      default: currentDayName = 'Error 404, day not found';
    }

    return currentDayName;

  }

  addRecipeToDay(index: number, recipe: {
      recipeID: string,
      recipeType: string,
      name: string,
      image: string,
      url: string,
      calories: number,
      carbs: number,
      protein: number,
      fat: number}) {

        // Add recipe to dayWithRecipes
        const dayWithRecipes = this.getDayByIndex(index);
        dayWithRecipes.recipes.push(recipe);

        // Write recipe to localStorage and Firebase
        this.writeRecipeToStorage(dayWithRecipes.day, recipe);
        dayWithRecipes.noOfRecipes++;

        this.updateWeeklyTotals();

        /* Check that the recipe(s) are suitable by passing them to:
         * checkRecipeIsSuitable - will update variables in the recipe's object if it's not suitable
         * Check the day is suitable by passing it to:
         * checkDayIsSuitable - will update variables in the day's object (in allRecipes array) if it's not suitable
         */
        this.checkRecipeIsSuitable(recipe);
        this.checkDayIsSuitable(this.getDayByIndex(index));
        this.arrayUpdated.emit('Array Updated');

    }

  addRecipesToDay(index: number, recipes: {
      recipeID: string
      recipeType: string,
      name: string,
      image: string,
      calories: number,
      carbs: number,
      protein: number,
      fat: number
      }[]
  ) {

      const dayWithRecipes = this.getDayByIndex(index);
      dayWithRecipes.recipes.push(...recipes);
      dayWithRecipes.noOfRecipes += recipes.length;

      this.updateWeeklyTotals();

      /* Check that the recipe(s) are suitable by passing them to:
       * checkRecipeIsSuitable - will update variables in the recipe's object if it's not suitable
       * Check the day is suitable by passing it to:
       * checkDayIsSuitable - will update variables in the day's object (in allRecipes array) if it's not suitable
       */
      this.checkRecipeIsSuitable(...recipes);
      this.checkDayIsSuitable(this.getDayByIndex(index));
      this.arrayUpdated.emit('Array Updated');

  }

  async removeRecipeByIndex(dayIndex: number, recipeIndex: number) {

    console.log('Recipe removed by index');

    const dayObject = this.getDayByIndex(dayIndex);
    this.storageService.setDayIsUpToDate(dayObject.day, 'false');

    await this.auth.removeRecipeFromUserTimetable(this.accountService.getUserID(), dayObject.day, dayObject.recipes[recipeIndex]);

    const dayWithRecipes = this.getDayByIndex(dayIndex);
    dayWithRecipes.recipes.splice(recipeIndex, 1);
    dayWithRecipes.noOfRecipes--;

    this.updateWeeklyTotals();
    this.arrayUpdated.emit('Array updated');

  }

  async removeRecipeByObject(
    dayObject: {
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
    },
    recipeIndex: number) {

      console.log(`Recipe removed by object`);

      this.storageService.setDayIsUpToDate(dayObject.day, 'false');
      await this.auth.removeRecipeFromUserTimetable(this.accountService.getUserID(), dayObject.day, dayObject.recipes[recipeIndex]);

      dayObject.recipes.splice(recipeIndex, 1);
      dayObject.noOfRecipes--;

      this.updateWeeklyTotals();
      this.arrayUpdated.emit('Array updated');

  }

  private getDayByIndex(index: number) {

    let dayWithRecipes;

    this.allRecipes.forEach((element, i) => {

      if (i === index) {

        dayWithRecipes = element;

      }

    });

    return dayWithRecipes;

  }

  /* Updates the totalCalories and caloriesRemaining variables in allRecipes array;
   * along with totalCarbs, totalProtein and totalFat
   */
  updateWeeklyTotals() {

    // Loop through each day
    this.allRecipes.forEach(dayElement => {

      // Variables which are used to total each recipe in day
      let totalCalsForDay = 0;
      let totalCarbsForDay = 0;
      let totalProteinForDay = 0;
      let totalFatForDay = 0;

      // Loop through each recipe in the day
      try {

        dayElement.recipes.forEach(recipeElement => {

          // Add each of the recipe's nutrients totals to the total nutrients for the day
          totalCalsForDay = totalCalsForDay + recipeElement.calories;
          totalCarbsForDay = totalCarbsForDay + recipeElement.carbs;
          totalProteinForDay = totalProteinForDay + recipeElement.protein;
          totalFatForDay = totalFatForDay + recipeElement.fat;

          // While looping through each recipe, round the recipe's nutrient values to one decimal place

          recipeElement.calories = parseFloat(recipeElement.calories.toFixed(1));
          recipeElement.carbs = parseFloat(recipeElement.carbs.toFixed(1));
          recipeElement.protein = parseFloat(recipeElement.protein.toFixed(1));
          recipeElement.fat = parseFloat(recipeElement.fat.toFixed(1));

        });

        // Assign the totals to the allRecipes object variables
        dayElement.caloriesRemaining = parseFloat((this.dailyCalories - totalCalsForDay).toFixed(1));
        dayElement.carbsRemaining = parseFloat((this.dailyCarbs - totalCarbsForDay).toFixed(1));
        dayElement.proteinRemaining = parseFloat((this.dailyProtein - totalProteinForDay).toFixed(1));
        dayElement.fatRemaining = parseFloat((this.dailyFat - totalFatForDay).toFixed(1));

        dayElement.totalCalories = parseFloat(totalCalsForDay.toFixed(1));
        dayElement.totalCarbs = parseFloat(totalCarbsForDay.toFixed(1));
        dayElement.totalProtein = parseFloat(totalProteinForDay.toFixed(1));
        dayElement.totalFat = parseFloat(totalFatForDay.toFixed(1));

      } catch (error) {
        console.log(error);
      }

    });

    this.arrayUpdated.emit('Array changed');

  }

  async writeRecipeToStorage(day, recipe) {

    this.auth.writeRecipeToUserTimetable(this.accountService.getUserID(), day, recipe);

  }

  async clearAll() {

    await this.auth.clearAllRecipes(this.accountService.getUserID());
    this.allRecipes = [];
    await this.checkStorage();
    this.updateWeeklyTotals();
    this.arrayUpdated.emit('Array cleared');

  }

  async checkStorage() {

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    console.log(`checkStorage() reached`);

    for (let i = 0; i < days.length; i++) {

      const currentDay = days[i];

      await this.auth.checkDayMatchesBetweenStorageAndFirebase(this.accountService.getUserID(), currentDay);
      /* Add a method in auth which loops through each recipe in the user's storages day's recipes array
       * Declare a variable to true before the while loop begins called 'firebaseAndStorageMatch = true'
       * If during the loop, a recipeID is not detected in the user's Firebase day's recipes array, then set the dayIsUpToDate value to false for that day in storage
       *
       */

      const dayIsUpToDate = this.storageService.checkDayIsUpToDate(currentDay);

      if (!dayIsUpToDate) {

        console.log(`${currentDay} is not up-to-date`);
        await this.auth.updateLocalStorageFromFirebase(this.accountService.getUserID(), currentDay); // This method fills storage
        this.storageService.setDayIsUpToDate(currentDay, true);
        console.log(this.storageService.getDayFromStorage(currentDay));

      }

    }

    this.updateAllRecipesFromLocalStorage();
    console.log(window.localStorage);

    this.arrayUpdated.emit('Array changed');

    //console.log(this.allRecipes);

  }

  async updateAllRecipesFromLocalStorage() {

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < window.localStorage.length; i++) {

      const currentKeyName = window.localStorage.key(i);

      // Make sure we're accessing a key/value which is a day and not paypal/firebase related
      if (days.includes(currentKeyName)) {

        const dayWithRecipes = JSON.parse(window.localStorage.getItem(currentKeyName));
        this.allRecipes.push(dayWithRecipes);

      }

    }

  }

  async generate() {

    let totalCallsToAPI = 0;

    // a string which will be used to store the request url to the edamam API
    let request = '';

    /* This is the format of what should be returned from the getRecipePlanStructure() method
     * It is an array which contains details on each of the recipes for a day.
     *
     *  Each element contains a recipeType (breakfast, lunch, dinner etc), the recipe itself,
     *  the caloriePercentage, fatPercentage, proteinPercentage and carbsPercentage. The percentages are to
     *  be used as parameters when attempting to find a recipe.
     */
    let recipePlan: {
      recipeType: string,
      calories: number;
      fat: number
      protein: number
      carbs: number
    }[] = [];

    for (let i = 0; i < this.allRecipes.length; i++) {

      const dayWithRecipes = this.allRecipes[i];

      /* The reciplePlan array is assigned the result of the getRecipePlanStructure method.
       * All the attributes of each element (apart from the recipe) will be given a value from the method.
       *
       * Each element in the recipePlan will be ready to be used to make calls to the API in order to find a suitable recipe.
       *
       * The recipePlan now returns gram values as opposed to percentages like previously so the request should be able to be
       * compiled directly from the recipePlan
       */

      /*Store the user's ingredient preferences in the tempUsersIngredients array and baseIngredients in a temp array */
      const tempUserIngredients = this.userIngredients.slice(0);
      let tempBaseIngredients = ['chicken', 'beef', 'pork', 'fish', 'lamb', 'veal', 'eggs', 'avocado', 'nuts', 'cheese', 'coconut', 'yogurt', 'steak'];
      let ingredient = '';

      // Remove the exclamation mark and change Monday's isKetoFriendly value back to true in the allRecipes array back to
      if (true/* UNCOMMENT THIS IN FUTURE dayWithRecipes.isKetoFriendly*/) {

        console.log(`Finding recipes for ${dayWithRecipes.day}`);

        recipePlan = await this.getReciplePlanStructure(dayWithRecipes);

        for (let j = 0; j < recipePlan.length; j++) {

          const recipeDetails = recipePlan[j];
          let recipeForMealType;

          // While a recipeReturned is undefined or false and there's still baseIngredients to find
          while (recipeForMealType === undefined && tempBaseIngredients.length > 0) {

            console.log('Looking for a new ingredient...');

            // If there are still user preferred ingredients to try and find a recipe for
            if (tempUserIngredients.length > 0) {

              console.log('A user preferenced ingredient found...');

              // Randomly select an ingredient from the user's preferred ingredients then remove it from this cycle so it can't be selected again for the same day
              const randomIngredientIndex = Math.round((Math.random()) * (tempUserIngredients.length-1));
              ingredient = tempUserIngredients[randomIngredientIndex];
              tempUserIngredients.splice(randomIngredientIndex, 1);


              // If there's no more user preferred ingredients to select from
            } else if (tempUserIngredients.length === 0) {

              console.log('No more user perferenced ingredients left...');

              // If there's still base ingredients to try and find a recipe for
              if (tempBaseIngredients.length > 0) {

                console.log('A base ingredient found...');

                // Randomly select an ingredient from the base ingredients then remove it from this cycle so it can't be selected again for the same day
                const randomIngredientIndex = Math.round((Math.random()) * (tempBaseIngredients.length-1));
                ingredient = tempBaseIngredients[randomIngredientIndex];
                tempBaseIngredients.splice(randomIngredientIndex, 1);

              }

            }

            // Try to find a recipe for the meal type (breakfast, lunch or dinner etc) - Will return a recipe or undefined (if a recipe isn't found)
            recipeForMealType = await this.edamam.searchForRecipe(recipeDetails, ingredient);

            // Make sure an actual recipe returned before adding it to day
            if (recipeForMealType !== undefined) {
              this.addRecipeToDay(i, recipeForMealType);
            }

            totalCallsToAPI++;

            console.log('Returned:' + recipeForMealType);

        }

          console.log('Exited while loop');

        }

      } else {

      // console.log(`${dayWithRecipes.day} is marked as notKetoFriendly`); -UNCOMMENT THIS AFTER TESTING

      }

    }

    console.log(window.localStorage);
    console.log(`Total calls: ${totalCallsToAPI}`);

  }

  checkRecipeIsSuitable(...recipes) {

    recipes.forEach(recipe => {

      // If the recipe has an amount of carbs greater than the user's preferred carbs divided by 1.5
      // e.g. If daily carb intake is 20g. 20 / 1.5 = 13.3. Any recipes with over 13.3g of carbs will be flagged
      if (recipe.totalCarbs > this.dailyCarbs / 1.5) {

        recipe.isKetoFriendly = false;
        recipe.notKetoFriendlyReason = 'This recipe uses up a lot of the daily carb intake.';

      }

      // If there's over 10g of protein and the total fat is less than half of the protein, the recipe will be flagged
      if (recipe.totalProtein > 10 && recipe.totalFat * 2 < recipe.totalProtein) {

        recipe.isKetoFriendly = false;
        recipe.notKetoFriendlyReason = 'This recipe has twice as much protein than fat.';

      }

    });

  }


  /**** It would be a good idea to revise the if statements in this method when further into developing the generate method ****/
  checkDayIsSuitable(...days) {

      days.forEach(currentDay => {

        /**** Calories ****/

        /* Need to check how many calories are left for the current day.
         * Is there enough calories to be able to find the recipes to fill the remaining macros?
         *
         *
         * check if there's any recipes between 100-199 calories which have 15g of fat, 10g of protein.. etc.
         *
         * If there's atleast 100-199 calories remaining and not more than 15g of fat, 10g of protein and 5g of carbs
         * it'll be worthwhile trying to complete the day.
         *
         * If there's atleast 200-299 calories remaining and not more than 17.5g of fat, 12.5g of protein and 7.5g of carbs
         * it'll be worthwhile trying to complete the day.
         *
         * If there's atleast 300-499 calories remaining and not more than 20g of fat, 15g of protein and 10g of carbs
         * it'll be worthwhile trying to complete the day.
         *
         *
         */

        // If there's less than -200 calories remaining (gone over limit by at least 200)
        if (currentDay.caloriesRemaining < -200) {

          currentDay.isKetoFriendly = false;
          currentDay.notKetoFriendlyReason = 'Too many calories, we recommend removing a few recipes';

        }

        // If there's less than 100 calories and more than 10g of fat and 7.5g of protein and 5g of carbs
        if (currentDay.caloriesRemaining < 100 && (currentDay.fatRemaining > 10 && currentDay.proteinRemaining > 7.5 &&
              currentDay.carbsRemaining > 5)) {

          currentDay.isKetoFriendly = false;
          currentDay.notKetoFriendlyReason = 'Not enough calories to fill the remaining macros';

        }

        // If there's between 100 & 200 calories and more than 15g of fat and 10g and protein and 7.5g of carbs
        if (currentDay.caloriesRemaining >= 100 && currentDay.caloriesRemaining < 200 && (currentDay.fatRemaining > 15 &&
              currentDay.proteinRemaining > 10 && currentDay.carbsRemaining > 7.5)) {

          currentDay.isKetoFriendly = false;
          currentDay.notKetoFriendlyReason = 'Not enough calories to fill the remaining macros';

        }

        // If there's between than 200 & 400 calories and more than 20g of fat and 12.5g of protein and 10g of carbs
        if (currentDay.caloriesRemaining >= 200 && currentDay.caloriesRemaining < 400 && (currentDay.fatRemaining > 20 &&
            currentDay.proteinRemaining > 12.5 && currentDay.carbsRemaining > 10)) {

          currentDay.isKetoFriendly = false;
          currentDay.notKetoFriendlyReason = 'Not enough calories to fill the remaining macros';

        }

        /**** Carbs ****/

        // If there's less than -10 carbs remaining (gone over limit by at least 10)
        if (currentDay.carbsRemaining < -10) {

          currentDay.isKetoFriendly = false;
          currentDay.notKetoFriendlyReason = 'Too many carbs, we recommend removing a few high carb recipes';

        }

        /* If there's between -5 carbs and -10 carbs remaining (gone over limit by between 5 and 10) and there's
         * more than 150 calories remaining
         *
         * This prevents any days which only go over the recommended carbs by <5 from being flagged
         */
        if ((currentDay.carbsRemaining > -5 && currentDay.carbsRemaining < -10)
            && (currentDay.caloriesRemaining >= 150)) {

          currentDay.isKetoFriendly = false;
          currentDay.notKetoFriendlyReason = 'Too many carbs, we recommend removing a few high carb recipes';

        }

        /**** Protein *****/

        // If there's less than -10 carbs remaining (gone over limit by at least 10)
        if (currentDay.proteinRemaining < -10) {

          currentDay.isKetoFriendly = false;
          currentDay.notKetoFriendlyReason = 'Too much protein, we recommend removing a few high protein recipes';

        }

        /* If there's between -5 fat and -10 fat remaining (gone over limit by between 5 and 10) and there's
         * more than 150 calories remaining
         *
         * This prevents any days which only go over the recommended protein by <5 from being flagged
         */
        if ((currentDay.proteinRemaining > -5 && currentDay.proteinRemaining < -10)
            && (currentDay.caloriesRemaining >= 150)) {

          currentDay.isKetoFriendly = false;
          currentDay.notKetoFriendlyReason = 'Too much protein, we recommend removing a few high protein recipes';

        }

        /**** Fat ****/

        // If there's less than -10 fat remaining (gone over limit by at least 10)
        if (currentDay.proteinRemaining < -10) {

          currentDay.isKetoFriendly = false;
          currentDay.notKetoFriendlyReason = 'Too much fat, we recommend removing a few high fat protein recipes';

        }

        /* If there's between -5 fat and -10 fat remaining (gone over limit by between 5 and 10) and there's
         * more than 150 calories remaining
         *
         * This prevents any days which only go over the recommended fat by <5 from being flagged
         */
        if ((currentDay.proteinRemaining > -5 && currentDay.proteinRemaining < -10)
            && (currentDay.caloriesRemaining >= 150)) {

          currentDay.isKetoFriendly = false;
          currentDay.notKetoFriendlyReason = 'Too much protein, we recommend removing a few high protein recipes';

        }

       });

  }

  /* This method is designed to take in a day's recipes along with the amount of recipes and calories remaining
   * in order to configure a suitable structure for that day.
   */
  async getReciplePlanStructure(currentDay: any) {

      // This reciplePlan object will be used to store the determined recipeType, caloriePercentage, fatPercentage, proteinPercentage
      // and carbsPercentage for each recipe.
      let recipePlan: {
        recipeType: string,
        calories: number;
        fat: number
        protein: number
        carbs: number
      }[] = [];


      // If there's no recipes, then the app checks how many calories are remaining and pushes recipe plans into the array
      if (true /*UNCOMMENT THIS IN FUTURE currentDay.noOfRecipes === 0*/) {

        switch (true) {

          case currentDay.caloriesRemaining < 1500:
            recipePlan.push({
              recipeType: 'Breakfast',
              calories: currentDay.caloriesRemaining * 0.30,
              fat: currentDay.fatRemaining * 0.60,
              protein: currentDay.proteinRemaining * 0.35,
              carbs: currentDay.carbsRemaining * 0.05
            });
            recipePlan.push({
              recipeType: 'Lunch',
              calories: currentDay.caloriesRemaining * 0.325,
              fat: currentDay.fatRemaining * 0.60,
              protein: currentDay.proteinRemaining * 0.35,
              carbs: currentDay.carbsRemaining * 0.05
            });
            recipePlan.push({
              recipeType: 'Dinner',
              calories: currentDay.caloriesRemaining * 0.375,
              fat: currentDay.fatRemaining * 0.60,
              protein: currentDay.proteinRemaining * 0.35,
              carbs: currentDay.carbsRemaining * 0.05
            });
            break;

          case currentDay.caloriesRemaining >= 1500 && currentDay.caloriesRemaining < 2000:
            recipePlan.push({
              recipeType: 'Breakfast',
              calories: currentDay.caloriesRemaining * 0.25,
              fat: currentDay.fatRemaining * 0.25,
              protein: currentDay.proteinRemaining * 0.25,
              carbs: currentDay.carbsRemaining * 0.25
            });
            recipePlan.push({
              recipeType: 'Lunch',
              calories: currentDay.caloriesRemaining * 0.25,
              fat: currentDay.fatRemaining * 0.25,
              protein: currentDay.proteinRemaining * 0.25,
              carbs: currentDay.carbsRemaining * 0.25
            });
            recipePlan.push({
              recipeType: 'Snack',
              calories: currentDay.caloriesRemaining * 0.10,
              fat: currentDay.fatRemaining * 0.10,
              protein: currentDay.proteinRemaining * 0.10,
              carbs: currentDay.carbsRemaining * 0.10
            });
            recipePlan.push({
              recipeType: 'Dinner',
              calories: currentDay.caloriesRemaining * 0.40,
              fat: currentDay.fatRemaining * 0.40,
              protein: currentDay.proteinRemaining * 0.40,
              carbs: currentDay.carbsRemaining * 0.40
            });
            return recipePlan;
            break;

          case currentDay.caloriesRemaining >= 2000:
            recipePlan.push({
              recipeType: 'Breakfast',
              calories: currentDay.caloriesRemaining * 0.217,
              fat: currentDay.fatRemaining * 0.25,
              protein: currentDay.proteinRemaining * 0.25,
              carbs: currentDay.carbsRemaining * 0.25
            });
            recipePlan.push({
              recipeType: 'Snack 1',
              calories: currentDay.caloriesRemaining * 0.10,
              fat: currentDay.fatRemaining * 0.10,
              protein: currentDay.proteinRemaining * 0.10,
              carbs: currentDay.carbsRemaining * 0.10
            });
            recipePlan.push({
              recipeType: 'Lunch',
              calories: currentDay.caloriesRemaining * 0.266,
              fat: currentDay.fatRemaining * 0.20,
              protein: currentDay.proteinRemaining * 0.20,
              carbs: currentDay.carbsRemaining * 0.20
            });
            recipePlan.push({
              recipeType: 'Snack 2',
              calories: currentDay.caloriesRemaining * 0.10,
              fat: currentDay.fatRemaining * 0.10,
              protein: currentDay.proteinRemaining * 0.10,
              carbs: currentDay.carbsRemaining * 0.10
            });
            recipePlan.push({
              recipeType: 'Dinner',
              calories: currentDay.caloriesRemaining * 0.317,
              fat: currentDay.fatRemaining * 0.35,
              protein: currentDay.proteinRemaining * 0.35,
              carbs: currentDay.carbsRemaining * 0.35
            });
            return recipePlan;
            break;
          }

        }

      if (currentDay.noOfRecipes > 0) {

        /* If there's one or more recipes then the application has to loop through all the recipes and check to see
         * which recipeTypes (breakfast, lunch, dinner, etc.) have already been included.
         *
         * We have three variables to do this: includeBreakfast, includeLunch, includeDinner. If any of the recipeTypes
         * are found in the currentRecipes, then we set its corresponding variable to false to prevent including
         * it twice.
         */

        let includeBreakfast = true;
        let includeLunch = true;
        let includeDinner = true;

        currentDay.recipes.forEach(element => {

          if (element.recipeType === 'Breakfast') {

            includeBreakfast = false;

          } else if (element.recipeType === 'Lunch') {

            includeLunch = false;

          } else if (element.recipeType === 'Dinner') {

            includeDinner = false;

          }

        });

        // Based on what recipe types are already in the current day, create the rest of the recipe plan
        switch (true) {

          case includeBreakfast && includeLunch && includeDinner:

            if (currentDay.caloriesRemaining < 500) {

              // Add a breakfast and suggest the user remove snacks

              recipePlan.push({
                recipeType: 'Breakfast',
                calories: currentDay.caloriesRemaining,
                fat: currentDay.fatRemaining,
                protein: currentDay.proteinRemaining,
                carbs: currentDay.carbsRemaining
              });

            } else if (currentDay.caloriesRemaining >= 500 && currentDay.caloriesRemaining < 1000) {

              // Add a breakfast and dinner

              /* Divide the 'leftPercentages' by 0.5 as the recipePlan requires two meals: breakfast & dinner
               * Dividing by 0.5 means that each meal type gets half of the remaining macros
               */
              recipePlan.push({
                recipeType: 'Breakfast',
                calories: currentDay.caloriesRemaining * 0.5,
                fat: currentDay.fatRemaining * 0.5,
                protein: currentDay.proteinRemaining * 0.5,
                carbs: currentDay.carbsRemaining * 0.5
              });

              recipePlan.push({
                recipeType: 'Dinner',
                calories: currentDay.caloriesRemaining * 0.5,
                fat: currentDay.fatRemaining * 0.5,
                protein: currentDay.proteinRemaining * 0.5,
                carbs: currentDay.carbsRemaining * 0.5
              });

            } else { // i.e. if caloriesRemaining are greater than 1000

              recipePlan.push({
                recipeType: 'Breakfast',
                calories: currentDay.caloriesRemaining * 0.33,
                fat: currentDay.fatRemaining * 0.33,
                protein: currentDay.proteinRemaining * 0.33,
                carbs: currentDay.carbsRemaining * 0.33
              });

              recipePlan.push({
                recipeType: 'Lunch',
                calories: currentDay.caloriesRemaining * 0.33,
                fat: currentDay.fatRemaining * 0.33,
                protein: currentDay.proteinRemaining * 0.33,
                carbs: currentDay.carbsRemaining * 0.33
              });

              recipePlan.push({
                recipeType: 'Dinner',
                calories: currentDay.caloriesRemaining * 0.33,
                fat: currentDay.fatRemaining * 0.33,
                protein: currentDay.proteinRemaining * 0.33,
                carbs: currentDay.carbsRemaining * 0.33
              });


            }

            break;

          case includeBreakfast && includeLunch && !includeDinner:

            if (currentDay.caloriesRemaining < 500) {

              recipePlan.push({
                recipeType: 'Breakfast',
                calories: currentDay.caloriesRemaining,
                fat: currentDay.fatRemaining,
                protein: currentDay.proteinRemaining,
                carbs: currentDay.carbsRemaining
              });

            } else if (currentDay.caloriesRemaining >= 500 && currentDay.caloriesRemaining < 1000) {


              recipePlan.push({
                recipeType: 'Breakfast',
                calories: currentDay.caloriesRemaining * 0.5,
                fat: currentDay.fatRemaining * 0.5,
                protein: currentDay.proteinRemaining * 0.5,
                carbs: currentDay.carbsRemaining * 0.5
              });

              recipePlan.push({
                recipeType: 'Lunch',
                calories: currentDay.caloriesRemaining * 0.5,
                fat: currentDay.fatRemaining * 0.5,
                protein: currentDay.proteinRemaining * 0.5,
                carbs: currentDay.carbsRemaining * 0.5
              });

            } else { // i.e. if caloriesRemaining are greater than 1000

              // Add a breakfast, lunch and maybe snack (if there's a realistic amount of cals remaining)

              recipePlan.push({
                recipeType: 'Breakfast',
                calories: currentDay.caloriesRemaining * 0.4,
                fat: currentDay.fatRemaining * 0.4,
                protein: currentDay.proteinRemaining * 0.4,
                carbs: currentDay.carbsRemaining * 0.4
              });

              recipePlan.push({
                recipeType: 'Lunch',
                calories: currentDay.caloriesRemaining * 0.4,
                fat: currentDay.fatRemaining * 0.4,
                protein: currentDay.proteinRemaining * 0.4,
                carbs: currentDay.carbsRemaining * 0.4
              });

              recipePlan.push({
                recipeType: 'Snack',
                calories: currentDay.caloriesRemaining * 0.2,
                fat: currentDay.fatRemaining * 0.2,
                protein: currentDay.proteinRemaining * 0.2,
                carbs: currentDay.carbsRemaining * 0.2
              });

            }

            break;

          case includeBreakfast && !includeLunch && includeDinner:

            if (currentDay.caloriesRemaining < 500) {

              // Add a dinner and suggest the user remove snacks (if there is any snacks)

              recipePlan.push({
                recipeType: 'Dinner',
                calories: currentDay.caloriesRemaining,
                fat: currentDay.fatRemaining,
                protein: currentDay.proteinRemaining,
                carbs: currentDay.carbsRemaining
              });

            } else if (currentDay.caloriesRemaining >= 500 && currentDay.caloriesRemaining < 1000) {

              // Add a breakfast and dinner

              recipePlan.push({
                recipeType: 'Breakfast',
                calories: currentDay.caloriesRemaining * 0.5,
                fat: currentDay.fatRemaining * 0.5,
                protein: currentDay.proteinRemaining * 0.5,
                carbs: currentDay.carbsRemaining * 0.5
              });

              recipePlan.push({
                recipeType: 'Dinner',
                calories: currentDay.caloriesRemaining * 0.5,
                fat: currentDay.fatRemaining * 0.5,
                protein: currentDay.proteinRemaining * 0.5,
                carbs: currentDay.carbsRemaining * 0.5
              });

            } else { // i.e. if caloriesRemaining are greater than 1000

              // Add a breakfast, dinner and maybe snack (if there's a realistic amount of cals remaining)

              recipePlan.push({
                recipeType: 'Breakfast',
                calories: currentDay.caloriesRemaining * 0.4,
                fat: currentDay.fatRemaining * 0.4,
                protein: currentDay.proteinRemaining * 0.4,
                carbs: currentDay.carbsRemaining * 0.4
              });

              recipePlan.push({
                recipeType: 'Dinner',
                calories: currentDay.caloriesRemaining * 0.4,
                fat: currentDay.fatRemaining * 0.4,
                protein: currentDay.proteinRemaining * 0.4,
                carbs: currentDay.carbsRemaining * 0.4
              });

              recipePlan.push({
                recipeType: 'Snack',
                calories: currentDay.caloriesRemaining * 0.2,
                fat: currentDay.fatRemaining * 0.2,
                protein: currentDay.proteinRemaining * 0.2,
                carbs: currentDay.carbsRemaining * 0.2
              });

            }

            break;

          case includeBreakfast && !includeLunch && !includeDinner:

            if (currentDay.caloriesRemaining < 500) {

              // Add a breakfast

              recipePlan.push({
                recipeType: 'Breakfast',
                calories: currentDay.caloriesRemaining,
                fat: currentDay.fatRemaining,
                protein: currentDay.proteinRemaining,
                carbs: currentDay.carbsRemaining
              });

            } else if (currentDay.caloriesRemaining >= 500 && currentDay.caloriesRemaining < 700) {

              // Add a breakfast and maybe snack (if there's a realistic amount of cals remaining)

              recipePlan.push({
                recipeType: 'Breakfast',
                calories: currentDay.caloriesRemaining * 1,
                fat: currentDay.fatRemaining * 1,
                protein: currentDay.proteinRemaining * 1,
                carbs: currentDay.carbsRemaining * 1
              });

              /*recipePlan.push({
                recipeType: 'Snack',
                calories: currentDay.caloriesRemaining * 0.20,
                fat: currentDay.fatRemaining * 0.20,
                protein: currentDay.proteinRemaining * 0.20,
                carbs: currentDay.carbsRemaining * 0.20
              });*/


            } else { // i.e. if caloriesRemaining are greater than 1000

              // Add a breakfast and maybe snack or two (if there's a realistic amount of cals remaining)

              recipePlan.push({
                recipeType: 'Breakfast',
                calories: currentDay.caloriesRemaining * 0.5,
                fat: currentDay.fatRemaining * 0.5,
                protein: currentDay.proteinRemaining * 0.5,
                carbs: currentDay.carbsRemaining * 0.5
              });

              recipePlan.push({
                recipeType: 'Snack 1',
                calories: currentDay.caloriesRemaining * 0.25,
                fat: currentDay.fatRemaining * 0.25,
                protein: currentDay.proteinRemaining * 0.25,
                carbs: currentDay.carbsRemaining * 0.25
              });

              recipePlan.push({
                recipeType: 'Snack 2',
                calories: currentDay.caloriesRemaining * 0.25,
                fat: currentDay.fatRemaining * 0.25,
                protein: currentDay.proteinRemaining * 0.25,
                carbs: currentDay.carbsRemaining * 0.25
              });

            }

            break;

          case !includeBreakfast && includeLunch && includeDinner:

            if (currentDay.caloriesRemaining < 500) {

              // Add a dinner and suggest user removes snacks if there is any

              recipePlan.push({
                recipeType: 'Dinner',
                calories: currentDay.caloriesRemaining,
                fat: currentDay.fatRemaining,
                protein: currentDay.proteinRemaining,
                carbs: currentDay.carbsRemaining
              });

            } else if (currentDay.caloriesRemaining >= 500 && currentDay.caloriesRemaining < 1000) {

              // Add a lunch and dinner

              recipePlan.push({
                recipeType: 'Lunch',
                calories: currentDay.caloriesRemaining * 0.5,
                fat: currentDay.fatRemaining * 0.5,
                protein: currentDay.proteinRemaining * 0.5,
                carbs: currentDay.carbsRemaining * 0.5
              });

              recipePlan.push({
                recipeType: 'Dinner',
                calories: currentDay.caloriesRemaining * 0.5,
                fat: currentDay.fatRemaining * 0.5,
                protein: currentDay.proteinRemaining * 0.5,
                carbs: currentDay.carbsRemaining * 0.5
              });


            } else { // i.e. if caloriesRemaining are greater than 1000

              // Add a lunch, dinner and maybe snack (if there's a realistic amount of cals remaining)

              recipePlan.push({
                recipeType: 'Lunch',
                calories: currentDay.caloriesRemaining * 0.4,
                fat: currentDay.fatRemaining * 0.4,
                protein: currentDay.proteinRemaining * 0.4,
                carbs: currentDay.carbsRemaining * 0.4
              });

              recipePlan.push({
                recipeType: 'Dinner',
                calories: currentDay.caloriesRemaining * 0.4,
                fat: currentDay.fatRemaining * 0.4,
                protein: currentDay.proteinRemaining * 0.4,
                carbs: currentDay.carbsRemaining * 0.4
              });

              recipePlan.push({
                recipeType: 'Snack',
                calories: currentDay.caloriesRemaining * 0.2,
                fat: currentDay.fatRemaining * 0.2,
                protein: currentDay.proteinRemaining * 0.2,
                carbs: currentDay.carbsRemaining * 0.2
              });

            }

            break;

          case !includeBreakfast && includeLunch && !includeDinner:

            if (currentDay.caloriesRemaining < 500) {

              // Add a lunch

              recipePlan.push({
                recipeType: 'Lunch',
                calories: currentDay.caloriesRemaining,
                fat: currentDay.fatRemaining,
                protein: currentDay.proteinRemaining,
                carbs: currentDay.carbsRemaining
              });

            } else if (currentDay.caloriesRemaining >= 500 && currentDay.caloriesRemaining < 1000) {

              // Add a lunch and maybe snack or two (if there's a realistic amount of cals remaining)

              recipePlan.push({
                recipeType: 'Lunch',
                calories: currentDay.caloriesRemaining * 0.65,
                fat: currentDay.fatRemaining * 0.65,
                protein: currentDay.proteinRemaining * 0.65,
                carbs: currentDay.carbsRemaining * 0.65
              });

              recipePlan.push({
                recipeType: 'Snack',
                calories: currentDay.caloriesRemaining * 0.65,
                fat: currentDay.fatRemaining * 0.65,
                protein: currentDay.proteinRemaining * 0.65,
                carbs: currentDay.carbsRemaining * 0.65
              });


            } else { // i.e. if caloriesRemaining are greater than 1000

              // Add a lunch and maybe snack or two (if there's a realistic amount of cals remaining)

              recipePlan.push({
                recipeType: 'Lunch',
                calories: currentDay.caloriesRemaining * 0.5,
                fat: currentDay.fatRemaining * 0.5,
                protein: currentDay.proteinRemaining * 0.5,
                carbs: currentDay.carbsRemaining * 0.5
              });

              recipePlan.push({
                recipeType: 'Snack 1',
                calories: currentDay.caloriesRemaining * 0.25,
                fat: currentDay.fatRemaining * 0.25,
                protein: currentDay.proteinRemaining * 0.25,
                carbs: currentDay.carbsRemaining * 0.25
              });

              recipePlan.push({
                recipeType: 'Snack 2',
                calories: currentDay.caloriesRemaining * 0.25,
                fat: currentDay.fatRemaining * 0.25,
                protein: currentDay.proteinRemaining * 0.25,
                carbs: currentDay.carbsRemaining * 0.25
              });

            }

            break;

          case !includeBreakfast && !includeLunch && includeDinner:

            if (currentDay.caloriesRemaining < 500) {

              // Add a dinner

              recipePlan.push({
                recipeType: 'Dinner',
                calories: currentDay.caloriesRemaining,
                fat: currentDay.fatRemaining,
                protein: currentDay.proteinRemaining,
                carbs: currentDay.carbsRemaining
              });

            } else if (currentDay.caloriesRemaining >= 500 && currentDay.caloriesRemaining < 1000) {

              // Add a dinner and maybe snack or two (if there's a realistic amount of cals remaining)

              recipePlan.push({
                recipeType: 'Dinner',
                calories: currentDay.caloriesRemaining * 0.65,
                fat: currentDay.fatRemaining * 0.65,
                protein: currentDay.proteinRemaining * 0.65,
                carbs: currentDay.carbsRemaining * 0.65
              });

              recipePlan.push({
                recipeType: 'Snack',
                calories: currentDay.caloriesRemaining * 0.35,
                fat: currentDay.fatRemaining * 0.35,
                protein: currentDay.proteinRemaining * 0.35,
                carbs: currentDay.carbsRemaining * 0.35
              });

            } else { // i.e. if caloriesRemaining are greater than 1000

              // Add a dinner and maybe snack or two (if there's a realistic amount of cals remaining)

              recipePlan.push({
                recipeType: 'Dinner',
                calories: currentDay.caloriesRemaining * 0.5,
                fat: currentDay.fatRemaining * 0.5,
                protein: currentDay.proteinRemaining * 0.5,
                carbs: currentDay.carbsRemaining * 0.5
              });

              recipePlan.push({
                recipeType: 'Snack 1',
                calories: currentDay.caloriesRemaining * 0.25,
                fat: currentDay.fatRemaining * 0.25,
                protein: currentDay.proteinRemaining * 0.25,
                carbs: currentDay.carbsRemaining * 0.25
              });

              recipePlan.push({
                recipeType: 'Snack 2',
                calories: currentDay.caloriesRemaining * 0.25,
                fat: currentDay.fatRemaining * 0.25,
                protein: currentDay.proteinRemaining * 0.25,
                carbs: currentDay.carbsRemaining * 0.25
              });

            }

            break;

          case !includeBreakfast && !includeLunch && !includeDinner:

            if (currentDay.caloriesRemaining < 500) {

              // Maybe add a snack

              recipePlan.push({
                recipeType: 'Snack',
                calories: currentDay.caloriesRemaining,
                fat: currentDay.fatRemaining,
                protein: currentDay.proteinRemaining,
                carbs: currentDay.carbsRemaining
              });

            } else if (currentDay.caloriesRemaining >= 500 && currentDay.caloriesRemaining < 1000) {

              // Add a snack or two

              recipePlan.push({
                recipeType: 'Snack 1',
                calories: currentDay.caloriesRemaining * 0.5,
                fat: currentDay.fatRemaining * 0.5,
                protein: currentDay.proteinRemaining * 0.5,
                carbs: currentDay.carbsRemaining * 0.5
              });

              recipePlan.push({
                recipeType: 'Snack 2',
                calories: currentDay.caloriesRemaining * 0.5,
                fat: currentDay.fatRemaining * 0.5,
                protein: currentDay.proteinRemaining * 0.5,
                carbs: currentDay.carbsRemaining * 0.5
              });


            } else { // i.e. if caloriesRemaining are greater than 1000

              // Add a snack or two

              recipePlan.push({
                recipeType: 'Snack 1',
                calories: currentDay.caloriesRemaining * 0.33,
                fat: currentDay.fatRemaining * 0.33,
                protein: currentDay.proteinRemaining * 0.33,
                carbs: currentDay.carbsRemaining * 0.33
              });

              recipePlan.push({
                recipeType: 'Snack 2',
                calories: currentDay.caloriesRemaining * 0.33,
                fat: currentDay.fatRemaining * 0.33,
                protein: currentDay.proteinRemaining * 0.33,
                carbs: currentDay.carbsRemaining * 0.33
              });

              recipePlan.push({
                recipeType: 'Snack 3',
                calories: currentDay.caloriesRemaining * 0.33,
                fat: currentDay.fatRemaining * 0.33,
                protein: currentDay.proteinRemaining * 0.33,
                carbs: currentDay.carbsRemaining * 0.33
              });

            }

            break;

        }

        return recipePlan;

    }

  }

}
