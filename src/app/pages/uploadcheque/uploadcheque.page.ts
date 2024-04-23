import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { PipaylibService } from 'pipaylib';
import { Distyconfig } from 'pipaylib/domain/distyconfig';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AppdataService } from 'src/app/services/appdata.service';
import { processinvoice } from 'src/app/services/appdata.service';

@Component({
  selector: 'app-uploadcheque',
  templateUrl: './uploadcheque.page.html',
  styleUrls: ['./uploadcheque.page.scss'],
})
export class UploadchequePage implements OnInit {
  isImageUpload = false;
  processInvoice;
  selectedInvoice;
  imageurl;
  paymentmode;
  scanimageurl;
  paidamount;
  instrumentref;
  instrumentdate;
  bankname;
  remarks;
  distyconfig: Distyconfig;
  user;
  imageforcheque;
  isLoading: boolean;
  compressedImage;
  Source;

  static chequeUploadPageInstance: UploadchequePage;
  txnref: any;

  constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController ,private router: Router, private pipaylib: PipaylibService, private dataService: AppdataService, private ng2ImgMax: Ng2ImgMaxService) { }


  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this.router.navigate(['/']);
    }
    this.user = this.pipaylib.loginService.loggedinstaff;
    this.processInvoice = {} as processinvoice;
    this.getDisty();
  }

  getDisty() {
    const disty = this.pipaylib.solace.dataService.getMasterFromMap('distyretailer');
  }

  ionViewWillEnter() {
    this.distyconfig = this.dataService.globalvars.get('distyconfig');
    this.processInvoice = this.dataService.globalvars.get('processedInvoice');
    this.selectedInvoice = this.dataService.globalvars.get('selectedinvoice');
    this.paymentmode = this.processInvoice.paymentmode;
    this.paidamount = this.processInvoice.paidamount;
    this.instrumentref = this.processInvoice.instrumentref;
    this.instrumentdate = this.processInvoice.chqdate;
    this.bankname = this.processInvoice.bankname;
    this.remarks = this.processInvoice.remark;
    this.txnref = this.processInvoice.txnid;
    this.processInvoice.paidon = new Date();
    this.processInvoice.invoiceno = this.selectedInvoice.invoicenumber;
    this.processInvoice.retailer = this.selectedInvoice.distyretailername;
  }

  onUploadComplete = () => {
    this.isImageUpload = !this.isImageUpload;
  }

  async processCollection() {
    this.showLoader('Processing Invoice...');
    const ret = await this.pipaylib.invoiceService.processStaffCollectionLambda(this.selectedInvoice, this.user, this.paymentmode, this.imageurl,this.paidamount ,this.instrumentref, this.instrumentdate,this.bankname,this.remarks, this.txnref,this.processInvoice.credit);
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
      this.router.navigate(['/paymentreceipt']); 
    }
    else { 
      this.hideLoader();
      const toast = await this.toastCtrl.create({
        message: ret.errordescription,
        duration: 2500,
        icon: 'close',
        color: 'danger',
      });
      toast.present();
    }
  };

  async takePicture() { 
    try {
       const image = await Camera.getPhoto({
           quality: 90,
           allowEditing: false,
           resultType: CameraResultType.DataUrl,
           source: CameraSource.Camera,
      });

      if (image) {   
        this.compressImage(image.dataUrl);
        // this.resizeAndPostImage(image);
      }

    } catch (error) {      
    }
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

  async updloadImageToS3(dataURL: string) {
    const base64Response = await fetch(dataURL);
    const blob = await base64Response.blob();
    const imageName = 'name.png';
    const imageFile = new File([blob], imageName, { type: 'image/png' });
    const strfile = new Date().getTime() + '.png';
    const fileSize = imageFile.size;
    const fileSizeInKB = fileSize / 1024;
    console.log(fileSizeInKB);    
    // console.log(JSON.stringify(imageFile) + strfile )
    const ret = await this.pipaylib.solace.utilService.uploadFiletoS3(imageFile,strfile,'foodkartiposimages');
    // console.log(ret)
    if (ret) {
      this.isImageUpload = true;
      const strurl = 'https://s3.ap-south-1.amazonaws.com/foodkartiposimages/' + strfile;
      this.imageurl = strurl;
      console.log(this.imageurl)
      // this.processCollection();
    }
  }

  async resizeAndPostImage(imageFile: any) {
    const img = new Image();
    img.src = imageFile.dataUrl;
    UploadchequePage.chequeUploadPageInstance = this;

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
      UploadchequePage.chequeUploadPageInstance .updloadImageToS3(newdataURI);      
    };
    
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
            });
          }
        });
      })
      .catch((e) => {
        this.isLoading = false;
      });
  }

}
