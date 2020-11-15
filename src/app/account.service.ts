import { EventEmitter, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  userId: string;

  accountDetails: {
    name: string,
    goals: string,
    sex: string,
    age: number,
    height: number, // cm
    weight: number, // kg
    ingredientPreferences: string[],
    macros: {
      fat: number,
      protein: number,
      carbs: number
    },
    dailyCalories: number

  };

  accountDetailsUpdated = new EventEmitter<string>();

  constructor(private auth: AuthService) {

    this.auth.signedIn.subscribe(user => {

      //Assign accountDetails to the User's details
      this.userId = user.uid;
      console.log(user.uid);

      this.updateAccountDetails();

      // make a call to the table holding the userData data using the user id

    });

    this.accountDetails = {
      name: undefined,
      goals: undefined,
      sex: undefined,
      age: undefined,
      height: undefined, // cm
      weight: undefined, // kg
      ingredientPreferences: undefined,
      macros: {
        fat: undefined,
        protein: undefined,
        carbs: undefined
      },
      dailyCalories: undefined
    };

  }

  getUserID() {

    return this.userId;

  }

  async updateAccountDetails() {

    console.log(await this.auth.readDataFromFirebase(`userData/${this.userId}`));
    const userDataResponse = await this.auth.readDataFromFirebase(`userData/${this.userId}`);

    this.accountDetails.name = userDataResponse.name;
    this.accountDetails.goals = userDataResponse.goals;
    this.accountDetails.sex = userDataResponse.sex;
    this.accountDetails.age = userDataResponse.age;
    this.accountDetails.height = userDataResponse.heightCM;
    this.accountDetails.weight = userDataResponse.weightKG;
    this.accountDetails.ingredientPreferences = userDataResponse.ingredients;

    this.calculateMacros();

    console.log(this.accountDetails.dailyCalories);

    this.accountDetailsUpdated.emit('Updated');

  }

  getAccountDetails() {

    return this.accountDetails;

  }

  calculateMacros() {

    // Nutrient percentages based on: https://www.hsph.harvard.edu/nutritionsource/healthy-weight/diet-reviews/ketogenic-diet/
    const carbsPercentage = 0.1;
    const proteinPercentage = 0.2;
    const fatPercentage = 0.7;

    let calories;

    // If user selected to lose one pound a week
    if (this.accountDetails.goals === 'loseOne') {


      if (this.accountDetails.sex === 'Male') {

        // Equation if male
        calories = (10 * this.accountDetails.weight + 6.25 * this.accountDetails.height - 5 * this.accountDetails.age + 5);

      } else if (this.accountDetails.sex === 'Female') {

        // Equation if female
        calories = (10 * this.accountDetails.weight + 6.25 * this.accountDetails.height - 5 * this.accountDetails.age - 161);

      }

      // These equations are generic and are applied whether male or female
      this.accountDetails.dailyCalories = Math.round(calories);
      this.accountDetails.dailyCalories = this.accountDetails.dailyCalories - 500;

    // If user selected to maintain weight
    } else if (this.accountDetails.goals === 'maintain') {

      if (this.accountDetails.sex === 'Male') {

        // Equation if male
        calories = (10 * this.accountDetails.weight + 6.25 * this.accountDetails.height - 5 * this.accountDetails.age + 5);

      } else if (this.accountDetails.sex === 'Female') {

        // Equation if female
        calories = (10 * this.accountDetails.weight + 6.25 * this.accountDetails.height - 5 * this.accountDetails.age - 161);

      }

      // This equation is generic and is applied whether male or female
      this.accountDetails.dailyCalories = Math.round(calories);

    // If users wants to gain one pound a week
    } else {

      if (this.accountDetails.sex === 'Male') {

        // Equation if male
        calories = (10 * this.accountDetails.weight + 6.25 * this.accountDetails.height - 5 * this.accountDetails.age + 5);

      } else if (this.accountDetails.sex === 'Female') {

        // Equation if female
        calories = (10 * this.accountDetails.weight + 6.25 * this.accountDetails.height - 5 * this.accountDetails.age - 161);

      }

      // These equations are generic and are applied whether male or female
      this.accountDetails.dailyCalories = Math.round(calories);
      this.accountDetails.dailyCalories = this.accountDetails.dailyCalories + 500;

    }


    this.accountDetails.macros.carbs =  Math.round((this.accountDetails.dailyCalories * carbsPercentage) / 4);
    this.accountDetails.macros.protein = Math.round((this.accountDetails.dailyCalories * proteinPercentage) / 4);
    this.accountDetails.macros.fat = Math.round((this.accountDetails.dailyCalories * fatPercentage) / 9);

    console.log(`Required dailyCalories: ${this.accountDetails.dailyCalories}`);
    console.log(`Required carbs: ${this.accountDetails.macros.carbs}`);
    console.log(`Required protein: ${this.accountDetails.macros.protein}`);
    console.log(`Required fat: ${this.accountDetails.macros.fat}`);

    //this.timetableService.setGenerateValues(calories, carbs, fat, protein, ingredients);

  }

}
