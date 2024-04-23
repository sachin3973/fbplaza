import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal, LoadingController, Platform, ToastController } from '@ionic/angular';
import { PipaylibService } from 'pipaylib';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { Invoice } from 'pipaylib/domain/invoice';
import { Retailer } from 'pipaylib/domain/retailer';
import { processinvoice } from 'src/app/services/appdata.service';
import { AppdataService } from 'src/app/services/appdata.service';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { IonInput } from '@ionic/angular';
import * as moment from 'moment';
import { Distybank } from 'pipaylib/domain/distybank';
import { Geolocation } from '@capacitor/geolocation';


interface docketInvoice {
  id: any;
  docket: Invoice[];
  firstinvoiceno:any;
  lastinvoiceno :any;
  docketsize: any;  
  docketnum: any;
  totalamt: number;
  status: any;
}

@Component({
  selector: 'app-paymentdocket',
  templateUrl: './paymentdocket.page.html',
  styleUrls: ['./paymentdocket.page.scss'],
})
export class PaymentdocketPage implements OnInit {
  @ViewChild('confirmModal') confirmmodal: IonModal;
  @ViewChild('chequemodal') chequemodal: IonModal;
  @ViewChild('cancellationModal') cancellationModal: IonModal;
  @ViewChild('myInput') myInput: IonInput;
  @ViewChild('creditinput') creditinput: IonInput;

  // Cheque Modal
  canDismissChequeModal: boolean;
  showchequemodal: boolean

  // Bank Modal
  canDismissbankModal: boolean;
  showbankmodal: boolean;

  // NEFT Modal
  canDismissNeftModal: boolean;
  showneftmodal: boolean;

  // Credit Note Modal
  canDismissCreditModal: boolean;
  showcreditmodal: boolean;

  // Cancel Invoice Modal
  canDismissCancelModal: boolean;
  showcancelmodal: boolean;

  // Confirmation Modal
  canDismissConfirmModal: boolean;
  showConfirmModal: boolean;

  isLoading: boolean;
  processInvoice: processinvoice;
  isprocessing = false;
  invoiceStatus;
  cnonly;
  selectedInvoice: Invoice | any;
  canDismiss: boolean;
  distyretailer: Distyretailer;
  selectedDocket: docketInvoice;
  docketNo;
  totalAmount;
  bankList: any[];
  selectedBank;
  paymenttyp: string;
  selectedCreditReason: string;
  showCreditReasons = false;
  creditRef;
  distyconfig;
  chqDate;
  searchBank;
  otherreason;
  showReasons = false;
  selectedReason;
  creditReasons = ['Sales Return', 'Previous Excess Payment', 'Other'];
  remarks = 'Payment Done';
  utrRef;
  txnref = new Date().valueOf().toString(6);
  creditallowed = false;
  creditnoteallowed = true;
  dwpallowed = false;
  creditdays = 0;
  otpfordwp = false;
  lat;
  long;

  collectionStatus: boolean;

  // To check permission of staff 
  hidepayment: boolean;

  onSendCancellationRequest(){
    
  }

  constructor(public loadingCtrl: LoadingController, public platform: Platform, public toastCtrl: ToastController, public pipaylib: PipaylibService, private _router: Router, private dataService: AppdataService) { }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this._router.navigate(['/']);
    };
    this.processInvoice = {} as processinvoice;
    this.paymenttyp == 'fullpay';
    this.collectionStatus = false;
  }

  ionViewDidEnter() {   
    this.distyconfig = this.dataService.globalvars.get('distyconfig')
    //console.log(this.distyconfig);
    this.chqDate = moment().format('YYYY-MM-D');
    let defaultperiod = this.distyconfig.defaultcreditperiod;
    this.chqDate = this.pipaylib.solace.utilService.addDaystoDate(this.chqDate, defaultperiod ? defaultperiod : 0);
  }
 
  ionViewWillEnter() {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setBackgroundColor({color:'#033584'});
    }
    // this.getLocation();
    this.getMyLocation();
    this.processInvoice.creditnotereason = this.creditReasons[0];
    let banklist = this.pipaylib.solace.dataService.getMasterFromMap('distybank');
    this.bankList = [];
    for(var bank of banklist){
      this.bankList.push({name: bank.name , id : bank.id});
    }
    this.selectedDocket = this.dataService.globalvars.get('processedDocket');
    this.docketNo = this.selectedDocket.docketnum;
    this.totalAmount = this.selectedDocket.totalamt;    
    //console.log('selectedDocket' + JSON.stringify(this.selectedDocket));
    this.getDistyRetailer();


  }

  async getDistyRetailer() {
    let key = {distributorid : '' + this.pipaylib.loginService.loggedindistributor.id , id : '' + this.selectedDocket.docket[0].distyretailerid };
    let tablename = this.pipaylib.solace.utilService.getTableName('distyretailer');
    this.distyretailer = <Distyretailer> await this.pipaylib.solace.dbLib.getItem(tablename,key);
    //console.log('RETAILER IS', this.distyretailer);
    this.getRetailerData();
  }

  // Main Payment Processing Logic 
  async confirmPayment() {
    this.showLoader('Processing...');
    let selectedInvoices = this.selectedDocket.docket;
    for (let i=0; i < selectedInvoices.length; i++) {
      if (selectedInvoices[i].invoicestatus == 'New' || selectedInvoices[i].invoicestatus === 'Delivery Without Payment') {
        this.processInvoice.paidamount = selectedInvoices[i].invoiceamount;
      } else if (selectedInvoices[i].invoicestatus == 'Payment failed') {
          this.processInvoice.paidamount = selectedInvoices[i].invoiceamount + this.selectedInvoice.failurecharges;
      }
      if (this.processInvoice.paymentmode === 'Cheque') {
        this.processInvoice.chqdate = this.chqDate;
      }
      this.processInvoice.paidon = this.pipaylib.solace.utilService.getCurrentBusinessDate();
      this.processInvoice.retailer = selectedInvoices[i].distyretailername;
      //console.log('Processeing The ' + i + "number invoice")
      this.processCollection(selectedInvoices[i]);
    }
    //console.log(this.collectionStatus)
  
  }

  async processCollection(processedInvoice: Invoice) {
    let bankname = '' ;
    if(this.processInvoice.paymentmode === 'Cheque' && this.distyretailer.chequebankid){
      let retbank = <Distybank> this.pipaylib.dataService.getEntityForId(this.distyretailer.chequebankid,'distybank');
      if(retbank){
        bankname = retbank.name;
      }
    }

    const ret = await this.pipaylib.staffService.processStaffCollection(processedInvoice, this.processInvoice.paymentmode, '', this.processInvoice.paidamount , this.processInvoice.instrumentref, this.processInvoice.chqdate ? this.processInvoice.chqdate : this.processInvoice.paidon, this.selectedBank ? this.selectedBank : '' , this.remarks, this.utrRef ? this.utrRef : this.txnref,30, this.lat, this.long);
    if (ret.status === 'success') {
      if(this.distyretailer && this.distyretailer.mobileno && this.distyretailer.mobileno.length === 10 && !isNaN(parseInt(this.distyretailer.mobileno, 10))){
        this.pipaylib.paymentService.sendNotificationOnWhatsApp(processedInvoice,this.distyretailer.mobileno, this.processInvoice.paidamount, this.processInvoice.paymentmode,this.pipaylib.loginService.loggedinstaff.name);
      }
      this.collectionStatus = true;
    }
    else {
      this.hideLoader();
      const toast = await this.toastCtrl.create({ message: ret.errordescription,duration: 2500,icon: 'close',color: 'danger',});
      toast.present();
      //console.log('error' + ret.statuserrorcode + ret.errordescription);
      this.collectionStatus = false;
      return 
    }
    if (this.collectionStatus) {
      //console.log("WE ARE HERE NOW!!")
      this.hideLoader();
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
      this.dataService.globalvars.set('isDocket', true);
      this.dataService.globalvars.set('processedDocket', this.selectedDocket);
      this._router.navigate(['/paymentreceipt'], { replaceUrl: true });
      toast.present();
    }
  };

  // async onSendCreditRequest() {
  //   this.processInvoice.txnid = this.txnref;
  //   if (this.otherreason) {
  //     this.processInvoice.creditnotereason = this.otherreason;
  //   }    
  //   // this._router.navigate(['/invoices']);
  //   if (this.distyconfig.skipuploadoncn) {
  //     this.dataService.globalvars.set('processedInvoice',this.processInvoice);
  //     this.creditnoteProcessCollection();
  //   } else {
  //     this.dataService.globalvars.set('processedInvoice',this.processInvoice);
  //     this._router.navigate(['/uploadinvoice']);
  //   }
    
  // }

  // async creditnoteProcessCollection() {
  //   this.showLoader('Processing Invoice...');
  //   this.crnselectedInvoice = this.dataService.globalvars.get('selectedinvoice');
  //   this.imageurl = '';
  //   const ret = await this.pipaylib.invoiceService.processStaffCollectionLambda
  //     (this.crnselectedInvoice,this.pipaylib.loginService.loggedinstaff, this.processInvoice.paymentmode, '', this.processInvoice.paidamount, this.processInvoice.instrumentref, this.processInvoice.paidon, this.processInvoice.bankname, this.processInvoice.remark, this.processInvoice.creditnotereason, 0);
  //   if (ret.status === 'success') { 
  //     this.hideLoader();
  //     const toast = await this.toastCtrl.create({
  //       message: 'Delivery Successful!',
  //       duration: 2500,
  //       icon: 'checkmark-circle-outline',
  //       color: 'success',
  //       position: 'top'
  //     });
  //     toast.present();
  //     this._router.navigate(['/paymentreceipt'], { replaceUrl: true }); 
  //   }
  //   else { 
  //     const toast = await this.toastCtrl.create({
  //       message: ret.errordescription,
  //       duration: 2500,
  //       icon: 'close',
  //       color: 'danger',
  //     });
  //     toast.present();
  //     //console.log('error' + ret.statuserrorcode + ret.errordescription);
  //   }
  // };

  uploadDocket() {
    this.dataService.globalvars.set('processedInvoice',this.processInvoice);
    this._router.navigate(['uploaddocket']);
  }

  async getRetailerData(){
    if(this.distyretailer){
        if(this.distyretailer.creditallowed && this.distyretailer.creditallowed.toUpperCase().indexOf('Y') >= 0){
          this.creditallowed = true;
          this.creditdays = this.distyretailer.creditperiod;
        }else{
          this.creditdays = 0;
      }
      if (this.distyretailer.dwpallowed && this.distyretailer.dwpallowed.toUpperCase().indexOf('Y') >= 0){
        this.dwpallowed = true;

         if(this.distyretailer.otpfordwp && this.distyretailer.otpfordwp.toUpperCase().indexOf('Y') >= 0) {
           this.otpfordwp = true;
         }else{
          this.otpfordwp = false;
         }
      }else{
        this.dwpallowed = false;
      }
    }else{
      const toast = await this.toastCtrl.create({ message: 'Error getting data, please try again!',duration: 2500,icon: 'close',color: 'danger',});
      toast.present();
      this._router.navigate(['/dashboard']);
    }
  }
  
  // Increase Decrease Cheque Date
  inncreaseChequeDate() {
    const curdate = this.chqDate;
    this.chqDate = this.pipaylib.solace.utilService.addDaystoDate(curdate,+1);
  }

  decreaseChequeDate() {
    const curdate = this.chqDate;
    this.chqDate = this.pipaylib.solace.utilService.addDaystoDate(curdate,-1);
  }

  // Select Payment Mode **********
  selectCash() {
    this.processInvoice.paymentmode = 'Cash';
    this.openConfirmModal();
  }

  selectCheque() {
    this.processInvoice.paymentmode = 'Cheque';
    this.openChequeModal();
  }

  selectNach() {
    this.processInvoice.paymentmode = 'NACH';
  }

  selectUpi() {
    this.processInvoice.paymentmode = 'UPI';
    this._router.navigate(['/qrdocket']);
  }

  selectNeft() {
    this.processInvoice.paymentmode = 'NEFT';
    this.openNeftModal();
  }

  selectCredit() {
    this.processInvoice.paymentmode = 'Credit Note';
    this.openCreditModal();
  }

  selectDeliver() {
    this.processInvoice.paymentmode = 'Delivery Without Payment';
    this.uploadDocket();
  }

  // Cheque Modal Controls
  openChequeModal() {
    this.canDismissChequeModal = false;
    this.showchequemodal = true;
  }

  closeChequeModal() {
    setTimeout(() => {
      this.showchequemodal = false;
      this.selectedBank = '';
    }, 100);
  }

  // Bank Modal Controls
  openbankModal() {
    this.canDismissbankModal = false;
    this.showbankmodal = true;
  }

  closebankModal() {
    setTimeout(() => {
      this.showbankmodal = false;
    }, 100);
  }

  // NEFT Modal Controls
  openNeftModal() {
    //console.log(this.paymenttyp)
     this.canDismissNeftModal = false;
     this.showneftmodal = true;
   }

   closeNeftModal() {
    setTimeout(() => {
      this.showneftmodal = false;
    }, 100);
  }

  // Credit Note Modal Controls
  openCreditModal() {
    setTimeout(() => {
      this.creditinput.setFocus();
    }, 400);
    this.canDismissCreditModal = false;
    this.processInvoice.remark = '';
    this.showcreditmodal = true;
    this.selectedCreditReason = 'Sales Return';
    this.processInvoice.paidamount = 0;
  }

  closeCreditModal() {
    setTimeout(() => {
      this.showcreditmodal = false;
    }, 100);
    this.selectedCreditReason = '';
    this.creditRef = '';
  }

  // Cancel Modal Controls
  openCancelModal() {
    this.canDismissCancelModal = false;
    this.showcancelmodal = true;
  }

  closecancelmodal() {
    setTimeout(() => {
      this.showcancelmodal = false;
    }, 100);
  }

  // Confirm Modal Controls
  openConfirmModal() {
    this.canDismissConfirmModal = false;
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    setTimeout(() => {
      this.showConfirmModal = false;
    }, 100);
  }

  // Select Bank Logic
  confirm(bank) {    
    this.selectedBank = bank.name;   
    this.closebankModal()
    this.searchBank = '';
  }

  // Cancellation Logic
  showReasonsOnClick = () => {
    this.showReasons = !this.showReasons;
  };

  selectReason(reason: string) {
    this.selectedReason = reason;
    this.showReasons = false;
  }

  // Credit Note Logic
  showCreditReasonsOnClick(){
    this.showCreditReasons = !this.showCreditReasons;
  };

  selectCreditReason(reason: string) {
    this.otherreason = "";
    this.selectedCreditReason = reason;
    this.processInvoice.creditnotereason = reason;
    this.showCreditReasons = false;
    //console.log(this.processInvoice.creditnotereason)
  }

  // Send Nach Link 
  async sendNachlink() {
    this.showLoader('Sending NACH Link...');
    var islive = false; 
    var livemobno = "";
    if (this.distyretailer.pipayretailerid){
      var retid = "" + this.distyretailer.pipayretailerid;
      var pipayretailer = <Retailer> await this.pipaylib.solace.dbLib.getItem('pipay_dev_retailer',{id: retid});
      if(pipayretailer && pipayretailer.nachmandatereference && pipayretailer.nachmandatereference.length > 0){
        islive = true;
        livemobno = pipayretailer.mobileno;
      }
    }

    if(islive){
      await this.pipaylib.invoiceService.sendNachLinkOnWhatsAppLive(this.selectedInvoice, livemobno);
    } else {
      await this.pipaylib.invoiceService.sendNachLinkOnWhatsApp(this.selectedInvoice);
    }

    const toast = await this.toastCtrl.create({
      message: 'NACH Payment Request Sent to retailer!',
      duration: 2500,
      icon: 'checkmark-circle-outline',
      color: 'success',
    });
    setTimeout(() => {
      this.hideLoader();
      toast.present();
      this._router.navigate(['/dashboard']);
    }, 300);
  }

  // Loaders
  showLoader(msg: string) {
    if (!this.isLoading) {this.isLoading = true;} 
    return this.loadingCtrl
      .create({
        message: msg,
        spinner: 'bubbles',
      })
      .then((res) => {
        res.present().then(() => {
          if (!this.isLoading) {
            res.dismiss().then(() => {
            });this.canDismiss = true;
          }
        });
      })
      .catch((e) => {
        this.isLoading = false;
        //console.log(e);
      });
  }

  hideLoader() {
    if (this.isLoading) {this.isLoading = false;}
    return this.loadingCtrl
      .dismiss()
      .then(() => console.log('dismissed'))
      .catch((e) => console.log(e));
  }

  // Get Location
  async getLocation() {
    if (navigator.geolocation) {
       const position = await Geolocation.getCurrentPosition();
       this.lat = position.coords.latitude.toString();
       this.long = position.coords.longitude.toString();
    };    
  }

  getMyLocation() {
    navigator.geolocation.getCurrentPosition( pos => {
			this.long = +pos.coords.longitude;
			this.lat= +pos.coords.latitude;    
    });
  }
}
