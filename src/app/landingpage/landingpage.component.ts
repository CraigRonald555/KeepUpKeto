import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Injectable  } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

declare var paypal: any;

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.css']
})

export class LandingpageComponent implements AfterViewInit {

  ingredients = [];

  porkSelected = false;
  chickenSelected = false;
  vealSelected = false;
  eggsSelected = false;
  berriesSelected = false;
  nutsSelected = false;

  stepCounter = 0;
  progress = 0;

  centimeters = true;
  lbs = true;

  @ViewChild('loginForm') loginForm;
  today = new Date();
  loginStatus: string;
  buttonError = false;
  buttonClickable = false;

  @ViewChild('paypal') paypalElement: ElementRef;
  planID = "P-1BH46091SU0529455L2YMZFY";
  subcripId: any;

  constructor(private auth: AuthService) {}

  ngAfterViewInit() {

    paypal.Buttons({

      onInit: (data, actions) => {

        actions.disable();

        this.loginForm.statusChanges.subscribe(status => {

          this.loginStatus = status;

          if (status === 'VALID' && (this.loginForm.value.name.length > 0 && this.loginForm.value.email.length > 0 && this.loginForm.value.password.length > 0)) {

            console.log('Form enabled');
            actions.enable();

          } else {

            console.log('Form disabled');
            actions.disable();

          }

        });

      },

      onClick: (actions) => {

        if (this.loginStatus !== 'VALID') {

          this.buttonError = true;

        }

      },

      createSubscription: (data, actions) => {

        return actions.subscription.create({
          'plan_id': this.planID,
        });

      },

      onApprove: (data, actions) => {
        console.log(data + ' transaction approved');
        this.submitLoginDetails();
        console.log(data.subscriptionID);
        //this.getSubcriptionDetails(data.subscriptionID);
        // use auth login method and redirect to /home
      },

      onCancel: (data) => {

        console.log('Transaction cancelled');

      },

      onError: (err) => {

        console.log(err);

      }

    }).render(this.paypalElement.nativeElement);

    console.log(navigator.userAgent);

  }

  submitUserMetrics(metricsForm: NgForm) {

    const centimeters = metricsForm.value.centimeters;
    const feet = metricsForm.value.feet;
    const inches = metricsForm.value.inches;

    // console.log('Centimeters' + metricsForm.value.centimeters);

    // if (centimeters.length === undefined && (feet.length === undefined || inches.length === undefined)) {

    //   console.log('Height hasn\'t been entered');

    // }

    // if(metricsForm.value.)

    console.log(metricsForm.value);
    this.stepCounter = this.stepCounter + 1;

  }

  submitLoginDetails() {

    this.auth.SignUp(this.loginForm.value.email, this.loginForm.value.password);

  }

  // getSubcriptionDetails(subcriptionId) {
  //   const xhttp = new XMLHttpRequest();
  //   xhttp.onreadystatechange = function() {
  //     if (this.readyState === 4 && this.status === 200) {
  //       console.log(JSON.parse(this.responseText));
  //       alert(JSON.stringify(this.responseText));
  //     }
  //   };
  //   xhttp.open('GET', 'https://api.sandbox.paypal.com/v1/billing/subscriptions/' + subcriptionId, true);
  //   xhttp.setRequestHeader('Authorization', this.basicAuth);

  //   xhttp.send();
  // }

  addIngredient(ingredient) {

    this.ingredients.push(ingredient);

    switch (ingredient) {
      case 'pork':
        this.porkSelected = true;
        break;
      case 'chicken':
        this.chickenSelected = true;
        break;
      case 'veal':
        this.vealSelected = true;
        break;
      case 'eggs':
        this.eggsSelected = true;
        break;
      case 'berries':
        this.berriesSelected = true;
        break;
      case 'nuts':
        this.nutsSelected = true;
        break;

      default:
        // code block
    }

    console.log(this.ingredients);

  }

  removeIngredient(ingredient) {

    // this.ingredients.filter(e => e !== ingredient);

    const index = this.ingredients.indexOf(ingredient);
    if (index !== -1) {
      this.ingredients.splice(index, 1);
    }

    switch (ingredient) {
      case 'pork':
        this.porkSelected = false;
        break;
      case 'chicken':
        this.chickenSelected = false;
        break;
      case 'veal':
        this.vealSelected = false;
        break;
      case 'eggs':
        this.eggsSelected = false;
        break;
      case 'berries':
        this.berriesSelected = false;
        break;
      case 'nuts':
        this.nutsSelected = false;
        break;

      default:
        // code block
    }

    console.log(this.ingredients);

  }

}
