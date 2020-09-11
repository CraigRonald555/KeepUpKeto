import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';
import { MealCardComponent } from './meal-card/meal-card.component';
import { TimetablepageComponent } from './timetablepage/timetablepage.component';
import { MealsForTodayComponent } from './homepage/meals-for-today/meals-for-today.component';
import { ProgressComponent } from './homepage/progress/progress.component';
import { TodaytableComponent } from './homepage/todaytable/todaytable.component';
import { AddMealComponent } from './add-meal/add-meal.component';
import { TimetableService } from './timetable.service';
import { AccountService } from './account.service';

import {HttpClientModule} from '@angular/common/http';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { MainComponent } from './main/main.component';
import { LoginpageComponent } from './loginpage/loginpage.component';
import { MoreInfoComponent } from './more-info/more-info.component';
import { SignupComponent } from './signup/signup.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const appRoutes = [

  {path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: '', component: MainComponent, children: [
    { path: 'home', component: HomepageComponent},
    { path: 'timetable', component: TimetablepageComponent},
    { path: 'more', component: MoreInfoComponent}
  ] },
  { path: 'landing', component: LandingpageComponent}

];

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    MealCardComponent,
    TimetablepageComponent,
    MealsForTodayComponent,
    ProgressComponent,
    TodaytableComponent,
    AddMealComponent,
    LandingpageComponent,
    MainComponent,
    LoginpageComponent,
    MoreInfoComponent,
    SignupComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule
  ],
  providers: [TimetableService, AccountService],
  bootstrap: [AppComponent]
})
export class AppModule { }
