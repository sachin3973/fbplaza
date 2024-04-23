import { Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import * as moment from 'moment';
import { PipaylibService } from 'pipaylib';
import { Cart } from 'pipaylib/domain/cart';
import { Distyconfig } from 'pipaylib/domain/distyconfig';
import { Payment } from 'pipaylib/domain/payment';
import { AppdataService } from 'src/app/services/appdata.service';
import {
  NgxQrcodeElementTypes,
  NgxQrcodeErrorCorrectionLevels,
} from '@techiediaries/ngx-qrcode';
import { Distystaff } from 'pipaylib/domain/distystaff';
import { LoadingController, ToastController } from '@ionic/angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import EscPosEncoder from 'esc-pos-encoder';
import { Order } from 'pipaylib/domain/order';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-confirmrequisitionmodal',
  templateUrl: './confirmrequisitionmodal.component.html',
  styleUrls: ['./confirmrequisitionmodal.component.scss'],
})
export class ConfirmrequisitionmodalComponent implements OnInit{
  @Input() visible: boolean;
  @Input()coords: any;
  @Input() cartSummary: Cart;
  @Input() outOfStockProducts: any;
  @Input()distyconfig: Distyconfig;
  @Input()frequentOrderProduct: any;
  @Output()placeOrderEmitter: EventEmitter<{
    modalVisibilty: boolean;
    confirmed?: boolean;
    isPaid?: boolean;
  }> = new EventEmitter<{
    modalVisibilty: boolean;
    confirmed?: boolean;
    isPaid?: boolean;
  }>();
  paymentObject: Payment;
  showPaymentModes: boolean;
  isConfirmed: boolean;
  paymentModes: string[] = ['Cash', 'NEFT', 'Cheque', 'UPI', 'No Payment'];
  selectedPaymentMode: string;
  placeOrderButtonDisabled: boolean;
  strsearch: string;
  showbankmodal: boolean;
  bankList: {
    name: string;
    id: string;
  }[];
  selectedBank: {
    name: string;
    id: string;
  };
  // distyconfig: Distyconfig;
  chqDate: any;
  chqNo: string;
  qrcodeimagesrc;
  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  qrvalue;
  user: Distystaff;
  isLiveUpi: boolean;
  lat;
  long;
  addBankName;
  isLoading: boolean;
  addgeotag;
  showRefModal: boolean;
  upiRef: string;
  isMultiVoucher: boolean;
  vchtypes: string[];
  selectedVchtype: string;
  showVchTypes: boolean;
  orderType = '';
  nameColumns: any= [];
  macAddress;
  deliveryDate;

  constructor(
    public pipaylib: PipaylibService,
    private dataService: AppdataService,
    public toastController: ToastController,
    public loadingCtrl: LoadingController,
    private bluetoothSerial: BluetoothSerial
  ) { }

  showVchTypesOnClick = () => {
    this.showVchTypes = !this.showVchTypes;
  };

  ngOnInit() {
    const staffvchs = this.pipaylib.loginService.loggedinstaff.vtypename;
    if(staffvchs && staffvchs.indexOf(',') > 0){
      this.vchtypes = staffvchs.split(',');
      this.isMultiVoucher = true;
    }else{
      this.isMultiVoucher = false;
    }
    this.placeOrderButtonDisabled = false;
    this.distyconfig = this.dataService.globalvars.get('distyconfig');
    this.paymentObject = {} as Payment;
    this.chqNo = '';
    this.isConfirmed = false;
    this.fetchQrCode();
    this.deliveryDate = this.pipaylib.solace.utilService.getCurrentBusinessDate();
  }

  setChqDate() {
    this.chqDate = moment().format('YYYY-MM-D');
    const defaultperiod =
      this.pipaylib.loginService.loggedindistributor.distyconfig
        .defaultcreditperiod;
    this.chqDate = this.pipaylib.solace.utilService.addDaystoDate(
      this.chqDate,
      defaultperiod ? defaultperiod : 0
    );
    console.log(this.chqDate);
  }

  extractProductNames(products) {
    const productNames = products.map(product => product.productName);
    return productNames.join(', ');
}

  getBankList() {
    const banklist = this.pipaylib.solace.dataService.getMasterFromMap('distybank');
    this.bankList = [];
   for (const bank of banklist) { this.bankList.push({ name: bank.name, id: bank.id });}
  }

  selectVchType(vchtype: string) {
    this.pipaylib.orderService.curOrder.vchtype = vchtype;
    this.showVchTypes = false;
  }

  fetchQrCode() {
    const pn =
    this.pipaylib.loginService.loggedindistributor.businessname.replace(
      / /g,
      '+'
    );
    const pa = this.pipaylib.loginService.loggedindistributor.distyconfig.vpaid;
    this.isLiveUpi =
      this.pipaylib.loginService.loggedindistributor.distyconfig.liveupi;
    const qrlink = 'upi://pay?pn=' + pn + '&pa=' + pa + '&am=' + this.paymentObject.paidamount;
    this.user = this.pipaylib.loginService.loggedinstaff;
    this.qrvalue = qrlink;
  }


  closeRefModal() {
    setTimeout(() => {
      this.showRefModal = false;
    }, 100);
  }

  openRefModal() {
    this.showRefModal = true;
  }

  async confirmRef() {
    this.showRefModal = false;
    this.closeRefModal();
    this.saveRequisition();
  }

  onChangePaymentAmount() {
    this.fetchQrCode();
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

  onHide() {
    this.isConfirmed = false;
    this.visible = false;
    this.selectedPaymentMode = '';
    this.showPaymentModes = true;
    this.orderType = '';
    this.placeOrderEmitter.emit({
      modalVisibilty: this.visible
    });
  }

  showPaymentModeOnClick() {
    this.showPaymentModes = !this.showPaymentModes;
  }

  openbankModal() {
    this.showbankmodal = true;
  }

  inncreaseChequeDate() {
    const curdate = this.chqDate;
    this.chqDate = this.pipaylib.solace.utilService.addDaystoDate(curdate, +1);
  }

  decreaseChequeDate() {
    const curdate = this.chqDate;
    this.chqDate = this.pipaylib.solace.utilService.addDaystoDate(curdate, -1);
  }

  onConfirm() {
    console.log(this.orderType, typeof this.orderType);
    if (this.distyconfig?.paymentinorder || this.orderType === 'readystock') {
      this.isConfirmed = true;
      this.showPaymentModes = false;
    } else {
      this.saveRequisition();
    }
    if (this.paymentModes && this.paymentModes.length > 0) {
      this.paymentObject = {} as Payment;
      this.paymentObject.paidamount = 0;
      this.selectedPaymentMode = '';
    }

  }

  validatePaymentMode() {
    switch (this.selectedPaymentMode) {
      case 'Cash':
        this.checkCashPaymentValidity();
        break;
      case 'No Payment':
        this.placeOrderButtonDisabled = false;
        break;
      case 'Cheque':
        this.checkChequePaymentValidity();
        break;
      case 'UPI':
        this.checkUpiPaymentValidity();
        break;
      case 'NEFT':
        this.checkNeftPaymentValidity();
        break;
    }
  }

  onSelectPaymentMode(paymentMode: string) {
    this.selectedPaymentMode = paymentMode;
    this.showPaymentModes = false;
    this.paymentObject.paidamount = 0;
    this.paymentObject.txnreference = '';
    this.upiRef = '';
    switch (this.selectedPaymentMode) {
      case 'Cash':
        this.checkCashPaymentValidity();
        break;
      case 'No Payment':
        this.placeOrderButtonDisabled = false;
        break;
      case 'Cheque':
        this.checkChequePaymentValidity();
        break;
      case 'UPI':
        this.checkUpiPaymentValidity();
        break;
      case 'NEFT':
        this.checkNeftPaymentValidity();
        break;
    }
  }

  checkCashPaymentValidity() {
    this.placeOrderButtonDisabled = this.paymentObject.paidamount <= 0;
  }

  checkChequePaymentValidity() {
    this.getBankList();
    this.setChqDate();
    if (this.distyconfig?.banknameinstaffapp) {
      this.placeOrderButtonDisabled = this.paymentObject.paidamount <= 0 || !this.chqNo || this.chqNo.length !== 6 || !this.selectedBank;
    } else{
      this.placeOrderButtonDisabled = this.paymentObject.paidamount <= 0 || !this.chqNo || this.chqNo.length !== 6;
    }
  }

  checkUpiPaymentValidity() {
    this.placeOrderButtonDisabled = this.paymentObject.paidamount <= 0 || !this.upiRef || this.upiRef.length < 3;
  }

  checkNeftPaymentValidity() {
    this.placeOrderButtonDisabled = this.paymentObject.paidamount <= 0 || !this.paymentObject.txnreference;
  }

  onPlaceOrder() {
    this.visible = false;
    this.isConfirmed = false;
    this.placeOrderEmitter.emit({
      modalVisibilty: false,
      confirmed: true
    });
  }

  async saveRequisition() {
    let toast;
    this.setCoords();
    if(this.isMultiVoucher && (!this.pipaylib.orderService.curOrder.vchtype || this.pipaylib.orderService.curOrder.vchtype.length < 2 )){
      toast = await this.toastController.create({message: 'Please select a voucher type', duration: 1500,
      icon: 'alert-circle-outline', color: 'danger',position: 'top'});
      toast.present();
      return;
    }
    if (this.selectedPaymentMode) { this.paymentObject.paymentmode = this.selectedPaymentMode; }
    if (this.selectedPaymentMode === 'Cheque') {
      this.paymentObject.bankname = this.selectedBank?.name;
      this.paymentObject.instrumentdate = this.chqDate;
      this.paymentObject.instrumentref = this.chqNo;
    } else if (this.selectedPaymentMode === 'UPI') {
      this.paymentObject.txnreference = this.upiRef;
    }
    this.showLoader('Processing...');
    if (this.distyconfig.geotagfororder) {
      if (!this.lat && !this.long) {
        toast = await this.toastController.create({
          message: 'Kindly Allow Permission To Access Location Of The Device',
          duration: 1500,
          icon: 'alert-circle-outline',
          color: 'danger',
          position: 'top',
        });
        setTimeout(() => {
          this.hideLoader();
          toast.present();
        }, 1000);
        return;
      }
    }
    let request;
    let nopayment = true;
    const isreadystock = this.orderType === 'readystock' ? true : false;
    if(this.distyconfig.paymentinorder || isreadystock) {
      nopayment = false;
    }
    if ( this.selectedPaymentMode==='No Payment' || nopayment) {
      request = await this.pipaylib.orderService.placeOrder(null, isreadystock, this.lat,this.long);
    } else {
      request = await this.pipaylib.orderService.placeOrder(this.paymentObject,isreadystock, this.lat,this.long);
    }
    if (request.status === 'success')
    {
      if(!this.distyconfig.nostkdisplay){
        await this.pipaylib.dataService.setLiveProductStock(this.pipaylib.loginService.loggedindistributor.id);
      }
      console.log(request.orderobj);
      if (this.distyconfig && this.distyconfig.btprinter) {
        this.sendData(request.orderobj);
      }
      this.paymentObject = {} as Payment;
      this.chqDate = moment().format('YYYY-MM-D');
      this.chqNo = '';
      this.selectedBank = null;
      this.selectedPaymentMode = '';
      this.visible = false;
      this.orderType = '';
      this.placeOrderEmitter.emit({
        modalVisibilty: false,
        isPaid: true
      });

      if (isreadystock) {
        toast = await this.toastController.create({
          message: 'Ready Stock Created Successfully!', duration: 3000,
          icon: 'checkmark-circle-outline', color: 'success', position: 'top',});
      } else {
        toast = await this.toastController.create({
          message: 'Requisition Successfully Added!',
          duration: 3000,
          icon: 'checkmark-circle-outline',
          color: 'success',
          position: 'top',
        });
      }
      setTimeout(() => {
        this.hideLoader();
        toast.present();
      }, 300);
      this.onPlaceOrder();
    } else {
      toast = await this.toastController.create({
        message: request.errordescription,
        duration: 3000,
        icon: 'alert-circle-outline',
        color: 'danger',
        position: 'top',
      });
      setTimeout(() => { this.hideLoader(); toast.present();
      }, 1000);
    }
  }

  setCoords() {
    if (this.coords) {console.log(this.coords);
      this.lat = this.coords.latitude ; this.long = this.coords.longitude;
    } else {
      this.lat = ''; this.long = '';
    }
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
            res.dismiss().then(() => {});
          }
        });
      })
      .catch((e) => {
        this.isLoading = false;
      });
  }

  hideLoader() {
    if (this.isLoading) {
      this.isLoading = false;
    }
    return this.loadingCtrl
      .dismiss()
      .then(() => console.log(''))
      .catch((e) => console.log(e));
  }

  getMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      this.long = +pos.coords.longitude;
      this.lat = +pos.coords.latitude;
    },
    (error) => {
      console.error('Error getting geolocation:', error);
    });
  }

  async sendData(ord: Order) {
    const resultByte = await this.dataService.getBTPrintBuffer(ord);
    const deviceid = localStorage.getItem('blprinter');
   console.log(deviceid);
    this.bluetoothSerial.connect(deviceid).subscribe(() => {
      console.log('Connected to printer');
      this.bluetoothSerial.write(resultByte).then(() => {
        this.bluetoothSerial.clear();
        this.bluetoothSerial.disconnect();
        console.log('Print success');
      })
      .catch((err) => {
        console.error(err);
        this.bluetoothSerial.disconnect();
      });
     },
     (error) => {
       console.error('Error connecting to printer', error);
     }
   );
  }

}
