import { Injectable } from '@angular/core';
import { fraction, number, create, all, string } from 'mathjs';

@Injectable()
export class IngredientDivider {

  // configure the default type of numbers as Fractions
    config = {
    // Default type of number
    // Available options: 'number' (default), 'BigNumber', or 'Fraction'
    number: 'Fraction'
  };

  // create a mathjs instance with everything included
  math = create(all, this.config);

  constructor() {

    // const stringWithIngredients = this.divideStringByServings(2, "1 1/2 tablespoons 1/2 chopped garlic, 1/6 of orange");
    // console.log(stringWithIngredients);
    // this.addDecimalsToFractions(stringWithIngredients);

    // const stringWithIngredients = this.convertDecimalsToFraction("0.75 - 1 tablespoons sugar, 1/2 of orange");
    // console.log(stringWithIngredients);


    // let result = this.improperFractionToMixedNumber(1, 2);
    // result = this.convertDecimalsToFraction(result);
    // console.log(`After converted from decimals to fraction: ${result}`);

  }

  convertAll(servings, stringWithIngredients) {

    // IMPORTANT: The order of these functions is very important, do NOT change it!

    stringWithIngredients = this.divideStringByServings(servings, stringWithIngredients);
    // console.log(`After dividing by servings: ${stringWithIngredients}`);

    stringWithIngredients = this.addDecimalsToFractions(stringWithIngredients);
    // console.log(`After adding decimals/ints to close fractions: ${stringWithIngredients}`);

    stringWithIngredients = this.convertDecimalsToFraction(stringWithIngredients);
    // console.log(`After converting decimals to fraction: ${stringWithIngredients}`);

    // console.log(" ");

    return stringWithIngredients;

  }

  // improperFractionToMixedNumber(numerator, denominator) {

  //   let result;

  //   if (numerator >= denominator) {

  //     result = this.convertRatio(this.math.number(numerator / denominator));
  //     console.log(`Result when numerator is greater than denominator: ${result}`);

  //   } else {

  //     result = this.convertRatio(this.math.fraction(numerator / denominator));
  //     console.log(`Should be the same as original: ${result}`);

  //   }

  //   return result;

  // }

  convertDecimalsToFraction(stringWithIngredients) {

    const decimalRegex = /(\d+[.]\d+)/g;
    const decimalArray = stringWithIngredients.split(decimalRegex);
    // console.log(decimalArray);

    for (let i = 0; i < decimalArray.length; i++) {

      let currentElement = decimalArray[i];
      const elementContainsDecimal = decimalRegex.test(currentElement);

      if (elementContainsDecimal) {

        // console.log(`${currentElement} is a decimal`);

        // Round to two decimal places
        currentElement = Math.round(currentElement * 100) / 100;

        // Only convert decimals less than one, otherwise we'll get improper fractions
        if (parseFloat(currentElement) < 1.00) {
          // console.log(`${currentElement} is less than one`);
          decimalArray[i] = this.convertRatio(this.math.fraction(currentElement));
        }

      }

    }

    return decimalArray.join('');

  }

  // If we originally had "1 1/2 teaspoons of sugar" after passing the string through the divideStringByServings(2, ...) method
  // then we'd be left with "0.5 1/4 teaspoons of sugar" which isn't really readible. This method combines these so they make more sense
  addDecimalsToFractions(stringWithIngredients) {

    // Detects when an integer or decimal is before
    const decimalProceedsOrPreceedsFractionRegex = /(\d+[.]\d+[ ]\d+[/]\d+)|(\d+[ ]\d+[/]\d+)/g;
    const decimalProceedsOrPreceedsFractionArray = stringWithIngredients.split(decimalProceedsOrPreceedsFractionRegex);

    for (let i = 0; i < decimalProceedsOrPreceedsFractionArray.length; i++) {

      const currentElement = decimalProceedsOrPreceedsFractionArray[i];

      // original - /((\d+[.]\d+|\d+)[ ]\d+[/]\d+)/g
      const elementContainsFractionAndDecimal = decimalProceedsOrPreceedsFractionRegex.test(currentElement);

      if (elementContainsFractionAndDecimal) {

        const decimal = currentElement.substring(0, currentElement.indexOf(" "));
        const fraction = currentElement.substring(currentElement.indexOf(" ") + 1, currentElement.length);

        const decimalAddFraction = this.convertRatio(this.math.add(this.math.fraction(decimal),this.math.fraction(fraction)));
        decimalProceedsOrPreceedsFractionArray[i] = decimalAddFraction;

      }

    }

    return decimalProceedsOrPreceedsFractionArray.join('');

  }

  divideStringByServings(servings, stringWithIngredients) {

    const splitByFractionOrNumber = stringWithIngredients.split(/(\d+[/]\d+)|(\d+)/g);

    for (let i = 0; i < splitByFractionOrNumber.length; i++) {

      const currentElement = splitByFractionOrNumber[i];

      if (currentElement !== undefined) {

        // Check if fraction
        if (currentElement.includes('/')) {

          try {

            const numerator = currentElement.substring(0, currentElement.indexOf('/'));
            const denominator = currentElement.substring(currentElement.indexOf('/') + 1, currentElement.length);

            const fractionAsNumberDividedByServings = (numerator / denominator) / servings;

            const fractionDividedByServings = this.convertRatio(this.math.fraction(fractionAsNumberDividedByServings));

            splitByFractionOrNumber[i] = fractionDividedByServings;


          } catch (error) {

            console.log("Wasn't a fraction");

          }

        }

        // Check if number (not fraction)
        if (!Number.isNaN(currentElement / 2) && !currentElement.includes(' ') && currentElement.length >= 1) {

          // console.log(`Pass NaN test: ${currentElement}`);
          splitByFractionOrNumber[i] = currentElement / servings;

        }

      }

    }

    return splitByFractionOrNumber.join('');

  }

  convertRatio(value) {

    value = this.math.format(value, { fraction: 'ratio' });
    return value;

  }

  getPosition(originalString, stringToFind, occourance) {
    return originalString.split(stringToFind, occourance).join(stringToFind).length;
  }

}
