import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PipaylibService } from 'pipaylib';
import { AppdataService } from '../../services/appdata.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Distyconfig } from 'pipaylib/domain/distyconfig';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { PrintService } from '../../services/print.service';
import { Order } from 'pipaylib/domain/order';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  appVersion: any;
  isLoading;
  user;
  curconfig: Distyconfig;
  devicelatitude;
  devicelongitude;
  locationpermission;
  nolocation;
  businessName: string;
  staffName: string;
  orderList: any[];
  date = new Date().getDate();
  month = new Date().toLocaleString('default', { month: 'short' });
  orderConfirmed: number;
  ordervalue: number;
  staffType: string;

  constructor(
    public pipaylib: PipaylibService,
    private router: Router,
    private dataService: AppdataService,
    private loadingCtrl: LoadingController,
    public alertController: AlertController,
    public bltService: PrintService,
  ) {}

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this.router.navigate(['/']);
      if (Capacitor.isNativePlatform()) {
        StatusBar.setBackgroundColor({ color: '#033584' });
      }
    }
    this.getMyLocation();
  }

  ionViewWillEnter() {
    const loggedindistributor = this.pipaylib.loginService.loggedindistributor;
    this.businessName = loggedindistributor?.businessname;
    this.staffName = this.pipaylib.loginService.loggedinstaff?.name;
    this.staffType = this.pipaylib.loginService.loggedinstaff?.stafftypename;
    this.fetchLastFiveOrders();
    this.curconfig = loggedindistributor?.distyconfig;    
    this.dataService.globalvars.set('distyconfig', this.curconfig);
    this.appVersion = this.dataService.globalvars.get('versionNumber');
    this.nolocation = this.curconfig?.nolocationmandatory;
    this.isLoading = false;
  }

  async fetchLastFiveOrders() {
    this.showLoader('Fetching Summary...');
    const distyid = this.pipaylib.loginService.loggedindistributor.id;
    const orders = await this.pipaylib.orderService.getDistyOrdersOnDate(distyid, "2024-04-10", "2024-04-22");
    this.orderList = orders.slice(0, 5);
    this.orderConfirmed = orders.filter(order => order.orderstatus === 'Confirmed').length;
    this.ordervalue = orders.reduce((a, b) => a + b.cart.payableamount, 0);
  }


  async goToRequisionEntry() {
    if(!this.curconfig.nostkdisplay){
      this.showLoader('Fetching Stock..');
      var strwhid = null;
      if(this.curconfig.multiwh){
        strwhid = this.pipaylib.loginService.loggedinstaff.assignedwh[0];
      }
      await this.pipaylib.dataService.setLiveProductStock(this.pipaylib.loginService.loggedindistributor.id,strwhid);
      this.hideLoader();
    }
    this.router.navigate(['/requisition']);
  }

  async getLocation() {
    if (navigator.geolocation) {
      const position = await Geolocation.getCurrentPosition();
      this.devicelatitude = position.coords.latitude;
      this.devicelongitude = position.coords.longitude;
    }
  }

  getMyLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.devicelongitude = +pos.coords.longitude;
        this.devicelatitude = +pos.coords.latitude;
      },
      (err) => {
        console.log('location not set');
        if (!this.nolocation) {
          this.dataService.displayToast('location not set', 'WARNING');
        }
      }
    );
  }

  checklocation() {
    if (this.devicelatitude && this.devicelongitude) {
      this.router.navigate(['/invoices']);
    } else {
      this.dataService.displayToast(
        'Kindly Allow Permission in the App setting and enable location in Mobile Setting',
        'WARNING'
      );
      return;
    }
  }

  showLoader(msg) {
    if (!this.isLoading) {
      this.isLoading = true;
    }
    return this.loadingCtrl
      .create({
        message: msg,
        spinner: 'bubbles',
      })
      .then((res) => {
        res.present().then(() => {
          if (!this.isLoading) {
            res.dismiss().then(() => {});
          }
        });
      })
      .catch((e) => {
        this.isLoading = false;
        //console.log(e);
      });
  }

  hideLoader() {
    if (this.isLoading) {
      this.isLoading = false;
    }
    return this.loadingCtrl.dismiss().catch((e) => console.log(e));
  }

  goToOrderReport() {
    this.router.navigate(['/orderreport']);
  }

  goToLedger() {
    this.router.navigate(['/ledger']);
  }

  goToPaymentSummary() {
    this.router.navigate(['/paymentsummary']);
  }


}
