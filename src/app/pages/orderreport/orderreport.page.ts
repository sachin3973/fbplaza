import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal, LoadingController } from '@ionic/angular';
import { PipaylibService } from 'pipaylib';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { IonInput } from '@ionic/angular';
import { AppdataService } from 'src/app/services/appdata.service';
import { Distystaff } from 'pipaylib/domain/distystaff';
import { Distystafftype } from 'pipaylib/domain/distystafftype';
import { Order } from 'pipaylib/domain/order';
import { Distyconfig } from 'pipaylib/domain/distyconfig';

@Component({
  selector: 'app-orderreport',
  templateUrl: './orderreport.page.html',
  styleUrls: ['./orderreport.page.scss'],
})
export class OrderreportPage implements OnInit {
  @ViewChild('searchRetname') searchRetname: IonInput;
  @ViewChild(IonModal) modal: any;
  fromDate;
  toDate;
  fetching: boolean;
  orderList: any[];
  strsearch: string;
  showRetailerModal: boolean;
  page: number;
  paginationRetailerList = [];
  retailerlist;
  perPage = 20;
  selectedRetailer: Distyretailer;
  retailername: string;
  salestaffLlist: any[];
  selectedStaff;
  showStaff = false;
  distyconfig: Distyconfig;

  constructor(public pipaylib: PipaylibService, private router: Router,
    public loadingCtrl: LoadingController, private dataService: AppdataService
  ) { }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this.router.navigate(['/']);
    }
    this.selectedStaff = {id: 'All', name: 'All Staff'};
  }

  ionViewWillEnter() {
    this.distyconfig = this.dataService.globalvars.get('distyconfig');
    this.selectedStaff = {id: 'All', name: 'All Staff'};
    this.showStaff = false;
    this.getStafflist();
    this.fromDate = this.pipaylib.solace.utilService.getCurrentBusinessDate();
    this.toDate = this.pipaylib.solace.utilService.getCurrentBusinessDate();
    this.fetching = false;
    this.fetchOrders();
  }
  ngAfterViewInIt() {
    console.log('afterviewenter');
  }

  async fetchOrders() {
    if (this.fromDate <= this.toDate) {
      this.showLoader('Fetching Summary...');
      const distyid = this.pipaylib.loginService.loggedindistributor.id;
      this.orderList = await this.pipaylib.orderService.getDistyOrdersOnDate(distyid, this.fromDate, this.toDate);
      this.filterOrder(this.orderList);
    } else {
      this.dataService.displayToast(`From Date cannot be greater than To Date`, 'WARNING', 'top');
      this.hideLoader();
      return;
    }
  }

  filterOrder(orderList) {
    const staffid = this.pipaylib.loginService.loggedinstaff.id;
    this.orderList = [];
    for(const ord of orderList){
      if (ord.salesstaffid === staffid) {
        this.orderList.push(ord);
      }
    }
    if (this.selectedRetailer && this.selectedRetailer?.businessname) {
      this.orderList = this.orderList.filter(item => this.selectedRetailer && this.selectedRetailer.id === item.distyretailerid);
    }
    if (this.pipaylib.loginService.loggedinstafftype.viewallorders) {
      this.orderList.sort((a: Order, b: Order) => (a.salesstaffname + a.createdat) < (b.salesstaffname + b.createdat) ? -1 : 1);
    } else {
      this.orderList.sort((a: Order, b: Order) => a.createdat < b.createdat ? -1 : 1);
    }
    this.hideLoader();
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

  // Open Retailer Modal
  openRetailerModal() {
    this.getPaginatedRetailerList();
    this.strsearch = '';
    setTimeout(() => {
      this.showRetailerModal = true;
      this.hideLoader();
    }, 100);
    setTimeout(() => {
      this.searchRetname.setFocus();
    },300);
  }

  async getPaginatedRetailerList() {
    /* Get Retailer 20 Record on page load and on search clear*/
    this.page = 0;
    this.paginationRetailerList = [];
    this.retailerlist = await this.pipaylib.solace.dataService.getMasterFromMap('distyretailer');
    this.paginationRetailerList = this.retailerlist.slice(0, this.perPage);
  }

  paginateArrayForRetailer() {
    this.page++;
    const curloaded = this.page * this.perPage;
    let invforpagination: any;
    /* on search use suggestion list */
    if (!this.strsearch) {
      invforpagination  = this.retailerlist;
    } else {
      invforpagination  = this.paginationRetailerList;
    }
    if(invforpagination && invforpagination.length > curloaded){
        const remaining = invforpagination.length - curloaded;
        if(remaining > this.perPage){
          const endindex = curloaded + this.perPage;
          return invforpagination.slice(curloaded,endindex);
        } else{
          return invforpagination.slice(curloaded,invforpagination.length);
        }
    }
  }

  onIonInfinite(event) {
    setTimeout(() => {
      const arr = this.paginateArrayForRetailer();
      if (arr?.length > 0)
      {
        this.paginationRetailerList = this.paginationRetailerList.concat(arr);  }
        event.target.complete();
        if (arr?.length < this.perPage) {
          event.target.disabled = true;
        }

    }, 200);
  }

  // Search Retailers
  searchRetailer() {
    this.paginationRetailerList = [];
    if (this.strsearch && this.strsearch.length >= 3) {
      for(const ret of this.retailerlist){
        if(ret.retailercode.includes(this.strsearch) || ret.businessname.toLowerCase().includes(this.strsearch.toLowerCase())){
          this.paginationRetailerList.push(ret);
        }
      }
      this.paginationRetailerList = [...this.paginationRetailerList];
    } else {
      this.getPaginatedRetailerList();
    }
  }

  clearRetailer() {
    this.retailername = '';
    this.selectedRetailer = {} as Distyretailer ;
  }

  confirm(retailer: Distyretailer) {
    this.selectedRetailer = retailer;
    this.retailername = this.selectedRetailer.retailercode + '-' + this.selectedRetailer.businessname;
    this.modal.dismiss('confirm');
    this.showRetailerModal = false;
    this.fetchOrders();
  }

  cancel() {
    this.modal.dismiss('confirm');
    this.strsearch = '';
    this.showRetailerModal = false;
  }

  onSelectStaff(staff: Distystaff) {
    this.selectedStaff = staff;
    this.showStaff = false;
    this.fetchOrders();
  }

  showStaffOnClick = () => {
    this.showStaff = !this.showStaff;
  };

  getStafflist() {
    this.showLoader('Loading');
    this.salestaffLlist = [];
    const stafflist =  this.pipaylib.solace.dataService.getMasterFromMap('distystaff') as Distystaff[];
    for (const staff of stafflist) {
      const stafftypelist = this.pipaylib.solace.dataService.getMasterFromMap('distystafftype') as Distystafftype[];
      for (const stafftype of stafftypelist) {
        if (stafftype.id === staff.stafftypeid) {
          if (stafftype.orderbooking) {this.salestaffLlist.push(staff);}
          break;
        }
      }
      this.hideLoader();
    }
    this.salestaffLlist.unshift({
      id: 'All',
      name: 'All Staff',
    });
    this.hideLoader();
  }

}
