import { Component, ChangeDetectorRef } from '@angular/core';
import { TimetableService } from './timetable.service';
import { stringify } from '@angular/compiler/src/util';
import { AccountService } from './account.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { EdamamService } from './edamam.service';
import { AuthGuard } from './auth-guard.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'KeepUpKeto';

  constructor(private timetableService: TimetableService,
              private accountService: AccountService,
              private authService: AuthService,
              private authGuard: AuthGuard,
              private afAuth: AngularFireAuth,
              private storageService: StorageService,
              private changeDetector: ChangeDetectorRef,
              private edamam: EdamamService) {

  }

}
