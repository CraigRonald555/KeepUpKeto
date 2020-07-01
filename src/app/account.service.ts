import { EventEmitter } from '@angular/core';

export class AccountService {

  accountDetails: {
    username: string,
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

  constructor(/*call the HTTP import*/) {

    this.accountDetails = {
      username: undefined,
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

    this.getAccountDetails();

  }

  getAccountDetails() {

    // Use this to make API calls to firebase which will fill in the accountDetails object

    // Test case:
    this.accountDetails.username = 'Test';
    this.accountDetails.sex = 'Male';
    this.accountDetails.age = 23;
    this.accountDetails.height = 178;
    this.accountDetails.weight = 95.25;
    this.accountDetails.ingredientPreferences = ['beef', 'chicken', 'walnuts', 'avocodo'];
    this.accountDetails.macros = {fat: 130, protein: 80, carbs: 20};
    this.calculateDailyCalories();

    console.log(this.accountDetails.dailyCalories);

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

    this.accountDetailsUpdated.emit('Daily Calories updated');

  }

}
