import { Injectable } from '@angular/core';
import { RecursiveTemplateAstVisitor } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  checkRecipeIsInStorage(dayName, recipe) {



  }

  addDayToStorage(day) {



  }

  addToRecipeToDay(dayName, recipe) {

    // Assign whether the day exists in localStorage to true or false based
    const dayExists = !window.localStorage.getItem(dayName) === null || !window.localStorage.getItem(dayName) === undefined ? true : false;

    // If the day exists in localStorage
    if (dayExists) {

      // Assign the day's recipes to recipes
      const recipes: { recipeID: {recipeType: string, name: string, image: string, calories: number, carbs: number,
        protein: number, fat: number, isKetoFriendly: boolean,
        notKetoFriendlyReason: string }} = JSON.parse(window.localStorage.getItem(dayName)).recipes;

      let recipeExists = false;

      // Check if the recipe already exists in storage
      for (const localRecipe in recipes) {
        // if(localRecipe.recipeID === recipe.recipeID) { recipeExists = true;  }
      }

      // If recipe exists
      if (recipeExists) {
        // Could be extra cautious and make a call to auth to check if recipe exists in Firebase then write it if not
      } else {

       // recipes.recipeID = { recipe.recipeType, ... }
       window.localStorage.setItem(dayName, JSON.stringify(recipes));

      }

      // If day doesn't exist in localStorage
    } else {

      this.addDayToStorage(dayName);

    }

  }
}
