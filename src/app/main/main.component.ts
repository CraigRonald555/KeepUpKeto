import { Component, OnInit } from '@angular/core';
import { TimetableService } from '../timetable.service';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  title = 'KetoManager';

  constructor(private timetableService: TimetableService, private accountService: AccountService) { }

  addNewRecipeTest() {

    const recipes: {
      recipeType: string,
      time: string,
      name: string,
      image: string,
      calories: number,
      carbs: number,
      protein: number,
      fat: number
    }[] = [];

    const indexOfDay = this.timetableService.dayToAddRecipeTo;

    recipes.push({recipeType: 'Breakfast', time: '10:30', name: 'Test', image: 'Test IMG', calories: 500, carbs: 5, protein: 20, fat: 25});

    this.timetableService.addRecipesToDay(indexOfDay, recipes);
    this.timetableService.arrayUpdated.emit('Array changed');

  }

  login() {

    this.accountService.getAccountDetails();

  }

  ngOnInit() {
  }

}
