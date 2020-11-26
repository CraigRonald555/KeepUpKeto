import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IngredientDivider } from './ingredientDivider.service';

@Injectable({
  providedIn: 'root'
})
export class EdamamService {

  constructor(private http: HttpClient, private ingredientDivider: IngredientDivider) { }

  getMeasureURL(measureType) {

    let measureURL = 'http://www.edamam.com/ontologies/edamam.owl#Measure_' + measureType.toLowerCase();

    return measureURL;

  }

  async getFoodNutrients(foodId, measureURL, quantity) {

    let returnNutrients = {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0
    };

    const postIngredients = {

      "ingredients": [
        {
          "quantity": quantity,
          "measureURI": measureURL,
          "foodId": foodId
        }
      ]
    };

    const postURL = `https://api.edamam.com/api/food-database/v2/nutrients?app_id=196941c8&app_key=1cd2c180f1873ed2d3388d3df478d174`;

    try {

      await this.http.post(postURL, postIngredients).toPromise().then(async result => {

        // Check if the ENERC_KCAL exists in totalNutrients
        if (await result['totalNutrients'].hasOwnProperty('ENERC_KCAL')) {

          returnNutrients.calories = Math.round(result['totalNutrients']['ENERC_KCAL']['quantity'] * 10) / 10;

        } else { returnNutrients.calories = 0; }

        // Check if the CHOCDF exists in totalNutrients
        if (result['totalNutrients'].hasOwnProperty('CHOCDF')) {

          returnNutrients.carbs = Math.round(result['totalNutrients']['CHOCDF']['quantity'] * 10) / 10;

        } else { returnNutrients.carbs = 0; }

        // Check if the PROCNT exists in totalNutrients
        if (result['totalNutrients'].hasOwnProperty('PROCNT')) {

          returnNutrients.protein = Math.round(result['totalNutrients']['PROCNT']['quantity'] * 10) / 10;

        } else { returnNutrients.protein = 0; }

        // Check if the FAT exists in totalNutrients
        if (result['totalNutrients'].hasOwnProperty('FAT')) {

          returnNutrients.fat = Math.round(result['totalNutrients']['FAT']['quantity'] * 10) / 10;

        } else { returnNutrients.fat = 0; }

        console.log(result);

      });

    } catch (error) {

      console.log(error);

    }

    return returnNutrients;

  }

  async searchForFoods(food) {

    const allFoods = [];
    const returnFoods = [];
    let foodToBePushedToReturnFoods;

    const requestURL = `https://api.edamam.com/api/food-database/v2/parser?ingr=${food}&app_id=196941c8&app_key=1cd2c180f1873ed2d3388d3df478d174`;

    await this.http.get(requestURL).toPromise().then(async result => {

      console.log(result);

      const foods = result['hints'];

      console.log(foods);

      for (let i = 0; i < foods.length; i++) {

        const currentFoodDetails = foods[i]['food'];
        const currentMeasures = foods[i]['measures'];

        let gramMeasure;
        // Add 'Grams' to the start of the array by removing it and adding it to the 0th index
        for (let j = currentMeasures.length - 1; j >= 0; j--) {

          const currentMeasurement = currentMeasures[j].label;
          if (currentMeasurement === 'Gram') {
            gramMeasure = currentMeasures[j];
            currentMeasures.splice(j, 1);
          }

        }



        currentMeasures.unshift(gramMeasure);

        foodToBePushedToReturnFoods = {

          foodId: currentFoodDetails['foodId'],
          name: currentFoodDetails['label'],
          image: currentFoodDetails['image'],
          contents: currentFoodDetails['foodContentsLabel'].split('; '),
          calories: Math.round(currentFoodDetails['nutrients']['ENERC_KCAL'] * 10) / 10,
          carbs: Math.round(currentFoodDetails['nutrients']['CHOCDF'] * 10) / 10,
          fat: Math.round(currentFoodDetails['nutrients']['FAT'] * 10) / 10,
          protein: Math.round(currentFoodDetails['nutrients']['PROCNT'] * 10) / 10,
          measures: currentMeasures,
          defaultMeasure: 'Grams',
          defaultQuantity: 100,
          defaultCalories: Math.round(currentFoodDetails['nutrients']['ENERC_KCAL'] * 10) / 10,
          defaultCarbs: Math.round(currentFoodDetails['nutrients']['CHOCDF'] * 10) / 10,
          defaultFat: Math.round(currentFoodDetails['nutrients']['FAT'] * 10) / 10,
          defaultProtein: Math.round(currentFoodDetails['nutrients']['PROCNT'] * 10) / 10,

        };

        allFoods.push(foodToBePushedToReturnFoods);

      }

      console.log(foodToBePushedToReturnFoods);

    });

    // More than 10 results so we need to split the array into a datatype more suitable for pagination (double array)
    if (allFoods.length > 10 ) {

      const requiredPages = Math.floor(allFoods.length / 10);

      for (let i = 0, j = 0; i < requiredPages; i++) {

        returnFoods[i] = allFoods.slice(j, j + 9);
        j = j + 10;

      }

    } else {

      returnFoods[0] = allFoods;

    }

    return returnFoods;

  }

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

        // console.log(recipeToBePushed);
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

    let recipeForDay;

  //   let recipeForDay: {
  //     recipeID: string,
  //     recipeType: string,
  //     name: string,
  //     image: string,
  //     url: string,
  //     uri: string,
  //     calories: number,
  //     carbs: number,
  //     protein: number,
  //     fat: number,
  //     ingredients:
  // };

    console.log('Reached searchForRecipes');

    //
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

      // Retrieve the array of recipes
      const recipes = await result['hits'];

      // SHOULD BE ABLE TO REASSIGN 'FROM' VARIABLE TO RECIPES.LENGTH

      // Randomly select between the from and to values
      randomRecipeNo = Math.round((Math.random() + from) * (to-1));
      console.log(randomRecipeNo);

      if (await result['count'] > 0) {

        // If there's less recipes than the actually random selected
        if (result['count'] <= to) {
          console.log('Results returned less than 5');
          to = result['count'] - 1;
          randomRecipeNo = Math.round((Math.random() + from) * (to));
          console.log(`${randomRecipeNo} after change`);
        }

        returnRecipe = recipes[randomRecipeNo]['recipe'];

        //Use this to get the servings
        const servings = returnRecipe['yield'];

        let newIngredientsArray = [];
        let originalIngredientArray = returnRecipe['ingredientLines'];

        for (let i = 0; i < originalIngredientArray.length; i++) {

          let ingredientLine = originalIngredientArray[i];

          ingredientLine = this.ingredientDivider.convertAll(servings, ingredientLine);

          newIngredientsArray.push(ingredientLine);

        }

        recipeForDay = {
          recipeID: returnRecipe.uri.substring(returnRecipe.uri.indexOf('_') + 1, returnRecipe.uri.length),
          recipeType: recipeDetails.recipeType,
          name: returnRecipe.label,
          url: returnRecipe.url,
          uri: returnRecipe.uri,
          carbs: returnRecipe['totalNutrients'].CHOCDF.quantity / servings,
          protein: returnRecipe['totalNutrients'].PROCNT.quantity  / servings,
          fat: returnRecipe['totalNutrients'].FAT.quantity / servings,
          calories: returnRecipe.calories / servings,
          image: returnRecipe.image,
          ingredients: newIngredientsArray
        };

        console.log(`New recipe added`);
        console.log(`Name: ${returnRecipe.label}`);
        console.log(`Image: ${returnRecipe.image}`);
        console.log(`Calories: ${returnRecipe.calories / servings}`);
        console.log(`Carbs: ${returnRecipe['totalNutrients'].CHOCDF.quantity / servings}`);
        console.log(`Protein: ${returnRecipe['totalNutrients'].PROCNT.quantity / servings}`);
        console.log(`Fat: ${returnRecipe['totalNutrients'].FAT.quantity / servings}`);

      }
    });

    return recipeForDay;

  }

  async getRecipeByEdamamID(edamamRecipeID, recipeType) {

    // Make call to edamam API to retrieve the url, uri, calories, carbs, protein etc.
    const requestURL = 'https://api.edamam.com/search?app_id=4dad360d&app_key=5d6c41eeeb543f362a3b108c597193bd&r=http%3A%2F%2Fwww.edamam.com%2Fontologies%2Fedamam.owl%23recipe_' + edamamRecipeID;

    console.log('Request to Edamam for recipe details sent');

    let result = await this.http.get(requestURL).toPromise();

    result = result[0];

    const servings = result['yield'];

    let newIngredientsArray = [];
    let originalIngredientArray = result['ingredientLines'];

    for (let i = 0; i < originalIngredientArray.length; i++) {

      let ingredientLine = originalIngredientArray[i];

      ingredientLine = this.ingredientDivider.convertAll(servings, ingredientLine);

      newIngredientsArray.push(ingredientLine);

    }

    const recipeToAdd = {
      recipeID: edamamRecipeID,
      recipeType: recipeType,
      name: result['label'],
      image: result['image'],
      url: result['url'],
      uri: result['uri'],
      calories: result['calories'] / servings,
      carbs: result['totalNutrients'].CHOCDF.quantity / servings,
      protein: result['totalNutrients'].PROCNT.quantity  / servings,
      fat: result['totalNutrients'].FAT.quantity / servings,
      ingredients: newIngredientsArray,
      isKetoFriendly: true, // Recipe is not keto friendly
      notKetoFriendlyReason: '' // Recipe is not keto friendly reason
    };

    console.log('Recipe retrieved from getRecipeByEdamamID(): ');
    console.log(recipeToAdd);

    return recipeToAdd;

  }

}
