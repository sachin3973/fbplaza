/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
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
import { Ng2ImgMaxService } from 'ng2-img-max';

@Component({
  selector: 'app-uploadinvoice',
  templateUrl: './uploadinvoice.page.html',
  styleUrls: ['./uploadinvoice.page.scss'],
})
export class UploadinvoicePage implements OnInit {
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
  static invoicePageInstance: UploadinvoicePage;
  imageurl;
  paymentmode;
  scanimageurl;
  paidamount;
  instrumentref;
  instrumentdate;
  bankname;
  remarks;
  txnref;
  timeLeft; timerId;
  distyconfig: Distyconfig;
  
  counter: {
    sec: number;
  };
  user;
  otpfordwp = false;
  resend = false;
  optionalinvoiceupload;
  Source;
  compressedImage;
  adminno;
  lat;
  long;
  
  creditenabled = false; 

  constructor(private sanitizer: DomSanitizer, public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,private _router: Router,private pipaylib: PipaylibService,
    private dataService: AppdataService,private ng2ImgMax: Ng2ImgMaxService) { }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this._router.navigate(['/']);
    }
    this.user = this.pipaylib.loginService.loggedinstaff;
    this.processInvoice = {} as processinvoice;
    this.getDisty();
  }

  getDisty() {
    const disty = this.pipaylib.solace.dataService.getMasterFromMap('distyretailer');
  }
  distyretailer : Distyretailer; 

  ionViewWillEnter() {
    this.distyconfig = this.dataService.globalvars.get('distyconfig')
    this.optionalinvoiceupload = this.distyconfig.optionalinvupload
    this.processInvoice = this.dataService.globalvars.get('processedInvoice');
    this.selectedInvoice = this.dataService.globalvars.get('selectedinvoice');
    this.paymentmode = this.processInvoice.paymentmode;
    this.paidamount = this.processInvoice.paidamount;//creditamt
    this.instrumentref = this.processInvoice.instrumentref;
    this.instrumentdate = this.processInvoice.chqdate ? this.processInvoice.chqdate : this.processInvoice.paidon;
    this.bankname = this.processInvoice.bankname;
    this.remarks = this.processInvoice.remark;//creditremark & crbillremark
    this.txnref = this.processInvoice.creditnotereason ? this.processInvoice.creditnotereason : this.processInvoice.txnid;
    this.processInvoice.paidon = new Date();
    this.processInvoice.invoiceno = this.selectedInvoice.invoicenumber;
    this.processInvoice.retailer = this.selectedInvoice.distyretailername;
    this.getRetailerData();
  
  }


  async getRetailerData(){
    this.creditenabled = false; 
    const key = {distributorid : '' + this.pipaylib.loginService.loggedindistributor.id , id : '' + this.selectedInvoice.distyretailerid };
    const tablename = this.pipaylib.solace.utilService.getTableName('distyretailer');
    const distyretailer = <Distyretailer> await this.pipaylib.solace.dbLib.getItem(tablename,key);
    if (distyretailer) {
      if (distyretailer.otpfordwp && distyretailer.otpfordwp.toUpperCase().indexOf('Y') >= 0) {
        this.otpfordwp = true;
      }

      this.distyretailer = <Distyretailer> distyretailer;
      if(this.pipaylib.loginService.loggedindistributor.enablenbfc && this.distyretailer.creditstatus == 'active'){
        this.creditenabled = true; 
        this.otpfordwp = true; 
      }
    }
  }

  onUploadComplete = () => {
    this.isImageUpload = !this.isImageUpload;
  };

  navigateCreditNote() {
    this.dataService.globalvars.set('paidInvoice',this.processInvoice);
    this._router.navigate(['/paymentreceipt']);
  }

  async processCollection() {
    this.showLoader('Processing Invoice...');
    const ret = await this.pipaylib.invoiceService.processStaffCollectionLambda(this.selectedInvoice, this.user, this.paymentmode, this.imageurl,this.paidamount ,this.instrumentref, this.instrumentdate,this.bankname,this.remarks, this.txnref,0);
    if (ret.status === 'success') { 
      this.hideLoader();
      const toast = await this.toastCtrl.create({
        message: 'Delivery Successful!',
        duration: 2500,
        icon: 'checkmark-circle-outline',
        color: 'success',
        position: 'top'
      });
      toast.present();
      this._router.navigate(['/paymentreceipt']); 
    }
    else { 
      const toast = await this.toastCtrl.create({
        message: ret.errordescription,
        duration: 2500,
        icon: 'close',
        color: 'danger',
      });
      toast.present();
      //console.log('error' + ret.statuserrorcode + ret.errordescription);
    }
  };

  async takePicture() {
    if (this.distyconfig.allowgalleryupload) {
      this.Source = CameraSource.Prompt
    } else {
      this.Source = CameraSource.Camera
    }
    
    try {
       const image = await Camera.getPhoto({
           quality: 90,
           allowEditing: false,
           resultType: CameraResultType.DataUrl,
           source: this.Source,
      });

      if (image) {
        //dummy txn no
        // this.processInvoice.txnid = '';
        this.resizeAndPostImage(image);
        this.compressImage(image.dataUrl);
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
    const fileSize = imageFile.size;
    const fileSizeInKB = fileSize / 1024;
    // console.log(fileSizeInKB);    
    // console.log(JSON.stringify(imageFile) + strfile )
    const ret = await this.pipaylib.solace.utilService.uploadFiletoS3(imageFile,strfile,'foodkartiposimages');
    // console.log(ret)
    if (ret) {
      this.isImageUpload = true;
      const strurl = 'https://s3.ap-south-1.amazonaws.com/foodkartiposimages/' + strfile;
      this.imageurl = strurl;
      // this.processCollection();
    }
  }

  async resizeAndPostImage(imageFile: any) {
    const img = new Image();
    img.src = imageFile.dataUrl;
    UploadinvoicePage.invoicePageInstance = this;

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
      UploadinvoicePage.invoicePageInstance.updloadImageToS3(newdataURI);      
    };
    
  }

  async compressImage(dataURL: string) { 
    this.showLoader('Compressing..');
    const base64Response = await fetch(dataURL);
    const blob = await base64Response.blob();
    const imageName = 'name.png';
    const imageFile = new File([blob], imageName, { type: 'image/png' });   
    this.ng2ImgMax.compressImage(imageFile, 0.35).subscribe(
      (result) => {        
        // this.compressedImage = new File([result], 'compressed-image.png');
        this.updloadImage(result);     
      },
      (error) => {
        console.error('Error compressing image: ', error);
        
      }
      
    );      
  }

  // async compressImage(imageFile) {   
  //   this.hideLoader();
  //   this.showLoader('Compressing..');
  //   this.ng2ImgMax.compressImage(imageFile, 0.1).subscribe(
  //     (result) => {        
  //       // this.compressedImage = new File([result], 'compressed-image.png');
  //       this.updloadImage(result);     
  //     },
  //     (error) => {
  //       console.error('Error compressing image: ', error);
  //       this.hideLoader();
  //     }
      
  //   );     
  // }

  async updloadImage(imageFile) {   
    this.hideLoader();
    this.showLoader('Uploading..');
    const fileSize = imageFile.size;
    const fileSizeInKB = fileSize / 1024;
    console.log(fileSizeInKB);
    const strfile = new Date().getTime() +'.png';
    const ret = await this.pipaylib.solace.utilService.uploadFiletoS3(imageFile,strfile,'foodkartiposimages');
    if (ret) {
      this.isImageUpload = true;
      const strurl = 'https://s3.ap-south-1.amazonaws.com/foodkartiposimages/' + strfile;
      this.imageurl = strurl;      
      console.log(this.imageurl)
    }
    this.hideLoader()
  }

  showOTPEntryDiaog(sendotp : boolean){
    this.startTimer();
    this.clearOTP();
    this.canDismiss = false;
    this.showmodal = true;
    this.getMyLocation();
    if(sendotp) this.sendotp();
  }

  async proceedWithCreditLine(settlementamount){
    //this.showLoader('Processing...');
    var ret = await this.pipaylib.invoiceService.processStaffCollection(this.selectedInvoice,this.user,'Credit Line',this.imageurl,settlementamount,'',
              this.pipaylib.solace.utilService.getCurrentBusinessDate(),'','','',90);   
    this.hideLoader();
    
    if(ret && ret.status == 'success'){
      this.dataService.globalvars.set('paidInvoice',this.processInvoice);
      this._router.navigate(['/paymentreceipt']);
    }else{
      this.showErrorToast('Error, please try again!');
    }
  }

  async proceedWithCreditAuthorization(){
    this.closemodal();
    this.showLoader('Processing...');
    
    this.otpstr = this.buildOTP();
    var retstatus = await this.pipaylib.invoiceService.authorizeDeliveryOnCredit(this.selectedInvoice,this.otpstr); 
    
    
    console.log(JSON.stringify(retstatus));
    if(retstatus){
      switch(retstatus.status){
        case 0: this.proceedWithCreditLine(retstatus.settlementamount); break;
        case -2: this.proceedWithCreditLine(retstatus.settlementamount); break;
        default: this.showErrorToast('Error, please try again!'); break; 
      }
    }else{
      this.showErrorToast('Error, please try again!'); 
    }
  


  }

  async openModal() {
    if(this.creditenabled){
      this.showLoader('Verifying...');
      console.log('Invoice ' + JSON.stringify(this.selectedInvoice));
      var retstatus = await this.pipaylib.invoiceService.validateDeliveryOnCredit(this.selectedInvoice,this.imageurl); 
      this.hideLoader();
      
      console.log(JSON.stringify(retstatus) + ' STATUS ' + retstatus.status);
      if(retstatus){
        switch(retstatus.status){
          case 0: 

            this.showOTPEntryDiaog(false);
            break;
          case -2: this.proceedWithCreditLine(retstatus.settlementamount); break;
          default: this.showErrorToast('Error, please try again!'); break;
        }
      }else{
        this.showErrorToast('Error, please try again!'); 
      }
      return;
      
    }else{
      this.showOTPEntryDiaog(true);
    }
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
      // setTimeout(() => {
      //    this.input.setFocus();
      // }, 100);
    // this.verifyOtp();


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
    // //console.log(event);
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(
      event.which ? event.which : event.charCode
    );
    if (!pattern.test(inputChar)) {
      event.preventDefault();
      return;
    }

    if (next == null) {
      //this.otpstr4 = '' + inputChar;
      ////console.log('OTP 4 ' + this.otpstr4);
      //this.otpstr = this.buildOTP();
      //  this.verifyOtp();
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

  async showErrorToast(msg: string){
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2500,
      icon: 'close',
      color: 'danger',
    });
    toast.present();
  }

  async verifyOtp() {
    this.otpstr = this.buildOTP();
    if(this.creditenabled){
      this.proceedWithCreditAuthorization();
      return; 
    }
    this.showLoader('Verifying...');
    
    if (this.otpstr === this.genotp) {
      this.clearOTP();
      this.hideLoader();
      this.canDismiss = true; this.showmodal = false;
      const ret = await  this.pipaylib.invoiceService.processStaffDelivery(this.selectedInvoice,  this.imageurl, 'retailer',this.remarks,this.lat,this.long);
      if (ret.status === 'success') {
        this.dataService.globalvars.set('paidInvoice',this.processInvoice);
        this._router.navigate(['/paymentreceipt']);
      } else {
        const toast = await this.toastCtrl.create({
          message: ret.errordescription,
          duration: 2500,
          icon: 'close',
          color: 'danger',
        });
        toast.present();
        this.closemodal();
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

  async submitDelivery() {
    this.showLoader('Processing Invoice...');
    const ret = await  this.pipaylib.invoiceService.processStaffDelivery(this.selectedInvoice,  this.imageurl, 'retailer',this.remarks,this.lat,this.long);
    if (ret.status === 'success') {
      this.hideLoader();
      const toast = await this.toastCtrl.create({
        message: 'Delivery Successful!',
        duration: 2500,
        icon: 'checkmark-circle-outline',
        color: 'success',
        position: 'top'
      });
      toast.present();
      this.dataService.globalvars.set('paidInvoice',this.processInvoice);
      this._router.navigate(['/paymentreceipt']);
    } else {
      const toast = await this.toastCtrl.create({
        message: ret.errordescription,
        duration: 2500,
        icon: 'close',
        color: 'danger',
      });
      toast.present();
      this.closemodal();
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

