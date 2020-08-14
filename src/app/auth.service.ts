import { Injectable, EventEmitter } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from 'firebase';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  signedIn = new EventEmitter<User>();

  constructor(private afAuth: AngularFireAuth, private router: Router, private fbDB: AngularFireDatabase) {

    this.afAuth.onAuthStateChanged(user => {

      if (user) {

        this.signedIn.emit(user);

      } else {

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

  async readDataFromFireBase(id, table) {

    let returnValue;

    await this.fbDB.database.ref(`${table}/` + id).once('value')
      .then(snapshot => {

        returnValue = snapshot.val();

      })
      .catch(error => {

        console.log(error);
        returnValue = error;


     });

    return returnValue;

  }

  async writeRecipeToUserTimetable(uid, data) {

    //add recipe to firebase

    await this.fbDB.database.ref('timetable/' + uid).set({
      name: data.name

    }).catch(error => {

      console.log(error);

    });

  }

  async writeEdamamRecipeToDatabase(uri, title, image) {

    /* uri e.g. "http://www.edamam.com/ontologies/edamam.owl#recipe_3bc88115588b85b4a4b6c717a510f9a5"
     * The line below creates a substring from the character after _ to the end i.e. the recipeID at the end
     */
    const recipeID = uri.substring(uri.chatAt('_') + 1, uri.length);

    // Check if recipeID exists in Firebase recipes
    await this.fbDB.database.ref('recipes/' + recipeID).once('value').then(async snapshot => {

      // If it doesn't exist then write the recipe into recipes
      if (!snapshot.exists()) {

        await this.fbDB.database.ref('recipes/' + recipeID).set({
          isEdamam: true,
          title: title,
          image: image

        }).catch(error => {

          console.log(error);

        });

      }

    });

    // Pushes recipe into recipes and returns the newRecipeKey
    // const newRecipeKey = this.fbDB.database.ref().child('recipes').push().key;

  }

}
