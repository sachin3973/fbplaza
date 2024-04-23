/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonModal,
  LoadingController,
  Platform,
  ToastController,
} from '@ionic/angular';
import { PipaylibService } from 'pipaylib';
import {
  AppdataService,
  processinvoice,
} from 'src/app/services/appdata.service';
import {
  NgxQrcodeElementTypes,
  NgxQrcodeErrorCorrectionLevels,
} from '@techiediaries/ngx-qrcode';
import { Geolocation } from '@capacitor/geolocation';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { Invoice } from 'pipaylib/domain/invoice';

@Component({
  selector: 'app-qrcodepage',
  templateUrl: './qrcodepage.page.html',
  styleUrls: ['./qrcodepage.page.scss'],
})
export class QrcodepagePage implements OnInit {
  @ViewChild('markpaidmodal') markpaidmodal: IonModal;
  @ViewChild('txnref') txnrefInput;
  processInvoice: processinvoice;
  transactionRef;
  partialpaidamt;
  canRefDismiss: boolean;
  showRefModal: boolean;
  selectedInvoice;
  invoiceamount: number;
  user;
  paidamount: number;
  invoiceStatus;
  isprocessing: boolean;
  qrcodeimagesrc;
  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  qrvalue;
  lat;
  long;
  failureCharges;
  initialgenerator;
  upiCheckTimer;
  distributorName: string;
  isLiveUpi: boolean;
  invoicenumber;
  invoicedate;

  constructor(
    public pipaylib: PipaylibService,
    public platform: Platform,
    public loadingCtrl: LoadingController,
    private _router: Router,
    private dataService: AppdataService,
    public toastCtrl: ToastController
  ) {}

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this._router.navigate(['/']);
    }
    this.user = this.pipaylib.loginService.loggedinstaff;
    //console.log('Staff Name ' + this.user.name);
  }

  async getCallback(retupi: string) {
    //console.log('Callback Received ' + retupi);
    if (retupi) {
      const arrupiresp = retupi.split('|');
      if (arrupiresp && arrupiresp.length > 10) {
        const strinv = arrupiresp[1];
        const amt = parseInt(arrupiresp[2], 10);
        const status = arrupiresp[4];
        const strinvlocal =
          this.selectedInvoice.distributorid +
          '_' +
          this.selectedInvoice.invoicenumber;

        //console.log('Params ' + strinv + ' __ ' + amt + ' __ ' + status + ' __ ' + strinvlocal);
        if (
          status === 'SUCCESS' &&
          amt === this.paidamount &&
          strinv === strinvlocal
        ) {
          this.transactionRef = arrupiresp[0];
          this.processCollection();
          return;
        } else if (status === 'FAILURE') {
          const toast = await this.toastCtrl.create({
            message: 'Payment not recevied',
            duration: 2500,
            icon: 'close',
            color: 'danger',
          });
          toast.present();
        }
      }
    }
  }

  ionViewWillEnter() {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setBackgroundColor({ color: '#033584' });
    }
    this.distributorName =
      this.pipaylib.loginService.loggedindistributor.businessname;
    //console.log('DISTRUBUTOR NAME', this.distributorName);
    this.processInvoice = this.dataService.globalvars.get('processedInvoice');
    this.selectedInvoice = <Invoice>(
      this.dataService.globalvars.get('selectedinvoice')
    );
    this.invoiceStatus = this.selectedInvoice.invoicestatus;
    this.invoiceamount = this.selectedInvoice.invoiceamount;
    this.invoicenumber = this.selectedInvoice.invoicenumber;
    this.invoicedate = this.selectedInvoice.invoicedate;
    this.failureCharges = this.selectedInvoice.failurecharges;
    this.paidamount = this.processInvoice.paidamount;
    this.partialpaidamt = this.selectedInvoice.paidamount;
    this.extractInitail();
    //console.log(this.paidamount +''+ this.partialpaidamt);
    const pn =
      this.pipaylib.loginService.loggedindistributor.businessname.replace(
        / /g,
        '+'
      );
    // const pa = this.pipaylib.loginService.loggedindistributor.distyconfig.vpaid;
    const pa = this.pipaylib.invoiceService.getVPAIdForInvoice(
      this.selectedInvoice
    );
    this.isLiveUpi =
      this.pipaylib.loginService.loggedindistributor.distyconfig.liveupi;

    let qrlink = 'upi://pay?pn=' + pn + '&pa=' + pa + '&am=' + this.paidamount;
    ////console.log('LIVE UPI + ' + this.pipaylib.loginService.loggedindistributor.distyconfig.liveupi);
    console.log('qrlink' + qrlink);
    console.log('selectedInvoice' + JSON.stringify(this.selectedInvoice));
    console.log('processInvoice' + JSON.stringify(this.processInvoice));
    if (this.pipaylib.loginService.loggedindistributor.distyconfig.liveupi) {
      const txnref =
        this.selectedInvoice.distributorid +
        '_' +
        this.selectedInvoice.invoicenumber;
      qrlink =
        'upi://pay?pn=' +
        pn +
        '&pa=' +
        pa +
        '&mc=6012&tr=' +
        txnref +
        '&mode=03&am=' +
        this.paidamount +
        '&cu=INR';
      this.pipaylib.websocketService.createCallbackPoller(
        this.selectedInvoice.invoicenumber,
        this
      );
      //this.upiCheckTimer = setTimeout(()=>{ this.monitorUPI();}, 4000);
    }

    this.user = this.pipaylib.loginService.loggedinstaff;
    //var qrlink = "upi://pay?pn=Satish+Goriani&pa=satish.goriani@oksbi&am=1&tr=12345";
    this.qrvalue = qrlink;
  }

  extractInitail() {
    const fullName = this.distributorName;
    const name = fullName.split(' ');
    const firstName = name[0];
    const lastName = fullName.substring(name[0].length).trim();
    const firstnameChar = firstName.charAt(0);
    const lastnameChar = lastName.charAt(0);
    this.initialgenerator =
      firstnameChar.toUpperCase() + lastnameChar.toUpperCase();
    //console.log(firstName + lastName);
  }

  ionViewWillLeave() {
    //console.log('CLEARING TIMEOUT..')
    clearTimeout(this.upiCheckTimer);
  }

  /*async monitorUPI(){
    var retupi = await this.pipaylib.paymentService.checkUPIStatus(this.selectedInvoice);
    //console.log('Checking status RESP::' + retupi);

    if(retupi){
        var arrupiresp = retupi.split("|");
        if(arrupiresp && arrupiresp.length > 10){
            var strinv = arrupiresp[1];
            var amt = parseInt(arrupiresp[2]);
            var status = arrupiresp[4];
            var strinvlocal = this.selectedInvoice.distributorid + "_" + this.selectedInvoice.invoicenumber;

            //console.log('Params ' + strinv + ' __ ' + amt + ' __ ' + status + ' __ ' + strinvlocal);
            if(status == 'SUCCESS' && amt == this.paidamount && strinv== strinvlocal){
                this.transactionRef  = arrupiresp[0];
                //this.processCollection();
                return;
            }
        }
      }
    this.upiCheckTimer = setTimeout(()=>{ this.monitorUPI();}, 1200);
  }*/

  async checkUpiStatus() {
    const retupi = await this.pipaylib.paymentService.checkUPIStatus(
      this.selectedInvoice
    );
    //console.log('Checking status RESP::' + retupi);

    if (retupi) {
      const arrupiresp = retupi.split('|');
      if (arrupiresp && arrupiresp.length > 10) {
        const strinv = arrupiresp[1];
        const amt = parseInt(arrupiresp[2], 10);
        const status = arrupiresp[4];
        const strinvlocal =
          this.selectedInvoice.distributorid +
          '_' +
          this.selectedInvoice.invoicenumber;

        //console.log('Params ' + strinv + ' __ ' + amt + ' __ ' + status + ' __ ' + strinvlocal);
        if (
          status === 'SUCCESS' &&
          amt === this.paidamount &&
          strinv === strinvlocal
        ) {
          this.transactionRef = arrupiresp[0];
          this.processCollection();
          return;
        } else if (status === 'FAILURE') {
          const toast = await this.toastCtrl.create({
            message: 'Payment not recevied',
            duration: 2500,
            icon: 'close',
            color: 'danger',
          });
          toast.present();
        }
      }
    }
  }

  upiMarkPaid() {
    // this.upiAmountPaid = true;
    // this.getLocation();
    this.getMyLocation();
    this.getMyLocation();
    this.openRefModal();
  }

  async confirmRef() {
    this.canRefDismiss = true;
    this.showRefModal = false;
    this.closeRefModal();

    // this._router.navigate(['/paymentreceipt']);
    this.processCollection();
  }

  closeRefModal() {
    setTimeout(() => {
      this.showRefModal = false;
    }, 100);
  }

  openRefModal() {
    this.canRefDismiss = false;
    this.showRefModal = true;
    setTimeout(() => {
      this.txnrefInput.setFocus();
    }, 300);
  }

  showLoader(msg) {
    //   this.platform.backButton.subscribeWithPriority(5, () => {
    //     document.addEventListener('backbutton', () => {}, false);
    // });
    if (!this.isprocessing) {
      this.isprocessing = true;
    }
    return this.loadingCtrl
      .create({ message: msg, spinner: 'bubbles' })
      .then((res) => {
        res.present().then(() => {
          if (!this.isprocessing) {
            res.dismiss().then(() => {
              //console.log('login successful');
              // this.platform.backButton.observers.pop();
            });
          }
        });
      })
      .catch((e) => {
        this.isprocessing = false;
      });
  }

  async getLocation() {
    if (navigator.geolocation) {
      const position = await Geolocation.getCurrentPosition();
      this.lat = position.coords.latitude.toString();
      this.long = position.coords.longitude.toString();
      const accuracy = position.coords.accuracy;
      const altaccuracy = position.coords.altitudeAccuracy;
    }
  }

  getMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      this.long = +pos.coords.longitude;
      this.lat = +pos.coords.latitude;
    });
  }

  hideLoader() {
    if (this.isprocessing) {
      this.isprocessing = false;
    }
    return this.loadingCtrl
      .dismiss()
      .then(() => console.log('dismissed'))
      .catch((e) => console.log(e));
  }

  async processCollection() {
    let ret;
    this.isprocessing = true;
    this.processInvoice.paidamount = this.paidamount;
    this.processInvoice.txnid = this.transactionRef;
    try {
      this.showLoader('Processing..');
      ret = await this.pipaylib.invoiceService.processStaffCollectionLambda(
        this.selectedInvoice,
        this.user,
        this.processInvoice.paymentmode,
        '',
        this.paidamount,
        '',
        this.pipaylib.solace.utilService.getCurrentBusinessDate(),
        '',
        this.processInvoice.remark,
        this.transactionRef,
        0,
        this.lat,
        this.long
      );
    } catch (err) {
      ret = { status: 'error', errordescription: 'Error, please try again!' };
    }
    this.hideLoader();
    // console.log('REMARK', this.processInvoice.remark)
    this.dataService.globalvars.set('processedInvoice', this.processInvoice);
    if (ret && ret.status === 'success') {
      //console.log('UPI PAYMENT DONE');
      const key = {
        distributorid: '' + this.pipaylib.loginService.loggedindistributor.id,
        id: '' + this.selectedInvoice.distyretailerid,
      };
      const tablename =
        this.pipaylib.solace.utilService.getTableName('distyretailer');
      const distyretailer = <Distyretailer>(
        await this.pipaylib.solace.dbLib.getItem(tablename, key)
      );

      if (
        distyretailer &&
        distyretailer.mobileno &&
        distyretailer.mobileno.length === 10 &&
        !isNaN(parseInt(distyretailer.mobileno, 10))
      ) {
        this.pipaylib.paymentService.sendNotificationOnWhatsApp(
          this.selectedInvoice,
          distyretailer.mobileno,
          this.processInvoice.paidamount,
          this.processInvoice.paymentmode,
          this.pipaylib.loginService.loggedinstaff.name
        );
      }

      this._router.navigate(['/paymentreceipt'], { replaceUrl: true });
    } else {
      const toast = await this.toastCtrl.create({
        message: ret.errordescription,
        duration: 2500,
        icon: 'close',
        color: 'danger',
      });
      toast.present();
      //console.log('error' + ret.statuserrorcode + ret.errordescription);
    }
  }
}
