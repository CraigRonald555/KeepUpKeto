import { Injectable, EventEmitter } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from 'firebase';
import { AngularFireDatabase } from '@angular/fire/database';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  signedIn = new EventEmitter<User>();

  constructor(private afAuth: AngularFireAuth, private router: Router, private fbDB: AngularFireDatabase,
              private storageService: StorageService) {

    this.afAuth.onAuthStateChanged(user => {

      if (user) {

        this.signedIn.emit(user);

      } else {

        // Don't just clear the localStorage, make sure to only remove the Days as it may break Firebase and PayPal API
        window.localStorage.clear();
        console.log('Currently logged out');

        /* Calling the navigate inside a subscribe block causes an ngZone error which
         * leads to variables not being assigned in the landing component. It'll probably be a better
         * idea to handle unauthorised users by using auth guards
         */
        // this.router.navigate(['/landing']);

      }


    })

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

    this.router.navigate(['/home']);
    return finalResponse;

  }

  // Sign in with email/password
  async signIn(email, password) {

    let finalResponse;

    await this.afAuth.signInWithEmailAndPassword(email, password)
      .then(response => {

         this.router.navigate(['/home']);
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

  async addMetrics(uid, name, ingredients, goals, sex, height, weight, dob, age) {

    await this.fbDB.database.ref('userData/' + uid).set({
      name: name,
      goals: goals,
      ingredients: ingredients,
      sex: sex,
      heightCM : height,
      weightKG: weight,
      dateOfBirth: dob,
      age: age

    }).catch(error => {

      console.log(error);

    });

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
        recipes: []

      }).catch(error => {

        console.log(error);

      });

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

    //`${table}/${id}`
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
        if (await this.checkReferenceExists(`timetables/${uid}/${dayName}/recipes/${recipe.recipeID}`) === false) {

          console.log('Recipe doesnt exist in timetable');

          // add recipe to firebase
          await this.fbDB.database.ref(`timetables/${uid}/${dayName}/recipes/${recipe.recipeID}`).set({

            recipeType: recipe.recipeType,
            name: recipe.name,
            image: recipe.image

          }).catch(error => {

            console.log(error);

          });

          recipeExistsInFirebase = true;

          // If recipe already exists
        } else {

          console.log('Recipe already exists in Firebase');
          recipeExistsInFirebase = true;

          // Check if recipe also exists in storage
          if (!this.storageService.checkRecipeIsInStorage(dayName, recipe)) {

            this.storageService.addToRecipeToDay(dayName, recipe);
            recipeExistsInStorage = true;

          }

        }

      } else {

        this.addDayToTimetable(uid, dayName);
        this.storageService.addDayToStorage(dayName);

      }

    } else {

      // Add a new timetable for the user then call addDefaultTimetable
      this.addDefaultTimetable(uid);
      // Write the new days to localStorage if it doesn't exist there

    }

    // Recursive loop if the method doesn't manage to get to the final nested if
    // if (!(recipeExistsInFirebase && recipeExistsInStorage)) {

    //   await this.writeRecipeToUserTimetable(uid, dayName, recipe);

    // }

  }

  async writeEdamamRecipeToDatabase(recipeID, title, imageURL) {

    /* uri e.g. "http://www.edamam.com/ontologies/edamam.owl#recipe_3bc88115588b85b4a4b6c717a510f9a5"
     * The line below creates a substring from the character after _ to the end i.e. the recipeID at the end
     */

    // Check if recipeID exists in Firebase recipes
    await this.fbDB.database.ref('recipes/' + recipeID).once('value').then(async snapshot => {

      // If it doesn't exist then write the recipe into recipes
      if (!snapshot.exists()) {

        await this.fbDB.database.ref('recipes/' + recipeID).set({
          isEdamam: true,
          title: title,
          imageURL: imageURL

        }).catch(error => {

          console.log(error);

        });

      }

    });

    // Pushes recipe into recipes and returns the newRecipeKey
    // const newRecipeKey = this.fbDB.database.ref().child('recipes').push().key;

  }

  async clearAllRecipes(uid) {

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < days.length; i++) {

      const currentDay = days[i];

      if (await this.checkReferenceExists(`timetables/${uid}/${currentDay}`)) {

        const recipesInFirebase = await this.readDataFromFirebase(`timetables/${uid}/${currentDay}/recipes`);

        for (const recipeID in recipesInFirebase) {

          this.fbDB.database.ref(`timetables/${uid}/${currentDay}/recipes/${recipeID}`).remove();

        }
      }
    }

    this.storageService.clearAll();

  }

  async updateLocalStorageFromFirebase(uid) {

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < days.length; i++) {

      const currentDay = days[i];

      // Check day exists in Firebase
      if (await this.checkReferenceExists(`timetables/${uid}/${currentDay}`)) {

        console.log(`${currentDay} exists in Firebase`);

        // Check/Add day exists in localStorage - addDayToStorage will only add if there isn't one in there
        this.storageService.addDayToStorage(currentDay);

        // Need the show and recipes array from Firebase, first check recipes exist
        if (await this.checkReferenceExists(`timetables/${uid}/${currentDay}/recipes`)) {

          console.log(`${currentDay}'s recipes exist in Firebase`);

          // Retrieve list of Firebase recipes for this currentDay
          const recipesInFirebase = await this.readDataFromFirebase(`timetables/${uid}/${currentDay}/recipes`);

          await this.storageService.addRecipesFromFirebase(currentDay, recipesInFirebase);

          // No recipes in currentDay in Firebase
        } else {

          console.log(`There are no recipes for ${currentDay} in Firebase`);

          // Perhaps write noOfRecipes to the object stored in the localStorage for currentDay

        }

        // Day doesn't exist in Firebase
      } else {

        console.log(`${currentDay} doesnt exist in Firebase`);

      }

    }

  }

}
