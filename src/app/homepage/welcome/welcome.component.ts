import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AccountService } from 'src/app/account.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  accountDetails;

  constructor(private accountService: AccountService, private changeDetector: ChangeDetectorRef) {

    accountService.accountDetailsUpdated.subscribe(status => {

      // This line is looping infinitely for some reason
      this.accountDetails = accountService.getAccountDetails();
      // Call this to update the html page after something changes whilst on the same page
      this.changeDetector.detectChanges();
      console.log(this.accountDetails.name);
      console.log('Updated account details in progress component');


    });

  }

  ngOnInit() {
  }

}