import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Injectable, ChangeDetectorRef  } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
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

  weightKG;
  heightCM;
  goalsText;
  sexText;
  dateOfBirth;
  age;
  name;

  centimeters = true;
  lbs = true;
  male: boolean = undefined;
  goals: number = undefined; // -1 = lose 1kg, 0 = maintain, 1 = gain 1kg

  // Track step of each form step
  signUpStep = 0;
  loginStep = 0;

  progress = 0; // For progress bar

  resetPasswordError = false;
  resetPasswordSuccess = false;

  loginAttemptFailed = false;

  @ViewChild('signUpForm') signUpForm;
  @ViewChild('closeSignUpForm') closeSignUpForm;

  @ViewChild('closeLoginModal') closeLoginModal;
  @ViewChild('loginModal') loginModal;

  @ViewChild('metricsForm') userMetricsForm;
  today = new Date();
  loginStatus: string;
  buttonError = false;
  buttonClickable = false;

  @ViewChild('paypal') paypalElement: ElementRef;
  planID = "P-1BH46091SU0529455L2YMZFY";
  subcripId: any;

  constructor(private auth: AuthService, private changeDetector: ChangeDetectorRef, private router: Router) {
  }

  ngAfterViewInit() {

    this.signUpStep = 0;
    this.progress = 0;
    this.loginStep = 0;

    console.log(`signUpStep: ${this.signUpStep}, loginStep: ${this.loginStep}`);

    this.changeDetector.detectChanges();

    paypal.Buttons({

      onInit: (data, actions) => {

        actions.disable();

        this.signUpForm.statusChanges.subscribe(status => {

          this.loginStatus = status;

          if (status === 'VALID' && (this.signUpForm.value.name.length > 0 && this.signUpForm.value.email.length > 0 && this.signUpForm.value.password.length > 0)) {

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
        console.log(data);
        this.submitSignUpDetails(data.subscriptionID);
        console.log('Subscription ID: ' + data.subscriptionID);
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

  }

  assignUserMetrics() {

    if (this.lbs) {
      this.weightKG = this.userMetricsForm.value.pounds / 2.2;
    } else {
      this.weightKG = this.userMetricsForm.value.kilograms;
    }

    // Convert feet and inches to cm
    if (!this.centimeters) {

      const feet = this.userMetricsForm.value.feet;
      const inches = this.userMetricsForm.value.inches;

      this. heightCM = (feet * 30.48) + (inches * 2.54);

    } else {
      this. heightCM = this.userMetricsForm.value.centimeters;
    }

    switch (true) {

      case this.goals === 0:      this.goalsText = 'maintain'; break;
      case this.goals === -1:     this.goalsText = 'loseOne'; break;
      case this.goals === +1:     this.goalsText = 'gainOne'; break;

    }

    switch (true) {

      case this.male === true:        this.sexText = 'Male'; break;
      case this.male === false:       this.sexText = 'Female'; break;

    }

    this.dateOfBirth = this.userMetricsForm.value.dateOfBirth;
    this.age = this.convertDOBtoAge(this.dateOfBirth);

  }


  async submitSignUpDetails(subscriptionID) {

    this.name = this.signUpForm.value.name;

    const uid = await this.auth.signUp(this.signUpForm.value.email, this.signUpForm.value.password);
    await this.auth.addMetrics(uid, subscriptionID, this.name, this.ingredients, this.goalsText, this.sexText, this.heightCM, this.weightKG, this.dateOfBirth, this.age);
    await this.auth.addDefaultTimetable(uid);

    this.closeSignUpForm.nativeElement.click();

    // Temporary page crash fix caused by modal box, wait a second for the modal box to close before navigating away
    setTimeout(() => this.router.navigate(['/home']), 1000);

  }

  async submitSignInDetails(loginForm: NgForm) {

    this.resetPasswordSuccess = false; // After submitting a login, reset the passwordSuccess message to not being showing

    const response = await this.auth.signIn(loginForm.value.emailLogin, loginForm.value.passwordLogin);

    switch (true) {

      case response === 'auth/wrong-password':    this.loginAttemptFailed = true;
                                                  break;

      case response === 'auth/user-not-found':    this.loginAttemptFailed = true;
                                                  break;

      case response === 'successful':   break;

    }

    if (response === 'successful') {
      this.closeLoginModal.nativeElement.click();
      // Temporary page crash fix caused by modal box, wait a second for the modal box to close before navigating away
      setTimeout(() => this.router.navigate(['/home']), 1000);
    }

    console.log(response);

  }

  async submitResetPassword(forgotPassword: NgForm) {

    const response = await this.auth.resetPassword(forgotPassword.value.forgotEmail);
    console.log(response);

    switch (true) {

      case response === 'auth/user-not-found':  this.resetPasswordError = true;
                                                break;


      case response === 'successful':   this.loginStep = 0;
                                        this.resetPasswordSuccess = true;
                                        break;

    }

  }

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

  convertDOBtoAge(dob) {

    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;

  }

}
