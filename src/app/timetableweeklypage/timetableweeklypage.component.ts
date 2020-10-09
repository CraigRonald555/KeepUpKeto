import { AfterViewInit, ChangeDetectorRef, Component, NgZone, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { OwlCarousel } from 'ngx-owl-carousel';
import { EdamamService } from '../edamam.service';
import { TimetableService } from '../timetable.service';

@Component({
  selector: 'app-timetableweeklypage',
  templateUrl: './timetableweeklypage.component.html',
  styleUrls: ['./timetableweeklypage.component.css']
})
export class TimetableweeklypageComponent implements AfterViewInit {

  allRecipes: {
    day: string,
    show: boolean,
    totalCarbs: number,
    carbsRemaining: number,
    totalProtein: number,
    proteinRemaining: number,
    totalFat: number,
    fatRemaining: number,
    totalCalories: number,
    caloriesRemaining: number,
    // isKetoFriendly: boolean, // Day is not keto friendly
    // notKetoFriendlyReason: string, // Day is not keto friendly reason
    recipes: {
      recipeID: string,
      recipeType: string,
      name: string,
      image: string,
      calories: number,
      carbs: number,
      protein: number,
      fat: number,
      ingredients: []
      // isKetoFriendly: boolean, // Recipe is not keto friendly
      // notKetoFriendlyReason: string // Recipe is not keto friendly reason
    }[]
  }[];

  mySlideOptions = {margin: 5, dots: false, nav: false, responsive: {
    0: {
      items: 1,
      autoplay: false,
    },
      361: {
      items: 2,
      autoplay: false,
    },
    600: {
      items: 2,
      autoplay: false,
    },
    680: {
      items: 3,
      autoplay: false,
    },

  }};

  myCarouselItems = [];
  mySlideItems = [[]];

  @ViewChild('owlElement') owlElement: OwlCarousel;
  @ViewChildren('owlElement') owlElements: QueryList<OwlCarousel>;
  selectedDayIndex;

  progressBars = [
    {carbsPercentage: 0,carbsRemaining: 0,proteinPercentage: 0,proteinRemaining: 0,fatPercentage: 0,fatRemaining: 0,caloriesPercentage: 0,caloriesRemaining: 0},
    {carbsPercentage: 0,carbsRemaining: 0,proteinPercentage: 0,proteinRemaining: 0,fatPercentage: 0,fatRemaining: 0,caloriesPercentage: 0,caloriesRemaining: 0},
    {carbsPercentage: 0,carbsRemaining: 0,proteinPercentage: 0,proteinRemaining: 0,fatPercentage: 0,fatRemaining: 0,caloriesPercentage: 0,caloriesRemaining: 0},
    {carbsPercentage: 0,carbsRemaining: 0,proteinPercentage: 0,proteinRemaining: 0,fatPercentage: 0,fatRemaining: 0,caloriesPercentage: 0,caloriesRemaining: 0},
    {carbsPercentage: 0,carbsRemaining: 0,proteinPercentage: 0,proteinRemaining: 0,fatPercentage: 0,fatRemaining: 0,caloriesPercentage: 0,caloriesRemaining: 0},
    {carbsPercentage: 0,carbsRemaining: 0,proteinPercentage: 0,proteinRemaining: 0,fatPercentage: 0,fatRemaining: 0,caloriesPercentage: 0,caloriesRemaining: 0},
    {carbsPercentage: 0,carbsRemaining: 0,proteinPercentage: 0,proteinRemaining: 0,fatPercentage: 0,fatRemaining: 0,caloriesPercentage: 0,caloriesRemaining: 0}
  ];

  constructor(public timetableService: TimetableService, private edamamService: EdamamService, private router: Router, private changeDetector: ChangeDetectorRef, private ngZone: NgZone ) {

    // this.selectedRecipeType = this.recipeTypes[0];

    timetableService.arrayUpdated.subscribe(status => {

      this.allRecipes = timetableService.getAllRecipes();

      this.updateProgress();
      console.log(this.owlElements);

      this.changeDetector.detectChanges();

    });

  }

  generate() {

    this.timetableService.generate();

  }

  clearAll() {

    this.timetableService.clearAll();

  }

  updateProgress() {

    for (let i = 0; i < this.allRecipes.length; i++) {

      const currentDayWithRecipes = this.allRecipes[i];

      this.addRecipesToTodayCarousel(i, currentDayWithRecipes.recipes);

      this.progressBars[i] = {
        carbsPercentage: (currentDayWithRecipes.totalCarbs / this.timetableService.dailyCarbs) * 100,
        carbsRemaining: Math.floor(currentDayWithRecipes.carbsRemaining),
        proteinPercentage: (currentDayWithRecipes.totalProtein / this.timetableService.dailyProtein) * 100,
        proteinRemaining: Math.floor(currentDayWithRecipes.proteinRemaining),
        fatPercentage: (currentDayWithRecipes.totalFat / this.timetableService.dailyFat) * 100,
        fatRemaining: Math.floor(currentDayWithRecipes.fatRemaining),
        caloriesPercentage: (currentDayWithRecipes.totalCalories / this.timetableService.dailyCalories) * 100,
        caloriesRemaining: Math.floor(currentDayWithRecipes.caloriesRemaining)
      }

    }

    console.log('Progress');
    console.log(this.progressBars);

  }

  addRecipesToTodayCarousel(dayIndex, recipes) {

    // Resets/Initialise array for this day
    this.mySlideItems[dayIndex] = [];

    for (let i = 0; i < recipes.length; i++) {

      const currentRecipe = recipes[i];
      currentRecipe.recipeTypeHTML = currentRecipe.recipeType.toLowerCase();
      currentRecipe.isRecipe = true;
      this.mySlideItems[dayIndex].push(currentRecipe);

    }

    try {
      const owlElementsArray = this.owlElements.toArray();
      owlElementsArray[dayIndex].reInit();
    } catch(error) {
      console.log(error);
    }

  }

  navigateToRecipe(recipeID) {

    this.selectedDayIndex = this.timetableService.getDayIndexByName(this.timetableService.getTodayName());

    // Use ngZone run to remove the silly 'did you forget to run ngZone' error which would break owlCarousel and not actually navigate to recipe page
    this.ngZone.run(() => this.router.navigate(['recipes/'], { queryParams: { 'selectedDayIndex': this.selectedDayIndex, 'recipeID': recipeID }})).then();

  }

  ngAfterViewInit(): void {

    this.allRecipes = this.timetableService.getAllRecipes();
    this.updateProgress();

    this.changeDetector.detectChanges();

  }

}
