import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
// import { Chart } from 'chart.js';
import { NgForm } from '@angular/forms';
import { AccountService } from '../account.service';
import { AuthService } from '../auth.service';
import * as Chart from 'chart.js';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {

  // ['01/01/2020', 110.0],
  // ['04/02/2020', 107.0],
  // ['25/04/2020', 100.8],
  // ['27/04/2020', 101.4],
  // ['12/05/2020', 98.0],
  // ['12/09/2020', 90.7]

  // barChartData = [
  //   {data: [110], label: new Date(2020, 1, 1)},
  //   {data: [107], label: new Date(2020, 2, 4)}
  // ];

  selectedHistoryOption = 'Past month';

  @ViewChild('addWeightForm') addWeightForm: NgForm;
  @ViewChild('chartElRef') chart: Chart;

  barChartType = 'line';
  barChartLegend = true;

  labelsArray = [];
  // Month starts from 0, days start from 1 e.g. 2020, 0, 1 = January 1st 2020
  barChartLabels = this.labelsArray;

  dataKGArray = [];
  dataLBArray = [];
  barChartData = [
    {data: this.dataKGArray, label: 'Weight (KG)'}
    // {data: this.dataLBArray, label: 'Weight (LBs)'}
  ];

  barChartOptions = {
    scales: {
      xAxes: [{
        type: 'time',
        time: {
          displayFormats: {
          	'millisecond': 'MMM DD',
            'second': 'MMM DD',
            'minute': 'MMM DD',
            'hour': 'MMM DD',
            'day': 'MMM DD',
            'week': 'MMM DD',
            'month': 'MMM DD',
            'quarter': 'MMM DD',
            'year': 'MMM DD',
          }
        }
      }],
    },
  }

  constructor(private accountService: AccountService, private authService: AuthService, private changeDetector: ChangeDetectorRef) {

    this.accountService.accountDetailsUpdated.subscribe(status => {

      this.addWeightForm.controls['date'].setValue(this.getTodayDate());
      this.retrieveProgressFromFirebase();

    });

  }

  async retrieveProgressFromFirebase() {

    console.log(this.selectedHistoryOption);

    this.dataKGArray = [];
    this.dataLBArray = [];
    this.labelsArray = [];

    const allProgress = await this.authService.readDataFromFirebase(`userData/${this.accountService.getUserID()}/progress`);
    let retrieveDateUpTo = new Date();

    console.log(allProgress);

    switch (true) {

      case this.selectedHistoryOption === "Past month":
        retrieveDateUpTo.setMonth(retrieveDateUpTo.getMonth() - 1);
        break;

      case this.selectedHistoryOption === "Past three months":
        retrieveDateUpTo.setMonth(retrieveDateUpTo.getMonth() - 3);
        break;

      case this.selectedHistoryOption === "Past six months":
        retrieveDateUpTo.setMonth(retrieveDateUpTo.getMonth() - 6);
        break;

      case this.selectedHistoryOption === "Past year":
        retrieveDateUpTo.setMonth(retrieveDateUpTo.getMonth() - 12);
        break;

    }

    console.log(retrieveDateUpTo);

    for (let currentDate in allProgress) {

      // Skip if current element is a prototype key
      if (!allProgress.hasOwnProperty(currentDate)) { continue; }

      const currentWeight = allProgress[currentDate].weightKG;

      console.log(`Read from Firebase`);
      console.log(`${currentDate}: ${currentWeight}`);

      const convertedDate = new Date(currentDate);

      console.log(`${convertedDate} as a Date type`);

      this.labelsArray.push(convertedDate);
      this.dataKGArray.push(currentWeight);

      this.chart.update();

    }

  }

  addWeightToProgress() {

    const date = this.addWeightForm.value.date;
    const weight = this.addWeightForm.value.weightKG;

    console.log(date + "\n" + weight);

    this.authService.addWeightToUserProgress(this.accountService.getUserID(), date, weight);
    this.retrieveProgressFromFirebase();

  }

  getTodayDate() {

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    return yyyy + '-' + mm + '-' + dd;

  }

  ngOnInit(): void {

  }

}
