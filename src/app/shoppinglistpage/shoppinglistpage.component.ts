import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TimetableService } from '../timetable.service';

declare var whisk: any;

@Component({
  selector: 'app-shoppinglistpage',
  templateUrl: './shoppinglistpage.component.html',
  styleUrls: ['./shoppinglistpage.component.css']
})
export class ShoppinglistpageComponent implements AfterViewInit {

  dayCheckBox = false;

  allRecipes;
  shoppingList: {
    day: string,
    edamamRecipes: {
      ingredients: {
        ingredientName: string
      }[]
    }[]
  }[] = [];

  // allRecipes: {
  //   day: string,
  //   show: boolean,
  //   totalCarbs: number,
  //   carbsRemaining: number,
  //   totalProtein: number,
  //   proteinRemaining: number,
  //   totalFat: number,
  //   fatRemaining: number,
  //   totalCalories: number,
  //   caloriesRemaining: number,
  //   checkBox: boolean,
  //   // isKetoFriendly: boolean, // Day is not keto friendly
  //   // notKetoFriendlyReason: string, // Day is not keto friendly reason
  //   recipes: {
  //     recipeID: string,
  //     recipeType: string,
  //     name: string,
  //     image: string,
  //     calories: number,
  //     carbs: number,
  //     protein: number,
  //     fat: number,
  //     checkBox: boolean
  //     // isKetoFriendly: boolean, // Recipe is not keto friendly
  //     // notKetoFriendlyReason: string // Recipe is not keto friendly reason
  //   }[]
  // }[];

  constructor(private timetableService: TimetableService, private changeDetector: ChangeDetectorRef) {

    try {

      // Initialise whisk
      whisk = whisk || {};
      whisk.queue = whisk.queue || [];

      whisk.queue.push(function () {
        whisk.shoppingList.defineWidget("HETI-XHHE-RNCR-CYIU");
      });

      timetableService.arrayUpdated.subscribe(status => {

        this.allRecipes = timetableService.getAllRecipes();
        this.initiliseCheckboxes();
        this.changeDetector.detectChanges();

      });

    } catch (error) {

    }

  }

  initiliseCheckboxes() {

    if (this.allRecipes !== undefined) {

      for (let i = 0; i < this.allRecipes.length; i++) {

        const dayWithRecipes = this.allRecipes[i];
        const edamamRecipes = dayWithRecipes.edamamRecipes;
        dayWithRecipes.checkBox = false;

        for (let j = 0; j < edamamRecipes.length; j++) {

          const currentRecipe = edamamRecipes[j];
          currentRecipe.checkBox = false;

          // Initialise new array for this recipe's ingredients (for display)
          currentRecipe.displayIngredients = [];

          const ingredients = currentRecipe.ingredients;

          for (let k = 0; k < ingredients.length; k++) {

            currentRecipe.displayIngredients.push({
              name: ingredients[k],
              checkBox: false
            });

            console.log(currentRecipe.displayIngredients[currentRecipe.displayIngredients.length - 1])

            // ingredients[k] = { name: ingredients[k], checkBox: false };
            // console.log(ingredients[k]);

          }

        }

      }

    }

  }

  switchDayCheckBox(dayIndex) {

    // Retrieve current day and switch its checkBox
    const dayWithRecipes = this.allRecipes[dayIndex];
    dayWithRecipes.checkBox = !dayWithRecipes.checkBox;

    // If selected day's checkbox was set to true
    if (dayWithRecipes.checkBox === true) {

      // Retrieve all ingredients for the recipe
      const allRecipesFromDay = dayWithRecipes.edamamRecipes;

      // Loop through each recipe belonging to day and set checkboxes to true
      for (let i = 0; i < allRecipesFromDay.length; i++) {

        allRecipesFromDay[i].checkBox = true;

        // Loop through each ingredient belonging to current recipe and set checkBoxes to true
        for (let j = 0; j < allRecipesFromDay[i].displayIngredients.length; j++) {

          allRecipesFromDay[i].displayIngredients[j].checkBox = true;

        }

      }

      // If selected day's check was set to false
    } else {

      // Retrieve all ingredients for the recipe
      const allRecipesFromDay = dayWithRecipes.edamamRecipes;

      // Loop through each ingredient
      for (let i = 0; i < allRecipesFromDay.length; i++) {

        // Retrieve the checkbox for the current ingredient and set it to false
        allRecipesFromDay[i].checkBox = false;

        // Loop through each ingredient belonging to current recipe and set checkBoxes to false
        for (let j = 0; j < allRecipesFromDay[i].displayIngredients.length; j++) {

          allRecipesFromDay[i].displayIngredients[j].checkBox = false;

        }

      }

    }

    this.changeDetector.detectChanges();

  }

  switchRecipeCheckBox(dayIndex, recipeIndex) {

    // Retrieve current recipe and switch its checkBox
    const recipeFromDay = this.allRecipes[dayIndex].edamamRecipes[recipeIndex];
    recipeFromDay.checkBox = !recipeFromDay.checkBox;

    // If the recipe's checkBox was set to true
    if (recipeFromDay.checkBox === true) {

      // Set the day which the recipe belong to, to true
      this.allRecipes[dayIndex].checkBox = true;

      // Retrieve all ingredients for the recipe
      const allIngredientsFromRecipe = recipeFromDay.displayIngredients;

      // Loop through each ingredient
      for (let i = 0; i < allIngredientsFromRecipe.length; i++) {

        // Retrieve the checkbox for the current ingredient and set it to true
        allIngredientsFromRecipe[i].checkBox = true;

      }

      // If the recipes' checkBox was set to false
    } else {

      // Retrieve all ingredients for the recipe
      const allIngredientsFromRecipe = recipeFromDay.displayIngredients;

      // If at least one recipe hasn't been checked
      if (!this.checkAtleastOneBoxTicked(this.allRecipes[dayIndex].edamamRecipes)) {

        // Set the day which the recipe belong to, to false
        this.allRecipes[dayIndex].checkBox = false;

      }

      // Loop through each ingredient
      for (let i = 0; i < allIngredientsFromRecipe.length; i++) {

        // Retrieve the checkbox for the current ingredient and set it to false
        allIngredientsFromRecipe[i].checkBox = false;

      }

    }

    this.changeDetector.detectChanges();

  }

  switchIngredientCheckBox(dayIndex, recipeIndex, ingredientIndex) {

    const dayWithRecipes = this.allRecipes[dayIndex];
    const recipeFromDay = this.allRecipes[dayIndex].edamamRecipes[recipeIndex];

    let ingredientFromRecipeFromDay = this.allRecipes[dayIndex].edamamRecipes[recipeIndex].displayIngredients[ingredientIndex];
    ingredientFromRecipeFromDay.checkBox = !ingredientFromRecipeFromDay.checkBox;

    // If at least one box from the ingredients is ticked
    if (this.checkAtleastOneBoxTicked(this.allRecipes[dayIndex].edamamRecipes[recipeIndex].displayIngredients)) {

      // Set the day & recipe checkboxes to true
      dayWithRecipes.checkBox = true;
      recipeFromDay.checkBox = true;

      // If no ingredient boxes are ticked
    } else {

      // Set recipe checkbox to false
      recipeFromDay.checkBox = false;

      // If there's at least one box from the day's recipes ticked
      if (this.checkAtleastOneBoxTicked(dayWithRecipes.edamamRecipes)) {

        // Set day checkbox to true
        dayWithRecipes.checkBox = true;

        // If there's no recipes ticked
      } else {
        // Set day checkbox to false
        dayWithRecipes.checkBox = false;
      }

    }

    console.log(ingredientFromRecipeFromDay.checkBox);

    this.changeDetector.detectChanges();

  }

  checkAtleastOneBoxTicked(array) {

    console.log(array);

    let oneBoxTicked = false;

    for (let i = 0; i < array.length; i++) {

      const currentElement = array[i].checkBox;

      if (currentElement === true) {
        oneBoxTicked = true;
      }

    }

    console.log(`oneBoxTicked: ${oneBoxTicked}`);

    return oneBoxTicked;

  }

  addIngredientsToWhisk() {

    const shoppingListArray = [];

    // Loop through days
    for (let i = 0; i < this.allRecipes.length; i++) {

      const currentRecipesFromDay = this.allRecipes[i].edamamRecipes;

      // Loop through recipes from day
      for (let j = 0; j < currentRecipesFromDay.length; j++) {

        const currentIngredientsFromRecipes = currentRecipesFromDay[j].displayIngredients;

        // Loop through displayIngredients from recipe
        for (let k = 0; k < currentIngredientsFromRecipes.length; k++) {

          const currentIngredient = currentIngredientsFromRecipes[k];

          if (currentIngredient.checkBox === true) {

            shoppingListArray.push(currentIngredient.name);

          }

        }

      }

    }

    const half = Math.ceil(shoppingListArray.length / 2);

    const firstHalfShoppingList = shoppingListArray.splice(0, half);
    const secondHalfShoppingList = shoppingListArray.splice(-half);

    whisk.queue.push(function() {
      whisk.shoppingList.addProductsToList({
        products: firstHalfShoppingList,
      });
    });

    setTimeout(this.pushPartOfArrayIntoWhisk, 5000, secondHalfShoppingList);

  }

  pushPartOfArrayIntoWhisk(ingredientsArray) {

    console.log('Timer test');

    whisk.queue.push(function() {
      whisk.shoppingList.addProductsToList({
        products: ingredientsArray,
      });
    });

  }

  ngAfterViewInit(): void {

    this.allRecipes = this.timetableService.getAllRecipes();
    this.initiliseCheckboxes();

  }

}
