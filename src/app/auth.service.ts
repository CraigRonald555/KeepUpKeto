import { Injectable, EventEmitter, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from 'firebase';
import { AngularFireDatabase } from '@angular/fire/database';
import { StorageService } from './storage.service';
import { e, string } from 'mathjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  signedIn = new EventEmitter<User>();
  signedInStatus = false;
  mondayChanged = new EventEmitter<unknown>();
  tuesdayChanged = new EventEmitter<unknown>();
  wednesdayChanged = new EventEmitter<unknown>();
  thursdayChanged = new EventEmitter<unknown>();
  fridayChanged = new EventEmitter<unknown>();
  saturdayChanged = new EventEmitter<unknown>();
  sundayChanged = new EventEmitter<unknown>();

  constructor(private afAuth: AngularFireAuth, private router: Router, private fbDB: AngularFireDatabase,
              private storageService: StorageService, private ngZone: NgZone) {

    this.afAuth.onAuthStateChanged(user => {

      if (user) {

        this.signedIn.emit(user);
        this.signedInStatus = true;


      } else {

        // Don't just clear the localStorage, make sure to only remove the Days as it may break Firebase and PayPal API
        window.localStorage.clear();
        this.signedInStatus = false;

        console.log('Currently logged out');

        /* Calling the navigate inside a subscribe block causes an ngZone error which
         * leads to variables not being assigned in the landing component. It'll probably be a better
         * idea to handle unauthorised users by using auth guards
         */
        // this.router.navigate(['/landing']);

      }


    });

  }

  listenToTimetableChanges(uid) {

    const mondayListener = this.fbDB.database.ref(`timetables/${uid}/Monday`);
    mondayListener.on('value', snapshot => {

      this.mondayChanged.emit(snapshot.val());

    });

    const tuesdayListener = this.fbDB.database.ref(`timetables/${uid}/Tuesday`);
    tuesdayListener.on('value', snapshot => {

      this.tuesdayChanged.emit(snapshot.val());

    });

    const wednesdayListener = this.fbDB.database.ref(`timetables/${uid}/Wednesday`);
    wednesdayListener.on('value', snapshot => {

      this.wednesdayChanged.emit(snapshot.val());

    });

    const thursdayListener = this.fbDB.database.ref(`timetables/${uid}/Thursday`);
    thursdayListener.on('value', snapshot => {

      this.thursdayChanged.emit(snapshot.val());

    });

    const fridayListener = this.fbDB.database.ref(`timetables/${uid}/Friday`);
    fridayListener.on('value', snapshot => {

      this.fridayChanged.emit(snapshot.val());

    });

    const saturdayListener = this.fbDB.database.ref(`timetables/${uid}/Saturday`);
    saturdayListener.on('value', snapshot => {

      this.saturdayChanged.emit(snapshot.val());

    });

    const sundayListener = this.fbDB.database.ref(`timetables/${uid}/Sunday`);
    sundayListener.on('value', snapshot => {

      this.sundayChanged.emit(snapshot.val());

    });

  }

  async signUp(email, password) {

    let finalResponse;

    await this.afAuth.createUserWithEmailAndPassword(email, password)
    .then(response => {

      finalResponse = response.user.uid;

    })
    .catch(error => {

      finalResponse = error;
      console.log(error);

    });

    return finalResponse;

  }

  // Sign in with email/password
  async signIn(email, password) {

    let finalResponse;

    await this.afAuth.signInWithEmailAndPassword(email, password)
      .then(response => {

         console.log(response);
         finalResponse = 'successful';

      })
      .catch(error => {

        console.log(error);
        finalResponse = error.code;

      });

    return finalResponse;

  }

  // Sign out
  signOut() {

    this.afAuth.signOut()
    .then(response => {

      console.log(response);

    })
    .catch(error => {

      console.log(error);

    });

    this.router.navigate(['/landing']);

  }

  async resetPassword(email: string) {

    let finalResponse;

    await this.afAuth.sendPasswordResetEmail(email)
    .then(response => {

      finalResponse = 'successful';

    })
    .catch(error => {

      finalResponse = error.code;

    });

    return finalResponse;

  }

  // Add the initial details the user signs up with
  async addMetrics(uid, subscriptionID, name, ingredients, goals, sex, height, weight, dob, age) {

    await this.fbDB.database.ref('userData/' + uid).set({
      name: name,
      goals: goals,
      ingredients: ingredients,
      sex: sex,
      heightCM : height,
      weightKG: weight,
      dateOfBirth: dob,
      age: age,
      initialSubscriptionID: subscriptionID

    }).catch(error => {

      console.log(error);

    });

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    const date = yyyy + '-' + mm + '-' + dd;

    await this.addWeightToUserProgress(uid, date, weight);

  }

  async addWeightToUserProgress(uid, date, weightKG) {

    // Update the progress table
    await this.fbDB.database.ref(`userData/${uid}/progress/${date}`).set({

      'weightKG': weightKG


    }).catch(error => {

      console.log(error);

    });

    // Retrieve the most recent weight in the user's record
    const mostRecentWeight = await this.getMostRecentWeight(uid);
    // Set the main weightKG associated with this user to the most recent weight
    await this.fbDB.database.ref(`userData`).child(`${uid}`).update({

      'weightKG': mostRecentWeight

    }).catch(error => {

      console.log(error);

    });

    console.log(`${mostRecentWeight} - added to ${uid} weightKG value (most recent)`);

  }

  async getMostRecentWeight(uid) {

    // These are set when when looping through the progress
    let mostRecentWeight;
    let mostRecentDate;

    const allProgress = await this.readDataFromFirebase(`userData/${uid}/progress`);

    // Loop through the dates in allProgress
    let loopIndex = 0;
    for (let currentDate in allProgress) {

      // Skip if current element is a prototype key
      if (!allProgress.hasOwnProperty(currentDate)) { continue; }

      // Set the current weight and date at this point in the loop
      const currentWeight = allProgress[currentDate].weightKG;
      const convertedCurrentDate = new Date(currentDate);

      // If loop index is zero then we already know the first object is the most recent so far
      if (loopIndex === 0) {

        mostRecentWeight = currentWeight;
        mostRecentDate = convertedCurrentDate;

        // If we're past the first iteration of the loop
      } else {

        // If the current date is greater than the most recent date
        if (convertedCurrentDate > mostRecentDate) {

          // Set the most recent values to the current object in the array
          mostRecentWeight = currentWeight;
          mostRecentDate = convertedCurrentDate;

        }

      }

      loopIndex++;

    }

    return mostRecentWeight;

  }

  async addDayToTimetable(uid, dayName) {

    await this.fbDB.database.ref(`timetables/${uid}/${dayName}`).set({

      show: true,
      noOfRecipes: 0

    }).catch(error => {

      console.log(error);

    });

  }

  async addDefaultTimetable(uid) {

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let allDays = [];

    for (let i = 0; i < days.length; i++) {

      const currentDay = days[i];

      await this.fbDB.database.ref(`timetables/${uid}/${currentDay}`).set({

        show: true,
        noOfRecipes: 0,
        edamamRecipes: []

      }).catch(error => {

        console.log(error);

      });

    }

  }

  async checkDayMatchesBetweenStorageAndFirebaseFoods(uid, dayName) {

    // Retrieve the foods from Storage for the given dayName
    const foodsInStorage = this.storageService.getDayFromStorage(dayName).edamamFoods;

    // Retrieve the foods from Firebase for the given dayName
    const foodsInFirebase = await this.readDataFromFirebase(`timetables/${uid}/${dayName}/edamamFoods`);

    // Before we can check the length of foodsInFirebase, we should check it's not equal to null otherwise we'll get an error
    if (foodsInFirebase !== null) {

      // If the number of foods in Storage and Firebase don't match then set isUpToDate false
      if (foodsInStorage.length !== Object.keys(foodsInFirebase).length) {

        this.storageService.setDayIsUpToDate(dayName, false);

        // If there are the same amount of food in each then we'll still have to check the foodIDs in localStorage match those in Firebase
      } else {

          // Loop though each food in Storage
        for (let i = 0; i < foodsInStorage.length; i++) {

          console.log(`Detected foods in Firebase for ${dayName}`);

          // Store the currentFoodID we're up to in Storage food loop
          const currentFoodIDStorage = foodsInStorage[i].foodID;

          // Before we loop through the Firebase foods, set a found variable to false
          let foundFoodIDFromStorageInFirebase = false;

          // Loop through the foodIDs in Firebase
          for (const currentFoodIDFirebase in foodsInFirebase) {

            // If the current food ID in Firebase is equal to the one in Storage, set the found variable to true
            if (currentFoodIDFirebase === currentFoodIDStorage) {

              console.log(`Found the current food from Storage in Firebase - ${dayName}`);
              foundFoodIDFromStorageInFirebase = true;

            }

          }

          // After looping through the Firebase recipe IDs, if we didn't find the currentRecipeID from Storage in Firebase's foods
          if (!foundFoodIDFromStorageInFirebase) {

            // Then we need to set the isUpToDate value to false for the day in storage as there's a recipe we have in Storage which isn't in Firebase
            this.storageService.setDayIsUpToDate(dayName, false);

          }

          console.log('Foods in Firebase from checkDayMatchesBetweenStorageAndFirebaseFoods()' + foodsInFirebase);

        }

      }

      // If foodsInFirebase is null
    } else {

      // Check foods in storage has at least one recipe, if it does isUpToDate to false as we can't have no foods in Firebase and some in localStorage
      if (foodsInStorage.length > 0 ) {

        this.storageService.setDayIsUpToDate(dayName, false);

      }

    }

  }

  async checkDayMatchesBetweenStorageAndFirebase(uid, dayName) {

    // Retrieve the recipes from Storage for the given dayName
    const recipesInStorage = this.storageService.getDayFromStorage(dayName).edamamRecipes;

    // Retrieve the recipes from Firebase for the given dayName
    const recipesInFirebase = await this.readDataFromFirebase(`timetables/${uid}/${dayName}/edamamRecipes`);

    // Before we can check the length of recipesInFirebase, we should check it's not equal to null otherwise we'll get an error
    if (recipesInFirebase !== null) {

      // If the number of recipes in Storage and Firebase don't match then set isUpToDate false
      if (recipesInStorage.length !== Object.keys(recipesInFirebase).length) {

        this.storageService.setDayIsUpToDate(dayName, false);

        // If there are the same amount of recipes in each then we'll still have to check the recipeIDs in localStorage match those in Firebase
      } else {

          // Loop though each recipe in Storage
        for (let i = 0; i < recipesInStorage.length; i++) {

          console.log(`Detected recipes in Firebase for ${dayName}`);

          // Store the currentRecipeID we're up to in Storage recipes loop
          const currentRecipeIDStorage = recipesInStorage[i].recipeID;

          // Before we loop through the Firebase recipes, set a found variable to false
          let foundRecipeIDFromStorageInFirebase = false;

          // Loop through the recipeIDs in Firebase
          for (const currentRecipeIDFirebase in recipesInFirebase) {

            // If the current recipe ID in Firebase is equal to the one in Storage, set the found variable to true
            if (currentRecipeIDFirebase === currentRecipeIDStorage) {

              console.log(`Found the current recipe from Storage in Firebase - ${dayName}`);
              foundRecipeIDFromStorageInFirebase = true;

            }

          }

          // After looping through the Firebase recipe IDs, if we didn't find the currentRecipeID from Storage in Firebase's recipes
          if (!foundRecipeIDFromStorageInFirebase) {

            // Then we need to set the isUpToDate value to false for the day in storage as there's a recipe we have in Storage which isn't in Firebase
            this.storageService.setDayIsUpToDate(dayName, false);

          }

          console.log('Recipes in Firebase from checkDayMatchesBetweenStorageAndFirebase()' + recipesInFirebase);

        }

      }

      // If recipesInFirebase is null
    } else {

      // Check recipes in storage has at least one recipe, if it does isUpToDate to false as we can't have no recipes in Firebase and some in localStorage
      if (recipesInStorage.length > 0 ) {

        this.storageService.setDayIsUpToDate(dayName, false);

      }

    }

  }

  async checkReferenceExists(reference) {

    let exists = false;

    await this.fbDB.database.ref(reference).once('value')
      .then(snapshot => {

        console.log(`${reference}: ${snapshot.exists()}`);

        if (snapshot.exists()) {

          exists = true;

        }

      })
      .catch(error => {

        console.log(error);

      });

    return exists;

  }

  async readDataFromFirebase(reference) {

    let returnValue;

    await this.fbDB.database.ref(reference).once('value')
      .then(snapshot => {

        returnValue = snapshot.val();

      })
      .catch(error => {

        console.log(error);
        returnValue = error;

     });

    return returnValue;

  }

  async removeMealFromUserTimetable(uid, dayName, edamamType, mealID) {

    // Check user has a timetable
    if (await this.checkReferenceExists(`timetables/${uid}`)) {

      // Check timetable has the day the meal is intended to be removed from
      if (await this.checkReferenceExists(`timetables/${uid}/${dayName}`)) {

        // This is used in the firebase reference
        const edamamTypeReference = 'recipe' === edamamType ? 'edamamRecipes' : 'edamamFoods';

        // Check meal intended to be removed exists in the day
        if (await this.checkReferenceExists(`timetables/${uid}/${dayName}/${edamamTypeReference}/${mealID}`)) {

          await this.fbDB.database.ref(`timetables/${uid}/${dayName}/${edamamTypeReference}/${mealID}`).remove().catch(error => {

            console.log(error);

          });

        } else {

          // Try remove meal from storage anyway, Firebase may have updated without telling us
          this.storageService.removeMealFromDay(dayName, edamamType, mealID);

        }

      } else {

        // Try remove meal from storage anyway, Firebase may have updated without telling us
        this.storageService.removeMealFromDay(dayName, edamamType, mealID);

      }

    } else {

      // Try remove meal from storage anyway, Firebase may have updated without telling us
      this.storageService.removeMealFromDay(dayName, edamamType, mealID);

    }

  }

  async removeRecipeFromUserTimetable(uid, dayName, recipe) {

    // Check user has a timetable
    if (await this.checkReferenceExists(`timetables/${uid}`)) {

      console.log('User has a timetable in Firebase');

      // Check timetable has the day the recipe is intended to be removed from
      if (await this.checkReferenceExists(`timetables/${uid}/${dayName}`)) {

        console.log('User has the day which the recipe is intended for in Firebase');

        // Check recipe intended to be removed exists in the day
        if (await this.checkReferenceExists(`timetables/${uid}/${dayName}/edamamRecipes/${recipe.recipeID}`)) {

          console.log('Recipe to be removed exists');

          await this.fbDB.database.ref(`timetables/${uid}/${dayName}/edamamRecipes/${recipe.recipeID}`).remove().catch(error => {

            console.log(error);

          });

          this.storageService.removeRecipeFromDay(dayName, recipe.recipeID);

          // Recipe doesn't exist in the day
        } else {

          // Try remove recipe from storage anyway, Firebase may have updated without telling us
          this.storageService.removeRecipeFromDay(dayName, recipe.recipeID);

        }

        // Day doesn't exist
      } else {

        // Try remove recipe from storage anyway, Firebase may have updated without telling us
        this.storageService.removeRecipeFromDay(dayName, recipe.recipeID);

      }

      // Timetable doesn't exist
    } else {

      // Try remove recipe from storage anyway, Firebase may have updated without telling us
      this.storageService.removeRecipeFromDay(dayName, recipe.recipeID);

    }

  }

  async writeRecipeToUserTimetable(uid, dayName, recipe) {

    let recipeExistsInFirebase = false;
    let recipeExistsInStorage = false;

    // Check user has a timetable
    if (await this.checkReferenceExists(`timetables/${uid}`)) {

      console.log('User has a timetable in Firebase');

      // Check timetable has the day the recipe is intended for
      if (await this.checkReferenceExists(`timetables/${uid}/${dayName}`)) {

        console.log('User has the day which the recipe is intended for in Firebase');

        // Check doesn't recipe doesn't exists in the day the recipe is intended for
        if (await this.checkReferenceExists(`timetables/${uid}/${dayName}/edamamRecipes/${recipe.recipeID}`) === false) {

          console.log('Recipe doesnt exist in timetable');

          // add recipe to firebase
          await this.fbDB.database.ref(`timetables/${uid}/${dayName}/edamamRecipes/${recipe.recipeID}`).set({

            recipeType: recipe.recipeType,
            name: recipe.name,
            image: recipe.image

          }).catch(error => {

            console.log(error);

          });

          // Add recipe to storage as well
          await this.storageService.addRecipeToDay(dayName, recipe.recipeID, recipe.recipeType);

          recipeExistsInStorage = true;
          recipeExistsInFirebase = true;

          // If recipe already exists
        } else {

          console.log('Recipe already exists in Firebase');
          recipeExistsInFirebase = true;

          // Check if recipe also exists in storage
          if (!this.storageService.checkRecipeIsInStorage(dayName, recipe)) {

            await this.storageService.addRecipeToDay(dayName, recipe.recipeID, recipe.recipeType);
            recipeExistsInStorage = true;

          }

        }

      } else {

        await this.addDayToTimetable(uid, dayName);
        await this.storageService.addDayToStorage(dayName);

      }

    } else {

      // Add a new timetable for the user then call addDefaultTimetable
      await this.addDefaultTimetable(uid);
      // Write the new days to localStorage if it doesn't exist there

    }

    // Recursive loop if the method doesn't manage to get to the final nested if
    // if (!(recipeExistsInFirebase && recipeExistsInStorage)) {

    //   await this.writeRecipeToUserTimetable(uid, dayName, recipe);

    // }

  }

  async writeFoodToUserTimetable(uid, dayName, food) {

    let foodExistsInFirebase = false;
    let foodExistsInStorage = false;

    // Check user has a timetable
    if (await this.checkReferenceExists(`timetables/${uid}`)) {

      console.log('User has a timetable in Firebase');

      // Check timetable has the day the food is intended for
      if (await this.checkReferenceExists(`timetables/${uid}/${dayName}`)) {

        console.log('User has the day which the food is intended for in Firebase');

        // Check doesn't food doesn't exists in the day the food is intended for
        if (await this.checkReferenceExists(`timetables/${uid}/${dayName}/edamamFoods/${food.foodID}`) === false) {

          console.log('Food doesnt exist in timetable');

          // add food to firebase
          await this.fbDB.database.ref(`timetables/${uid}/${dayName}/edamamFoods/${food.foodID}`).set({

            foodType: food.foodType,
            name: food.name,
            image: food.image,
            measureType: food.measureType,
            quantity: food.quantity,
            contents: food.contents

          }).catch(error => {

            console.log(error);

          });

          // Add food to storage as well
          await this.storageService.addFoodToDay(dayName, food.foodID, food);

          foodExistsInStorage = true;
          foodExistsInFirebase = true;

          // If food already exists
        } else {

          console.log('Food already exists in Firebase');
          foodExistsInFirebase = true;

          // Check if food also exists in storage, if it doesn't add it
          if (!this.storageService.checkFoodIsInStorage(dayName, food.foodID)) {

            await this.storageService.addFoodToDay(dayName, food.foodID, food);
            foodExistsInStorage = true;

          }

        }

      } else {

        await this.addDayToTimetable(uid, dayName);
        this.storageService.addDayToStorage(dayName);

      }

    } else {

      // Add a new timetable for the user then call addDefaultTimetable
      await this.addDefaultTimetable(uid);
      // Write the new days to localStorage if it doesn't exist there

    }

    // Recursive loop if the method doesn't manage to get to the final nested if
    // if (!(recipeExistsInFirebase && recipeExistsInStorage)) {

    //   await this.writeRecipeToUserTimetable(uid, dayName, recipe);

    // }

  }

  async clearAllRecipes(uid) {

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < days.length; i++) {

      const currentDay = days[i];

      if (await this.checkReferenceExists(`timetables/${uid}/${currentDay}`)) {

        const recipesInFirebase = await this.readDataFromFirebase(`timetables/${uid}/${currentDay}/edamamRecipes`);

        for (const recipeID in recipesInFirebase) {

          await this.fbDB.database.ref(`timetables/${uid}/${currentDay}/edamamRecipes/${recipeID}`).remove();

        }
      }
    }

    this.storageService.clearAll();

  }

  async clearAllFoods(uid) {

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < days.length; i++) {

      const currentDay = days[i];

      if (await this.checkReferenceExists(`timetables/${uid}/${currentDay}`)) {

        const foodsInFirebase = await this.readDataFromFirebase(`timetables/${uid}/${currentDay}/edamamFoods`);

        for (const foodID in foodsInFirebase) {

          await this.fbDB.database.ref(`timetables/${uid}/${currentDay}/edamamFoods/${foodID}`).remove();

        }
      }
    }

    this.storageService.clearAll();

  }

  async updateLocalStorageFromFirebase(uid, dayName) {

    // Check day exists in Firebase
    if (await this.checkReferenceExists(`timetables/${uid}/${dayName}`)) {

      console.log(`${dayName} exists in Firebase`);

      // Check/Add day exists in localStorage - addDayToStorage will only add if there isn't one in there
      this.storageService.addDayToStorage(dayName);

      // Need the show and recipes array from Firebase, first check recipes exist
      if (await this.checkReferenceExists(`timetables/${uid}/${dayName}/edamamRecipes`)) {

        console.log(`${dayName}'s recipes exist in Firebase`);

        // Retrieve list of Firebase recipes for this currentDay
        const recipesInFirebase = await this.readDataFromFirebase(`timetables/${uid}/${dayName}/edamamRecipes`);

        await this.storageService.addRecipesFromFirebase(dayName, recipesInFirebase);

        await this.storageService.removeRecipesNotInFirebase(dayName, recipesInFirebase);

        // No recipes in currentDay in Firebase
      } else {

        console.log(`There are no recipes for ${dayName} in Firebase`);

        // Perhaps write noOfRecipes to the object stored in the localStorage for currentDay

        this.storageService.removeAllRecipesFromDay(dayName);
        console.log(`Recipes should now be removed from localStorage for ${dayName}`);

      }

      // Day doesn't exist in Firebase
    } else {

      console.log(`${dayName} doesnt exist in Firebase`);

    }

  }

  async updateLocalStorageFromFirebaseFoods(uid, dayName) {

    // Check day exists in Firebase
    if (await this.checkReferenceExists(`timetables/${uid}/${dayName}`)) {

      console.log(`${dayName} exists in Firebase`);

      // Check/Add day exists in localStorage - addDayToStorage will only add if there isn't one in there
      this.storageService.addDayToStorage(dayName);

      // Need the show and foods array from Firebase, first check foods exist
      if (await this.checkReferenceExists(`timetables/${uid}/${dayName}/edamamFoods`)) {

        console.log(`${dayName}'s foods exist in Firebase`);

        // Retrieve list of Firebase foods for this currentDay
        const foodsInFirebase = await this.readDataFromFirebase(`timetables/${uid}/${dayName}/edamamFoods`);

        await this.storageService.addFoodsFromFirebase(dayName, foodsInFirebase);

        await this.storageService.removeFoodsNotInFirebase(dayName, foodsInFirebase);

        // No foods in currentDay in Firebase
      } else {

        console.log(`There are no foods for ${dayName} in Firebase`);

        // Perhaps write noOffoods to the object stored in the localStorage for currentDay

        this.storageService.removeAllFoodsFromDay(dayName);
        console.log(`Foods should now be removed from localStorage for ${dayName}`);

      }

      // Day doesn't exist in Firebase
    } else {

      console.log(`${dayName} doesnt exist in Firebase`);

    }

  }

}

  // async writeEdamamRecipeToDatabase(recipeID, title, imageURL) {

  //   /* uri e.g. "http://www.edamam.com/ontologies/edamam.owl#recipe_3bc88115588b85b4a4b6c717a510f9a5"
  //    * The line below creates a substring from the character after _ to the end i.e. the recipeID at the end
  //    */

  //   // Check if recipeID exists in Firebase recipes
  //   await this.fbDB.database.ref('edamamRecipes/' + recipeID).once('value').then(async snapshot => {

  //     // If it doesn't exist then write the recipe into recipes
  //     if (!snapshot.exists()) {

  //       await this.fbDB.database.ref('edamamRecipes/' + recipeID).set({
  //         isEdamam: true,
  //         title: title,
  //         imageURL: imageURL

  //       }).catch(error => {

  //         console.log(error);

  //       });

  //     }

  //   });

  //   // Pushes recipe into recipes and returns the newRecipeKey
  //   // const newRecipeKey = this.fbDB.database.ref().child('recipes').push().key;

  // }
