import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { PipaylibService } from 'pipaylib';
import { Payment } from 'pipaylib/domain/payment';

interface PaymentModeType {
  title: string;
  type: string;
}

interface TranscationType {
  staffId: string,
  staffName: string,
  count: number,
  amount: number
}


@Component({
  selector: 'app-staffcollectionsummary',
  templateUrl: './staffcollectionsummary.page.html',
  styleUrls: ['./staffcollectionsummary.page.scss'],
})
export class StaffcollectionsummaryPage implements OnInit {
  vehiclelist: any[];
  selectedVehicle;
  showVehicle = false;
  deliveryDate: string;
  fetching: boolean;
  paymentModeType: PaymentModeType[];
  selectedPaymentMode: PaymentModeType;
  showPaymentModes: boolean;
  cashdeposittxns;
  transcations: TranscationType[];
  distyid;


  constructor(public pipaylib: PipaylibService, private _router: Router, public loadingCtrl: LoadingController) { }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this._router.navigate(['/']);
    }

    this.paymentModeType = [
      { title: 'Cash', type: 'Cash' },      
      { title: 'Cheque', type: 'Cheque' },   
      { title: 'Credit Note', type: 'Credit Note'},
      { title: 'NEFT', type: 'NEFT' },
      { title: 'UPI', type: 'UPI' },    
      // { title: 'Delivery W/P', type: 'Delivered' },   
    ];
  }

  ionViewWillEnter() {
    this.distyid = this.pipaylib.loginService.loggedinstaff.distributorid; 
    this.deliveryDate = this.pipaylib.solace.utilService.getCurrentBusinessDate();
    this.getVehiclelist();
    this.selectedVehicle = '';
    this.fetching = false;
    this.selectedPaymentMode = this.paymentModeType[0],
    this.selectedVehicle = this.vehiclelist[0];
    this.fetchPayments();
  }

  // async fetchPayments() {
  //   this.showLoader("Fetching Summary...")
  //   var retpayments:Payment[] = await this.pipaylib.paymentService.getDistyPaymentsOnDate(this.distyid, this.deliveryDate,this.deliveryDate);
  //   this.transcations = [];
  //   for (let i=0; i < retpayments.length; i++) {
  //     if (retpayments[i].vehicleid === this.selectedVehicle.id && this.selectedPaymentMode.type === retpayments[i].paymentmode) {

  //       if (this.transcations && this.transcations.length === 0) {
  //         this.transcations.push({
  //           staffId: retpayments[i].collectedby,
  //           staffName: retpayments[i].collectedbystaffname,
  //           count: 1,
  //           amount: retpayments[i].paidamount
  //         })
  //       } else {
  //         let currentpayment = this.transcations.find((item) => item.staffId === retpayments[i].collectedby);
          
  //         if(currentpayment) {
  //           currentpayment.count += 1,
  //           currentpayment.amount += retpayments[i].paidamount
  //         } else {
  //           this.transcations.push({
  //             staffId: retpayments[i].collectedby,
  //             staffName: retpayments[i].collectedbystaffname,
  //             count: 1,
  //             amount: retpayments[i].paidamount
  //           })
  //         }
  //       }
  //     }
  //   }
  //   this.hideLoader();
  // }

  
  async fetchPayments() {
    this.showLoader("Fetching Summary...")
    console.log(this.deliveryDate)   
    var retpayments:Payment[] = await this.pipaylib.paymentService.getDistyPaymentsOnDate(this.distyid,this.deliveryDate,this.deliveryDate);
    this.transcations = [];
    if (retpayments && retpayments.length > 0) {
      for (let i=0; i < retpayments.length; i++) {
        if (retpayments[i].vehicleid === this.selectedVehicle.id && this.selectedPaymentMode.type === retpayments[i].paymentmode) {
          let currentpayment = this.checkExistingsummary(retpayments[i]);          
          if (currentpayment) {          
            currentpayment.count += 1,
            currentpayment.amount += retpayments[i].paidamount        
          } else {
            this.transcations.push({
              staffId: retpayments[i].collectedby,
              staffName: retpayments[i].collectedbystaffname,
              count: 1,
              amount: retpayments[i].paidamount
            })
         }
        }
      }
    }
    
    this.hideLoader();
  }

  checkExistingsummary(paymnt : Payment){
    for(var rec of this.transcations){
      if(rec.staffId == paymnt.collectedby) return rec; 
    }
    return null; 
  }

  getVehiclelist() {
    this.showLoader("Fetching...")
    this.vehiclelist = [];
    if (this.pipaylib.loginService.loggedinstaff.vehicleviewallowed && this.pipaylib.loginService.loggedinstaff.vehicleviewallowed.length > 0) {
      for (let i = 0; i < this.pipaylib.loginService.loggedinstaff.vehicleviewallowed.length; i++) {
        const ret = this.pipaylib.dataService.getVehicleNameForId(this.pipaylib.loginService.loggedinstaff.vehicleviewallowed[i]);
        this.vehiclelist.push({ name: ret, id: this.pipaylib.loginService.loggedinstaff.vehicleviewallowed[i] });
        this.hideLoader();
      }
    }
    if (this.vehiclelist && this.vehiclelist.length === 0) {
      this.vehiclelist = this.pipaylib.solace.dataService.getMasterFromMap("distyvehicle").map(item => {
        this.hideLoader();
        return  {
          id: item.id,
          name: item.name,
        }
      })
    }

  }

  onSelectVehcile(vehicle: any) {
    this.selectedVehicle = vehicle;
    this.showVehicle = false;
    if (this.selectedPaymentMode) {
      this.fetchPayments();
    }
  }

  onSelectPaymentMode(paymentMode: PaymentModeType) {
    this.selectedPaymentMode = paymentMode;
    this.showPaymentModes = false;
    if (this.selectedVehicle) {
      this.fetchPayments();
    }
  }

  hideLoader() {
    if (this.fetching) {this.fetching = false;}
    return this.loadingCtrl
      .dismiss()
      .catch((e) => console.log(e));
  }

  showLoader(msg) {
    if (!this.fetching) {this.fetching = true;}
    return this.loadingCtrl
      .create({
        message: msg,
        spinner: 'bubbles',
      })
      .then((res) => {
        res.present().then(() => {
          if (!this.fetching) {
            res.dismiss().then(() => {
            });
          }
        });
      })
      .catch((e) => {
        this.fetching = false;
      });
  }

  showVehicleOnClick = () => {
    this.showPaymentModes = false;
    this.showVehicle = !this.showVehicle;
  };

  showPaymentModeOnClick = () => {
    this.showVehicle = false;
    this.showPaymentModes = !this.showPaymentModes;
  };

}
