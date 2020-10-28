import { Injectable } from '@angular/core';
import { RecursiveTemplateAstVisitor } from '@angular/compiler';
import { HttpClient } from '@angular/common/http';
import { IngredientDivider } from './ingredientDivider.service';
import { EdamamService } from './edamam.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private http: HttpClient, private ingredientDivider: IngredientDivider, private edamamService: EdamamService) { }

  clearAll() {

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < days.length; i++) {

      const currentDay = days[i];
      const dayExists = this.checkDayIsInStorage(currentDay);

      if (dayExists) {

        window.localStorage.removeItem(currentDay);
        this.setDayIsUpToDate(currentDay, false);

      }

    }

  }

  getDayFromStorage(dayName) {

    const dayExists = this.checkDayIsInStorage(dayName);
    let dayInStorage;

    if (dayExists) {

      dayInStorage = JSON.parse(window.localStorage.getItem(dayName));

    } else {

      this.addDayToStorage(dayName);
      dayInStorage = JSON.parse(window.localStorage.getItem(dayName));

    }

    return dayInStorage;

  }

  setDayIsUpToDate(dayName, trueOrFalse) {

    const dayExists = this.checkDayIsInStorage(dayName);

    if (dayExists) {

      const dayInStorage = this.getDayFromStorage(dayName);
      dayInStorage.isUpToDate = trueOrFalse;
      window.localStorage.setItem(dayName, JSON.stringify(dayInStorage));

    } else {

      this.addDayToStorage(dayName);
      const dayInStorage = this.getDayFromStorage(dayName);
      dayInStorage.isUpToDate = trueOrFalse;
      window.localStorage.setItem(dayName, JSON.stringify(dayInStorage));

    }

  }

  checkDayIsUpToDate(dayName) {

    let dayIsUpToDate = false;
    const dayExists = this.checkDayIsInStorage(dayName);

    if (dayExists) {

      const dayInStorage = this.getDayFromStorage(dayName);

      if (dayInStorage.isUpToDate === true) {

        dayIsUpToDate = true;

      }

    }

    return dayIsUpToDate;

  }

  checkDayIsInStorage(dayName) {

    const dayExists = window.localStorage.getItem(dayName) === null || window.localStorage.getItem(dayName) === undefined ? false : true;

    return dayExists;

  }

  checkRecipeIsInStorage(dayName, recipeID) {

    const dayExists = this.checkDayIsInStorage(dayName);
    let recipeExists = false;

    if (dayExists) {

      const dayWithRecipes = this.getDayFromStorage(dayName);

      // A fancy way of checking if the passed recipe exists in the dayWithRecipes recipes array.
      recipeExists = dayWithRecipes.edamamRecipes.filter(recipe => recipe.recipeID === recipeID).length > 0 ? true : false;

    }

    return recipeExists;

  }

  addDayToStorage(dayName) {

    // Assign whether the day exists in localStorage to true or false
    const dayExists = this.checkDayIsInStorage(dayName);

    // If day doesn't exist in local storage
    if (!dayExists) {

      const dayWithRecipes = {
        day: dayName,
        show: true,
        isUpToDate: false,
        edamamRecipes: []
      };

      // Push day name as the key and the dayWithRecipes as the value
      window.localStorage.setItem(dayWithRecipes.day, JSON.stringify(dayWithRecipes));

    }

  }

  async removeRecipesNotInFirebase(dayName, recipesInFirebase) {


  }



  removeAllRecipesFromDay(dayName) {

    const dayExists = this.checkDayIsInStorage(dayName);

    if (dayExists) {

      const emptyRecipes = [];

      const dayInStorage = this.getDayFromStorage(dayName);
      const oldRecipes = dayInStorage.edamamRecipes;

      // If recipes exists in dayInStorage
      if (!(oldRecipes === undefined || oldRecipes === null)) {

        console.log(`There are currently recipes in storage for ${dayName}`);

        dayInStorage.edamamRecipes = emptyRecipes;
        window.localStorage.setItem(dayName, JSON.stringify(dayInStorage));

      }

    }

  }

  removeRecipeFromDay(dayName, recipeID) {

    const recipeExists = this.checkRecipeIsInStorage(dayName, recipeID);

    if (recipeExists) {

      console.log('Recipe exists in storage');

      const dayInStorage = this.getDayFromStorage(dayName);

      // Remove recipe from a day
      dayInStorage.edamamRecipes = dayInStorage.edamamRecipes.filter(recipe => recipe.recipeID !== recipeID);
      window.localStorage.setItem(dayName, JSON.stringify(dayInStorage));

    }

  }

  // async addRecipesFromFirebaseOld(dayName, recipesInFirebase) {

  //   console.log(`${dayName}'s recipe IDs: `);
  //   console.log(recipesInFirebase);
  //   const dayExistsInLocalStorage = this.checkDayIsInStorage(dayName);

  //   let recipesAdded = false;

  //   if (dayExistsInLocalStorage) {

  //     // const dayWithRecipesInStorage = JSON.parse(window.localStorage.getItem(dayName));

  //     //Loop through the recipeIDs in the Firebase object
  //     for (const currentRecipeID in recipesInFirebase) {

  //       // Exclude any prototype keys
  //       if (!recipesInFirebase.hasOwnProperty(currentRecipeID)) { continue; }

  //       // Get the curent recipe details using the current recipeID e.g. { name: ..., image: ..., ... }
  //       const currentRecipeDetails = recipesInFirebase[currentRecipeID];

  //       const recipeExistsInStorageDayAlready = this.checkRecipeIsInStorage(dayName, currentRecipeID);

  //       // Only make a call to Edamam if the recipe doesn't already exist in localStorage
  //       if (!recipeExistsInStorageDayAlready) {

  //         try {

  //           // Make call to edamam API to retrieve the url, uri, calories, carbs, protein etc.
  //           const requestURL = 'https://api.edamam.com/search?app_id=4dad360d&app_key=5d6c41eeeb543f362a3b108c597193bd&r=http%3A%2F%2Fwww.edamam.com%2Fontologies%2Fedamam.owl%23recipe_' + currentRecipeID;

  //           console.log('Request to Edamam for recipe details sent');
  //           let result = await this.http.get(requestURL).toPromise();

  //           result = result[0];

  //           const servings = result['yield'];

            // let newIngredientsArray = [];
            // let originalIngredientArray = result['ingredientLines'];

            // for (let i = 0; i < originalIngredientArray.length; i++) {

            //   let ingredientLine = originalIngredientArray[i];

            //   ingredientLine = this.ingredientDivider.convertAll(servings, ingredientLine);

            //   // ingredientLine = this.ingredientDivider.divideStringByServings(servings, ingredientLine);
            //   // ingredientLine = this.ingredientDivider.addDecimalsToFractions(ingredientLine);

            //   newIngredientsArray.push(ingredientLine);

            // }

            // const recipeToAdd = {
            //   recipeID: currentRecipeID,
            //   recipeType: currentRecipeDetails.recipeType,
            //   name: currentRecipeDetails.name,
            //   image: result['image'],
            //   url: result['url'],
            //   uri: result['uri'],
            //   calories: result['calories'] / servings,
            //   carbs: result['totalNutrients'].CHOCDF.quantity / servings,
            //   protein: result['totalNutrients'].PROCNT.quantity  / servings,
            //   fat: result['totalNutrients'].FAT.quantity / servings,
            //   ingredients: newIngredientsArray,
            //   isKetoFriendly: true, // Recipe is not keto friendly
            //   notKetoFriendlyReason: '' // Recipe is not keto friendly reason
            // };

  //           console.log('Recipe added to storage:');
  //           console.log(recipeToAdd);

  //           this.addRecipeToDay(dayName, recipeToAdd);
  //           recipesAdded = true;

  //         } catch (error) {

  //           console.log(`${error} - most likely due to Edamam having deleted the recipe`);

  //         }
  //       }
  //     }

  //     // If day doesn't exist in localStorage
  //   } else {

  //     this.addDayToStorage(dayName);
  //     // const dayWithRecipesInStorage = JSON.parse(window.localStorage.getItem(dayName));

  //     // Loop through the recipeIDs in the Firebase object
  //     for (const recipeID in recipesInFirebase) {

  //       // Exclude any prototype keys
  //       if (!recipesInFirebase.hasOwnProperty(recipeID)) { continue; }

  //       // Get the recipe details of the object which matches the recipeID e.g. { name: ..., image: ..., ... }
  //       const recipeDetails = recipesInFirebase[recipeID];

  //       // Make call to edamam API to retrieve the url, uri, calories, carbs, protein etc.
  //       const requestURL = 'https://api.edamam.com/search?app_id=4dad360d&app_key=5d6c41eeeb543f362a3b108c597193bd&r=http%3A%2F%2Fwww.edamam.com%2Fontologies%2Fedamam.owl%23recipe_' + recipeID;

  //       console.log('Request to Edamam for recipe details sent');
  //       let result = await this.http.get(requestURL).toPromise();

  //       result = result[0];

  //       const servings = result['yield'];

  //       let ingredients = [];
  //       result['ingredientLines'].forEach(ingredientObject => {

  //         ingredients.push(ingredientObject);

  //       });

  //       const recipeToAdd = {
  //         recipeID: recipeID,
  //         recipeType: recipeDetails.recipeType,
  //         name: recipeDetails.name,
  //         image: result['image'],
  //         url: result['url'],
  //         uri: result['uri'],
  //         calories: result['calories'] / servings,
  //         carbs: result['totalNutrients'].CHOCDF.quantity / servings,
  //         protein: result['totalNutrients'].PROCNT.quantity  / servings,
  //         fat: result['totalNutrients'].FAT.quantity / servings,
  //         ingredients: ingredients,
  //         isKetoFriendly: true, // Recipe is not keto friendly
  //         notKetoFriendlyReason: '' // Recipe is not keto friendly reason
  //       };

  //       console.log(recipeToAdd);
  //       this.addRecipeToDay(dayName, recipeToAdd);
  //       // dayWithRecipesInStorage.recipes.push(recipeToAdd);
  //       recipesAdded = true;

  //     }

  //   }

  //   // if (!recipesAdded) {
  //   //   await this.addRecipesFromFirebase(dayName, recipesInFirebase);
  //   // }

  // }

  async addRecipesFromFirebase(dayName, recipesInFirebase) {

    console.log(`${dayName}'s recipe IDs: `);
    console.log(recipesInFirebase);
    const dayExistsInLocalStorage = this.checkDayIsInStorage(dayName);

    let recipesAdded = false;

    if (dayExistsInLocalStorage) {

      //Loop through the recipeIDs in the Firebase object
      for (const currentRecipeID in recipesInFirebase) {

        // Exclude any prototype keys
        if (!recipesInFirebase.hasOwnProperty(currentRecipeID)) { continue; }

        // Get the current basic recipe details using the current recipeID e.g. { name: ..., image: ..., ... }
        const currentRecipeDetails = recipesInFirebase[currentRecipeID];

        const recipeExistsInStorageDayAlready = this.checkRecipeIsInStorage(dayName, currentRecipeID);

        // Only make a call to Edamam if the recipe doesn't already exist in localStorage
        if (!recipeExistsInStorageDayAlready) {

          try {

            await this.addRecipeToDay(dayName, currentRecipeID, currentRecipeDetails.recipeType);

            recipesAdded = true;

          } catch (error) {

            console.log(`${error} - most likely due to Edamam having deleted the recipe`);

          }
        }
      }

      // If day doesn't exist in localStorage
    } else {

      // Add day to storage
      this.addDayToStorage(dayName);

      // Loop through the recipeIDs in the Firebase object
      for (const currentRecipeID in recipesInFirebase) {

        // Exclude any prototype keys
        if (!recipesInFirebase.hasOwnProperty(currentRecipeID)) { continue; }

        // Get the recipe details of the object which matches the recipeID e.g. { name: ..., image: ..., ... }
        const currentRecipeDetails = recipesInFirebase[currentRecipeID];

        // No need to check if recipe already exists in day because the day didn't exist before reaching this else statement

        try {

          await this.addRecipeToDay(dayName, currentRecipeID, currentRecipeDetails.recipeType);
          recipesAdded = true;

        } catch (error) {

          console.log(`${error} - most likely due to Edamam having deleted the recipe`);

        }

      }

    }

  }

  // addRecipeToDayOld(dayName, recipe) {

  //   // Assign whether the day exists in localStorage to true or false
  //   const dayExists = this.checkDayIsInStorage(dayName);

  //   // If the day exists in localStorage
  //   if (dayExists) {

  //     // Assign the day's recipes from storage to recipes
  //     const recipes: { recipeID: string, recipeType: string, name: string, image: string, calories: number, carbs: number,
  //       protein: number, fat: number, ingredients: [], isKetoFriendly: boolean,
  //       notKetoFriendlyReason: string }[] = JSON.parse(window.localStorage.getItem(dayName)).recipes;

  //     // Check if the recipe already exists in storage <- Old way
  //     // let recipeExists = false;
  //     // for (let i = 0; i < recipes.length; i++) {
  //     //   if (recipes[i].recipeID === recipe.recipeID) { recipeExists = true;  }
  //     // }

  //     // Check if the recipe already exists in storage
  //     const recipeExists = this.checkRecipeIsInStorage(dayName, recipe.recipeID)

  //     // If recipe doesn't exists
  //     if (!recipeExists) {

  //       // make a call to the edamam API using the recipeID to retrieve details about the nutrients etc. in the recipe
  //       // add the nutrients to the recipe properties from the edamam result

  //       // Get the recipe's day object from storage & add the recipe to the recipes' array
  //       const dayWithRecipes = JSON.parse(window.localStorage.getItem(dayName));
  //       dayWithRecipes.recipes.push(recipe);
  //       window.localStorage.setItem(dayName, JSON.stringify(dayWithRecipes));

  //       /* As this method should only really be called after a recipe is added in Firebase, localStorage should always be up-to-date
  //       * with Firebase after the recipe is added to it - meaning there's no reason to call setIsUpToDate() after a recipe
  //       * is added to Storage
  //       */

  //     }

  //     // If day doesn't exist in localStorage
  //   } else {

  //     // Add day to storage
  //     this.addDayToStorage(dayName);

  //     // make a call to the edamam API using the recipeID to retrieve details about the nutrients etc. in the recipe
  //     // add the nutrients to the recipe properties from the edamam result

  //     // We already know the day's recipes array is empty so no need to check whether it exsits or not

  //     // Get the recipe's day object from storage & add the recipe to the recipes' array
  //     const dayWithRecipes = JSON.parse(window.localStorage.getItem(dayName));
  //     dayWithRecipes.recipes.push(recipe);
  //     window.localStorage.setItem(dayName, JSON.stringify(dayWithRecipes));

  //     /* As this method should only really be called after a recipe is added in Firebase, localStorage should always be up-to-date
  //     * with Firebase after the recipe is added to it - meaning there's no reason to call setIsUpToDate() after a recipe
  //     * is added to Storage
  //     */

  //   }

  // }

  // Should receive a recipe directly from firebase therefore only contains basic info about recipe

  async addRecipeToDay(dayName, recipeID, recipeType) {

    // Assign whether the day exists in localStorage to true or false
    const dayExists = this.checkDayIsInStorage(dayName);

    // If the day exists in localStorage
    if (dayExists) {

      // Check if the recipe already exists in storage
      const recipeExists = this.checkRecipeIsInStorage(dayName, recipeID);

      // If recipe doesn't exists
      if (!recipeExists) {

        try {

          // make a call to the edamam API using the recipeID to retrieve details about the nutrients etc. in the recipe
          const recipeToAdd = await this.edamamService.getRecipeByEdamamID(recipeID, recipeType);

          // Get the recipe's day object from storage & add the recipe to the recipes' array
          const dayWithRecipes = JSON.parse(window.localStorage.getItem(dayName));
          dayWithRecipes.edamamRecipes.push(recipeToAdd);
          window.localStorage.setItem(dayName, JSON.stringify(dayWithRecipes));

        } catch (error) {

          console.log(`${error} - most likely due to Edamam having deleted the recipe`);

        }

        /* As this method should only really be called after a recipe is added in Firebase, localStorage should always be up-to-date
        * with Firebase after the recipe is added to it - meaning there's no reason to call setIsUpToDate() after a recipe
        * is added to Storage
        */

      }

      // If day doesn't exist in localStorage
    } else {

      // Add day to storage
      this.addDayToStorage(dayName);

      try {

        // make a call to the edamam API using the recipeID to retrieve details about the nutrients etc. in the recipe
        const recipeToAdd = await this.edamamService.getRecipeByEdamamID(recipeID, recipeType);

        // Get the recipe's day object from storage & add the recipe to the recipes' array
        const dayWithRecipes = JSON.parse(window.localStorage.getItem(dayName));
        dayWithRecipes.edamamRecipes.push(recipeToAdd);
        window.localStorage.setItem(dayName, JSON.stringify(dayWithRecipes));

      } catch (error) {

        console.log(`${error} - most likely due to Edamam having deleted the recipe`);

      }

      /* As this method should only really be called after a recipe is added in Firebase, localStorage should always be up-to-date
      * with Firebase after the recipe is added to it - meaning there's no reason to call setIsUpToDate() after a recipe
      * is added to Storage
      */

    }

  }


}
