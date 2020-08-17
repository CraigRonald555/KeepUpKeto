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

  async addDayToTimetable(uid, day) {

    await this.fbDB.database.ref(`timetables/${uid}/${day.name}`).set({

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

        if (snapshot.hasChild(reference)) {

          exists = true;

        }

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
    if (this.checkReferenceExists(`timetables/${uid}`)) {

      // Check timetable has the day the recipe is intended for
      if (this.checkReferenceExists(`timetables/${uid}/${dayName}`)) {

        // Check doesn't recipe doesn't exists in the day the recipe is intended for
        if (!this.checkReferenceExists(`timetables/${uid}/${dayName}/recipes/${recipe.recipeID}`)) {

          // add recipe to firebase
          await this.fbDB.database.ref(`timetable/${uid}/${dayName}/recipes/${recipe.recipeID}`).set({

            recipeType: recipe.recipeType,
            name: recipe.name,
            image: recipe.img

          }).catch(error => {

            console.log(error);

          });

          recipeExistsInFirebase = true;

        } else {
          /* recipe already exists so there's no need to write it to Firebase, however we'd may need to write it to
          * localStorage if it doesn't exist there
          */

          this.storageService.checkRecipeIsInStorage(dayName, recipe)
          this.storageService.addToRecipeToDay(dayName, recipe);
          recipeExistsInFirebase = true;
          recipeExistsInStorage = true;


        }

      } else {

        this.addDayToTimetable(uid, dayName);
        // Write day to localStorage if it doesn't exist there

      }

    } else {

      // Add a new timetable for the user then call addDefaultTimetable
      this.addDefaultTimetable(uid);
      // Write the new days to localStorage if it doesn't exist there

    }

    if (!(recipeExistsInFirebase && recipeExistsInStorage)) {

      this.writeRecipeToUserTimetable(uid, dayName, recipe);

    }

  }

  async writeEdamamRecipeToDatabase(uri, title, imageURL) {

    /* uri e.g. "http://www.edamam.com/ontologies/edamam.owl#recipe_3bc88115588b85b4a4b6c717a510f9a5"
     * The line below creates a substring from the character after _ to the end i.e. the recipeID at the end
     */
    const recipeID = uri.substring(uri.indexOf('_') + 1, uri.length);

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

}
