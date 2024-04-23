/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PipaylibService } from 'pipaylib';
import { Invoice } from 'pipaylib/domain/invoice';
import { Summaryrecord } from 'pipaylib/domain/summaryrecord';
import { formatDate } from '@angular/common';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-vehiclerecosummary',
  templateUrl: './vehiclerecosummary.page.html',
  styleUrls: ['./vehiclerecosummary.page.scss'],
})
export class VehiclerecosummaryPage implements OnInit {
  vehiclelist: any[];
  selectedVehicle;
  vehileSummaryList: Summaryrecord[];
  deliveryDate: any;
  invoiceList: Invoice[];
  vehiceleselected = false;
  record;
  fetching;
  showVehicle = false;
  lengthOfInvoices;
  constructor(public pipaylib: PipaylibService,private _router: Router, public loadingCtrl: LoadingController) { }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this._router.navigate(['/']);
    }
  }

  ionViewWillEnter() {
    this.deliveryDate = this.pipaylib.solace.utilService.getCurrentBusinessDate();
    this.getVehiclelist();
    this.selectedVehicle = '';
    this.fetching = false;
  }

  vehicleselected() {
    //console.log(this.selectedVehicle);
  }

  getVehiclelist() {
    this.showLoader("Fetching...")
    this.vehiclelist = [];
    if (this.pipaylib.loginService.loggedinstaff.vehicleviewallowed && this.pipaylib.loginService.loggedinstaff.vehicleviewallowed.length > 0) {    
      for (let i = 0; i < this.pipaylib.loginService.loggedinstaff.vehicleviewallowed.length; i++) {
        const ret = this.pipaylib.dataService.getVehicleNameForId(this.pipaylib.loginService.loggedinstaff.vehicleviewallowed[i]);
        this.vehiclelist.push({ name: ret, id: this.pipaylib.loginService.loggedinstaff.vehicleviewallowed[i] });
      }
    }

    if (this.vehiclelist && this.vehiclelist.length === 0) {
      this.vehiclelist = this.pipaylib.solace.dataService.getMasterFromMap("distyvehicle").map(item => {
        return  {
          id: item.id,
          name: item.name,
        }
      })
    }
    this.hideLoader();

  }

  onSelectVehcile(vehicle: any) {
    this.selectedVehicle = vehicle;
    //console.log('>>>>>>', this.selectedVehicle);
    this.showVehicle = false;
  }


  async fetchInvoices() {
    this.showLoader('Fetching Sumamry...');
    this.fetching = true;
    this.vehileSummaryList = [];
    this.record = {};
    const startdate = formatDate(this.deliveryDate, 'yyyy-MM-dd','en-US' );
    const distyid = this.pipaylib.loginService.loggedindistributor.id;
    this.invoiceList = await this.pipaylib.invoiceService.getDistyInvoicesOnDeliveryDate(distyid, startdate, startdate);
    this.vehileSummaryList = this.pipaylib.reportService.getVehicleStatusMatrix(this.invoiceList);
    for (const rec of this.vehileSummaryList) {
      if (rec.id === this.selectedVehicle.id) {
        this.record = rec;
      }
      //console.log(this.record);
    }
    this.hideLoader();
    this.lengthOfInvoices = Object.keys(this.record).length;
    // this.vehileSummaryList = this.vehileSummaryList.filter((item) => item.id === this.selectedVehicle.id.toString());
    // //console.log(this.vehileSummaryList);
  }


  calculateSum(array, property) {
    const total = array.reduce((accumulator, object) => accumulator + object[property], 0);
    return total;
  }

  hideLoader() {
    if (this.fetching) {this.fetching = false;}
    return this.loadingCtrl
      .dismiss()
      .then(() => console.log('dismissed'))
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
              // //console.log('login successful');
            });
          }
        });
      })
      .catch((e) => {
        this.fetching = false;
        //console.log(e);
      });
  }

  showVehicleOnClick = () => {
    this.showVehicle = !this.showVehicle;
  };
}
