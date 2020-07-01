import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-meals-for-today',
  templateUrl: './meals-for-today.component.html',
  styleUrls: ['./meals-for-today.component.css']
})
export class MealsForTodayComponent implements OnInit {

  mealCards = [{name: 'Test', url: "http://google.com", image: 'assets/img/color-explosion.jpg'},
               {name: 'Ultra-Crispy Slow-Roasted Pork Shoulder' , url: 'http://google.com' , image: 'https://www.seriouseats.com/recipes/images/2015/12/20111204-pork-shoulder%20-%2007.jpg'},
               {name: 'Curried Chicken Skewers', url: 'http://google.com', image: 'https://www.seriouseats.com/recipes/images/20090901skewers.jpg'},
               {name: 'Curried Chicken Skewers', url: 'http://google.com', image: 'https://www.seriouseats.com/recipes/images/20090901skewers.jpg'},
               {name: 'Curried Chicken Skewers', url: 'http://google.com', image: 'https://www.seriouseats.com/recipes/images/20090901skewers.jpg'},
               {name: 'Curried Chicken Skewers', url: 'http://google.com', image: 'https://www.seriouseats.com/recipes/images/20090901skewers.jpg'}];

  constructor() { }

  ngOnInit() {
  }

}
