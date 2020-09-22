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
import { TimetablepageComponent } from './timetablepage/timetablepage.component';
import { ProgressComponent } from './homepage/progress/progress.component';
import { TodaytableComponent } from './homepage/todaytable/todaytable.component';
import { AddMealComponent } from './add-meal/add-meal.component';
import { TimetableService } from './timetable.service';
import { AccountService } from './account.service';
import { IngredientDivider } from './ingredientDivider.service'

import {HttpClientModule} from '@angular/common/http';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { MainComponent } from './main/main.component';
import { LoginpageComponent } from './loginpage/loginpage.component';
import { SignupComponent } from './signup/signup.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OwlModule } from 'ngx-owl-carousel';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecipeComponent } from './recipe/recipe.component';
import { InstructionsComponent } from './recipe/instructions/instructions.component';
import { EdamamService } from './edamam.service';
import { StorageService } from './storage.service';

const appRoutes = [

  {path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: '', component: MainComponent, children: [
    { path: 'home', component: HomepageComponent},
    { path: 'timetable', component: TimetablepageComponent},
    { path: 'recipes', component: RecipeComponent},
    { path: 'instructions', component: InstructionsComponent }
  ]},
  { path: 'landing', component: LandingpageComponent}

];

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    TimetablepageComponent,
    ProgressComponent,
    TodaytableComponent,
    AddMealComponent,
    LandingpageComponent,
    MainComponent,
    LoginpageComponent,
    SignupComponent,
    RecipeComponent,
    InstructionsComponent
  ],
  imports: [
    BrowserModule,
    OwlModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    RouterModule.forRoot(appRoutes, {onSameUrlNavigation: 'reload'}),
    HttpClientModule,
    FormsModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule
  ],
  providers: [TimetableService, AccountService, EdamamService, StorageService, IngredientDivider],
  bootstrap: [AppComponent]
})
export class AppModule { }
