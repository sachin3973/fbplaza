import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PipaylibService } from 'pipaylib';
import { AppdataService } from 'src/app/services/appdata.service';

@Component({
  selector: 'app-completereadystock',
  templateUrl: './completereadystock.page.html',
  styleUrls: ['./completereadystock.page.scss'],
})
export class CompletereadystockPage implements OnInit {
  processedInvoice;
  txndate = new Date();

  constructor(private pipaylib: PipaylibService, private dataService: AppdataService, private _router: Router) { }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this._router.navigate(['/']);
    }
  }

  ionViewWillEnter() {
    this.processedInvoice = this.dataService.globalvars.get('readyStockProcessedInvoice');
    //console.log(this.processedInvoice)
  }

  goToDashboard() {
    this._router.navigate(['/dashboard'])
  }
}
