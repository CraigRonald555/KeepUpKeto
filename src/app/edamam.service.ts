import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IngredientDivider } from './ingredientDivider.service';

@Injectable({
  providedIn: 'root'
})
export class EdamamService {

  constructor(private http: HttpClient, private ingredientDivider: IngredientDivider) { }

  async searchForRecipes(recipeDetails, ingredient, maxResults) {

    const allRecipes = [];
    let returnRecipes = [];
    let recipeToBePushed;

    const minCarbs = (recipeDetails.carbs - 5 <= 0) ? 0 : recipeDetails.carbs - 5;
    const maxCarbs = (recipeDetails.carbs < 0) ? 5 : recipeDetails.carbs + 5;
    const minProtein = (recipeDetails.protein - 3.5 <= 0) ? 0 : recipeDetails.protein - 3.5;
    const maxProtein = (recipeDetails.protein < 0) ? 3.5 : recipeDetails.protein + 3.5;
    const minFat = (recipeDetails.fat - 3.5 <= 0) ? 0 : recipeDetails.fat - 3.5;
    const maxFat = (recipeDetails.fat < 0) ? 3.5 : recipeDetails.fat + 3.5;
    const minCalories = (recipeDetails.calories - 35 <= 0) ? 0 : recipeDetails.calories - 35;
    const maxCalories = (recipeDetails.calories < 0) ? 35 : recipeDetails.calories + 35;

    const requestURL = `https://api.edamam.com/search?q=${ingredient}&app_id=4dad360d&app_key=5d6c41eeeb543f362a3b108c597193bd&from=0&to=${maxResults}&calories=${minCalories}-${maxCalories}&nutrients%5BFAT%5D=${minFat}-${maxFat}&nutrients%5BCHOCDF%5D=${minCarbs}-${maxCarbs}&nutrients%5BPROCNT%5D=${minProtein}-${maxProtein}`;


    await this.http.get(requestURL).toPromise().then(async result => {

      const recipes = await result['hits'];

      for (let i = 0; i < recipes.length; i++) {

        const currentRecipe = recipes[i]['recipe'];

        const servings = currentRecipe.yield;

        let newIngredientsArray = [];
        let originalIngredientArray = currentRecipe['ingredientLines'];

        console.log(originalIngredientArray);

        for (let i = 0; i < originalIngredientArray.length; i++) {

          let ingredientLine = originalIngredientArray[i];

          ingredientLine = this.ingredientDivider.convertAll(servings, ingredientLine);

          // ingredientLine = this.ingredientDivider.divideStringByServings(servings, ingredientLine);
          // console.log(`After divideStringByServings: ${ingredientLine}`);

          // ingredientLine = this.ingredientDivider.addDecimalsToFractions(ingredientLine);
          // console.log(`After addDecimalsToFractions: ${ingredientLine}`);

          newIngredientsArray.push(ingredientLine);

        }

        recipeToBePushed = {

          recipeID: currentRecipe.uri.substring(currentRecipe.uri.indexOf('_') + 1, currentRecipe.uri.length),
          name: currentRecipe.label,
          url: currentRecipe.url,
          uri: currentRecipe.uri,
          image: currentRecipe.image,
          carbs: Math.round(currentRecipe['totalNutrients'].CHOCDF.quantity / servings * 10) / 10,
          protein: Math.round(currentRecipe['totalNutrients'].PROCNT.quantity  / servings * 10) / 10,
          fat: Math.round(currentRecipe['totalNutrients'].FAT.quantity / servings * 10) / 10,
          calories: Math.round(currentRecipe.calories / servings * 10) / 10,
          ingredients: newIngredientsArray

        };

        console.log(recipeToBePushed);
        allRecipes.push(recipeToBePushed);

      }

    });


    // More than 10 results so we need to split the array into a datatype more suitable for pagination (double array)
    if (allRecipes.length > 10 ) {

      const requiredPages = Math.floor(allRecipes.length / 10);

      for (let i = 0, j = 0; i < requiredPages; i++) {

        returnRecipes[i] = allRecipes.slice(j, j + 9);
        j = j + 10;

      }

    } else {

      returnRecipes[0] = allRecipes;

    }

    return returnRecipes;

  }

  async searchForRecipe(recipeDetails, ingredient) {

    let returnRecipe;
    let randomRecipeNo;

    let recipeForDay: {
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
      isKetoFriendly: boolean,
      notKetoFriendlyReason: string
  };

    console.log('Reached searchForRecipes');

    const from = 0;
    let to = from + 5;

    const minCarbs = (recipeDetails.carbs - 5 <= 0) ? 0 : recipeDetails.carbs - 5;
    const maxCarbs = (recipeDetails.carbs < 0) ? 5 : recipeDetails.carbs + 5;
    const minProtein = (recipeDetails.protein - 3.5 <= 0) ? 0 : recipeDetails.protein - 3.5;
    const maxProtein = (recipeDetails.protein < 0) ? 3.5 : recipeDetails.protein + 3.5;
    const minFat = (recipeDetails.fat - 3.5 <= 0) ? 0 : recipeDetails.fat - 3.5;
    const maxFat = (recipeDetails.fat < 0) ? 3.5 : recipeDetails.fat + 3.5;
    const minCalories = (recipeDetails.calories - 35 <= 0) ? 0 : recipeDetails.calories - 35;
    const maxCalories = (recipeDetails.calories < 0) ? 35 : recipeDetails.calories + 35;

    // TEMPORARILY JUST USE BASIC PARAMETERS UNTIL MEMBERSHIP UPGRADED
    const requestURL = `https://api.edamam.com/search?q=${ingredient}&app_id=4dad360d&app_key=5d6c41eeeb543f362a3b108c597193bd&from=${from}&to=${to}&calories=${minCalories}-${maxCalories}&nutrients%5BFAT%5D=${minFat}-${maxFat}&nutrients%5BCHOCDF%5D=${minCarbs}-${maxCarbs}&nutrients%5BPROCNT%5D=${minProtein}-${maxProtein}`;
    console.log(requestURL);

    await this.http.get(requestURL).toPromise().then(async result => {


      console.log(result);
      const recipes = await result['hits'];

      //console.log(recipes);

      // Randomly select between the from and to values
      randomRecipeNo = Math.round((Math.random() + from) * (to-1));
      console.log(randomRecipeNo);

      if (await result['count'] > 0) {

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

        recipeForDay = { recipeID: returnRecipe.uri.substring(returnRecipe.uri.indexOf('_') + 1, returnRecipe.uri.length),
          recipeType: recipeDetails.recipeType,
          name: returnRecipe.label,
          url: returnRecipe.url,
          uri: returnRecipe.uri,
          carbs: returnRecipe['totalNutrients'].CHOCDF.quantity / servings,
          protein: returnRecipe['totalNutrients'].PROCNT.quantity  / servings,
          fat: returnRecipe['totalNutrients'].FAT.quantity / servings,
          calories: returnRecipe.calories / servings,
          isKetoFriendly: true,
          notKetoFriendlyReason: '',
          image: ''
        };
      }
    });

    return recipeForDay;

  }

}
