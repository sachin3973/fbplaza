import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonModal, LoadingController, ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { PipaylibService } from 'pipaylib';
import { Distyconfig } from 'pipaylib/domain/distyconfig';
import { AppdataService } from 'src/app/services/appdata.service';
import { Distystaff } from 'pipaylib/domain/distystaff';
import { Router } from '@angular/router';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { Invoice } from 'pipaylib/domain/invoice';

@Component({
  selector: 'app-partywisepaymentmodes',
  templateUrl: './partywisepaymentmodes.component.html',
  styleUrls: ['./partywisepaymentmodes.component.scss'],
})
export class PartywisepaymentmodesComponent implements OnInit {
  @ViewChild(IonModal) modal: any;
  @Input() openModal: boolean;
  @Input() settlementAmount: number;
  @Input() retailerName: string;
  @Input() selectedRetailer: Distyretailer;
  @Input() selectedInvoices: Invoice[];
  @Input() calculationType: string;
  @Output()closePaymentModeModalEmiter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('txnref') txnrefInput;
  @Input() distyconfig: Distyconfig;
  canDismissbankModal: boolean;
  showbankmodal: boolean;
  strsearch: string;
  selectedBank: string;
  bankList: any[];
  chequeNo: string;
  chqDate;
  selectedPaymentMode: string;
  showCashConfirmationModal: boolean;
  canDismissConfirmationModal: boolean;
  utrRef: string;
  showUpiModal: boolean;
  canDismissUpiModal: boolean;
  paymentDate: string;
  user: Distystaff;
  showRefModal: boolean;
  canRefDismiss;
  isLoading: boolean;
  remarks: string;
  processPaymentObject: {
    selectedRetailer: Distyretailer;
    calculationType: string;
    user: Distystaff;
    selectedPaymentMode: string;
    settlementAmount: number;
    chequeNo: string;
    paymentDate: string;
    selectedBank: string;
    remarks: string;
    utrRef: string;
    selectedInvoices: Invoice[] | null;
  };

  constructor(
    private dataService: AppdataService,
    private pipaylib: PipaylibService,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.setPaymentModeData();
  }

  setInitalValues() {
    this.chequeNo = '';
    this.utrRef = '';
    this.selectedBank = '';
  }

  async processPartywisePayment() {
    this.showLoader('Processing...');
    //console.log(' STAFF ' + JSON.stringify(this.user) + ' CALC TYPE ' + this.calculationType);
    const response = await this.pipaylib.invoiceService.processPartywisePayment(
      this.selectedRetailer,
      this.calculationType,
      this.user,
      this.selectedPaymentMode,
      this.settlementAmount,
      this.chequeNo ? this.chequeNo : '',
      this.selectedPaymentMode === 'Cheque' ? this.chqDate : this.paymentDate,
      this.selectedBank ? this.selectedBank : '',
      this.remarks ? this.remarks : '',
      this.utrRef ? this.utrRef : '',
      this.selectedInvoices
    );

    //console.log('|PARTYPAYMENTRET|' + JSON.stringify(response));
    if (response.status === 'success') {
      this.hideLoader();
      this.closePaymentModeDialog();
      setTimeout(() => {
        this.dataService.displayToast('Successfully Settled', 'SUCCESS', 'top');
        this.router.navigate(['/partwisecompletionpage']);
      },200);
    } else {
      this.hideLoader();
      // console.log(response);
      this.dataService.displayToast(response.errordescription, 'FAIL', 'top');
    }
  }

  setPaymentModeData() {
    this.paymentDate = moment().format('YYYY-MM-D');
    const banklist = this.pipaylib.solace.dataService.getMasterFromMap('distybank');
    this.bankList = [];
    for(const bank of banklist){
      this.bankList.push({name: bank.name , id : bank.id});
    }
    this.chqDate = moment().format('YYYY-MM-D');
    const defaultperiod = this.pipaylib.loginService.loggedindistributor.distyconfig.defaultcreditperiod;
    this.chqDate = this.pipaylib.solace.utilService.addDaystoDate(this.chqDate, defaultperiod ? defaultperiod : 0);
  }

  async confirmRef() {
    this.canRefDismiss = true;
    this.showRefModal = false;
    this.closeRefModal();
    this.confirmPayment();
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

  onSelectPaymentMode(paymentMode: string) {
    this.user = this.pipaylib.loginService.loggedinstaff;
    this.setPaymentModeData();
    this.selectedPaymentMode = paymentMode;
    if (this.selectedPaymentMode !== 'Cheque') {
      this.selectedBank = '';
      this.chequeNo = '';
    }
    this.processPaymentObject = {
      selectedRetailer: this.selectedRetailer,
      calculationType: this.calculationType,
      user: this.user,
      selectedPaymentMode: this.selectedPaymentMode,
      settlementAmount: this.settlementAmount,
      chequeNo: this.chequeNo ? this.chequeNo : '',
      paymentDate: this.selectedPaymentMode === 'Cheque' ? this.chqDate : this.paymentDate,
      selectedBank: this.selectedBank ? this.selectedBank : '',
      remarks: this.remarks ? this.remarks : '',
      utrRef: this.utrRef ? this.utrRef : '',
      selectedInvoices: this.selectedInvoices
    };
  }

  closePaymentModeDialog() {
    this.openModal = false;
    this.closePaymentModeModalEmiter.emit(this.openModal);
    // console.log('closePaymentModeDialog');
    this.selectedPaymentMode = '';
  }

  proceedToPay() {
    if(this.selectedPaymentMode === 'Cash') {
      this.showCashConfirmationModal = true;
      this.dataService.globalvars.set('partywisepaymentObj', {
        amount: this.settlementAmount,
        paymentDate: this.paymentDate,
        retailerName: this.retailerName,
        paymentmode: 'Cash'
      });
    } else if (this.selectedPaymentMode === 'UPI') {
      this.openUPIModal();
    } else {
      this.confirmPayment();
    }
  }

  openbankModal() {
    this.canDismissbankModal = false;
    this.showbankmodal = true;
  }

  confirm(bank) {
    this.selectedBank = bank.name;
    this.closebankModal();
    this.strsearch = '';
  }

  closebankModal() {
    setTimeout(() => {
      this.showbankmodal = false;
    }, 100);
  }

  inncreaseChequeDate() {
    const curdate = this.chqDate;
    this.chqDate = this.pipaylib.solace.utilService.addDaystoDate(curdate,+1);
  }

  decreaseChequeDate() {
    const curdate = this.chqDate;
    this.chqDate = this.pipaylib.solace.utilService.addDaystoDate(curdate,-1);
  }

  closeConfrimationModal() {
    this.showCashConfirmationModal = false;
  }

  confirmPayment() {
    this.dataService.globalvars.set('partywisepaymentObj', {
      distyretailer: this.selectedRetailer,
      calculationType: this.calculationType,
      amount: this.settlementAmount,
      paymentDate: this.paymentDate,
      retailerName: this.retailerName,
      paymentmode: this.selectedPaymentMode,
      chequeNo: this.chequeNo,
      chequeDate: this.chqDate
    });
    this.processPartywisePayment();
  }

  openUPIModal() {
    this.dataService.globalvars.set('partywisepaymentObj', {
      amount: this.settlementAmount,
      paymentDate: this.paymentDate,
      retailerName: this.retailerName,
      paymentmode: 'UPI'
    });
    this.processPaymentObject.remarks = this.remarks  
    this.dataService.globalvars.set('processPaymentObject', this.processPaymentObject);
    this.closePaymentModeDialog();
    setTimeout(() => {
      this.router.navigate(['/partywiseqrcodepage']);
    }, 300);
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
            });
          }
        });
      })
      .catch((e) => {
        this.isLoading = false;
      });
  }
}
