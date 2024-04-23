import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal, LoadingController, Platform, ToastController } from '@ionic/angular';
import { PipaylibService } from 'pipaylib';
import { AppdataService, processinvoice } from 'src/app/services/appdata.service';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { Geolocation } from '@capacitor/geolocation';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { Invoice } from 'pipaylib/domain/invoice';

interface docketInvoice {
  id: any;
  docket: Invoice[];
  firstinvoiceno:any;
  lastinvoiceno :any;
  docketsize: any;  
  docketnum: any;
  totalamt: number;
}

@Component({
  selector: 'app-qrdocket',
  templateUrl: './qrdocket.page.html',
  styleUrls: ['./qrdocket.page.scss'],
})
export class QrdocketPage implements OnInit {
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
  selectedDocket: docketInvoice;
  docketNo;
  totalAmount;
  collectionStatus: boolean;
  txnref = new Date().valueOf().toString(6);
  isLiveUpi: boolean;
  invoicedate;
  invoicenumber;
  distributorName: string;
  initialgenerator: string;
  upiCheckTimer;



  constructor(private pipaylib: PipaylibService,public platform: Platform,public loadingCtrl: LoadingController,  private _router: Router, private dataService: AppdataService, public toastCtrl: ToastController) { }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this._router.navigate(['/']);
    }
    this.user = this.pipaylib.loginService.loggedinstaff;
    //console.log('Staff Name ' + this.user.name);
    this.processInvoice = <processinvoice>{};
  }

  ionViewWillEnter() {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setBackgroundColor({color:'#033584'});
    }   
    this.distributorName = this.pipaylib.loginService.loggedindistributor.businessname;
    const pn = this.pipaylib.loginService.loggedindistributor.businessname.replace(/ /g, '+');
    const pa = this.pipaylib.loginService.loggedindistributor.distyconfig.vpaid;
    this.selectedDocket = this.dataService.globalvars.get('processedDocket');
    this.docketNo = this.selectedDocket.docketnum;
    this.totalAmount = this.selectedDocket.totalamt;
    var distributorid = this.pipaylib.loginService.loggedindistributor.id
    this.isLiveUpi = this.pipaylib.loginService.loggedindistributor.distyconfig.liveupi;
    // this.invoicenumber = this.selectedInvoice.invoicenumber;
    // this.invoicedate = this.selectedInvoice.invoicedate
    var qrlink = 'upi://pay?pn=' +  pn + '&pa=' + pa + '&am=' + this.paidamount;
    //console.log('LIVE UPI + ' + this.pipaylib.loginService.loggedindistributor.distyconfig.liveupi);

    if(this.pipaylib.loginService.loggedindistributor.distyconfig.liveupi){
      var txnref = distributorid + "_" + this.docketNo;
      qrlink = 'upi://pay?pn=' +  pn + '&pa=' + pa + "&mc=6012&tr="  + txnref + "&mode=03&am=" +  this.paidamount + "&cu=INR";
      //console.log('LINK --- ' + qrlink + '||');
    }
    this.user = this.pipaylib.loginService.loggedinstaff;
    this.qrvalue = qrlink;
    this.calculateFailureCharges();
    this.extractInitail();

    // if(this.pipaylib.loginService.loggedindistributor.distyconfig.liveupi){
    //   var txnref = this.selectedInvoice.distributorid + "_" + this.selectedInvoice.invoicenumber;
    //   qrlink = 'upi://pay?pn=' +  pn + '&pa=' + pa + "&mc=6012&tr="  + txnref + "&mode=03&am=" +  this.paidamount + "&cu=INR";

    //   this.upiCheckTimer = setTimeout(()=>{ this.monitorUPI();}, 4000);
    // }
  }

  ionViewWillLeave() {
    //console.log('CLEARING TIMEOUT..')
    clearTimeout(this.upiCheckTimer);
  }

  async monitorUPI(){
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
                this.processCollection();
                return;
            }
        }
      }
    this.upiCheckTimer = setTimeout(()=>{ this.monitorUPI();}, 1200);
  }

  extractInitail() {
    const fullName = this.distributorName;
    const name = fullName.split(' ');
    const firstName = name[0];
    const lastName = fullName.substring(name[0].length).trim();
    const firstnameChar = firstName.charAt(0);
    const lastnameChar = lastName.charAt(0);
    this.initialgenerator = firstnameChar.toUpperCase() + lastnameChar.toUpperCase();
    //console.log(firstName + lastName);
  };

  calculateFailureCharges() {
    let arr = this.selectedDocket.docket;
    this.failureCharges = arr.reduce((prev, next) => prev + next.failurecharges, 0);
  }

  // Process Collection Logic
  async confirmRef() {
    this.canRefDismiss = true;
    this.showRefModal = false;
    this.closeRefModal();
    this.processCollection();
  }

  async processCollection() {
    this.showLoader('Processing..');
    let ret;
    var paidon = this.pipaylib.solace.utilService.getCurrentBusinessDate();
    this.isprocessing = true;
    let selectedInvoices = this.selectedDocket.docket;
    for (let i=0; i < selectedInvoices.length; i++) {
      try{
        ret = await this.pipaylib.invoiceService.processStaffCollectionLambda(selectedInvoices[i], this.user, 'UPI', '', selectedInvoices[i].invoiceamount, '', paidon, '', '', this.transactionRef,0,this.lat, this.long);
      } catch(err){
        ret = {status : 'error', errordescription : 'Error, please try again!'};
        this.hideLoader();
        const toast = await this.toastCtrl.create({
          message: ret.errordescription,
          duration: 2500,
          icon: 'close',
          color: 'danger',
        });
        toast.present();
        this.collectionStatus = false;
        return
      }
      if (ret && ret.status === 'success') {
        //console.log('UPI PAYMENT DONE');
        const key = {distributorid : '' + this.pipaylib.loginService.loggedindistributor.id , id : '' + selectedInvoices[i].distyretailerid };
        const tablename = this.pipaylib.solace.utilService.getTableName('distyretailer');
        const distyretailer = <Distyretailer> await this.pipaylib.solace.dbLib.getItem(tablename,key);
        if(distyretailer && distyretailer.mobileno && distyretailer.mobileno.length === 10 && !isNaN(parseInt(distyretailer.mobileno, 10))){
          this.pipaylib.paymentService.sendNotificationOnWhatsApp(selectedInvoices[i], distyretailer.mobileno, selectedInvoices[i].invoiceamount, 'UPI', this.pipaylib.loginService.loggedinstaff.name);
        }
        this.collectionStatus = true;
      }
    }

    if (this.collectionStatus) {
      this.hideLoader();
      this.processInvoice.paymentmode = 'UPI';
      this.processInvoice.paidon = paidon;
      this.processInvoice.txnid = this.txnref;
      this.dataService.globalvars.set('processedInvoice', this.processInvoice);
      //console.log('paymentmodeprocessinv' + this.processInvoice);
      const toast = await this.toastCtrl.create({
        message: 'Payment Successful!',
        duration: 2500,
        icon: 'checkmark-circle-outline',
        color: 'success',
        position: 'top'
      });
      toast.present();
      this.dataService.globalvars.set('isDocket', true);
      this._router.navigate(['/paymentreceipt'], { replaceUrl: true });
    }
  };

  upiMarkPaid() {
    // this.getLocation();
    this.getMyLocation();
    this.openRefModal();
  }

  async getLocation() {
    if (navigator.geolocation) {
       const position = await Geolocation.getCurrentPosition();
       this.lat = position.coords.latitude.toString();
       this.long = position.coords.longitude.toString();
       const accuracy = position.coords.accuracy;
       const altaccuracy  = position.coords.altitudeAccuracy;
    };
  }

  getMyLocation() {
    navigator.geolocation.getCurrentPosition( pos => {
			this.long = +pos.coords.longitude;
			this.lat= +pos.coords.latitude;
    
    });
  }
  // UPI REF Modal Controls
  openRefModal() {
    this.canRefDismiss = false;
    this.showRefModal = true;
    setTimeout(() => {
      this.txnrefInput.setFocus();
    }, 300);
  }

  closeRefModal() {
    setTimeout(() => {
      this.showRefModal = false;
    }, 100);
  }

  // Loaders
  showLoader(msg) {
    if (!this.isprocessing) {this.isprocessing = true;}
    return this.loadingCtrl.create({message: msg,spinner: 'bubbles',})
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

  hideLoader() {
    if (this.isprocessing) {this.isprocessing = false;}
    return this.loadingCtrl.dismiss().then(() => console.log('dismissed')).catch((e) => console.log(e));
  }
}
