import { Component, OnInit } from '@angular/core';
import { TimetableService } from '../timetable.service';
import { AccountService } from '../account.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {

  title = 'KetoManager';

  constructor(private timetableService: TimetableService, private accountService: AccountService, public authService: AuthService) {



  }

}
