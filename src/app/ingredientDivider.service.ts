import { Injectable } from '@angular/core';

@Injectable()
export class IngredientDivider {

  constructor() {

    console.log('Ingredient after conversion: ' + this.convertFractionsInStringToNumbers("½ cup shredded mozzarella cheese"));

  }

  convertFractionsInStringToNumbers(stringWithIngredients) {

    // If string contains ½
    if (stringWithIngredients.indexOf("½") !== - 1) {

      console.log('Reached indexOf 1/2');

      stringWithIngredients = stringWithIngredients.substring(0, stringWithIngredients.indexOf("&frac12") - 1)
      + "0.5" +
      stringWithIngredients.substring(stringWithIngredients.indexOf("&frac12") + 1, stringWithIngredients.length);

    }

    return stringWithIngredients;

  }

}
