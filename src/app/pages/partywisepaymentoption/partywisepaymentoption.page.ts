import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonModal,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { PipaylibService } from 'pipaylib';
import { Distyconfig } from 'pipaylib/domain/distyconfig';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { Invoice } from 'pipaylib/domain/invoice';
import { AppdataService } from 'src/app/services/appdata.service';

@Component({
  selector: 'app-partywisepaymentoption',
  templateUrl: './partywisepaymentoption.page.html',
  styleUrls: ['./partywisepaymentoption.page.scss'],
})
export class PartywisepaymentoptionPage implements OnInit {
  @ViewChild(IonModal) modal: any;
  paymentoption;
  retailername: string;
  strsearch: string;
  showRetailerModal: boolean;
  showInvoiceListModal: boolean;
  isLoading: boolean;
  page = 0;
  perPage = 20;
  amount = 0;
  paginationRetailerList = [];
  retailerlist;
  selectedRetailer: Distyretailer;
  invoicesAgainstRetailer: Invoice[];
  selectedInvoicesToSettle: Invoice[];
  settlementAmount: number;
  showPaymentModes: boolean;
  selectedInvoiceAmount: number;
  showRouteForRetailerSearch: boolean;
  selectedRouteForRetailerSearch;
  routeList: any;
  failureCharges: number;
  distyconfig: Distyconfig;

  constructor(
    private dataService: AppdataService,
    public pipaylib: PipaylibService,
    private router: Router,
    public alertController: AlertController,
    public toastController: ToastController,
    public loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this.router.navigate(['/']);
    }
  }

  ionViewWillEnter() {
    this.amount = 0;
    this.dataService.globalvars.set('fromPartywise', false);
    this.distyconfig = this.dataService.globalvars.get('distyconfig');
    this.selectedInvoicesToSettle = [];
    this.retailername = '';
    this.selectedInvoiceAmount = 0;
    this.failureCharges = this.dataService.globalvars.get('failurecharges');
    this.paymentoption = '';
    this.dataService.globalvars.set('cameFromPartywise', false);
  }

  onSelectRouteForRetailerSearch(route: any) {
    this.selectedRouteForRetailerSearch = route;
    localStorage.setItem('selectedRoute', JSON.stringify(this.selectedRouteForRetailerSearch));
    this.showRouteForRetailerSearch = false;
    this.getPaginatedRetailerList();
  }

  showRouteFoRetailerSearchOnClick = () => {
    this.showRouteForRetailerSearch = !this.showRouteForRetailerSearch;
  };

  receiveOnCloseModal(val: boolean) {
    // console.log('receiving', val);
    this.showPaymentModes = val;
    this.settlementAmount = 0;
    for (const inv of this.invoicesAgainstRetailer) {
      if (!inv.failurecharges) {inv.failurecharges = 0;}
      if (!inv.paidamount) {inv.paidamount = 0;}
    }
    this.settlementAmount = this.invoicesAgainstRetailer.reduce(
      (acc, item) =>
        acc +
        (item.invoiceamount + item.failurecharges - item.paidamount),
      0
    );
  }

  onSubmitSelectedInvoices() {
    this.showLoader('Processing...');
    setTimeout(() => {
      this.showInvoiceListModal = false;
      this.hideLoader();
    }, 200);
    setTimeout(() => {
      this.openPaymentModal();
    }, 300);
  }

  receiveSelectedInvoices(inv: {
    selectedInvoice?: Invoice;
    deselectedInvoice?: Invoice;
  }) {
    if (inv.selectedInvoice) {
      this.selectedInvoicesToSettle = [
        ...this.selectedInvoicesToSettle,
        inv.selectedInvoice,
      ];
    } else {
      this.selectedInvoicesToSettle = this.selectedInvoicesToSettle.filter(
        (item) => item.id !== inv.deselectedInvoice.id
      );
    }
    this.selectedInvoiceAmount = 0;
    // this.selectedInvoiceAmount = this.selectedInvoicesToSettle.reduce(
    //   (prev, next) => prev + next.invoiceamount,
    //   0
    // );

    for (const selinv of this.selectedInvoicesToSettle) {
      if (!selinv.failurecharges) {selinv.failurecharges = 0;}
      if (!selinv.paidamount) {selinv.paidamount = 0;}
    }
    this.selectedInvoiceAmount = this.selectedInvoicesToSettle.reduce(
      (acc, item) =>
        acc +
        (item.invoiceamount + item.failurecharges - item.paidamount),
      0
    );
  }

  submitInvoices() {
    this.showInvoiceListModal = false;
  }

  onChangePaymentOption(event: any) {
    this.selectedInvoiceAmount = 0;
    if (this.paymentoption === 'full') {
      if (
        this.invoicesAgainstRetailer &&
        this.invoicesAgainstRetailer.length > 0
      ) {
        for (const inv of this.invoicesAgainstRetailer) {
          if (!inv.failurecharges) {inv.failurecharges = 0;}
          if (!inv.paidamount) {inv.paidamount = 0;}
        }
        this.settlementAmount = this.invoicesAgainstRetailer.reduce(
          (acc, item) =>
            acc +
            (item.invoiceamount + item.failurecharges - item.paidamount),
          0
        );
      }
    } else if (this.paymentoption === 'invoice') {
      this.amount = 0;
    }

  }

  // ************************* RETAILER LIST LOGIG ************************************

  async openRetailerModal() {
    const assignedroutes =
      this.pipaylib.loginService.loggedinstaff.assignedroutes;
    if (assignedroutes && assignedroutes.length > 0) {
      this.routeList = assignedroutes.map((item) => {
        const routeName = this.pipaylib.dataService.getRouteNameforId(item);
        return {
          id: item,
          name: routeName,
        };
      });
    } else {
      this.routeList = await this.pipaylib.solace.dataService.getMasterFromMap(
        'distyroute'
      );
    }
    // this.routeList = this.routeList.map(item => {
    //   return {
    //     id: item.id,
    //     name: item.name
    //   }
    // });
    this.routeList = [{ id: 'All', name: 'All' }, ...this.routeList];
    this.selectedRouteForRetailerSearch = JSON.parse(localStorage.getItem('selectedRoute'));
    if (!this.selectedRouteForRetailerSearch) {
      this.selectedRouteForRetailerSearch = this.routeList[0];
    }
    this.getPaginatedRetailerList();
    this.strsearch = '';
    setTimeout(() => {
      this.showRetailerModal = true;
      this.hideLoader();
    }, 100);
  }

  changePaymentoption(ev) {
    // console.log(ev.target.value);
    this.paymentoption = ev.target.value;
    this.getPaginatedRetailerList();
    this.strsearch = '';
    setTimeout(() => {
      this.showRetailerModal = true;
      this.hideLoader();
    }, 100);
  }

  getPaginatedRetailerList() {
    /* Get Retailer 20 Record on page load and on search clear*/
    this.page = 0;
    this.paginationRetailerList = [];
    const retailerlist =
      this.pipaylib.solace.dataService.getMasterFromMap('distyretailer');
    const assignedroutes =
      this.pipaylib.loginService.loggedinstaff.assignedroutes;
    if (assignedroutes && assignedroutes.length > 0) {
      this.retailerlist = retailerlist.filter((item) =>
        assignedroutes.includes(item.routeid)
      );
      if (
        this.selectedRouteForRetailerSearch &&
        this.selectedRouteForRetailerSearch.name !== 'All'
      ) {
        this.retailerlist = this.retailerlist.filter(
          (item) => this.selectedRouteForRetailerSearch.id === item.routeid
        );
      }
      // this.paginationRetailerList = this.retailerlist.slice(0, this.perPage);
    } else {
      if (
        this.selectedRouteForRetailerSearch &&
        this.selectedRouteForRetailerSearch.name !== 'All'
      ) {
        this.retailerlist = retailerlist.filter(
          (item) => this.selectedRouteForRetailerSearch.id === item.routeid
        );
      } else {
        this.retailerlist = retailerlist;
      }
    }
    this.paginationRetailerList = this.retailerlist.slice(0, this.perPage);
  }

  paginateArrayForRetailer() {
    this.page++;
    const curloaded = this.page * this.perPage;
    let invforpagination: any;
    /* on search use suggestion list */
    if (!this.strsearch) {
      invforpagination = this.retailerlist;
    } else {
      invforpagination = this.paginationRetailerList;
    }
    if (invforpagination && invforpagination.length > curloaded) {
      const remaining = invforpagination.length - curloaded;
      if (remaining > this.perPage) {
        const endindex = curloaded + this.perPage;
        return invforpagination.slice(curloaded, endindex);
      } else {
        return invforpagination.slice(curloaded, invforpagination.length);
      }
    }
  }

  searchRetailer() {
    if (this.strsearch && this.strsearch.length >= 3) {
      const paginationRetailerList = [];
      //filtered ret list is added in search instead of master ret list
      for (const ret of this.retailerlist) {
        if (
          ret.retailercode.includes(this.strsearch) ||
          ret.businessname.toLowerCase().includes(this.strsearch.toLowerCase())
        ) {
          paginationRetailerList.push(ret);
        }
      }
      this.paginationRetailerList = [...paginationRetailerList];
    } else {
      this.getPaginatedRetailerList();
    }
  }

  async confirmRetailer(retailer: Distyretailer) {
    this.showLoader('Fetching Invoices ...');
    this.selectedRetailer = retailer;
    this.retailername =
      this.selectedRetailer.retailercode +
      '-' +
      this.selectedRetailer.businessname;
    this.modal.dismiss('confirm');
    this.showRetailerModal = false;
    this.invoicesAgainstRetailer =
      await this.pipaylib.invoiceService.getDistyRetailerInvoices(
        this.pipaylib.loginService.loggedindistributor.id,
        this.selectedRetailer.id
      );
    this.invoicesAgainstRetailer = this.invoicesAgainstRetailer.filter(
      (item) =>
        item.invoicestatus !== 'Settled' &&
        item.invoicestatus !== 'Paid' &&
        item.invoicestatus !== 'Cancelled'
    );
    this.settlementAmount = 0;
    if (
      this.invoicesAgainstRetailer &&
      this.invoicesAgainstRetailer.length > 0
    ) {
      // this.settlementAmount = this.invoicesAgainstRetailer.reduce(
      //   (prev, next) => prev + next.invoiceamount,
      //   0
      // );
      for (const inv of this.invoicesAgainstRetailer) {
        if (!inv.failurecharges) {inv.failurecharges = 0;}
        if (!inv.paidamount) {inv.paidamount = 0;}
      }
      this.settlementAmount = this.invoicesAgainstRetailer.reduce(
        (acc, item) =>
          acc +
          (item.invoiceamount + item.failurecharges - item.paidamount),
        0
      );
    }
    this.hideLoader();
  }

  async selectPaymentMode(item) {
    this.dataService.globalvars.set('selectedinvoice', item);
    const key = {
      distributorid: '' + this.pipaylib.loginService.loggedindistributor.id,
      id: '' + item.distyretailerid,
    };
    // console.log(' KEY ' + JSON.stringify(key));
    const tablename =
      this.pipaylib.solace.utilService.getTableName('distyretailer');
    const distyretailer = (await this.pipaylib.solace.dbLib.getItem(
      tablename,
      key
    )) as Distyretailer;
    this.dataService.globalvars.set('selectedretailer', distyretailer);
    this.dataService.globalvars.set('curpage', this.page);
    this.dataService.globalvars.set('cameFromPartywise', true);
    if (
      (this.distyconfig.capturegeotag && !distyretailer.geotagdone) ||
      (this.distyconfig.capturefssai && !distyretailer.fssaiavailable)
    ) {
      this.router.navigate(['captureshopimage']);
    } else {
      if (this.showInvoiceListModal) {
        this.showInvoiceListModal = false;
        setTimeout(() => {
          this.dataService.globalvars.set('fromPartywise', true);
          this.router.navigate(['/paymentmode']);
        }, 500) ;
        return;
      }
      this.dataService.globalvars.set('fromPartywise', true);
      this.router.navigate(['/paymentmode']);
    }
  }

  closeRetailerDialog() {
    this.modal.dismiss('confirm');
    this.strsearch = '';
    this.showRetailerModal = false;
  }

  // ****************************** INVOICE LIST LOGIC *************************
  async openInvoiceListDialog() {
    this.showInvoiceListModal = true;
    this.selectedInvoicesToSettle = [];
    this.showLoader('Fetching Invoices ...');
    this.hideLoader();
    this.selectedInvoiceAmount = 0;
  }

  closeInvoiceListDialog() {
    this.modal.dismiss('confirm');
    this.strsearch = '';
    this.showInvoiceListModal = false;
  }

  openPaymentModal() {
    this.showPaymentModes = true;
    if (this.paymentoption === 'onaccount') {
      this.settlementAmount = this.amount;
    }
  }

  // ****************************** LOADER LOGIC *******************************

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
      });
  }

  paginateArray() {
    this.page++;
    const curloaded = this.page * this.perPage;
    let invforpagination: any;
    /* on search use suggestion list */
    if (!this.strsearch) {
      invforpagination = this.retailerlist;
    } else {
      invforpagination = this.paginationRetailerList;
    }
    if (invforpagination && invforpagination.length > curloaded) {
      const remaining = invforpagination.length - curloaded;
      if (remaining > this.perPage) {
        const endindex = curloaded + this.perPage;
        return invforpagination.slice(curloaded, endindex);
      } else {
        return invforpagination.slice(curloaded, invforpagination.length);
      }
    }
  }

  onIonInfinite(event) {
    setTimeout(() => {
      const arr = this.paginateArray();
      if (arr?.length > 0) {
        this.paginationRetailerList = this.paginationRetailerList.concat(arr);
      }
      event.target.complete();
      if (arr?.length < this.perPage) {
        event.target.disabled = true;
      }
    }, 200);
  }
}
