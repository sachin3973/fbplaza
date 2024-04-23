import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal, LoadingController, ToastController } from '@ionic/angular';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { PipaylibService } from 'pipaylib';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { Distystaff } from 'pipaylib/domain/distystaff';
import { Invoice } from 'pipaylib/domain/invoice';
import { AppdataService } from 'src/app/services/appdata.service';

@Component({
  selector: 'app-partywiseqrcodepage',
  templateUrl: './partywiseqrcodepage.page.html',
  styleUrls: ['./partywiseqrcodepage.page.scss'],
})
export class PartywiseqrcodepagePage implements OnInit {
  @ViewChild('markpaidmodal') markpaidmodal: IonModal;
  @ViewChild('txnref') txnrefInput;
  isLoading: boolean;
  transactionRef;
  qrvalue: string;
  distributorName: string;
  initialgenerator: string;
  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  processData: {
    paymentDate: string;
    amount: string;
    retailerName: string;
  };
  paymentDate: string;
  amount: string;
  retailerName: string;
  isLiveUpi: boolean;
  long: number;
  lat: number;
  canRefDismiss: boolean;
  showRefModal: boolean;
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
  ) {}

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this.router.navigate(['/']);
    }
  }

  ionViewWillEnter() {
    this.isLiveUpi = this.pipaylib.loginService.loggedindistributor.distyconfig.liveupi;
    this.distributorName = this.pipaylib.loginService.loggedindistributor.businessname;
    this.processData = this.dataService.globalvars.get('partywisepaymentObj');
    this.processPaymentObject = this.dataService.globalvars.get('processPaymentObject');
    console.log(this.processPaymentObject)
    this.paymentDate = this.processData.paymentDate;
    this.amount = this.processData.amount;
    this.retailerName = this.processData.retailerName;
    this.extractInitail();
    this.generateQRValue();
  }

  extractInitail() {
    const fullName = this.distributorName;
    const name = fullName.split(' ');
    const firstName = name[0];
    const lastName = fullName.substring(name[0].length).trim();
    const firstnameChar = firstName.charAt(0);
    const lastnameChar = lastName.charAt(0);
    this.initialgenerator = firstnameChar.toUpperCase() + lastnameChar.toUpperCase();
  };

  generateQRValue() {
    this.showLoader('Loading...');
    setTimeout(() => {
      const qrlink = 'upi://pay?pn=Satish+Goriani&pa=satish.goriani@oksbi&am=1&tr=12345';
      this.qrvalue = qrlink;
    }, 300);
    this.hideLoader();
  }

  upiMarkPaid() {
    // this.getLocation();
    this.getMyLocation();
    this.openRefModal();
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

  async confirmRef() {
    this.canRefDismiss = true;
    this.showRefModal = false;
    this.processCollection();
  }

 async processCollection() {
    this.showLoader('Processing...');
    // console.log('OBJECT IS', this.processPaymentObject);
    const response = await this.pipaylib.invoiceService.processPartywisePayment(
      this.processPaymentObject.selectedRetailer,
      this.processPaymentObject.calculationType,
      this.processPaymentObject.user,
      this.processPaymentObject.selectedPaymentMode,
      this.processPaymentObject.settlementAmount,
      this.processPaymentObject.chequeNo,
      this.processPaymentObject.paymentDate,
      this.processPaymentObject.selectedBank,
      this.processPaymentObject.remarks,
      this.transactionRef,
      this.processPaymentObject.selectedInvoices
    );

    if (response.status === 'success') {
      this.hideLoader();
      this.closeRefModal();
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

  getMyLocation() {
    navigator.geolocation.getCurrentPosition( pos => {
			this.long = +pos.coords.longitude;
			this.lat= +pos.coords.latitude;

    });
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
