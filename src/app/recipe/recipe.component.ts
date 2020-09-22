import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EdamamService } from '../edamam.service';
import { TimetableService } from '../timetable.service';


@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css']
})
export class RecipeComponent implements OnInit {

  recipeDetails;
  dataLoaded = false;

  progressBars = {
    carbsPercentage: 0,
    carbsTotal: 0,
    carbsDaily: 0,
    proteinPercentage: 0,
    proteinTotal: 0,
    proteinDaily: 0,
    fatPercentage: 0,
    fatTotal: 0,
    fatDaily: 0,
    caloriesPercentage: 0,
    caloriesTotal: 0,
    caloriesDaily: 0
  };

  constructor(private timetableService: TimetableService, private router: Router, private route: ActivatedRoute, private ngZone: NgZone ,private changeDetector: ChangeDetectorRef) {

    if (this.timetableService.dataLoaded) {

      // Retrieve recipe details

      const selectedDayWithRecipes = this.timetableService.getDayByIndex(+this.route.snapshot.queryParams.selectedDayIndex).recipes;
      console.log(selectedDayWithRecipes);

      this.recipeDetails = this.findRecipeInRecipesArray(selectedDayWithRecipes, this.route.snapshot.queryParams['recipeID']);
      console.log(this.recipeDetails);

      this.fillProgressBars();

      this.dataLoaded = true;

  }

    this.timetableService.arrayUpdated.subscribe(status => {

      // If the params change whilst user is on recipe page (e.g. if they refresh)
      this.route.queryParams.subscribe((params: Params) => {

        // Convert selectedDayIndex back to integer using '+' before the variable
        const selectedDayWithRecipes = this.timetableService.getDayByIndex(+params['selectedDayIndex']).recipes;

        console.log(selectedDayWithRecipes);

        console.log(`Query params: ${params['selectedDayIndex']} and ${params['recipeID']}`);

        this.recipeDetails = this.findRecipeInRecipesArray(selectedDayWithRecipes, params['recipeID']);

        this.fillProgressBars();

      });

      this.dataLoaded = true;
      this.changeDetector.detectChanges();

    });

  }

  ngOnInit(): void {

  }

  fillProgressBars() {

    // Fill in progress bars

    this.progressBars = {
      carbsPercentage: (this.recipeDetails.carbs / this.timetableService.dailyCarbs) * 100,
      carbsTotal: this.recipeDetails.carbs,
      carbsDaily: this.timetableService.dailyCarbs,
      proteinPercentage: (this.recipeDetails.protein / this.timetableService.dailyProtein) * 100,
      proteinTotal: this.recipeDetails.protein,
      proteinDaily: this.timetableService.dailyProtein,
      fatPercentage: (this.recipeDetails.fat / this.timetableService.dailyFat) * 100,
      fatTotal: this.recipeDetails.fat,
      fatDaily: this.timetableService.dailyFat,
      caloriesPercentage: (this.recipeDetails.calories / this.timetableService.dailyCalories) * 100,
      caloriesTotal: this.recipeDetails.calories,
      caloriesDaily: this.timetableService.dailyCalories,

    }

  }

  findRecipeInRecipesArray(recipesArray, recipeIDToFind) {

    let foundRecipe = '';

    // Loop through recipesArray
    for (let i = 0; i < recipesArray.length; i++) {

      // The current recipe in array
      const currentRecipe = recipesArray[i];

      // If the current recipe's ID is equal to the one passed (usually from params) then assign it to the foundRecipe
      if (currentRecipe.recipeID === recipeIDToFind) {

        foundRecipe = currentRecipe;

      }

    }

    return foundRecipe;

  }

  // navigateToIntructions() {

  //   // Use ngZone run to remove the silly 'did you forget to run ngZone' error which would break owlCarousel and not actually navigate to recipe page
  //   this.ngZone.run(() => this.router.navigate(['instructions/'], { queryParams: { 'url': this.recipeDetails.url}})).then();

  // }

}
