import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-add-meal',
  templateUrl: './add-meal.component.html',
  styleUrls: ['./add-meal.component.css']
})
export class AddMealComponent implements OnInit {


  @Input() content;

  constructor() { }

  ngOnInit() {
  }

}
