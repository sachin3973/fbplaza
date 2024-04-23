/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-underscore-dangle */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PipaylibService } from 'pipaylib';
import { AppdataService } from '../../services/appdata.service';
import { Router } from '@angular/router';
import {
  LoadingController,
  ScrollDetail,
  ModalController,
  ToastController,
  Platform,
} from '@ionic/angular';
import { Invoice } from 'pipaylib/domain/invoice';
import { IonContent } from '@ionic/angular';
import { ImagepreviewPage } from '../imagepreview/imagepreview.page';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { Distystaff } from 'pipaylib/domain/distystaff';
import { add } from 'lodash';
import { formatDate } from '@angular/common';

interface DocketInvoice {
  id: any;
  docket: Invoice[];
  firstinvoiceno: any;
  lastinvoiceno: any;
  docketsize: any;
  docketnum: any;
  totalamt: number;
  status: any;
}

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.page.html',
  styleUrls: ['./invoices.page.scss'],
})
export class InvoicesPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  scrollYPosition: number;
  isVehicleMode: boolean;
  vehicle;
  vehiclename;
  vehicleid;
  selectedvehicle;
  filteredinvoices: Invoice[];
  routes;
  strsearch;
  isLoading;
  routeid;
  selectedroute;
  type;
  searchtype;
  billtype;
  pendingDockets: DocketInvoice[] = [];
  pendingInvoices: Invoice[] = [];
  date = new Date().getDate();
  month = new Date().toLocaleString('default', { month: 'short' });
  scrollTopPosition: number;
  failureCharges;
  searchlist;
  distyconfig;
  myPendingbill;
  paginationInvoicesList;
  page = 0;
  perPage = 10;
  pendingdocketInv: any = [];
  showdocket: boolean;
  docketinvoicecount: number;

  constructor(
    public pipaylib: PipaylibService,
    public platform: Platform,
    public toastCtrl: ToastController,
    private router: Router,
    private dataService: AppdataService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this.router.navigate(['/']);
    }
  }

  ionViewWillEnter() {
    this.dataService.globalvars.set('fromPartywise', false);
    if (Capacitor.isNativePlatform()) {
      StatusBar.setBackgroundColor({ color: '#033584' });
    }
    this.strsearch = '';
    this.distyconfig = this.dataService.globalvars.get('distyconfig');
    this.failureCharges = this.dataService.globalvars.get('failurecharges');
    this.scrollTopPosition = this.dataService.globalvars.get(
      'scrollTopPosition'
    )
      ? this.dataService.globalvars.get('scrollTopPosition')
      : 0;
    // this.isVehicleMode = this.dataService.globalvars.get('vehicleWiseMode');
    this.myPendingbill = this.dataService.globalvars.set(
      'pendinginv',
      this.filteredinvoices
    );
    this.pendingInvoices = [];
    this.filteredinvoices = [];
    // this.isLoading = true;
    this.showLoader('Loading Invoices..');
    this.type = 'pending';
    this.routes = this.dataService.globalvars.get('routes');
    this.routeid = this.dataService.globalvars.get('selectedroute');
    this.selectedroute = this.dataService.globalvars.get('selectedroutename');
    this.vehicle = this.dataService.globalvars.get('vehicles');
    this.vehicleid = this.dataService.globalvars.get('selectedvehicle');
    this.vehiclename = this.dataService.globalvars.get('selectedvehiclename');
    this.selectedvehicle = this.dataService.globalvars.get('selectedvehicleno');
    this.searchtype = this.dataService.globalvars.get('invoicelist');
    this.billtype = this.dataService.globalvars.get('billtype');

    this.setPendingInvoices();
  }

  async setPendingInvoices() {
    if (
      !this.pipaylib.invoiceService.pendinginvoicesfordisty ||
      this.pipaylib.invoiceService.pendinginvoicesfordisty.length === 0
    ) {
      await this.pipaylib.invoiceService.setDistypendingInvoices(
        this.pipaylib.loginService.loggedindistributor.id
      );
    } else {
      await this.pipaylib.invoiceService.updatePendingInvoices(
        this.pipaylib.loginService.loggedindistributor.id
      );
    }
    if (this.searchtype === 'vehicle') {
      this.getPendingInvoicesForVehicle();
    } else if (this.searchtype === 'route') {
      this.getPendingInvoicesByRoute();
    } else if (this.searchtype === 'staffwise') {
      this.getPendinginvoicesBystaff();
    }
  }

  getNonDocketInvoices() {
    const nondocketinv = [];
    for (const inv of this.filteredinvoices) {
      if (!inv.docketno || inv.docketno <= 0) {
        nondocketinv.push(inv);
      }
    }
    return nondocketinv;
  }

  searchPending() {
    this.paginationInvoicesList = [];
    if (this.strsearch && this.strsearch.length >= 3) {
      for (const inv of this.searchlist) {
        if (
          inv.invoicenumber.includes(this.strsearch) || inv.distyretailername.toLowerCase().includes(this.strsearch.toLowerCase()) ||
          inv.distyretailercode.toLowerCase().includes(this.strsearch.toLowerCase() )
        ) {
          this.paginationInvoicesList.push(inv);
        }
      }
    } else {
      //this.paginationInvoicesList = this.searchlist
      this.scrollTopPosition = 0;
      this.stafftypeFilter();
    }

    this.paginationInvoicesList = [...this.paginationInvoicesList];
  }

  paginateInvoices() {
    this.page++;
    const curloaded = this.page * this.perPage;
    const invforpagination = this.getNonDocketInvoices();
    //Are there more?
    if (invforpagination && invforpagination.length > curloaded) {
      const remaining = invforpagination.length - curloaded;
      if (remaining > this.perPage) {
        const endindex = curloaded + this.perPage;
        return invforpagination.slice(curloaded, endindex);
      } else {
        return invforpagination.slice(curloaded, invforpagination.length);
      }
    }

    /*for (let i=0; i < this.filteredinvoices.length; i++) {
      this.filteredinvoices[i]['counter'] = i+1;
    };
    //console.log('FILTERED INVOICES ARE NOW', this.filteredinvoices)
    return this.filteredinvoices.filter(
      item => item.counter > (this.page * this.perPage - this.perPage) && item.counter <= (this.page * this.perPage)
    )*/
  }

  onIonInfinite(event) {
    setTimeout(() => {
      const arr = this.paginateInvoices();

      //If we have invoices from next page
      if (arr?.length > 0) {
        this.paginationInvoicesList = this.paginationInvoicesList.concat(arr);
      }
      event.target.complete();
      if (arr?.length < this.perPage) {
        event.target.disabled = true;
      }
    }, 200);
  }

  handleScroll(ev: CustomEvent<ScrollDetail>) {
    this.scrollTopPosition = ev.detail.scrollTop;
    this.dataService.globalvars.set(
      'scrollTopPosition',
      this.scrollTopPosition
    );
  }

  scrollToPosition() {
    this.content.scrollToPoint(this.scrollTopPosition, this.scrollTopPosition);
  }

  /*handleRefresh(ev) {
    this.getPendingInvoicesForVehicle();
    ev.target.complete();
  }*/

  checkStaffRouteVehicleFilters(inv: Invoice) {
    const staff = this.pipaylib.loginService.loggedinstaff as Distystaff;
    let routefilterpassed = false;
    let vehiclefilterpassed = false;

    if (staff.assignedroutes && staff.assignedroutes.length > 0) {
      for (const rt of staff.assignedroutes) {
        if (rt === inv.routeid) {
          routefilterpassed = true;
          break;
        }
      }
    } else {
      routefilterpassed = true;
    }

    if (staff.vehicleviewallowed && staff.vehicleviewallowed.length > 0) {
      for (const vh of staff.vehicleviewallowed) {
        if (vh === inv.vehicleid) {
          vehiclefilterpassed = true;
          break;
        }
      }
    } else {
      vehiclefilterpassed = true;
    }

    if (routefilterpassed && vehiclefilterpassed) {
      return true;
    }

    return false;
  }

  takeoutDocketInvoices() {
    const temparr = [];
    this.docketinvoicecount = 0;
    for (const inv of this.filteredinvoices) {
      if (!inv.docketno || inv.docketno <= 0) {
        temparr.push(inv);
      } else {
        this.docketinvoicecount = this.docketinvoicecount + 1;
      }
    }

    this.filteredinvoices = temparr;
    this.filteredinvoices = [...this.filteredinvoices];
  }

  isGoodForDelivery(inv: Invoice) {
    const curbsndate = this.pipaylib.solace.utilService.getCurrentBusinessDate();
    if (
      inv.invoicestatus === 'New' ||
      (inv.invoicestatus === 'Partially paid' && (inv.deliveredon ===  curbsndate || inv.schdeliverydate === curbsndate))
    ) {
      return true;
    }
    return false;
  }

  isGoodForCollection(inv: Invoice) {
    if (
      inv.invoicestatus === 'Delivered' ||
      inv.invoicestatus === 'Payment failed' ||
      inv.invoicestatus === 'Partially paid'
    ) {
      return true;
    }
    return false;
  }

  getPaymentInfo(inv: Invoice){
    let retstring = '';
    if(inv.pymtinfolist && inv.pymtinfolist.length > 0){
      for(const pymt of inv.pymtinfolist){

        if(pymt.paymentstatus !== 'Cancelled' && pymt.paymentstatus !== 'Payment failed'){
          retstring = retstring + formatDate(pymt.paymentdate,'dd/MM', 'en') + ':' + pymt.paymentmode + ' ₹' + pymt.paidamount  + ', ';
        }
      }
      return retstring.substring(0,retstring.length -2);
    }

    return retstring;
  }

  stafftypeFilter() {
    this.filteredinvoices = [];
    this.paginationInvoicesList = [];
    this.pendingDockets = [];
    const staffid = this.pipaylib.loginService.loggedinstaff.id;
    const allocateassigned =
      this.pipaylib.loginService.loggedindistributor.distyconfig
        .allocateassigned;

    for (const inv of this.pendingInvoices) {
      let addinvoice = false;
      if (
        this.pipaylib.loginService.loggedinstafftype.deliverywpallowed &&
        this.billtype !== 'collection'
      ) {
        if (
          this.pipaylib.loginService.loggedinstafftype.allocateddeliveryonly
        ) {
          if (inv.delassignedto === staffid) {
            if (this.isGoodForDelivery(inv)) {
              addinvoice = true;
            }
          }
        } else {
          if (this.isGoodForDelivery(inv)) {
            if (this.checkStaffRouteVehicleFilters(inv)) {
              addinvoice = true;
            }
          }
        }
      }
      if (!addinvoice) {
        if (
          this.pipaylib.loginService.loggedinstafftype.collectionallowed &&
          this.billtype !== 'delivery'
        ) {
          if (
            this.pipaylib.loginService.loggedinstafftype.allocatedcollectiononly
          ) {
            if (
              inv.assignedto === staffid &&
              (inv.makevisible || !allocateassigned)
            ) {
              if (this.isGoodForCollection(inv)) {
                addinvoice = true;
              }
            }
          } else {
            if (this.isGoodForCollection(inv)) {
              if (this.checkStaffRouteVehicleFilters(inv)) {
                addinvoice = true;
              }
            }
          }
        }
      }

      if (addinvoice) {
        this.filteredinvoices.push(inv);
      }

      /*if(this.pipaylib.loginService.loggedinstafftype.deliverywpallowed && this.pipaylib.loginService.loggedinstafftype.allocateddeliveryonly){
          if(inv.delassignedto == staffid ){
            if(inv.invoicestatus == 'New' || (inv.invoicestatus == 'Partially paid' && inv.schdeliverydate == this.pipaylib.solace.utilService.getCurrentBusinessDate())) {
                if(this.checkStaffRouteVehicleFilters(inv)) this.filteredinvoices.push(inv);
            }
          }
      } else if(this.pipaylib.loginService.loggedinstafftype.collectionallowed && this.pipaylib.loginService.loggedinstafftype.allocatedcollectiononly){
          if(inv.assignedto == staffid && (inv.makevisible || !allocateassigned)){
            if(inv.invoicestatus === 'Delivered' || inv.invoicestatus === 'Payment failed' || inv.invoicestatus === 'Partially paid') {
                if(this.checkStaffRouteVehicleFilters(inv)) this.filteredinvoices.push(inv);
            }
          }
      }
      else{
          if (!this.pipaylib.loginService.loggedinstafftype.collectionallowed && this.pipaylib.loginService.loggedinstafftype.deliverywpallowed) {
            if (inv.invoicestatus === 'New' || (inv.invoicestatus === 'Partially paid' && inv.schdeliverydate == this.pipaylib.solace.utilService.getCurrentBusinessDate())) {
              if(this.checkStaffRouteVehicleFilters(inv)) this.filteredinvoices.push(inv);
            }
          }
          else if (!this.pipaylib.loginService.loggedinstafftype.deliverywpallowed && this.pipaylib.loginService.loggedinstafftype.collectionallowed) {
            if (inv.invoicestatus === 'Delivered' || inv.invoicestatus === 'Payment failed' || inv.invoicestatus === 'Partially paid') {
                if(this.checkStaffRouteVehicleFilters(inv)) this.filteredinvoices.push(inv);
            }
          } else {
              if(this.checkStaffRouteVehicleFilters(inv)) this.filteredinvoices.push(inv);
          }
      }*/
    }

    this.filteredinvoices.sort((a: Invoice, b: Invoice) =>
      a.invoicenumber < b.invoicenumber ? -1 : 1
    );
    // console.log('filteredinvoices' + JSON.stringify(this.filteredinvoices))

    //Filtered invoices has invoices to be displayed
    const importformat = this.pipaylib.loginService.loggedindistributor.distyconfig.invimportformat;
    if(importformat){
      const docketcol = this.pipaylib.loginService.loggedindistributor.distyconfig.invimportformat.docketnocol;
      if (docketcol && docketcol.length > 0 && this.searchtype === 'vehicle') {
        this.filterDocketinvoice();
      }
    }


    const nondocketinv = this.getNonDocketInvoices();

    const curpage = this.dataService.globalvars.get('curpage');
    if (curpage) {
      this.page = curpage;
      const curloaded = (this.page + 1) * this.perPage;
      if (curloaded > nondocketinv.length) {
        this.paginationInvoicesList = nondocketinv;
      } else {
        this.paginationInvoicesList = nondocketinv.slice(0, curloaded);
      }
    } else {
      this.paginationInvoicesList = nondocketinv.slice(0, this.perPage);
    }
    // console.log(JSON.stringify( this.paginationInvoicesList))
    this.searchlist = nondocketinv;
    if (this.scrollTopPosition > 0) {
      setTimeout(() => this.scrollToPosition(), 100);
    }
  }

  async getPendingInvoicesByRoute() {
    this.pendingInvoices = [];
    if (this.routeid === 'all') {
      this.pendingInvoices =
        await this.pipaylib.staffService.getPendinginvoicesForRoute('All');
      this.hideLoader();
    } else {
      this.pendingInvoices =
        await this.pipaylib.staffService.getPendinginvoicesForRoute(
          this.routeid
        );
      this.hideLoader();
    }
    this.stafftypeFilter();
  }

  async getPendinginvoicesBystaff() {
    this.pendingInvoices = [];
    this.pendingInvoices =
      await this.pipaylib.staffService.getPendinginvoicesForVehicle('All');
    this.hideLoader();
    this.stafftypeFilter();
  }

  async getPendingInvoicesForVehicle() {
    this.pendingInvoices = [];
    if (this.vehicleid === 'all') {
      this.pendingInvoices =
        await this.pipaylib.staffService.getPendinginvoicesForVehicle('All');
      this.hideLoader();
    } else {
      this.pendingInvoices =
        await this.pipaylib.staffService.getPendinginvoicesForVehicle(
          this.vehicleid
        );
      this.hideLoader();
    }

    this.stafftypeFilter();
  }

  getCurrentDocket(inv: Invoice) {
    for (const dockinv of this.pendingDockets) {
      if (dockinv.docketnum === inv.docketno) {
        return dockinv;
      }
    }
    return null;
  }
  filterDocketinvoice() {
    this.showdocket = false;
    this.pendingDockets = [];

    for (const inv of this.filteredinvoices) {
      //console.log('INV NO  ' + inv.invoicenumber + ' Docket No '  + inv.docketno + ' Inv status ' + inv.invoicestatus);

      if (inv.invoicestatus === 'New' && inv.docketno && inv.docketno > 0) {
        //console.log('Invoice with Docket No  ' + inv.docketno);
        const curdocket = this.getCurrentDocket(inv);
        if (curdocket) {
          curdocket.docket.push(inv);
          curdocket.lastinvoiceno = inv.invoicenumber;
          curdocket.totalamt = curdocket.totalamt + inv.invoiceamount;
          curdocket.docketsize = curdocket.docket.length;
        } else {
          const doc = {} as DocketInvoice;
          doc.docket = [];
          doc.docketsize = 1;
          doc.docketnum = inv.docketno;
          doc.docket.push(inv);
          doc.firstinvoiceno = inv.invoicenumber;
          doc.totalamt = inv.invoiceamount;
          doc.lastinvoiceno = inv.invoicenumber;
          this.pendingDockets.push(doc);
        }
      }
    }

    if (this.pendingDockets.length > 0) {
      this.showdocket = true;
    }
  }

  calculateSum(arr, property: string): number {
    return arr.reduce((sum, obj) => sum + obj[property], 0);
  }

  gotodashboard() {
    this.router.navigate(['/dashboard']);
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
    //   this.platform.backButton.subscribeWithPriority(10, () => {
    //     document.addEventListener('backbutton', () => {}, false);
    // });
    this.isLoading = true;
    return this.loadingCtrl
      .create({
        message: msg,
        spinner: 'bubbles',
      })
      .then((res) => {
        res.present().then(() => {
          if (!this.isLoading) {
            res.dismiss().then(() => {
              //console.log('invoices listed successful');
            });
          }
        });
      })
      .catch((e) => {
        this.isLoading = false;
        //console.log(e);
      });
  }

  async invoiceDetail(item: Invoice) {
    const latLongExists = await this.getLatLongForRetailer(item.distyretailerid);
    if (latLongExists) {
      this.dataService.globalvars.set('retailerName', item.distyretailername);
      this.dataService.globalvars.set('amount', item.invoiceamount);
      this.dataService.globalvars.set('invoiceDate', item.invoicedate);
      this.dataService.globalvars.set('dueDate', item.duedate);
      this.dataService.globalvars.set('invoiceNumber', item.invoicenumber);
      this.dataService.globalvars.set('invoiceStatus', item.invoicestatus);
      this.dataService.globalvars.set('retailerid', item.distyretailerid);
      this.dataService.globalvars.set('curpage', this.page);
      this.dataService.globalvars.set('selectedinvoice', item);
      this.router.navigate(['/invoicedetail']);
    };
  }

  async getLatLongForRetailer(retailerId: string) {
    const distyid = this.pipaylib.loginService.loggedindistributor.id;
    const retailer = await this.pipaylib.dataService.getLiveRetailerForId(retailerId, distyid) as unknown as Distyretailer;
    if (retailer.latitude) {
      this.dataService.globalvars.set('retailerlat', retailer.latitude);
      this.dataService.globalvars.set('retailerlong', retailer.longitude);
      this.dataService.globalvars.set('retaileraddress', retailer.addressline1 + ' ' + retailer.addressline2);
      return true;
    } else {
      this.dataService.displayToast('Retailer latitude and longitude are unspecified', 'WARNING');
      return false;
    }
  }

  async selectPaymentMode(item) {
    this.dataService.globalvars.set('selectedinvoice', item);
    const key = {
      distributorid: '' + this.pipaylib.loginService.loggedindistributor.id,
      id: '' + item.distyretailerid,
    };
    const tablename =
      this.pipaylib.solace.utilService.getTableName('distyretailer');
    const distyretailer = (await this.pipaylib.solace.dbLib.getItem(
      tablename,
      key
    )) as Distyretailer;
    this.dataService.globalvars.set('selectedretailer', distyretailer);
    this.dataService.globalvars.set('curpage', this.page);

    if(((this.distyconfig.capturegeotag && !distyretailer.geotagdone) ||
      (this.distyconfig.capturemobile && !distyretailer.mobileverified)) && this.pipaylib.loginService.loggedinstafftype.collectionallowed)
    {
      this.dataService.globalvars.set('capturecalledfrom', 'invoices');
      this.router.navigate(['/captureshopimage']);
    }else {
      this.router.navigate(['/paymentmode']);
    }
  }

  viewInvoice(invoice: Invoice) {
    window.open(invoice.scanimageurl);
  }

  async openPreview(img: any) {
    //console.log('IMAGE REVIEW', img);
    if (!img) {
      const toast = await this.toastCtrl.create({
        message: 'No Invoice Image Found!',
        duration: 1500,
        icon: 'close',
        color: 'danger',
      });
      toast.present();
      return;
    }
    const modal = await this.modalCtrl.create({
      component: ImagepreviewPage,
      componentProps: {
        img,
      },
      cssClass: 'transaparent-modal',
    });
    modal.present();
  }

  gotoHome() {
    this.router.navigate(['/dashboard']);
  }

  docketPayment(inv) {
    //console.log(inv)
    this.dataService.globalvars.set('processedDocket', inv);
    this.router.navigate(['/paymentdocket']);
  }

  ionViewDidLeave() {
    this.hideLoader();
  }
}
