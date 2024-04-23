import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppdataService} from '../../services/appdata.service';

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.page.html',
  styleUrls: ['./myaccount.page.scss'],
})
export class MyaccountPage implements AfterViewInit {
  
  fromDate: string | undefined;
  toDate: string | undefined;
  balance: string;
  showResults = true;

  transactions = [
    {
      transactionId: '123232378saddw',
      transactionDate: '12/11/2022 09:17',
      amount: 3087,
      isCredited: true,
    },
    {
      transactionId: '123232378saddw',
      transactionDate: '08/11/2022 11:17',
      amount: 9000,
      isCredited: false,
    },
    {
      transactionId: '123232378saddw',
      transactionDate: '20/10/2022 10:47',
      amount: 9980,
      isCredited: true,
    },
    {
      transactionId: '123232378saddw',
      transactionDate: '12/10/2022 11:20',
      amount: 2287,
      isCredited: false,
    },
    {
      transactionId: '123232378saddw',
      transactionDate: '9/10/2022 10:17',
      amount: 3345,
      isCredited: false,
    },
  ];

  constructor(private dataService: AppdataService, private _router: Router) { }

  ngAfterViewInit() {
    this.fromDate = this.dataService.globalvars.get('fromDate');
    this.toDate = this.dataService.globalvars.get('toDate');
    // this.showResults = this.dataService.globalvars.get('showTransactions');
    this.computeTotalBalance();
  }


  numberWithCommas(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  computeTotalBalance() {
    let totalAmount = 0;
    for (const iterator of this.transactions) {
      totalAmount += iterator.amount;
    }
    return this.balance = this.numberWithCommas(totalAmount);
  }
}
