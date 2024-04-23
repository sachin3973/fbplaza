import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PipaylibService } from 'pipaylib';
import { AppdataService } from '../../services/appdata.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { processinvoice } from 'src/app/services/appdata.service';
import { IonModal, LoadingController, ToastController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { Distyconfig } from 'pipaylib/domain/distyconfig';
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
  selector: 'app-uploaddocket',
  templateUrl: './uploaddocket.page.html',
  styleUrls: ['./uploaddocket.page.scss'],
})
export class UploaddocketPage implements OnInit {
  @ViewChild('otp1') input;
  @ViewChild('otpmodal') otpmodal: IonModal;

  isImageUpload = false;
  processInvoice;
  selectedInvoice;
  showmodal: boolean;
  canDismiss: boolean;
  otp;
  genotp;
  isRunning = false;
  isLoading = false;
  otpstr1;
  otpstr2;
  otpstr3;
  otpstr4;
  otpstr='1234';
  static invoicePageInstance: UploaddocketPage;
  imageurl;
  paymentmode;
  scanimageurl;
  paidamount;
  instrumentref;
  instrumentdate;
  bankname;
  remarks;
  txnref = new Date().valueOf().toString(6);
  timeLeft; timerId;
  distyconfig: Distyconfig;
  optionalinvoiceupload;
  counter: {
    sec: number;
  };
  user;
  otpfordwp = false;
  resend = false;
  adminno;
  lat;
  long;
  selectedDocket: docketInvoice;
  collectionStatus: boolean;


  constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController,private _router: Router,private pipaylib: PipaylibService, private dataService: AppdataService) { }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this._router.navigate(['/']);
    }
    this.user = this.pipaylib.loginService.loggedinstaff;
    this.processInvoice = {} as processinvoice;
    this.getDisty();
  }

  ionViewWillEnter() {
    this.distyconfig = this.dataService.globalvars.get('distyconfig')
    this.optionalinvoiceupload = this.distyconfig.optionalinvupload
    this.processInvoice = this.dataService.globalvars.get('processedInvoice');
    this.selectedInvoice = this.dataService.globalvars.get('selectedinvoice');
    this.paymentmode = this.processInvoice.paymentmode;
    this.processInvoice.paidon = new Date();
    this.selectedDocket = this.dataService.globalvars.get('processedDocket');

    //console.log('this.processInvoice', this.processInvoice);
    //console.log(this.optionalinvoiceupload)
  }

  onUploadComplete = () => {
    this.isImageUpload = !this.isImageUpload;
  };

  getDisty() {
    const disty = this.pipaylib.solace.dataService.getMasterFromMap('distyretailer');
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

    const strfile =
    // this.pipaylib.loginService.loggedinstaff.id +
    //   '_' +
      new Date().getTime() +
      '.png';

    //this.pipaylib.solace.utilService.uploadFiletoS3
    //console.log(JSON.stringify(imageFile) + strfile )
    const ret = await this.pipaylib.solace.utilService.uploadFiletoS3(imageFile,strfile,'foodkartiposimages');
    //console.log(ret)
    if (ret) {
      this.isImageUpload = true;
      const strurl = 'https://s3.ap-south-1.amazonaws.com/foodkartiposimages/' + strfile;
      this.imageurl = strurl;
    }
  }

  async resizeAndPostImage(imageFile: any) {
    const img = new Image();
    img.src = imageFile.dataUrl;
    UploaddocketPage.invoicePageInstance = this;

    img.onload = function(_event) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxW = 600;
      const maxH = 600;

      const iw = img.width;
      const ih = img.height;
      const scale = Math.min(maxW / iw, maxH / ih);
      const iwScaled = iw * scale;
      const ihScaled = ih * scale;
      canvas.width = iwScaled;
      canvas.height = ihScaled;

      ctx.drawImage(img, 0, 0, iwScaled, ihScaled);

      const newdataURI = canvas.toDataURL('image/png');
      UploaddocketPage.invoicePageInstance.updloadImageToS3(newdataURI);
    };
  }

  openModal() {
    this.startTimer();
    this.clearOTP();
    this.canDismiss = false;
    this.showmodal = true;
    // this.getLocation();
    this.getMyLocation();
    this.sendotp();
  }

  closemodal() {
    setTimeout(() => {
      this.showmodal = false;
    }, 100);
  }

  maskify(mb) {
    return mb.replace(/.(?=.{2})/g, 'X');
  }

  startTimer() {
    this.counter = { sec:30 }; // choose whatever you want
      const intervalId = setInterval(() => {
      if (this.counter.sec - 1 === -1) {
        clearInterval(intervalId);
        this.resend = true;
      }
       else { this.counter.sec -= 1; }
    }, 1000);
  }

  sendotp() {
    this.clearOTP();
    const mobileno = this.pipaylib.loginService.loggedindistributor.distyconfig.otpauthnumbers;
    this.adminno = this.pipaylib.loginService.loggedindistributor.distyconfig.otpauthnumbers;
    const genOTP = Math.floor(1000 + Math.random() * 9000);
    this.genotp = '' + genOTP;

    if(mobileno && mobileno.length >= 10){
      const arrmob = mobileno.split(',');

      for(const mob of arrmob){
        this.pipaylib.staffService.sendOTPForDWP(mob,this.selectedInvoice,this.genotp);
      }
    }
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
    } else {
      next.setFocus();
    }
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

  async verifyOtp() {
    this.showLoader('Verifying...');
    this.otpstr = this.buildOTP();

    if (this.otpstr === this.genotp) {
      this.clearOTP();
      this.hideLoader();
      this.canDismiss = true; this.showmodal = false;
      this.submitDelivery();
    }
  }

  async submitDelivery() {
    this.showLoader('Processing Invoice...');
    let selectedInvoices = this.selectedDocket.docket;
    for (let i=0; i < selectedInvoices.length; i++) {
      const ret = await  this.pipaylib.invoiceService.processStaffDelivery(selectedInvoices[i],  this.imageurl, 'retailer',this.lat,this.long);
      if (ret.status === 'success') {
        this.collectionStatus = true;
      } else {
        const toast = await this.toastCtrl.create({
          message: ret.errordescription,
          duration: 2500,
          icon: 'close',
          color: 'danger',
        });
        toast.present();
        this.closemodal();
        this.collectionStatus = false;
        return;
      }
    }
    if(this.collectionStatus) {
      this.hideLoader();
        const toast = await this.toastCtrl.create({
          message: 'Delivery Successful!',
          duration: 2500,
          icon: 'checkmark-circle-outline',
          color: 'success',
          position: 'top'
        });
        toast.present();
        this.processInvoice.txnid = this.txnref;
        this.dataService.globalvars.set('isDocket', true);
        this.dataService.globalvars.set('processedDocket', this.selectedDocket);
        this.dataService.globalvars.set('paidInvoice',this.processInvoice);
        this._router.navigate(['/paymentreceipt']);
    }
  }

  hideLoader() {
    if (this.isLoading) {this.isLoading = false;}
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
            });this.canDismiss = true; this.showmodal = false;
          }
        });
      })
      .catch((e) => {
        this.isLoading = false;
        //console.log(e);
      });
  }

}
