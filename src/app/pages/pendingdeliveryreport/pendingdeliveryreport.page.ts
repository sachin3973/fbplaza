import { Component, OnInit } from '@angular/core';
import { PipaylibService } from 'pipaylib';
import { Invoice } from 'pipaylib/domain/invoice';
import { Router } from '@angular/router';
import { AppdataService } from 'src/app/services/appdata.service';
import * as moment from 'moment';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-pendingdeliveryreport',
  templateUrl: './pendingdeliveryreport.page.html',
  styleUrls: ['./pendingdeliveryreport.page.scss'],
})
export class PendingdeliveryreportPage implements OnInit {
  pendinginvoices: Invoice[];
  failureCharges;
  fromDate;
  toDate;
  isLoading: boolean;
  
  constructor(public pipaylib: PipaylibService, private _router: Router,private dataService: AppdataService, public loadingCtrl: LoadingController, public toastCtrl: ToastController) { }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this._router.navigate(['/']);
    }
  }

  ionViewWillEnter() {
    this.fromDate = moment().format('YYYY-MM-D');
    this.fromDate = this.pipaylib.solace.utilService.addDaystoDate(this.fromDate, -7);
    this.toDate = this.pipaylib.solace.utilService.getCurrentBusinessDate();
    this.setPendingInvoices();
    this.failureCharges =  this.dataService.globalvars.get('failurecharges');
    this.getPendingInvoices();
  }

  async getPendingInvoices() {
    this.showLoader('Fetching...');
    if (this.fromDate <= this.toDate) {
      var distyid = this.pipaylib.loginService.loggedindistributor.id; 
      this.pendinginvoices = await this.pipaylib.invoiceService.getDistyInvoicesOnDate(distyid, this.fromDate,this.toDate);
      this.pendinginvoices = this.pendinginvoices.filter(invoice => {
        return invoice.invoicestatus === 'New' && invoice.assignedto === this.pipaylib.loginService.loggedinstaff.id;
      })        
      this.pendinginvoices.sort((a: Invoice, b: Invoice) => a.invoicedate < b.invoicedate ? -1 : 1);
      this.hideLoader();
    } else {
      this.dataService.displayToast(`From Date cannot be greater than To Date`, 'WARNING', 'top'); 
      this.pendinginvoices = [];
      this.hideLoader();
      return;
    }
    
  }

  async setPendingInvoices() {
    if(!this.pipaylib.invoiceService.pendinginvoicesfordisty || this.pipaylib.invoiceService.pendinginvoicesfordisty.length == 0) {
      await this.pipaylib.invoiceService.setDistypendingInvoices(this.pipaylib.loginService.loggedindistributor.id);
    } else {
      await this.pipaylib.invoiceService.updatePendingInvoices(this.pipaylib.loginService.loggedindistributor.id);
    }
  }

  hideLoader() {
    if (this.isLoading) {
      this.isLoading = false;
    }
    return this.loadingCtrl
      .dismiss()
      .then(() => console.log('dismissed'))
      .catch((e) => console.log(e));
  }

  showLoader(msg) {
    if (!this.isLoading) {this.isLoading = true;}
    return this.loadingCtrl
      .create({
        message: msg,
        spinner: 'bubbles',
      })
      .then((res) => {
        res.present().then(() => {
          if (!this.isLoading) {
            res.dismiss().then(() => {
            });
          }
        });
      })
      .catch((e) => {
        this.isLoading = false;
      });
  }


}
