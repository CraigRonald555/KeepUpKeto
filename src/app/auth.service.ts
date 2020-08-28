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
  mondayChanged = new EventEmitter<unknown>();
  tuesdayChanged = new EventEmitter<unknown>();
  wednesdayChanged = new EventEmitter<unknown>();
  thursdayChanged = new EventEmitter<unknown>();
  fridayChanged = new EventEmitter<unknown>();
  saturdayChanged = new EventEmitter<unknown>();
  sundayChanged = new EventEmitter<unknown>();

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


    });

  }

  listenToTimetableChanges(uid) {

    const mondayListener = this.fbDB.database.ref(`timetables/${uid}/Monday`);
    mondayListener.on('value', snapshot => {

      console.log('Change has been detected in Timetable for Monday');
      this.mondayChanged.emit(snapshot.val());

    });

    const tuesdayListener = this.fbDB.database.ref(`timetables/${uid}/Tuesday`);
    tuesdayListener.on('value', snapshot => {

      console.log('Change has been detected in Timetable for Tuesday');
      this.tuesdayChanged.emit(snapshot.val());

    });

    const wednesdayListener = this.fbDB.database.ref(`timetables/${uid}/Wednesday`);
    wednesdayListener.on('value', snapshot => {

      console.log('Change has been detected in Timetable for Wednesday');
      this.wednesdayChanged.emit(snapshot.val());

    });

    const thursdayListener = this.fbDB.database.ref(`timetables/${uid}/Thursday`);
    thursdayListener.on('value', snapshot => {

      console.log('Change has been detected in Timetable for Thursday');
      this.thursdayChanged.emit(snapshot.val());

    });

    const fridayListener = this.fbDB.database.ref(`timetables/${uid}/Friday`);
    fridayListener.on('value', snapshot => {

      console.log('Change has been detected in Timetable for Friday');
      this.fridayChanged.emit(snapshot.val());

    });

    const saturdayListener = this.fbDB.database.ref(`timetables/${uid}/Saturday`);
    saturdayListener.on('value', snapshot => {

      console.log('Change has been detected in Timetable for Saturday');
      this.saturdayChanged.emit(snapshot.val());

    });

    const sundayListener = this.fbDB.database.ref(`timetables/${uid}/Sunday`);
    sundayListener.on('value', snapshot => {

      console.log('Change has been detected in Timetable for Sunday');
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

  async removeRecipeFromUserTimetable(uid, dayName, recipe) {

    // Check user has a timetable
    if (await this.checkReferenceExists(`timetables/${uid}`)) {

      console.log('User has a timetable in Firebase');

      // Check timetable has the day the recipe is intended to be removed from
      if (await this.checkReferenceExists(`timetables/${uid}/${dayName}`)) {

        console.log('User has the day which the recipe is intended for in Firebase');

        // Check recipe intended to be removed exists in the day
        if (await this.checkReferenceExists(`timetables/${uid}/${dayName}/recipes/${recipe.recipeID}`) === true) {

          console.log('Recipe to be removed exists');

          await this.fbDB.database.ref(`timetables/${uid}/${dayName}/recipes/${recipe.recipeID}`).remove().catch(error => {

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

          // Add recipe to storage as well
          this.storageService.addRecipeToDay(dayName, recipe);
          recipeExistsInStorage = true;

          recipeExistsInFirebase = true;

          // If recipe already exists
        } else {

          console.log('Recipe already exists in Firebase');
          recipeExistsInFirebase = true;

          // Check if recipe also exists in storage
          if (!this.storageService.checkRecipeIsInStorage(dayName, recipe)) {

            this.storageService.addRecipeToDay(dayName, recipe);
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

  async updateLocalStorageFromFirebase(uid, dayName) {

    // Check day exists in Firebase
    if (await this.checkReferenceExists(`timetables/${uid}/${dayName}`)) {

      console.log(`${dayName} exists in Firebase`);

      // Check/Add day exists in localStorage - addDayToStorage will only add if there isn't one in there
      this.storageService.addDayToStorage(dayName);

      // Need the show and recipes array from Firebase, first check recipes exist
      if (await this.checkReferenceExists(`timetables/${uid}/${dayName}/recipes`)) {

        console.log(`${dayName}'s recipes exist in Firebase`);

        // Retrieve list of Firebase recipes for this currentDay
        const recipesInFirebase = await this.readDataFromFirebase(`timetables/${uid}/${dayName}/recipes`);

        await this.storageService.addRecipesFromFirebase(dayName, recipesInFirebase);

        // No recipes in currentDay in Firebase
      } else {

        console.log(`There are no recipes for ${dayName} in Firebase`);

        // Perhaps write noOfRecipes to the object stored in the localStorage for currentDay

      }

      // Day doesn't exist in Firebase
    } else {

      console.log(`${dayName} doesnt exist in Firebase`);

    }

  }

}
