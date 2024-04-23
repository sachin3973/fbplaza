import { Component, OnInit } from '@angular/core';
import { PipaylibService } from 'pipaylib';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Router } from '@angular/router';
import { AppdataService } from '../../services/appdata.service';
import { Distyconfig } from 'pipaylib/domain/distyconfig';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { Functionresponse } from 'solace/domain/functionresponse';
import { cloneDeep } from 'lodash';
import { timeStamp } from 'console';
import { FSSAIInfo } from 'pipaylib/domain/fssaiinfo';
import { IonContent, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Retailer } from 'pipaylib/domain/retailer';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-captureshopimage',
  templateUrl: './captureshopimage.page.html',
  styleUrls: ['./captureshopimage.page.scss'],
})
export class CaptureshopimagePage implements OnInit {
  static invoicePageInstance: CaptureshopimagePage;
  isImageUpload = false;
  imageurl;
  scanimageurl;
  canDismissFssaiModal = false;
  showfssaimodal = false;
  distyconfig: Distyconfig;
  distyretailer: Distyretailer;
  lat;
  long;
  fssaiavailable ='';
  fssaino;
  curpage: string;
  // Fssai Verification
  fssaiResponse;
  isLoading = false;
  fssaiinfo;
  currentDate;
  enableimagebutton;
  mobileno;
  showmodal: boolean;
  canDismiss: boolean;
  counter: { sec: number };
  resend = false;
  otp: any;
  genotp: any;
  otpstr1;
  otpstr2;
  otpstr3;
  otpstr4;
  otpstr: string;
  verifiedmobile;
  cameFromPartywise: boolean;


  constructor(
    private dataService: AppdataService,
    private pipaylib: PipaylibService,
    private router: Router,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController
  ) { }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this.router.navigate(['/']);
    }
  }

  ionViewWillEnter() {
    this.cameFromPartywise = this.dataService.globalvars.get('cameFromPartywise');
    console.log(this.cameFromPartywise);
    this.enableimagebutton = false;
    this.lat = null;
    this.long = null;
    this.currentDate = new Date();
    this.currentDate = formatDate(this.currentDate, 'yyyy-MM-dd','en-US' );
    // this.fssaino = "";
    // this.mobileno = "";
    // this.fssaiexpiry = "";
    this.distyconfig = this.dataService.globalvars.get('distyconfig');
    console.log(this.distyconfig);

    this.distyretailer = cloneDeep(this.dataService.globalvars.get('selectedretailer'));
    if(this.distyconfig.capturegeotag && !this.distyretailer.geotagdone){
      this.getMyLocation();
      this.curpage = 'img';
      this.showfssaimodal = false;
    }else{
      this.curpage = 'fssai';
      this.showfssaimodal = true;
    }

    // this.distyretailer.fssaiexp = this.distyretailer.fssaiexp ? this.distyretailer.fssaiexp : this.fssaiexpiry;
  }
  goToPartywise() {
    this.router.navigate(['/partywisepaymentoption']);
  }

  async takePicture() {
    try {
       const image = await Camera.getPhoto({
           quality: 80,
           allowEditing: false,
           resultType: CameraResultType.DataUrl,
           source: CameraSource.Camera,
      });

      if (image) {
        //dummy txn no
        // this.processInvoice.txnid = '';
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
    //console.log(JSON.stringify(imageFile) + strfile )
    const ret = await this.pipaylib.solace.utilService.uploadFiletoS3(imageFile,strfile,'foodkartiposimages');
    //console.log(ret )
    if (ret) {
      //console.log('IS UPLOADED!!')
      this.isImageUpload = true;
      const strurl = 'https://s3.ap-south-1.amazonaws.com/foodkartiposimages/' + strfile;
      this.imageurl = strurl;
      //console.log(this.lat)
      if(this.lat && this.long) {this.enableimagebutton = true;}
    }
  }

  async resizeAndPostImage(imageFile: any) {
    const img = new Image();
    img.src = imageFile.dataUrl;
    CaptureshopimagePage.invoicePageInstance = this;

    img.onload = (_event) => {
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
      CaptureshopimagePage.invoicePageInstance.updloadImageToS3(newdataURI);
    };
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

  onSkipImage() {
    if(this.curpage === 'img'){
      if((this.distyconfig.capturemobile && !this.distyretailer.mobileverified)){
        this.curpage = 'fssai';
        this.showfssaimodal = true;
        return;
      }
    }

    this.dataService.globalvars.set('selectedretailer', this.distyretailer);
    this.router.navigate(['paymentmode']);
  
  }

  onSkipFssai() {
    this.dataService.globalvars.set('selectedretailer', this.distyretailer);
    this.router.navigate(['paymentmode']);
  }

  async saveRetailer(){
    const txnitems = [];
    // this.distyretailer.mobileno = this.mobileno;
    const cloneItem = cloneDeep(this.distyretailer);
    const tableName = this.pipaylib.solace.utilService.getTableName('distyretailer');
    const staffitem = this.pipaylib.solace.utilService.getTransactionItem('edit', tableName, cloneItem);
    txnitems.push(staffitem);
    try{
      const ret = await this.pipaylib.solace.dbLib.performTransaction(txnitems);
      if(ret) {
          this.distyretailer = cloneItem;
          return true;
      }else{
        return false;
      }

    }catch(err){
      return false;
    }

  }

  async submitImage() {
    this.distyretailer.shopimageurl = this.imageurl;
    this.distyretailer.latitude = '' + this.lat;
    this.distyretailer.longitude = '' + this.long;
    this.distyretailer.geotagdone = true;

    const ret = await this.saveRetailer();
    if(ret){
      //console.log('LOADING capture shoping image....')
      if((this.distyconfig.capturefssai && !this.distyretailer.fssaiavailable)){
        this.showfssaimodal = true;
        this.curpage = 'fssai';
      } else {
        
        this.router.navigate(['/paymentmode']);
      }
    }else{
      this.dataService.displayToast('Error Saving Disty Retailer ', 'FAIL', 'top');

    }

  }

  async closeFssaiModal() {
    //VALIDATE FSSAI
    //console.log('Here...');
    /*if(this.distyretailer.fssaiavailable === 'Yes' && (!this.distyretailer.fssaino || this.distyretailer.fssaino.trim().length === 0)){
      this.dataService.displayToast('FSAAI Number Cannot Be Blank', 'FAIL', 'top');
      return false;

    }
    console.log(this.distyretailer.fssaiexp);
    if (this.distyretailer.fssaiavailable === 'Yes') {
      if (!this.distyretailer.fssaiexp) {
        this.dataService.displayToast('Please Enter The Expiry Date', 'WARNING', 'top');
        return false;
      } else {
        if (this.distyretailer.fssaiexp < this.currentDate) {
          this.dataService.displayToast('Invalid Expiry Date', 'WARNING', 'top');
          return false;
        }
      }

      const str = this.distyretailer.fssaino;
      const regex = new RegExp(/^[1-2]{1}[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{7}$/);

      if (regex.test(str) !== true) {
        this.dataService.displayToast('Enter FSSAI Number In Correct Format', 'WARNING', 'top');
        return  false;
      }

    }*/

    // this.distyretailer.fssaiavailable = this.fssaiavailable;
    // this.distyretailer.fssaino = this.fssaino;

    const ret = await this.saveRetailer();
    if(ret){
      this.dataService.globalvars.set('selectedretailer', this.distyretailer);
      this.router.navigate(['/paymentmode']);
    }else{
      this.dataService.displayToast('Error Saving Disty Retailer ', 'FAIL', 'top');
    }
  }

  async verifyFssaiNo() {
    this.showLoader('Fetching details from FSSAI Server...');
    const ret = await this.pipaylib.enrollmentService.getFSSAIInfo(this.fssaino);
    if(!ret){
      this.hideLoader();
      this.dataService.displayToast('FSSAI Details not found! Please check and try again!', 'WARNING', 'top');
    } else{
      this.hideLoader();
      this.fssaiinfo = ret as FSSAIInfo;
    }

    this.fssaiResponse = ret;
    //console.log(ret);
  }


  verifyMobileNo() {
    if(!this.distyretailer.mobileno || this.distyretailer.mobileno.trim().length !== 10){
      this.dataService.displayToast('Please enter valid 10 digit mobile number!', 'WARNING', 'top');
      return;
    }
    this.startTimer();
    this.clearOTP();
    this.sendotp();
    this.canDismiss = false;
    this.showmodal = true;
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

  clearOTP() {
    this.otpstr1 = '';
    this.otpstr2 = '';
    this.otpstr3 = '';
    this.otpstr4 = '';
  }

  sendotp() {
    if (this.validateMobno()) {
      const genOTP = Math.floor(1000 + Math.random() * 9000);
      this.genotp = '' + genOTP;
      this.pipaylib.loginService.sendOTPOnWhatsApp(this.distyretailer.mobileno,'PiPay User',this.genotp);
    }
  }

  validateMobno() {
    if (!this.distyretailer.mobileno) {
      this.dataService.displayToast('Registered Mobile No Cannot Be Blank', 'WARNING', 'top');
      return false;
    }

    if (isNaN(parseInt(this.distyretailer.mobileno, 10))) {
      this.dataService.displayToast('Registerd Mobile Number Should Be Numeric Value','WARNING', 'top');
      return false;
    }
    const mobno = '' + this.distyretailer.mobileno;

    if (mobno.trim().length !== 10) {
      this.dataService.displayToast('Invalid Registered Mobile Number, Please Enter 10 digit Mobile Number.',
        'WARNING', 'top'
      );
      return false;
    }
    return true;
  }

  maskify(mb) {
    return mb.replace(/.(?=.{2})/g, 'X');
  }

  async verifyOtp() {
    this.showLoader('Verifying...');
    this.otpstr = this.buildOTP();

    if (this.otpstr === this.genotp) {
      this.clearOTP();
      this.hideLoader();
      // this.verifiedmobile = true;
      this.verifiedmobile = true;
      this.distyretailer.mobileverified = true; 
      const toast = await this.toastCtrl.create({
        message: 'Sucessfully Verified!',
        duration: 2500,
        icon: 'check',
        color: 'secondary',
      });
      toast.present();
      this.closemodal();
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Invalid OTP, you entered :' + this.otpstr + ': ',
        duration: 2500,
        icon: 'close',
        color: 'danger',
      });
      toast.present();
      this.clearOTP();
      this.hideLoader();
      this.closemodal();
    }
  }

  closemodal() {
    setTimeout(() => {
      this.showmodal = false;
    }, 100);
  }

  getotp(event, next) {
    //console.log(event);
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
      ////console.log('OTP 4 ' + this.otpstr4);
      //this.otpstr = this.buildOTP();
      //  this.verifyOtp();
    } else {
      next.setFocus();
    }
  }

  buildOTP() {
    return this.otpstr1 + this.otpstr2 + this.otpstr3 + this.otpstr4;
  }

  changeFssaiAvailable(event: any) {
    if (event.target.value === 'No') {
      // this.fssaino = "";
      // this.mobileno = "";
      // this.fssaiexpiry = "";
      // this.verifiedmobile = false;
    }
  }

  async showLoader(msg: string) {
    if (!this.isLoading) {this.isLoading = true;}
    try {
      const res = await this.loadingCtrl
        .create({
          message: msg,
          spinner: 'bubbles',
        });
      res.present().then(() => {
        if (!this.isLoading) {
          res.dismiss().then(() => {
          });
        }
      });
    } catch (e) {
      this.isLoading = false;
      //console.log(e);
    }
  }

  async hideLoader() {
    if (this.isLoading) {
      this.isLoading = false;
    }
    try {
      await this.loadingCtrl.dismiss();
      return; //console.log('dismissed');
    } catch (e) {
      return; //console.log(e);
    }
  }

}
