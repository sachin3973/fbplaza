import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal, LoadingController } from '@ionic/angular';
import { PipaylibService } from 'pipaylib';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { IonInput } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { AppdataService } from 'src/app/services/appdata.service';

@Component({
  selector: 'app-ordersummary',
  templateUrl: './ordersummary.page.html',
  styleUrls: ['./ordersummary.page.scss'],
})
export class OrdersummaryPage implements OnInit {
  fromDate;
  toDate;
  fetching: boolean;
  selectedType: any;
  showSummarytype: boolean;
  typeList: any[];
  orderList: any = [];
  objSummary = {};
  summaryInfoArray: any;

  constructor(public pipaylib: PipaylibService, private _router: Router, public loadingCtrl: LoadingController,private dataService: AppdataService) { }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this._router.navigate(['/']);
    }
  }

  ionViewWillEnter() {
    this.showSummarytype = false;
    this.typeList = [
      { value: 'productwise', name: 'Product Wise' },
      { value: 'retailerwise', name: 'Retailer Wise' }     
    ];

    this.fromDate = this.pipaylib.solace.utilService.getCurrentBusinessDate();
    this.toDate = this.pipaylib.solace.utilService.getCurrentBusinessDate();
    this.selectedType = this.typeList[0],
    this.fetching = false;
    this.fetchOrderSummary()
  }

  
  onSelectSummaryType(type) {
    this.selectedType = type;
    this.showSummarytype = false;    
    this.fetchOrderSummary()
  }

  showSummaryTypeOnClick = () => {    
    this.showSummarytype = !this.showSummarytype;
  };

  async fetchOrderSummary() {
    this.fromDate = formatDate(this.fromDate, "yyyy-MM-dd","en-US" );
    this.toDate = formatDate(this.toDate, "yyyy-MM-dd","en-US");
    if (this.fromDate <= this.toDate) {
      let distyid = this.pipaylib.loginService.loggedindistributor.id; 
      let staffid = this.pipaylib.loginService.loggedinstaff.id;
      this.fetching = true; 
      this.orderList = await this.pipaylib.orderService.getDistyOrdersOnDate(distyid, this.fromDate, this.toDate); 
      this.orderList = this.orderList.filter(item => item.orderstatus === 'Placed' &&  item.salesstaffid==staffid);
      this.filterSummary();
      this.fetching = false;
    } else {
      this.dataService.displayToast(`From Date cannot be greater than To Date`, 'WARNING', 'top'); 
      this.hideLoader();
      return;
    }
  }

  filterSummary() {
    this.objSummary={}
  if (this.selectedType.value =='productwise') {
    this.calculateProductData(this.orderList)
  } else if (this.selectedType.value =='retailerwise') {
    this.calculateRetailerData(this.orderList)
  }
    this.summaryInfoArray = Object.values(this.objSummary);
  } 

  calculateProductData(orders: any[]) {
    // Iterate through each order
  orders.forEach((order) => {
    order.cart.items.forEach((item) => {
      const productId = item.productid;
      const billedAmount = item.billedamount;
      var prod = this.pipaylib.dataService.getProductForId(item.productid);
      var productName = item.productname ;
      if(prod) productName = productName + " [" + prod.primaryunit + "] "; 
      const quantity = this.pipaylib.orderService.getQuantityOfPrimary(item);
      if (this.objSummary[productId]) {
        this.objSummary[productId].count += 1;
        this.objSummary[productId].quantity += quantity;
        this.objSummary[productId].amount += billedAmount;
      } else {
        this.objSummary[productId] = {
          description: productName,
          count: 1,
          quantity: quantity,
          amount: billedAmount,
        };
      }
    });
  });
  }
  
  calculateRetailerData(orders: any[]) {  
    orders.forEach((order) => {
      const distyretailerid = order.distyretailerid;
      const retailername = this.getRetailernameForId(distyretailerid);
      const billedAmount = order.cart.billedamount; 
        if (this.objSummary[distyretailerid]) {
          this.objSummary[distyretailerid].quantity += 1;
          this.objSummary[distyretailerid].amount += billedAmount;
        } else {
          this.objSummary[distyretailerid] = {
            description: retailername,
            quantity: 1,
            amount: billedAmount,
          };
        }  
    });
  }
  
  getRetailernameForId(id) {
    var distyretailers = this.pipaylib.solace.dataService.getMasterFromMap('distyretailer');
    for (var ret of distyretailers) {
      if (ret.id == id) {       
        return ret.businessname;
      }          
    }
    return null;
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

}
