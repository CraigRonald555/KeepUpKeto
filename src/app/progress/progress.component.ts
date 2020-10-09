import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
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


  myChart;

  selectedHistoryOption = 'Past month';

  @ViewChild('addWeightForm') addWeightForm: NgForm;
  todayDate = this.getTodayDate();
  formError = false;

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

      // this.addWeightForm.controls['date'].setValue(this.getTodayDate());
      this.retrieveProgressFromFirebase();

    });

    this.retrieveProgressFromFirebase();

  }

  async retrieveProgressFromFirebase() {

    console.log(this.selectedHistoryOption);

    // Reset the arrays associated with the graph so we don't get duplicate values when the table refreshes
    this.dataKGArray = [];
    this.dataLBArray = [];
    this.labelsArray = [];

    console.log('Array emptied');

    // Retrieve the progress from the
    const allProgress = await this.authService.readDataFromFirebase(`userData/${this.accountService.getUserID()}/progress`);
    let retrieveDateUpTo: Date = new Date();

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

    // Read all the dates from Firebase into labelsArray and dataKGArray
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


    }

    this.removeElementsOutOfDateRange(retrieveDateUpTo, this.labelsArray, this.dataKGArray);
    // this.removeElementsOutOfDateRange(retrieveDateUpTo);

    // Set the chart data values to the corresponding array
    this.myChart.data.datasets[0].data = this.dataKGArray;
    this.myChart.data.labels = this.labelsArray;

    // Update chart
    this.myChart.update();
    // this.changeDetector.detectChanges();

    console.log(this.labelsArray);
    console.log(this.dataKGArray);

    // console.log(this.myChart);

  }

  // removeElementsOutOfDateRange(earliestDate) {

  //   // Loop through the labelDates array which contains the dates when the weights were recorded
  //   for (let i = this.labelsArray.length-1; i >= 0; i--) {

  //     // Get current label date in loop
  //     const currentLabelDate = this.labelsArray[i];

  //     console.log(`${i} - Earliest date: ${formatDate(earliestDate, 'yyyy-MM-dd', 'en_GB')} | Current label date: ${formatDate(currentLabelDate, 'yyyy-MM-dd', 'en_GB')}`);

  //     // If the earliest date is greater than the current label date
  //     if (formatDate(earliestDate, 'yyyy-MM-dd', 'en_GB') >= formatDate(currentLabelDate, 'yyyy-MM-dd', 'en_GB')) {

  //       console.log(`${formatDate(currentLabelDate, 'yyyy-MM-dd', 'en_GB')} removed from array`);

  //       // Remove the label date from array
  //       this.labelsArray.splice(i, 1);
  //       this.dataKGArray.splice(i, 1);

  //     }

  //   }

  // }

  removeElementsOutOfDateRange(earliestDate, labelDates, ...valueArrays) {

    console.log('Begin removing unnecessary dates');

    const labelDatesLength = labelDates.length;
    console.log(`labelDates length: ${labelDatesLength}`);
    console.log(labelDates);

    // Loop through the labelDates array which contains the dates when the weights were recorded
    for (let i = labelDates.length - 1; i >= 0; i--) {

      // Get current label date in loop
      const currentLabelDate = labelDates[i];

      console.log(`Earliest date: ${formatDate(earliestDate, 'yyyy-MM-dd', 'en_GB')} | Current label date: ${formatDate(currentLabelDate, 'yyyy-MM-dd', 'en_GB')}`);

      // If the earliest date is greater than the current label date
      if (earliestDate >= currentLabelDate) {

        console.log(`${formatDate(currentLabelDate, 'yyyy-MM-dd', 'en_GB')} removed from array`);

        // Remove the label date from array
        labelDates.splice(i, 1);

        // Loop through the array of values (weightKG and weightLBs)
        for (let j = 0; j < valueArrays.length; j++) {

          // Select current values array
          const currentValuesArr = valueArrays[j];

          // Remove the corresponding value associated with date
          currentValuesArr.splice(i, 1);

        }

      }

    }

  }

  addWeightToProgress() {

    this.addWeightForm.statusChanges.subscribe(status => {

      if (status === 'VALID') {

        this.formError = false;
        console.log('Valid');

      } else {

        console.log('Invalid');

      }

    });

    if (this.addWeightForm.valid) {

      const date = this.addWeightForm.value.date;
      const weight = this.addWeightForm.value.weightKG;

      console.log(date + "\n" + weight);

      this.authService.addWeightToUserProgress(this.accountService.getUserID(), date, weight);
      this.retrieveProgressFromFirebase();

    } else {

      this.formError = true;

    }

  }

  getTodayDate() {

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    return yyyy + '-' + mm + '-' + dd;

  }

  initialiseChart() {

    let canvas: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('myChart');
    let ctx = canvas.getContext('2d');

    this.myChart = new Chart(ctx, {

      type: 'line',
      data: {
        labels: this.labelsArray,
        datasets: [{
          label: 'WeightKG',
          data: this.dataKGArray
        }]
      },
      options: {
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
        }
      }

    });

  }

  ngOnInit(): void {

    this.initialiseChart();

  }

}
