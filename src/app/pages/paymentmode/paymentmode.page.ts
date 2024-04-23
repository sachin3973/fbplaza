import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IonModal,
  LoadingController,
  Platform,
  ToastController,
} from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Router } from '@angular/router';
import { AppdataService } from 'src/app/services/appdata.service';
import { processinvoice } from 'src/app/services/appdata.service';
import { PipaylibService } from 'pipaylib';
import { UploadinvoicePage } from 'src/app/pages/uploadinvoice/uploadinvoice.page';
import * as moment from 'moment';
import { Invoice } from 'pipaylib/domain/invoice';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { Geolocation } from '@capacitor/geolocation';
import { Distybank } from 'pipaylib/domain/distybank';
import { Retailer } from 'pipaylib/domain/retailer';
import { Paymentinfo } from 'pipaylib/domain/pymtinfo';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { IonInput } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { Distyconfig } from 'pipaylib/domain/distyconfig';
import { HttpClient } from '@angular/common/http';

interface SelectedItem {
  title: string;
  value: string;
}

@Component({
  selector: 'app-paymentmode',
  templateUrl: './paymentmode.page.html',
  styleUrls: ['./paymentmode.page.scss'],
})
export class PaymentmodePage implements OnInit {
  static paymentModePageInstance: PaymentmodePage;
  @ViewChild('paymentmodal') paymentmodal: IonModal;
  @ViewChild('otpmodal') otpmodal: IonModal;
  @ViewChild('chequemodal') chequemodal: IonModal;
  @ViewChild('cancellationModal') cancellationModal: IonModal;
  @ViewChild('myInput') myInput: IonInput;
  @ViewChild('crbillRemark') crbillRemark: IonInput;
  @ViewChild('creditinput') creditinput: IonInput;
  @ViewChild('creditbillModal') creditbillModal: IonModal;
  @ViewChild(IonModal) modal: any;
  imageurl;
  utrRef;
  paymenttyp;
  showcashbtn = false;
  isImageUpload = false;
  canDismissCancelModal: boolean;
  showcancelmodal: boolean;
  canDismissChequeModal: boolean;
  showchequemodal: boolean;
  showmodal: boolean;
  canDismiss: boolean;
  partailamount: number;
  showchequebtn = false;
  shownachbtn = false;
  showupibtn = false;
  showdeliverbtn = false;
  selectedRadioGroup: any;
  selectedInvoice: Invoice | any;
  invoiceamount: number;
  processInvoice: processinvoice;
  remarks: string;
  txnref = new Date().valueOf().toString(6);
  isLoading = false;
  otpstr1;
  otpstr2;
  otpstr3;
  otpstr4;
  otpstr = '1234';
  counter: {
    sec: number;
  };
  user;
  showotpmodal: boolean;
  candismissotpmodal: boolean;
  candismissqrmodal: boolean;
  otp;
  genotp;
  chqDate: any;
  upiAmountPaid = false;
  cancelreasons: SelectedItem[];
  showReasons = false;
  selectedReason;
  isPaymentModeCheque: string;
  invoiceStatus;
  paidamount;
  resend = false;
  creditallowed = false;
  creditnoteallowed = true;
  dwpallowed = false;
  creditdays = 0;
  isprocessing = false;
  otpfordwp = false;
  failureCharges: number;
  lat;
  long;
  distyretailer: Distyretailer;
  // creditReasons: string[];
  selectedCreditReason: string;
  showCreditReasons = false;
  canDismissCreditModal: boolean;
  showcreditmodal: boolean;
  creditref;
  creditamt;
  otherreason;
  canDismissNeftModal: boolean;
  showneftmodal: boolean;
  canDismissbankModal: boolean;
  showbankmodal: boolean;
  creditRef;
  showOtherCreditReason: boolean;
  totalamount;
  payableamount = 0;
  showBank: boolean;
  bankList: any[];
  selectedBank;
  cnonly;
  distyconfig: Distyconfig;
  strsearch: string;
  hidepayment = false;
  paymentremark: boolean;
  canDismissCreditbillModal: boolean;
  showcreditbillModal: boolean;
  imageforcheque: boolean;
  crnselectedInvoice;
  fromRequisition: boolean;
  cameFromPartywise: boolean;
  creditReasons = [
    'Sales Return',
    'Discount',
    'Previous Excess Payment',
    'Other',
  ];
  enablepipay;

  constructor(
    public loadingCtrl: LoadingController,
    public platform: Platform,
    public toastCtrl: ToastController,
    public pipaylib: PipaylibService,
    private router: Router,
    private http: HttpClient,
    private dataService: AppdataService
  ) {}

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this.router.navigate(['/']);
    };
    this.cameFromPartywise = this.dataService.globalvars.get('cameFromPartywise');
    this.paymenttyp = 'fullpay';
    this.user = this.pipaylib.loginService.loggedinstaff;
    this.processInvoice = {} as processinvoice;
    this.chqDate = moment().format('YYYY-MM-D');
    const defaultperiod =
      this.pipaylib.loginService.loggedindistributor.distyconfig
        .defaultcreditperiod;
    this.chqDate = this.pipaylib.solace.utilService.addDaystoDate(
      this.chqDate,
      defaultperiod ? defaultperiod : 0
    );
  }

  async showErrorToast(errmsg){
    const toast = await this.toastCtrl.create({
      message: errmsg,
      duration: 2500,
      icon: 'close',
      color: 'danger',
    });
    toast.present();
  }
  ionViewDidEnter() {
    this.distyconfig = this.dataService.globalvars.get('distyconfig');
    this.fromRequisition = this.dataService.globalvars.get('fromRequisition');
    // console.log(this.distyconfig)
  }

  // async goToPipayPayment() {
  //   this.showLoader('Processing...');
  //   var retrequest = <any> await this.pipaylib.invoiceService.getCCAvenueIframeURL(this.selectedInvoice);
  //   if(retrequest.status == 'success'){
  //       var body = retrequest.pgrequestbody;
  //   }else{
  //     this.showErrorToast(retrequest.errordescription);
  //     this.hideLoader();
  //     return;
  //   }

  //   console.log('Sending Request ' + JSON.stringify(body));
  //   var pgurl;
  //   var url  ="https://kxhstkytl9.execute-api.ap-south-1.amazonaws.com/prod/createiframelink";
  //     var headers = {'content-type': 'application/json'};
  //     try{

  //     pgurl =  await this.http.post(url,body,{responseType: 'text','headers' : headers}).toPromise();
  //     console.log('URL REturned ' + JSON.stringify(pgurl));


  //     }catch(err){



  //       console.log('ERROR ' + JSON.stringify(err));
  //       this.hideLoader();

  //       return null;
  //     }


  //   this.hideLoader();

  //   var pymturl = 'https://www.pipayments.in/pipayupi.html?url=' + pgurl;
  //   window.open(pymturl);


  //   //this.router.navigate(['/pipaypayment']);
  // }

  async goToPipayPayment() {
    this.dataService.globalvars.set('invoiceforpipayment', this.selectedInvoice);
    this.dataService.globalvars.set('openpg', true);
    this.router.navigate(['/pipaypayment'], { replaceUrl: true });
  }

  goToPartywise() {
    this.router.navigate(['/partywisepaymentoption']);
  }

  checknocollectionwdel() {
    if (
      this.pipaylib.loginService.loggedinstafftype.deliverywpallowed &&
      this.pipaylib.loginService.loggedinstafftype.nocollectionwithdelivery
    ) {
      this.hidepayment = true;
    } else {
      this.hidepayment = false;
    }
  }

  ionViewWillEnter() {
    this.distyconfig = this.dataService.globalvars.get('distyconfig');
    this.imageforcheque = this.distyconfig.imageforcheque;
    this.paymentremark =
      this.distyconfig && this.distyconfig.partialpaymentremark;
    if (Capacitor.isNativePlatform()) {
      StatusBar.setBackgroundColor({ color: '#033584' });
    }
    this.checknocollectionwdel();
    const banklist =
      this.pipaylib.solace.dataService.getMasterFromMap('distybank');
    this.bankList = [];
    for (const bank of banklist) {
      this.bankList.push({ name: bank.name, id: bank.id });
    }

    this.processInvoice.creditnotereason = this.creditReasons[0];
    this.canDismiss = false;
    this.showCreditReasons = false;
    //console.log( this.showCreditReasons);
    this.selectedInvoice = this.dataService.globalvars.get('selectedinvoice') as Invoice;
    //console.log(this.selectedInvoice)

    this.enablepipay = this.pipaylib.invoiceService.isPiPayApplicable(this.selectedInvoice);

    this.distyretailer = this.dataService.globalvars.get('selectedretailer');
    //console.log('>>>>>>>>'+ JSON.stringify(this.distyretailer))
    //console.log('selectedInvoice', this.selectedInvoice);
    if (!this.selectedInvoice.paidamount) {
      this.selectedInvoice.paidamount = 0;
    }
    if (!this.selectedInvoice.failurecharges) {
      this.selectedInvoice.failurecharges = 0;
    }
    this.payableamount =
      this.selectedInvoice.invoiceamount +
      this.selectedInvoice.failurecharges -
      this.selectedInvoice.paidamount;

    this.invoiceamount = this.selectedInvoice.invoiceamount;
    this.totalamount = this.selectedInvoice.totalamt;
    this.invoiceStatus = this.selectedInvoice.invoicestatus;
    this.paidamount = this.selectedInvoice.paidamount;
    this.failureCharges = this.dataService.globalvars.get('failurecharges');
    this.processInvoice.invoiceno = this.selectedInvoice.invoicenumber;
    this.processInvoice.txnid = this.txnref;
    this.processInvoice.retailer = this.selectedInvoice.distyretailername;
    //this.processInvoice.paidon = moment().format('YYYY-MM-DD');
    this.processInvoice.paidon =
      this.pipaylib.solace.utilService.getCurrentBusinessDate();

    this.processInvoice.paidamount = 0;
    // this.partailamount = 0;
    this.setCnOnly();
    this.processInvoice.collectedby =
      this.pipaylib.loginService.loggedinstaff.name;
    //console.log(this.pipaylib.loginService.loggedinstaff.name)
    //console.log('processinv' ,this.processInvoice);

    this.creditnoteallowed = true;
    if (
      this.pipaylib.loginService.loggedindistributor.distyconfig
        .disablecreditnote
    ) {
      this.creditnoteallowed = false;
    }
    this.getBankname();
    this.getRetailerData();
  }

  gotoUploadcheque() {
    this.router.navigate(['/uploadcheque']);
  }

  openBankDropdown() {
    this.showBank = !this.showBank;
  }

  selectBank(bank) {
    this.selectedBank = bank.name;
    this.showBank = false;
  }

  async getBankname() {
    const key = {
      distributorid: '' + this.pipaylib.loginService.loggedindistributor.id,
      id: '' + this.selectedInvoice.distyretailerid,
    };
    const tablename =
      this.pipaylib.solace.utilService.getTableName('distyretailer');
    const distyretailer = await this.pipaylib.solace.dbLib.getItem(tablename, key) as Distyretailer;
    // //console.log("DISTY RETAILER", distyretailer)
    if (distyretailer && distyretailer.chequebankid) {
      const retbank = this.pipaylib.dataService.getEntityForId(distyretailer.chequebankid, 'distybank') as Distybank;
      if (retbank) {
        this.selectedBank = retbank.name;
      }
    } else {
      //console.log("OTHER")
    }
  }

  selectCash() {
    this.showcashbtn = true;
    this.showchequebtn = false;
    this.shownachbtn = false;
    this.showupibtn = false;
    this.showdeliverbtn = false;
    this.processInvoice.paymentmode = 'Cash';
  }

  selectCheque() {
    this.showchequebtn = true;
    this.showcashbtn = false;
    this.shownachbtn = false;
    this.showupibtn = false;
    this.showdeliverbtn = false;
    this.processInvoice.paymentmode = 'Cheque';
  }

  selectNach() {
    this.shownachbtn = true;
    this.showcashbtn = false;
    this.showchequebtn = false;
    this.showupibtn = false;
    this.showdeliverbtn = false;
  }

  selectUpi() {
    this.showupibtn = true;
    this.showcashbtn = false;
    this.shownachbtn = false;
    this.showchequebtn = false;
    this.showdeliverbtn = false;
    this.processInvoice.paymentmode = 'UPI';
  }

  selectNeft() {
    this.showupibtn = true;
    this.showcashbtn = false;
    this.shownachbtn = false;
    this.showchequebtn = false;
    this.showdeliverbtn = false;
    this.processInvoice.paymentmode = 'NEFT';
  }

  selectCredit() {
    this.showupibtn = true;
    this.showcashbtn = false;
    this.shownachbtn = false;
    this.showchequebtn = false;
    this.showdeliverbtn = false;
    this.processInvoice.paymentmode = 'Credit Note';
  }

  selectDeliver() {
    this.showdeliverbtn = true;
    this.showcashbtn = false;
    this.shownachbtn = false;
    this.showchequebtn = false;
    this.showupibtn = false;
    this.processInvoice.paymentmode = 'Delivery Without Payment';
    this.processInvoice.retailermobileno =
      this.selectedInvoice.retailermobileno;
  }

  async getRetailerData() {
    if (this.distyretailer) {
      if (
        this.distyretailer.creditallowed &&
        this.distyretailer.creditallowed.toUpperCase().indexOf('Y') >= 0
      ) {
        this.creditallowed = true;
        this.creditdays = this.distyretailer.creditperiod;
      } else {
        this.creditdays = 0;
      }
      if (
        this.distyretailer.dwpallowed &&
        this.distyretailer.dwpallowed.toUpperCase().indexOf('Y') >= 0
      ) {
        this.dwpallowed = true;

        if (
          this.distyretailer.otpfordwp &&
          this.distyretailer.otpfordwp.toUpperCase().indexOf('Y') >= 0
        ) {
          this.otpfordwp = true;
        } else {
          this.otpfordwp = false;
        }
      } else {
        this.dwpallowed = false;
      }
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Error getting data, please try again!',
        duration: 2500,
        icon: 'close',
        color: 'danger',
      });
      toast.present();
      this.router.navigate(['/dashboard']);
    }
  }

  setCnOnly() {
    this.cnonly = false;
    if (this.selectedInvoice.pymtinfolist) {
      for (const pymtinfo of this.selectedInvoice.pymtinfolist) {
        if (pymtinfo.paymentmode !== 'Credit Note') {
          this.cnonly = false;
          return;
        }
      }
    }

    this.cnonly = true;
  }

  inncreaseChequeDate() {
    const curdate = this.chqDate;
    this.chqDate = this.pipaylib.solace.utilService.addDaystoDate(curdate, +1);
  }

  decreaseChequeDate() {
    const curdate = this.chqDate;
    this.chqDate = this.pipaylib.solace.utilService.addDaystoDate(curdate, -1);
  }

  showReasonsOnClick = () => {
    this.showReasons = !this.showReasons;
  };

  selectReason(reason: string) {
    this.selectedReason = reason;
    this.showReasons = false;
  }

  otherCreditReasonBlur(val) {
    this.selectedCreditReason = val;
  }

  showCreditReasonsOnClick() {
    this.showCreditReasons = !this.showCreditReasons;
    //console.log(this.showCreditReasons);
  }

  selectCreditReason(reason: string) {
    this.otherreason = '';
    this.selectedCreditReason = reason;
    this.processInvoice.creditnotereason = reason;
    this.showCreditReasons = false;
    //console.log(this.processInvoice.creditnotereason)
  }

  openModal(isFromCheque?: string) {
    // this.ionInput.setFocus();
    this.paymenttyp = 'fullpay';
    this.remarks = '';
    //console.log(this.paymenttyp)
    // this.getLocation();
    this.getMyLocation();
    this.canDismiss = false;
    this.showmodal = true;
    // this.partailamount = 0;
    this.isPaymentModeCheque = isFromCheque;
  }

  selectpartail(ev) {
    if (this.paymenttyp === 'partialpay') {
      // setTimeout(() => {
      //   this.myInput.setFocus();
      // },100);
    }
    //console.log(this.paymenttyp)
  }
  openNeftModal() {
    //console.log(this.paymenttyp)
    this.canDismissNeftModal = false;
    this.showneftmodal = true;
  }

  openbankModal() {
    this.canDismissbankModal = false;
    this.showbankmodal = true;
  }

  closeNeftModal() {
    setTimeout(() => {
      this.showneftmodal = false;
    }, 100);
  }

  closebankModal() {
    setTimeout(() => {
      this.showbankmodal = false;
    }, 100);
  }

  openCreditModal() {
    setTimeout(() => {
      this.creditinput.setFocus();
    }, 400);
    this.canDismissCreditModal = false;
    this.processInvoice.remark = '';
    this.showcreditmodal = true;
    this.selectedCreditReason = 'Sales Return';
    if (this.selectedInvoice.invoicestatus === 'Partially paid') {
      this.processInvoice.paidamount =
        this.selectedInvoice.invoiceamount - this.selectedInvoice.paidamount;
    } else {
      this.processInvoice.paidamount = 0;
    }
  }

  closeCreditModal() {
    setTimeout(() => {
      this.showcreditmodal = false;
    }, 100);
    this.selectedCreditReason = '';
    this.creditRef = '';
  }

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

  closemodal() {
    // this.partailamount = 0;
    setTimeout(() => {
      this.showmodal = false;
    }, 100);
  }

  openQrModal() {
    if (
      this.selectedInvoice.invoicestatus === 'Delivered' ||
      this.selectedInvoice.invoicestatus === 'New'
    ) {
      if (this.paymenttyp === 'fullpay') {
        if (!this.selectedInvoice.paidamount) {
          this.selectedInvoice.paidamount = 0;
        }
        if (!this.selectedInvoice.failurecharges) {
          this.selectedInvoice.failurecharges = 0;
        }
        this.processInvoice.paidamount =
          this.selectedInvoice.invoiceamount +
          this.selectedInvoice.failurecharges -
          this.selectedInvoice.paidamount;
      } else {
        this.processInvoice.paidamount = this.partailamount;
      }
    } else if (
      this.selectedInvoice.invoicestatus === 'Partially paid' &&
      this.selectedInvoice.failurecharges >= 0
    ) {
      if (this.paymenttyp === 'fullpay') {
        this.processInvoice.paidamount =
          this.selectedInvoice.invoiceamount +
          this.selectedInvoice.failurecharges -
          this.selectedInvoice.paidamount;
        //console.log('IF PARTIALLY PAID',this.processInvoice.paidamount);
      } else {
        this.processInvoice.paidamount = this.partailamount;
      }
    } else if (
      this.selectedInvoice.invoicestatus === 'Payment failed' &&
      !this.selectedInvoice.paidamount
    ) {
      if (this.paymenttyp === 'fullpay') {
        this.processInvoice.paidamount =
          this.selectedInvoice.invoiceamount +
          this.selectedInvoice.failurecharges;
      } else {
        this.processInvoice.paidamount = this.partailamount;
      }
    } else if (
      this.selectedInvoice.invoicestatus === 'Payment failed' &&
      this.selectedInvoice.paidamount
    ) {
      if (this.paymenttyp === 'fullpay') {
        this.processInvoice.paidamount =
          this.selectedInvoice.invoiceamount +
          this.selectedInvoice.failurecharges -
          this.selectedInvoice.paidamount;
        //console.log('IF PARTIALLY PAID',this.processInvoice.paidamount);
      } else {
        this.processInvoice.paidamount = this.partailamount;
      }
    }
    this.dataService.globalvars.set('processedInvoice', this.processInvoice);
    //console.log('qrinv data' + JSON.stringify(this.processInvoice));
    this.router.navigate(['/qrcodepage'], { replaceUrl: true });
  }

  confirmPayment() {
    this.showLoader('Processing...');
    if (
      this.selectedInvoice.invoicestatus === 'Delivered' ||
      this.selectedInvoice.invoicestatus === 'New'
    ) {
      if (this.paymenttyp === 'fullpay') {
        if (!this.selectedInvoice.paidamount) {
          this.selectedInvoice.paidamount = 0;
        }
        if (!this.selectedInvoice.failurecharges) {
          this.selectedInvoice.failurecharges = 0;
        }
        this.processInvoice.paidamount =
          this.selectedInvoice.invoiceamount +
          this.selectedInvoice.failurecharges -
          this.selectedInvoice.paidamount;
      } else {
        this.processInvoice.paidamount = this.partailamount;
        //console.log(this.processInvoice.paidamount)
      }
    } else if (
      this.selectedInvoice.invoicestatus === 'Partially paid' &&
      this.selectedInvoice.failurecharges >= 0
    ) {
      if (this.paymenttyp === 'fullpay') {
        // this.selectedInvoice.paidamount = this.payableamount;
        this.processInvoice.paidamount =
          this.selectedInvoice.invoiceamount +
          this.selectedInvoice.failurecharges -
          this.selectedInvoice.paidamount;
        //console.log('IF PARTIALLY PAID',this.processInvoice.paidamount);
      } else {
        this.processInvoice.paidamount = this.partailamount;
      }
    } else if (
      this.selectedInvoice.invoicestatus === 'Payment failed' &&
      !this.selectedInvoice.paidamount
    ) {
      if (this.paymenttyp === 'fullpay') {
        this.processInvoice.paidamount =
          this.selectedInvoice.invoiceamount +
          this.selectedInvoice.failurecharges;
      } else {
        this.processInvoice.paidamount = this.partailamount;
      }
    } else if (
      this.selectedInvoice.invoicestatus === 'Payment failed' &&
      this.selectedInvoice.paidamount
    ) {
      if (this.paymenttyp === 'fullpay') {
        this.processInvoice.paidamount =
          this.selectedInvoice.invoiceamount +
          this.selectedInvoice.failurecharges -
          this.selectedInvoice.paidamount;
        //console.log('IF PARTIALLY PAID',this.processInvoice.paidamount);
      } else {
        this.processInvoice.paidamount = this.partailamount;
      }
    }
    //console.log('processedInvoice++++', this.processInvoice)
    this.dataService.globalvars.set('processedInvoice', this.processInvoice);
    //console.log('processedInvoice', this.processInvoice)
    // this.router.navigate(['/qrcodepage']);
    if (this.processInvoice.paymentmode === 'Cheque') {
      this.processInvoice.chqdate = this.chqDate;
      this.processInvoice.credit = this.creditdays;
    }
    this.processInvoice.retailer = this.selectedInvoice.distyretailername;
    if (this.imageforcheque && this.processInvoice.paymentmode === 'Cheque') {
      // console.log(this.processInvoice)
      this.goToUploadCheque();
    } else {
      this.processCollection();
    }
  }

  validatecheque() {
    if (this.processInvoice.paidamount > this.selectedInvoice.invoiceamount) {
      this.dataService.displayToast(
        `Paid amount cannot be more than invoice amount`,
        'WARNING',
        'top'
      );
      return false;
    }

    if (
      !this.processInvoice.instrumentref ||
      this.processInvoice.instrumentref.length !== 6
    ) {
      this.dataService.displayToast(
        `Please enter valid 6 digit cheque number of Invoice #${this.processInvoice.invoiceno}`,
        'WARNING',
        'top'
      );
      return false;
    }
    const strdate = formatDate(
      this.processInvoice.chqdate,
      'yyyy-MM-dd',
      'en-US'
    );
    if (!strdate || !this.pipaylib.solace.utilService.isValidDate(strdate)) {
      this.dataService.displayToast(
        `Please enter valid cheque date of Invoice #${this.processInvoice.invoiceno}`,
        'WARNING',
        'top'
      );
      return false;
    }
    const pymtperiod = this.getPaymentPeriod(
      this.selectedInvoice.invoicedate,
      strdate
    );
    if (pymtperiod < 0) {
      this.dataService.displayToast(
        `Cheque date can not be before invoice date of Invoice #${this.processInvoice.invoiceno}`,
        'WARNING',
        'top'
      );
      return false;
    }
    return true;
  }
  getPaymentPeriod(invoicedate: string, paymentdate: string) {
    const invdate = new Date(invoicedate);
    const pymtdate = new Date(paymentdate);

    const timediff = pymtdate.getTime() - invdate.getTime();
    return timediff / (1000 * 3600 * 24);
  }
  processCreditBillinvoice() {
    this.processInvoice.remark = '';
    if (this.distyconfig.crbillremarks) {
      this.openCreditBillModal();
    } else {
      this.uploadInvoice();
    }
  }

  openCreditBillModal() {
    this.canDismissCreditbillModal = false;
    this.showcreditbillModal = true;
    setTimeout(() => {
      this.crbillRemark.setFocus();
    }, 200);
  }

  closeCreditBillModal() {
    setTimeout(() => {
      this.showcreditbillModal = false;
    }, 100);
  }

  uploadInvoice() {
    this.dataService.globalvars.set('processedInvoice', this.processInvoice);
    this.router.navigate(['uploadinvoice']);
  }

  async processCollection() {
    let bankname = '';
    if (
      this.processInvoice.paymentmode === 'Cheque' &&
      this.distyretailer.chequebankid
    ) {
      const retbank = this.pipaylib.dataService.getEntityForId(
        this.distyretailer.chequebankid,
        'distybank'
      ) as Distybank;
      if (retbank) {
        bankname = retbank.name;
      }
    }
    // console.log(this.remarks)
    const ret = await this.pipaylib.staffService.processStaffCollection(
      this.selectedInvoice,
      this.processInvoice.paymentmode,
      this.imageurl,
      this.processInvoice.paidamount
        ? this.processInvoice.paidamount
        : this.creditamt,
      this.processInvoice.instrumentref,
      this.processInvoice.chqdate
        ? this.processInvoice.chqdate
        : this.processInvoice.paidon,
      this.selectedBank ? this.selectedBank : '',
      this.remarks,
      this.utrRef ? this.utrRef : this.txnref,
      this.creditdays,
      this.lat,
      this.long
    );
    this.dataService.globalvars.set('processedInvoice', this.processInvoice);
    //console.log('paymentmodeprocessinv' + this.processInvoice)
    if (ret.status === 'success') {
      this.hideLoader();

      const toast = await this.toastCtrl.create({
        message: 'Payment Successful!',
        duration: 2500,
        icon: 'checkmark-circle-outline',
        color: 'success',
        position: 'top',
      });
      toast.present();

      if (
        this.distyretailer &&
        this.distyretailer.mobileno &&
        this.distyretailer.mobileno.length === 10 &&
        !isNaN(parseInt(this.distyretailer.mobileno, 10))
      ) {
        this.pipaylib.paymentService.sendNotificationOnWhatsApp(
          this.selectedInvoice,
          this.distyretailer.mobileno,
          this.processInvoice.paidamount,
          this.processInvoice.paymentmode,
          this.pipaylib.loginService.loggedinstaff.name
        );
      }
      this.router.navigate(['/paymentreceipt'], { replaceUrl: true });
    } else {
      this.hideLoader();
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

  inputBlur(val) {
    this.partailamount = val;
    //console.log(this.partailamount)
  }

  inputPartialBlur(val) {
    this.processInvoice.remark = val;
  }

  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image) {
        this.processInvoice.txnid = new Date().valueOf().toString(6);
        this.resizeAndPostImage(image);
      }
    } catch (error) {
      //console.log('Error/Cancellation in taking picture:  ' + error);
    }
  }

  async updloadImageToS3(dataURL: string) {
    const base64Response = await fetch(dataURL);
    const blob = await base64Response.blob();
    const imageName = 'name.png';
    const imageFile = new File([blob], imageName, { type: 'image/png' });

    const strfile = new Date().getTime() + '.png';

    //console.log('--> Uploading file .. ' + strfile);
    const ret = await this.pipaylib.solace.utilService.uploadFiletoS3(
      imageFile,
      strfile,
      'foodkartiposimages'
    );
    if (ret) {
      this.isImageUpload = true;
      const strurl =
        'https://s3.ap-south-1.amazonaws.com/foodkartiposimages/' + strfile;
      this.imageurl = strurl;
    }
  }

  async resizeAndPostImage(imageFile: any) {
    const img = new Image();
    img.src = imageFile.dataUrl;
    PaymentmodePage.paymentModePageInstance = this;

    img.onload = (_event) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxW = 300;
      const maxH = 300;
      const iw = img.width;
      const ih = img.height;
      const scale = Math.min(maxW / iw, maxH / ih);
      const iwScaled = iw * scale;
      const ihScaled = ih * scale;
      canvas.width = iwScaled;
      canvas.height = ihScaled;
      ctx.drawImage(img, 0, 0, iwScaled, ihScaled);
      const newdataURI = canvas.toDataURL('image/png');
      UploadinvoicePage.invoicePageInstance.updloadImageToS3(newdataURI);
    };
  }

  openOtpModal = () => {
    this.startTimer();
    this.clearOTP();
    this.candismissotpmodal = false;
    this.showotpmodal = true;
    this.genotp = '1234';
  };

  closeOtpModal() {
    setTimeout(() => {
      this.showotpmodal = false;
    }, 100);
  }

  maskify(mb) {
    return mb.replace(/.(?=.{2})/g, 'X');
  }

  startTimer() {
    this.counter = { sec: 30 };
    const intervalId = setInterval(() => {
      if (this.counter.sec - 1 === -1) {
        clearInterval(intervalId);
        this.resend = true;
      } else {
        this.counter.sec -= 1;
      }
    }, 1000);
  }

  clearOTP() {
    this.otpstr1 = '';
    this.otpstr2 = '';
    this.otpstr3 = '';
    this.otpstr4 = '';
  }

  buildOTP() {
    return this.otpstr1 + this.otpstr2 + this.otpstr3 + this.otpstr4;
  }

  getotp(event, next) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(
      event.which ? event.which : event.charCode
    );
    if (!pattern.test(inputChar)) {
      event.preventDefault();
      return;
    }
    if (next == null) {
      this.otpstr4 = '' + inputChar;
      this.otpstr = this.buildOTP();
    } else {
      next.setFocus();
    }
  }

  async verifyOtp() {
    this.showLoader('Verifying...');
    if (this.otpstr === this.genotp) {
      this.clearOTP();
      this.hideLoader();
      this.candismissotpmodal = true;
      this.showotpmodal = false;
      const ret = await this.pipaylib.invoiceService.processStaffDelivery(
        this.selectedInvoice,
        this.imageurl,
        'retailer'
      );
      if (ret.status === 'success') {
        this.dataService.globalvars.set('paidInvoice', this.processInvoice);
        this.router.navigate(['/paymentreceipt'], { replaceUrl: true });
      } else {
        const toast = await this.toastCtrl.create({
          message: ret.errordescription,
          duration: 2500,
          icon: 'close',
          color: 'danger',
        });
        toast.present();
        this.closeOtpModal();
      }
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Invalid OTP!',
        duration: 2500,
        icon: 'close',
        color: 'danger',
      });
      toast.present();
      this.clearOTP();
      this.hideLoader();
    }
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
    //   this.platform.backButton.subscribeWithPriority(5, () => {
    //     document.addEventListener('backbutton', () => {}, false);
    // });
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
            res.dismiss().then(() => {
              // this.platform.backButton.observers.pop();
            });
            this.canDismiss = true;
            this.showmodal = false;
          }
        });
      })
      .catch((e) => {
        this.isLoading = false;
        //console.log(e);
      });
  }

  closecancelmodal() {
    setTimeout(() => {
      this.showcancelmodal = false;
    }, 100);
  }

  openCancelModal() {
    this.canDismissCancelModal = false;
    this.showcancelmodal = true;
  }

  async onSendCancellationRequest() {
    const ret = await this.pipaylib.staffService.cancelInvoice(
      this.selectedInvoice,
      this.selectedReason
    );
    if (ret.status === 'success') {
      const toast = await this.toastCtrl.create({
        message: 'Invoice Cancelled!',
        duration: 2500,
        icon: 'checkmark-circle-outline',
        color: 'success',
        position: 'bottom',
      });
      toast.present();
      this.router.navigate(['/invoices']);
    } else {
      const toast = await this.toastCtrl.create({
        message: ret.errordescription,
        duration: 2500,
        icon: 'close',
        color: 'danger',
      });
      toast.present();
      this.closecancelmodal();
    }
  }

  async onSendCreditRequest() {
    this.processInvoice.txnid = this.txnref;
    if (this.otherreason) {
      this.processInvoice.creditnotereason = this.otherreason;
    }
    if (this.processInvoice.paidamount < 1) {
      this.dataService.displayToast('Credit Amount Cannot be 0,', 'WARNING');
      return;
    }
    // this.router.navigate(['/invoices']);
    if (this.distyconfig.skipuploadoncn) {
      this.dataService.globalvars.set('processedInvoice', this.processInvoice);
      this.creditnoteProcessCollection();
    } else {
      this.dataService.globalvars.set('processedInvoice', this.processInvoice);
      this.router.navigate(['/uploadinvoice']);
    }
  }

  goToUploadCheque() {
    this.processInvoice.bankname = this.selectedBank;
    this.dataService.globalvars.set('processedInvoice', this.processInvoice);
    setTimeout(() => {
      this.hideLoader();
      if (this.validatecheque()) {
        this.router.navigate(['/uploadcheque']);
      }
    }, 300);
  }

  async creditnoteProcessCollection() {
    this.showLoader('Processing Invoice...');
    this.crnselectedInvoice =
      this.dataService.globalvars.get('selectedinvoice');
    this.imageurl = '';
    const ret = await this.pipaylib.invoiceService.processStaffCollectionLambda(
      this.crnselectedInvoice,
      this.pipaylib.loginService.loggedinstaff,
      this.processInvoice.paymentmode,
      this.imageurl,
      this.processInvoice.paidamount,
      this.processInvoice.instrumentref,
      this.processInvoice.paidon,
      this.processInvoice.bankname,
      this.processInvoice.remark,
      this.processInvoice.creditnotereason,
      0
    );
    if (ret.status === 'success') {
      this.hideLoader();
      const toast = await this.toastCtrl.create({
        message: 'Delivery Successful!',
        duration: 2500,
        icon: 'checkmark-circle-outline',
        color: 'success',
        position: 'top',
      });
      toast.present();
      this.router.navigate(['/paymentreceipt'], { replaceUrl: true });
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

  async sendNachlink() {
    this.showLoader('Sending NACH Link...');
    let islive = false;
    let livemobno = '';
    if (this.distyretailer.pipayretailerid) {
      const retid = '' + this.distyretailer.pipayretailerid;
      const pipayretailer = await this.pipaylib.solace.dbLib.getItem(
        'pipay_dev_retailer',
        {
          id: retid,
        }
      ) as Retailer;
      if (
        pipayretailer &&
        pipayretailer.nachmandatereference &&
        pipayretailer.nachmandatereference.length > 0
      ) {
        islive = true;
        livemobno = pipayretailer.mobileno;
      }
    }

    if (islive) {
      // console.log('Sending on live no ' + livemobno);
      await this.pipaylib.invoiceService.sendNachLinkOnWhatsAppLive(
        this.selectedInvoice,
        livemobno
      );
    } else {
      await this.pipaylib.invoiceService.sendNachLinkOnWhatsApp(
        this.selectedInvoice
      );
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
      this.router.navigate(['/dashboard']);
    }, 300);
  }

  async getLocation() {
    if (navigator.geolocation) {
      const position = await Geolocation.getCurrentPosition();
      this.lat = position.coords.latitude.toString();
      this.long = position.coords.longitude.toString();
    }
    //console.log('* Device Current latitude: ' + this.lat);
    //console.log('* Device Current longitude: ' + this.long);
  }

  getMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      this.long = +pos.coords.longitude;
      this.lat = +pos.coords.latitude;
    });
  }

  confirm(bank) {
    this.selectedBank = bank.name;
    this.closebankModal();
    this.strsearch = '';
  }
}
