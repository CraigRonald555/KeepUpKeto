import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { GoogleChartsModule } from 'angular-google-charts';
import { ChartsModule } from 'ng2-charts';

import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';
import { TimetablepageComponent } from './timetablepage/timetablepage.component';
import { WelcomeComponent } from './homepage/welcome/welcome.component';
import { TodaytableComponent } from './homepage/todaytable/todaytable.component';
import { AddMealComponent } from './add-meal/add-meal.component';
import { TimetableService } from './timetable.service';
import { AccountService } from './account.service';
import { IngredientDivider } from './ingredientDivider.service';

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
import { ProgressComponent } from './progress/progress.component';
import { TimetableweeklypageComponent } from './timetableweeklypage/timetableweeklypage.component';
import { ShoppinglistpageComponent } from './shoppinglistpage/shoppinglistpage.component';
import { FoodComponent } from './food/food.component';

const appRoutes = [

  {path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: '', component: MainComponent, children: [
    { path: 'home', component: HomepageComponent},
    { path: 'timetable', component: TimetablepageComponent},
    { path: 'timetable/weekly', component: TimetableweeklypageComponent},
    { path: 'recipes', component: RecipeComponent},
    { path: 'foods', component: FoodComponent},
    { path: 'instructions', component: InstructionsComponent },
    { path: 'progress', component: ProgressComponent},
    { path: 'shopping-list', component: ShoppinglistpageComponent}
  ]},
  { path: 'landing', component: LandingpageComponent}

];

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    TimetablepageComponent,
    WelcomeComponent,
    TodaytableComponent,
    AddMealComponent,
    LandingpageComponent,
    MainComponent,
    LoginpageComponent,
    SignupComponent,
    RecipeComponent,
    InstructionsComponent,
    ProgressComponent,
    TimetableweeklypageComponent,
    ShoppinglistpageComponent,
    FoodComponent
  ],
  imports: [
    BrowserModule,
    OwlModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    RouterModule.forRoot(appRoutes, {scrollPositionRestoration: 'enabled'}),
    HttpClientModule,
    FormsModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    GoogleChartsModule,
    ChartsModule
  ],
  providers: [TimetableService, AccountService, EdamamService, StorageService, IngredientDivider],
  bootstrap: [AppComponent]
})
export class AppModule { }
