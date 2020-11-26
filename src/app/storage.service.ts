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

  checkMealIsInStorage(dayName, edamamType, mealID) {

    const dayExists = this.checkDayIsInStorage(dayName);
    let mealExists = false;

    if (dayExists) {

      const dayWithRecipes = this.getDayFromStorage(dayName);

      if (edamamType === 'recipe') {

        // A fancy way of checking if the passed recipe exists in the dayWithRecipes recipes array.
        mealExists = dayWithRecipes.edamamRecipes.filter(recipe => recipe.recipeID === mealID).length > 0 ? true : false;

      } else {

        // A fancy way of checking if the passed recipe exists in the dayWithRecipes recipes array.
        mealExists = dayWithRecipes.edamamFoods.filter(food => food.foodID === mealID).length > 0 ? true : false;

      }

    }

    return mealExists;

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

  checkFoodIsInStorage(dayName, foodID) {

    const dayExists = this.checkDayIsInStorage(dayName);
    let foodExists = false;

    if (dayExists) {

      const dayWithFoods = this.getDayFromStorage(dayName);

      // A fancy way of checking if the passed food exists in the dayWithFoods foods array.
      foodExists = dayWithFoods.edamamFoods.filter(food => food.foodID === foodID).length > 0 ? true : false;

    }

    return foodExists;

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
        edamamRecipes: [],
        edamamFoods: []
      };

      // Push day name as the key and the dayWithRecipes as the value
      window.localStorage.setItem(dayWithRecipes.day, JSON.stringify(dayWithRecipes));

    }

  }

  async removeFoodsNotInFirebase(dayName, foodsInFirebase) {

    const dayExists = this.checkDayIsInStorage(dayName);

    if (dayExists) {

      // Get day's foods from storage
      const foodsInStorage = this.getDayFromStorage(dayName).edamamFoods;

      // Loop through each food in storage
      for (let i = 0; i < foodsInStorage.length; i++) {

        // Store storage food id
        const currentStorageFoodID = foodsInStorage[i].foodID;

        // Use this to detect whether the food in storage is also found in Firebase array
        let foodFound = false;

        // Loop through the foodIDs in the Firebase object
        for (const currentFirebaseFoodID in foodsInFirebase) {

          // If food in storage is in firebase array, set foodFound to true
          if (currentFirebaseFoodID === currentStorageFoodID) {
            foodFound = true;
          }

        }

        // If food wasn't found during the loop above
        if (!foodFound) {

          // Remove food from storage
          this.removeFoodFromDay(dayName, currentStorageFoodID);

        }

      }

      // If day doesn't exist in storage
    } else {

      // Do nothing?

    }


  }

  async removeRecipesNotInFirebase(dayName, recipesInFirebase) {

    const dayExists = this.checkDayIsInStorage(dayName);

    if (dayExists) {

      // Get day's recipes from storage
      const recipesInStorage = this.getDayFromStorage(dayName).edamamRecipes;

      // Loop through each recipe in storage
      for (let i = 0; i < recipesInStorage.length; i++) {

        // Store storage recipe id
        const currentStorageRecipeID = recipesInStorage[i].recipeID;

        // Use this to detect whether the recipe in storage is also found in Firebase array
        let recipeFound = false;

        // Loop through the recipeIDs in the Firebase object
        for (const currentFirebaseRecipeID in recipesInFirebase) {

          // If recipe in storage is in firebase array, set recipeFound to true
          if (currentFirebaseRecipeID === currentStorageRecipeID) {
            recipeFound = true;
          }

        }

        // If recipe wasn't found during the loop above
        if (!recipeFound) {

          // Remove recipe from storage
          this.removeRecipeFromDay(dayName, currentStorageRecipeID);

        }

      }

      // If day doesn't exist in storage
    } else {

      // Do nothing?

    }


  }

  removeAllFoodsFromDay(dayName) {

    const dayExists = this.checkDayIsInStorage(dayName);

    if (dayExists) {

      const emptyFoods = [];

      const dayInStorage = this.getDayFromStorage(dayName);
      const oldFoods = dayInStorage.edamamFoods;

      // If foods exists in dayInStorage
      if (!(oldFoods === undefined || oldFoods === null)) {

        console.log(`There are currently foods in storage for ${dayName}`);

        dayInStorage.edamamFoods = emptyFoods;
        window.localStorage.setItem(dayName, JSON.stringify(dayInStorage));

      }

    }

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

  removeFoodFromDay(dayName, foodID) {

    const foodExists = this.checkRecipeIsInStorage(dayName, foodID);

    if (foodExists) {

      console.log('Food exists in storage');

      const dayInStorage = this.getDayFromStorage(dayName);

      // Remove recipe from a day
      dayInStorage.edamamFoods = dayInStorage.edamamFoods.filter(food => food.foodID !== foodID);
      window.localStorage.setItem(dayName, JSON.stringify(dayInStorage));

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

  removeMealFromDay(dayName, edamamType, mealID) {

    const mealExists = this.checkMealIsInStorage(dayName, edamamType, mealID);

    if (mealExists) {

      console.log('Meal exists in storage');

      const dayInStorage = this.getDayFromStorage(dayName);

      if (edamamType === 'recipe') {

        // Remove recipe from day
        dayInStorage.edamamRecipes = dayInStorage.edamamRecipes.filter(recipe => recipe.recipeID !== mealID);

      } else {

        // Remove food from day
        dayInStorage.edamamFoods = dayInStorage.edamamFoods.filter(food => food.foodID !== mealID);

      }

      window.localStorage.setItem(dayName, JSON.stringify(dayInStorage));

    }

  }

  async addFoodsFromFirebase(dayName, foodsInFirebase) {

    console.log(`${dayName}'s recipe IDs: `);
    console.log(foodsInFirebase);
    const dayExistsInLocalStorage = this.checkDayIsInStorage(dayName);

    let foodsAdded = false;

    if (dayExistsInLocalStorage) {

      //Loop through the foodIDs in the Firebase object
      for (const currentFoodID in foodsInFirebase) {

        // Exclude any prototype keys
        if (!foodsInFirebase.hasOwnProperty(currentFoodID)) { continue; }

        // Get the current basic food details using the current foodID e.g. { name: ..., image: ..., ... }
        const currentFoodDetails = foodsInFirebase[currentFoodID];

        const foodExistsInStorageDayAlready = this.checkFoodIsInStorage(dayName, currentFoodID);

        // Only make a call to Edamam if the food doesn't already exist in localStorage
        if (!foodExistsInStorageDayAlready) {

          try {

            await this.addFoodToDay(dayName, currentFoodDetails);

            foodsAdded = true;

          } catch (error) {

            console.log(`${error} - most likely due to Edamam having deleted the food`);

          }
        }
      }

      // If day doesn't exist in localStorage
    } else {

      // Add day to storage
      this.addDayToStorage(dayName);

      // Loop through the foodIDs in the Firebase object
      for (const currentFoodID in foodsInFirebase) {

        // Exclude any prototype keys
        if (!foodsInFirebase.hasOwnProperty(currentFoodID)) { continue; }

        // Get the food details of the object which matches the foodID e.g. { name: ..., image: ..., ... }
        const currentFoodDetails = foodsInFirebase[currentFoodID];

        // No need to check if food already exists in day because the day didn't exist before reaching this else statement
        try {

          await this.addFoodToDay(dayName, currentFoodDetails);
          foodsAdded = true;

        } catch (error) {

          console.log(`${error} - most likely due to Edamam having deleted the food`);

        }

      }

    }

  }

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

  async addFoodToDay(dayName, food) {

    // Assign whether the day exists in localStorage to true or false
    const dayExists = this.checkDayIsInStorage(dayName);

    // If the day exists in localStorage
    if (dayExists) {

      // Check if the food already exists in storage
      const foodExists = this.checkFoodIsInStorage(dayName, food.foodID);

      // If food doesn't exists
      if (!foodExists) {

        try {

          // Get measureURL using food.measureType then make a call to the edamam API using the foodID, measureURL & quantity to retrieve nutritional info
          const measureURL = this.edamamService.getMeasureURL(food.measureType);
          const nutritionalInfo = await this.edamamService.getFoodNutrients(food.foodID, measureURL, food.quantity);

          const foodToAdd = { foodID: food.foodID, foodType: food.foodType, name: food.name, image: food.image, contents: food.contents,
            measureType: food.measureType, quantity: food.quantity, calories: nutritionalInfo.calories,
            carbs: nutritionalInfo.carbs, protein: nutritionalInfo.protein, fat: nutritionalInfo.fat };

          // Get the food's day object from storage & add the food to the foods' array
          const dayWithRecipes = JSON.parse(window.localStorage.getItem(dayName));
          dayWithRecipes.edamamFoods.push(foodToAdd);
          window.localStorage.setItem(dayName, JSON.stringify(dayWithRecipes));

        } catch (error) {

          console.log(`${error} - most likely due to Edamam having deleted the food`);

        }

        /* As this method should only really be called after a food is added in Firebase, localStorage should always be up-to-date
        * with Firebase after the food is added to it - meaning there's no reason to call setIsUpToDate() after a food
        * is added to Storage
        */

      }

      // If day doesn't exist in localStorage
    } else {

      // Add day to storage
      this.addDayToStorage(dayName);

      try {

        // Get measureURL using food.measureType then make a call to the edamam API using the foodID, measureURL & quantity to retrieve nutritional info
        const measureURL = this.edamamService.getMeasureURL(food.measureType);
        const nutritionalInfo = await this.edamamService.getFoodNutrients(food.foodID, measureURL, food.quantity);

        const foodToAdd = { foodID: food.foodID, foodType: food.foodType, name: food.name, image: food.image, contents: food.contents,
          measureType: food.measureType, quantity: food.quantity, calories: nutritionalInfo.calories,
          carbs: nutritionalInfo.carbs, protein: nutritionalInfo.protein, fat: nutritionalInfo.fat };

        // Get the food's day object from storage & add the food to the foods' array
        const dayWithRecipes = JSON.parse(window.localStorage.getItem(dayName));
        dayWithRecipes.edamamFoods.push(foodToAdd);
        window.localStorage.setItem(dayName, JSON.stringify(dayWithRecipes));

      } catch (error) {

        console.log(`${error} - most likely due to Edamam having deleted the food`);

      }

      /* As this method should only really be called after a food is added in Firebase, localStorage should always be up-to-date
      * with Firebase after the food is added to it - meaning there's no reason to call setIsUpToDate() after a food
      * is added to Storage
      */

    }

  }


}
