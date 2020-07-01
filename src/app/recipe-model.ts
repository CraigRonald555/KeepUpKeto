export class RecipeModel{

  day;
  recipes = new Array();
  propertyShow;

  constructor(day, recipes){

    this.day = day;
    this.recipes = recipes;
    this.propertyShow = true;

  }

}
