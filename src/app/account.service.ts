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

    console.log(await this.auth.readDataFromFireBase(this.userId, 'userData'));
    const userDataResponse = await this.auth.readDataFromFireBase(this.userId, 'userData');

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

  calculateDailyCalories() {

    // Mifflin St. Joer formula

    if (this.accountDetails.sex === 'Male') {

      this.accountDetails.dailyCalories = 10 * this.accountDetails.weight + 6.25 * this.accountDetails.height
                                          - 5 * this.accountDetails.age + 5;

    } else if (this.accountDetails.sex === 'Female') {

      this.accountDetails.dailyCalories = 10 * this.accountDetails.weight + 6.25 * this.accountDetails.height
                                          - 5 * this.accountDetails.age - 161;

    }

  }

  calculateMacros() {

    const carbsPercentage = 0.2;
    const proteinPercentage = 0.3;
    const fatPercentage = 0.5;

    let calories;

    if (this.accountDetails.goals === 'loseOne') {

      if (this.accountDetails.sex === 'Male') {

        calories = (10 * this.accountDetails.weight + 6.25 * this.accountDetails.height - 5 * this.accountDetails.age + 5);

      } else if (this.accountDetails.sex === 'Female') {

        calories = (10 * this.accountDetails.weight + 6.25 * this.accountDetails.height - 5 * this.accountDetails.age - 161);

      }

      this.accountDetails.dailyCalories = Math.round((calories)  * 10) / 10;
      this.accountDetails.dailyCalories = this.accountDetails.dailyCalories - 500;
      //calories = calories - 500;
      //this.goalCalories = Math.round((calories)  * 10) / 10;

    } else if (this.accountDetails.goals === 'maintain') {

      if (this.accountDetails.sex === 'Male') {

        calories = (10 * this.accountDetails.weight + 6.25 * this.accountDetails.height - 5 * this.accountDetails.age + 5);

      } else if (this.accountDetails.sex === 'Female') {

        calories = (10 * this.accountDetails.weight + 6.25 * this.accountDetails.height - 5 * this.accountDetails.age - 161);

      }

      this.accountDetails.dailyCalories = Math.round((calories)  * 10) / 10;

    } else {

      if (this.accountDetails.sex === 'Male') {

        calories = (10 * this.accountDetails.weight + 6.25 * this.accountDetails.height - 5 * this.accountDetails.age + 5);

      } else if (this.accountDetails.sex === 'Female') {

        calories = (10 * this.accountDetails.weight + 6.25 * this.accountDetails.height - 5 * this.accountDetails.age - 161);

      }

      this.accountDetails.dailyCalories = Math.round((calories)  * 10) / 10;
      this.accountDetails.dailyCalories = this.accountDetails.dailyCalories - 500;
      //calories = calories + 500;
      //this.goalCalories = Math.round((calories) * 10) / 10;

    }

    this.accountDetails.macros.carbs =  Math.round(((this.accountDetails.dailyCalories * carbsPercentage) / 4) * 10) / 10;
    this.accountDetails.macros.protein = Math.round(((this.accountDetails.dailyCalories * proteinPercentage) / 4) * 10) / 10;
    this.accountDetails.macros.fat = Math.round(((this.accountDetails.dailyCalories * fatPercentage) / 9) * 10) / 10;

    //this.timetableService.setGenerateValues(calories, carbs, fat, protein, ingredients);

  }

}
