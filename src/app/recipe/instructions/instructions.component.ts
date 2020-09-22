import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent implements OnInit {

  url;
  urlLoaded = false;

  constructor(private route: ActivatedRoute) {


  }

  ngOnInit(): void {

    this.url = this.route.snapshot.queryParams['url'];
    console.log(`URL: ${this.url}`);
    this.urlLoaded = true;

  }

}
