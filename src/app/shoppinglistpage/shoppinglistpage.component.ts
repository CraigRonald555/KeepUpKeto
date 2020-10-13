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
        const recipes = dayWithRecipes.recipes;
        dayWithRecipes.checkBox = false;

        for (let j = 0; j < recipes.length; j++) {

          const currentRecipe = recipes[j];
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

    const dayWithRecipes = this.allRecipes[dayIndex];
    dayWithRecipes.checkBox = !dayWithRecipes.checkBox;

    // this.dayCheckBox = !this.dayCheckBox;
    this.changeDetector.detectChanges();

  }

  switchRecipeCheckBox(dayIndex, recipeIndex) {

    const recipeFromDay = this.allRecipes[dayIndex].recipes[recipeIndex];
    recipeFromDay.checkBox = !recipeFromDay.checkBox;
    this.changeDetector.detectChanges();

  }

  switchIngredientCheckBox(dayIndex, recipeIndex, ingredientIndex) {

    // let ingredientFromRecipeFromDay: {name: string, checkBox: boolean} = {
    //   name: this.allRecipes[dayIndex].recipes[recipeIndex].ingredients[ingredientIndex].name,
    //   checkBox: !this.allRecipes[dayIndex].recipes[recipeIndex].ingredients[ingredientIndex].checkBox
    // };

    let ingredientFromRecipeFromDay = this.allRecipes[dayIndex].recipes[recipeIndex].displayIngredients[ingredientIndex];
    ingredientFromRecipeFromDay.checkBox = !ingredientFromRecipeFromDay.checkBox;

    console.log(ingredientFromRecipeFromDay.checkBox);

    this.changeDetector.detectChanges();

  }

  addRecipeToWhisk() {

    whisk.queue.push(function() {
      whisk.shoppingList.addProductsToList({
        products: ["½ ounce dried morel mushrooms","5 tablespoons unsalted butter, divided","6 ounces chicken livers","1 medium onion, finely chopped","Kosher salt and freshly ground black pepper","6 cups low-sodium chicken broth","1½ cups cracked rye berries or regular rye berries, barley, or buckwheat","¼ cup finely chopped fresh tarragon"]
      });
    });

  }

  ngAfterViewInit(): void {

    this.allRecipes = this.timetableService.getAllRecipes();
    this.initiliseCheckboxes();

  }

}
