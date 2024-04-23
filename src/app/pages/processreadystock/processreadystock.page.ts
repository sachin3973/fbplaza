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
import * as moment from 'moment';
import { Distybank } from 'pipaylib/domain/distybank';
import { Distyconfig } from 'pipaylib/domain/distyconfig';

@Component({
  selector: 'app-processreadystock',
  templateUrl: './processreadystock.page.html',
  styleUrls: ['./processreadystock.page.scss'],
})
export class ProcessreadystockPage implements OnInit {
  @ViewChild('markpaidmodal') markpaidmodal: IonModal;
  @ViewChild('txnref') txnrefInput;
  @ViewChild(IonModal) modal: any;
  strsearch: any;
  pageTitle;
  processedInvoice;
  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  paidamount:number= 0;
  user;
  qrvalue;
  transactionRef; //ADDED - CHECK 
  canRefDismiss: boolean;
  showRefModal: boolean;
  isprocessing: boolean;
  showqr;
  chqDate: any;
  showBank: boolean;
  canDismissbankModal: boolean;
  showbankmodal: boolean;
  bankList: any[];
  selectedBank;
  distyconfig;
  distyretailerid;
  chequeno;
  invoicenumber: string;
  invoicedate: string;
  distributorName: string
  initialgenerator: string;
  isLiveUpi: boolean;
  curconfig: Distyconfig;
  lat;
  long;

  constructor(private pipaylib: PipaylibService,public platform: Platform,public loadingCtrl: LoadingController,  private _router: Router, private dataService: AppdataService, public toastCtrl: ToastController) { }


  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this._router.navigate(['/']);
    }   
  }

  ionViewWillEnter() {
    this.curconfig = this.dataService.globalvars.get('distyconfig');
    this.distributorName = this.pipaylib.loginService.loggedindistributor.businessname;
    this.isLiveUpi = this.pipaylib.loginService.loggedindistributor.distyconfig.liveupi;
    this.distyconfig = this.dataService.globalvars.get('distyconfig')
    this.getBankList();
    this.processedInvoice = this.dataService.globalvars.get('readyStockProcessedInvoice');

    // console.log('THIS IS PROCESSEDINVOICE', this.processedInvoice);
    this.invoicenumber = this.processedInvoice.invoicenumber;
    this.invoicedate = moment().format('DD-MM-YYYY');
    //console.log('INVOICE DATE', this.invoicedate)
    this.chqDate = this.pipaylib.solace.utilService.getCurrentBusinessDate();
    let defaultperiod = this.pipaylib.loginService.loggedindistributor.distyconfig.defaultcreditperiod;
    this.chqDate = this.pipaylib.solace.utilService.addDaystoDate(this.chqDate, defaultperiod ? defaultperiod : 0);
    this.showqr = true;
    this.pageTitle = this.processedInvoice.paymentmode === 'UPI' ? 'Scan QR Code' : 'Cheque Details';
    //console.log( this.pageTitle)
    if (Capacitor.isNativePlatform()) {
      StatusBar.setBackgroundColor({color:'#033584'});
    } 
    const pn = this.pipaylib.loginService.loggedindistributor.businessname.replace(/ /g, '+');
    const pa = this.pipaylib.loginService.loggedindistributor.distyconfig.vpaid;
    // let pa:any;
    // if (this.processedInvoice.upivpaid && this.processedInvoice.upivpaid.length > 1) {
    //   pa = this.processedInvoice.upivpaid;
    // } else {
    //   pa = this.pipaylib.loginService.loggedindistributor.distyconfig.vpaid;
    // }    
    const qrlink = 'upi://pay?pn=' + pn + '&pa=' + pa + '&am=' + this.paidamount;
    // console.log(qrlink)
    this.user = this.pipaylib.loginService.loggedinstaff;    
    this.qrvalue = qrlink;
    this.getBankname()
    this.extractInitail();
    this.getMyLocation();
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

  upiMarkPaid() {
    this.openRefModal();
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
  
  openbankModal() {
    this.canDismissbankModal = false;
    this.showbankmodal = true;
  }

  closebankModal() {
    setTimeout(() => {
      this.showbankmodal = false;
    }, 100);
  }

  async confirmRef() {
    this.canRefDismiss = true;
    this.showRefModal = false;
    this.selectedBank = '';
    this.chequeno = '';
    this.processedInvoice.txnref = this.transactionRef;
    this.chqDate = this.pipaylib.solace.utilService.getCurrentBusinessDate();   
    this.closeRefModal();
    this.confirmPayment();
  }

  confirmChequePayment() {
    let newObj = {
      chqdate: this.chqDate,  
      chequeno: this.chequeno,
      bankName: this.selectedBank
    };
    this.processedInvoice.txnref = ''; 
    this.processedInvoice = {
      ...this.processedInvoice,
      ...newObj
    }
    //console.log( this.processedInvoice)
    this.confirmPayment();
  }

  async confirmPayment() {
    if (this.curconfig?.invnumreadystock === 'auto') {
      this.processedInvoice.invoicenumber = await this.getInvno(); 
      this.showLoader("Processing...");    
    } 
    let ret = await this.pipaylib.invoiceService.processReadyStockCollection(this.processedInvoice.invoicenumber, this.processedInvoice.invamount, this.processedInvoice.staff, this.processedInvoice.paidamount, this.processedInvoice.distyretailer, this.processedInvoice.paymentmode, this.chequeno, this.chqDate, this.selectedBank, this.processedInvoice.remark, this.processedInvoice.txnref, this.processedInvoice.creditDays, this.processedInvoice.brand, this.processedInvoice.vehicle,this.lat,this.long)

    if (ret.status === 'success') {
      //console.log("BEFORE MOVING TO CMPLETION PAGE", this.processedInvoice);
      this.dataService.globalvars.set('readyStockProcessedInvoice', this.processedInvoice);
      const toast = await this.toastCtrl.create({
        message: 'Payment Successful!',
        duration: 2500,
        icon: 'checkmark-circle-outline',
        color: 'success',
        position: 'top'
      });
      this.hideLoader();
      toast.present();
      this._router.navigate(['/completereadystock']);
    } else {
      const toast = await this.toastCtrl.create({
        message: ret.errordescription,
        duration: 2500,
        icon: 'checkmark-circle-outline',
        color: 'danger',
        position: 'top'
      });
      this.hideLoader();
      toast.present();
    }
    
  }

  showLoader(msg) {   
    if (!this.isprocessing) {
      this.isprocessing = true;
    }
    return this.loadingCtrl.create({
        message: msg,
        spinner: 'bubbles'
      })
      .then((res) => {
        res.present().then(() => {
          if (!this.isprocessing) {
            res.dismiss().then(() => {
              //console.log('processing');              
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

  inncreaseChequeDate() {
    const curdate = this.chqDate;
    this.chqDate = this.pipaylib.solace.utilService.addDaystoDate(curdate,+1);
  }

  decreaseChequeDate() {
    const curdate = this.chqDate;
    this.chqDate = this.pipaylib.solace.utilService.addDaystoDate(curdate,-1);
  }

  async getBankname() {
    let key = {distributorid : '' + this.pipaylib.loginService.loggedindistributor.id , id : '' + this.distyretailerid };
    let tablename = this.pipaylib.solace.utilService.getTableName('distyretailer');
    var distyretailer = <Distyretailer> await this.pipaylib.solace.dbLib.getItem(tablename,key);
   // //console.log("DISTY RETAILER", distyretailer)
    if(distyretailer && distyretailer.chequebankid){
      let retbank = <Distybank> this.pipaylib.dataService.getEntityForId(distyretailer.chequebankid,'distybank');
      if(retbank){
        this.selectedBank = retbank.name;
      }
    } else {
      //console.log("OTHER")
    }
  }

  getBankList() {
    let banklist = this.pipaylib.solace.dataService.getMasterFromMap('distybank');
    this.bankList = [];
    for(var bank of banklist){
      this.bankList.push({name: bank.name , id : bank.id});
    }
    //console.log(this.bankList)
  }

  confirmBank(bank) {    
    this.selectedBank = bank.name;  
    this.closebankModal()
  }

  async getInvno() {  
    var invseq = await this.pipaylib.invoiceService.getSequence("inv")
    var paddedstring = String(invseq).padStart(5, '0');
    this.invoicenumber = this.curconfig.invnumprefix + paddedstring;
    return this.invoicenumber;
  }
  
  getMyLocation() {
    navigator.geolocation.getCurrentPosition(pos => {
      this.long = +pos.coords.longitude;
      this.lat = +pos.coords.latitude;    
    });
  }

}
