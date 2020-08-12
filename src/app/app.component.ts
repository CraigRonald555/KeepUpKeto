import { Component, ChangeDetectorRef } from '@angular/core';
import { TimetableService } from './timetable.service';
import { stringify } from '@angular/compiler/src/util';
import { AccountService } from './account.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'KetoManager';

  constructor(private timetableService: TimetableService, private accountService: AccountService, private authService: AuthService, private changeDetector: ChangeDetectorRef) {

  }

}
