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
import { TimetablepageComponent } from './timetablepage/timetablepage.component';
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
import { SettingsComponent } from './settings/settings.component';
import { AuthGuard } from './auth-guard.service';
import { AuthService } from './auth.service';

const appRoutes = [

  {path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: '', component: MainComponent, children: [
    { path: 'home', canActivate: [AuthGuard], component: TimetablepageComponent},
    // { path: 'timetable', component: TimetablepageComponent},
    { path: 'plan', canActivate: [AuthGuard], component: TimetableweeklypageComponent},
    { path: 'recipes', canActivate: [AuthGuard], component: RecipeComponent},
    { path: 'foods', canActivate: [AuthGuard], component: FoodComponent},
    { path: 'instructions', canActivate: [AuthGuard], component: InstructionsComponent },
    { path: 'progress', canActivate: [AuthGuard], component: ProgressComponent},
    { path: 'settings', canActivate: [AuthGuard], component: SettingsComponent}
  ]},
  { path: 'landing', component: LandingpageComponent}

];

@NgModule({
  declarations: [
    AppComponent,
    TimetablepageComponent,
    LandingpageComponent,
    MainComponent,
    LoginpageComponent,
    SignupComponent,
    RecipeComponent,
    InstructionsComponent,
    ProgressComponent,
    TimetableweeklypageComponent,
    ShoppinglistpageComponent,
    FoodComponent,
    SettingsComponent
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
  providers: [TimetableService, AuthService, AuthGuard, AccountService, EdamamService, StorageService, IngredientDivider],
  bootstrap: [AppComponent]
})
export class AppModule { }
