import { OnInit, EventEmitter, Injectable } from '@angular/core';
import { AccountService } from './account.service';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';

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
      recipeType: string,
      name: string,
      image: string,
      url: string,
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
  dailyCalories = this.accountService.accountDetails.dailyCalories;
  dailyCarbs = this.accountService.accountDetails.macros.carbs;
  dailyProtein = this.accountService.accountDetails.macros.protein;
  dailyFat = this.accountService.accountDetails.macros.fat;

  userIngredients = this.accountService.accountDetails.ingredientPreferences;
  baseIngredients = ['chicken', 'beef', 'ribs', 'fish', 'pork', 'fish', 'lamb', 'veal', 'eggs', 'avocado', 'nuts'];

  constructor(private accountService: AccountService, private http: HttpClient) {

    this.accountService.accountDetailsUpdated.subscribe(status => {

      this.dailyCalories = this.accountService.accountDetails.dailyCalories;
      this.dailyCarbs = this.accountService.accountDetails.macros.carbs;
      this.dailyProtein = this.accountService.accountDetails.macros.protein;
      this.dailyFat = this.accountService.accountDetails.macros.fat;

    });

    if (typeof this.allRecipes === 'undefined') {
      this.allRecipes = [];
    }

    this.allRecipes.push({day: 'Monday', show: true, totalCarbs: 0, carbsRemaining: this.dailyCarbs, totalProtein: 0, proteinRemaining: this.dailyProtein, totalFat: 0, fatRemaining: this.dailyFat, totalCalories: 0, caloriesRemaining: this.dailyCalories, noOfRecipes: 0, isKetoFriendly: true, notKetoFriendlyReason: undefined, recipes: []});
    this.allRecipes.push({day: 'Tuesday', show: true, totalCarbs: 0, carbsRemaining: this.dailyCarbs, totalProtein: 0, proteinRemaining: this.dailyProtein, totalFat: 0, fatRemaining: this.dailyFat, totalCalories: 0, caloriesRemaining: this.dailyCalories, noOfRecipes: 0, isKetoFriendly: true, notKetoFriendlyReason: undefined, recipes: []});
    this.allRecipes.push({day: 'Wednesday', show: true, totalCarbs: 0, carbsRemaining: this.dailyCarbs, totalProtein: 0, proteinRemaining: this.dailyProtein, totalFat: 0, fatRemaining: this.dailyFat, totalCalories: 0, caloriesRemaining: this.dailyCalories, noOfRecipes: 0, isKetoFriendly: true, notKetoFriendlyReason: undefined, recipes: []});
    this.allRecipes.push({day: 'Thursday', show: true, totalCarbs: 0, carbsRemaining: this.dailyCarbs, totalProtein: 0, proteinRemaining: this.dailyProtein, totalFat: 0, fatRemaining: this.dailyFat, totalCalories: 0, caloriesRemaining: this.dailyCalories, noOfRecipes: 0, isKetoFriendly: true, notKetoFriendlyReason: undefined, recipes: []});
    this.allRecipes.push({day: 'Friday', show: true, totalCarbs: 0, carbsRemaining: this.dailyCarbs, totalProtein: 0, proteinRemaining: this.dailyProtein, totalFat: 0, fatRemaining: this.dailyFat, totalCalories: 0, caloriesRemaining: this.dailyCalories, noOfRecipes: 0, isKetoFriendly: true, notKetoFriendlyReason: undefined, recipes: []});
    this.allRecipes.push({day: 'Saturday', show: true, totalCarbs: 0, carbsRemaining: this.dailyCarbs, totalProtein: 0, proteinRemaining: this.dailyProtein, totalFat: 0, fatRemaining: this.dailyFat, totalCalories: 0, caloriesRemaining: this.dailyCalories, noOfRecipes: 0, isKetoFriendly: true, notKetoFriendlyReason: undefined, recipes:[]});
    this.allRecipes.push({day: 'Sunday', show: true, totalCarbs: 0, carbsRemaining: this.dailyCarbs, totalProtein: 0, proteinRemaining: this.dailyProtein, totalFat: 0, fatRemaining: this.dailyFat, totalCalories: 0, caloriesRemaining: this.dailyCalories, noOfRecipes: 0, isKetoFriendly: true, notKetoFriendlyReason: undefined, recipes: []});

    this.arrayUpdated.emit('Array Changed');

  }

  getAllRecipes(): any {

    return this.allRecipes;

  }


  getTodayRecipes() {

    const currentDayName: string = this.getDayName();

    let todayRecipes: {
      day: string,
      show: boolean,
      caloriesRemaining: number,
      noOfRecipes: number,
      recipes: {
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

  addRecipeToDay(index: number, recipe: {recipeType: string,
      name: string,
      image: string,
      url: string,
      calories: number,
      carbs: number,
      protein: number,
      fat: number}) {

        const dayWithRecipes = this.getDayByIndex(index);
        dayWithRecipes.recipes.push(recipe);
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

  removeRecipeByIndex(dayIndex: number, recipeIndex: number) {

    const dayWithRecipes = this.getDayByIndex(dayIndex);
    dayWithRecipes.recipes.splice(recipeIndex, 1);
    dayWithRecipes.noOfRecipes--;
    this.updateWeeklyTotals();
    this.arrayUpdated.emit('Array updated');

  }

  removeRecipeByObject(
    dayObject: {
      day: string,
      show: boolean,
      caloriesRemaining: number,
      noOfRecipes: number,
      recipes: {
        recipeType: string,
        name: string,
        image: string,
        calories: number,
        carbs: number
      }[]
    },
    recipeIndex: number) {

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

    });

    this.arrayUpdated.emit('Array changed');

  }

  generate() {

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

    // Loop through each day in the allRecipes array to and pass the day to the getRecipePlanStructure method
    this.allRecipes.forEach((dayWithRecipes, index) => {

      /* The reciplePlan array is assigned the result of the getRecipePlanStructure method.
       * All the attributes of each element (apart from the recipe) will be given a value from the method.
       *
       * Each element in the recipePlan will be ready to be used to make calls to the API in order to find a suitable recipe.
       *
       * The recipePlan now returns gram values as opposed to percentages like previously so the request should be able to be
       * compiled directly from the recipePlan
       */

        /*Store the user's ingredient preferences in the ingredients array and baseIngredients in a temp array */
       let userIngredients = this.accountService.accountDetails.ingredientPreferences;
       let tempBaseIngredients = ['chicken', 'beef', 'pork', 'fish', 'lamb', 'veal', 'eggs', 'avocado', 'nuts', 'cheese', 'coconut', 'yogurt', 'steak'];
       let ingredient = '';

       // Remove the exclamation mark and change Monday's isKetoFriendly value back to true in the allRecipes array back to
       if (dayWithRecipes.isKetoFriendly) {

          recipePlan = this.getReciplePlanStructure(dayWithRecipes);

          recipePlan.forEach(async recipeDetails => {

            let recipeReturned;

            //While a recipeReturned is undefined or false and there's still baseIngredients to find
            while (!recipeReturned && tempBaseIngredients.length > 0) {

              console.log('While loop starting...');

              if (userIngredients.length > 0) {


                console.log('Reached 1');

                const randomIngredientIndex = Math.round((Math.random()) * (userIngredients.length-1));
                ingredient = userIngredients[randomIngredientIndex];
                userIngredients.splice(randomIngredientIndex, 1);

              }
              else if (userIngredients.length === 0) {

                console.log('Reached 2');

                if (tempBaseIngredients.length > 0) {

                  console.log('Reached 3');

                  const randomIngredientIndex = Math.round((Math.random()) * (tempBaseIngredients.length-1));
                  ingredient = tempBaseIngredients[randomIngredientIndex];
                  tempBaseIngredients.splice(randomIngredientIndex, 1);

                }

              }

              await this.searchForRecipes(index, recipeDetails, ingredient).then(returned => {

                console.log('Returned:' + returned);
                recipeReturned = returned;

              });


          }
            console.log('Exited while loop');
            console.log(recipePlan);

          });

       } else {

        // console.log(`${dayWithRecipes.day} is marked as notKetoFriendly`); -UNCOMMENT THIS AFTER TESTING

       }

    });

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

  async searchForRecipes(index, recipeDetails, ingredient) {

    let returnRecipe;
    let randomRecipeNo;
    let recipeFound;

    const from = 0;
    let to = from + 5;

    const minCarbs = (recipeDetails.carbs - 3.5 <= 0) ? 0 : recipeDetails.carbs - 3.5;
    const maxCarbs = (recipeDetails.carbs < 0) ? 3.5 : recipeDetails.carbs + 3.5;
    const minProtein = (recipeDetails.protein - 3.5 <= 0) ? 0 : recipeDetails.protein - 3.5;
    const maxProtein = (recipeDetails.protein < 0) ? 3.5 : recipeDetails.protein + 3.5;
    const minFat = (recipeDetails.fat - 3.5 <= 0) ? 0 : recipeDetails.fat - 3.5;
    const maxFat = (recipeDetails.fat < 0) ? 3.5 : recipeDetails.fat + 3.5;
    const minCalories = (recipeDetails.calories - 35 <= 0) ? 0 : recipeDetails.calories - 35;
    const maxCalories = (recipeDetails.calories < 0) ? 35 : recipeDetails.calories + 35;

    // TEMPORARILY JUST USE BASIC PARAMETERS UNTIL MEMBERSHIP UPGRADED
    const requestURL = `https://api.edamam.com/search?q=${ingredient}&app_id=4dad360d&app_key=5d6c41eeeb543f362a3b108c597193bd&from=${from}&to=${to}&calories=${minCalories}-${maxCalories}&nutrients%5BFAT%5D=${minFat}-${maxFat}&nutrients%5BCHOCDF%5D=${minCarbs}-${maxCarbs}&nutrients%5BPROCNT%5D=${minProtein}-${maxProtein}`;
    console.log(requestURL);

    await this.http.get(requestURL).toPromise().then(result => {


      console.log(result);
      const recipes = result['hits'];

      //console.log(recipes);

      // Randomly select between the from and to values
      randomRecipeNo = Math.round((Math.random() + from) * (to-1));
      console.log(randomRecipeNo);

      if (result['count'] > 0) {

        // If there's less recipes than the actually random selected
        if (result['count'] <= to) {
          console.log('Count less than 5');
          to = result['count'] - 1;
          randomRecipeNo = Math.round((Math.random() + from) * (to));
          console.log(`${randomRecipeNo} after change`);
        }

        returnRecipe = recipes[randomRecipeNo]['recipe'];

        //Use this to get the servings
        const servings = returnRecipe['yield'];

        let recipeForDay: {
          recipeType: string,
          name: string,
          image: string,
          url: string,
          calories: number,
          carbs: number,
          protein: number,
          fat: number,
          isKetoFriendly: boolean,
          notKetoFriendlyReason: string
      } = {recipeType: recipeDetails.recipeType,
          name: returnRecipe.label,
          url: returnRecipe.url,
          carbs: returnRecipe['totalNutrients'].CHOCDF.quantity / servings,
          protein: returnRecipe['totalNutrients'].PROCNT.quantity  / servings,
          fat: returnRecipe['totalNutrients'].FAT.quantity / servings,
          calories: returnRecipe.calories / servings,
          isKetoFriendly: true,
          notKetoFriendlyReason: '',
          image: ''};

        this.addRecipeToDay(index, recipeForDay);
        recipeFound = true;

      } else {

        recipeFound = false;

      }

    });

    return recipeFound;

  }

  /* This method is designed to take in a day's recipes along with the amount of recipes and calories remaining
   * in order to configure a suitable structure for that day.
   */
  getReciplePlanStructure(currentDay: any) {

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
      if (currentDay.noOfRecipes === 0) {

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
