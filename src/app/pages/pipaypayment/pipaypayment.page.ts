import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { PipaylibService } from 'pipaylib';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppdataService } from 'src/app/services/appdata.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Invoice } from 'pipaylib/domain/invoice';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}


@Component({
  selector: 'app-pipaypayment',
  templateUrl: './pipaypayment.page.html',
  styleUrls: ['./pipaypayment.page.scss'],
})
export class PipaypaymentPage implements OnInit {
  selectedInvoice: Invoice | any;
  isLoading;
  paymentProcessed: boolean;

  constructor(private pipaylib: PipaylibService, private http: HttpClient, public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,private dataService: AppdataService, private router: Router, private sanitizer: DomSanitizer) {

   }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this.router.navigate(['/']);
    };
  }

  async checkStatus(){
    var resp =await this.pipaylib.invoiceService.getPGOrderStatus(this.orderid);
    this.showSuccessToast('Status of transaction is : ' + resp.txnstatus);

  }



  ionViewWillEnter() {
    this.selectedInvoice = this.dataService.globalvars.get('invoiceforpipayment');
    if(this.dataService.globalvars.get('openpg')){
      this.paymentProcessed = false;
      this.dataService.globalvars.set('openpg',false);
      setTimeout(() => {
        this.processPipayPayment();
      }, 800);

    }

  }

  goToInvoicePage() {
    this.router.navigate(['/invoices']);
  }

  onBrowserClosed() {
    this.router.navigate(['/invoices'])
}


  goToPaymentMode() {
    this.router.navigate(['/paymentmode']);
  }


  orderid : string; 
  
  async processPipayPayment() {
    
    this.showLoader('Processing...');
    const retrequest = <any> await this.pipaylib.invoiceService.getCCAvenueIframeURL(this.selectedInvoice);
    if(retrequest.status == 'success'){
        var body = retrequest.pgrequestbody;
        this.orderid = body.order_id;
    }else{
      this.showErrorToast(retrequest.errordescription);
      this.hideLoader();
      return;
    }

    console.log('Sending Request ' + JSON.stringify(body));
    
    let pgurl;
    const url  ='https://kxhstkytl9.execute-api.ap-south-1.amazonaws.com/prod/createiframelink';
      const headers = {'content-type': 'application/json'};
      try{
        pgurl =  await this.http.post(url,body,{responseType: 'text',headers}).toPromise();
        console.log('URL REturned ' + JSON.stringify(pgurl));
      }catch(err){
        console.log('ERROR ' + JSON.stringify(err));
        this.hideLoader();
        return null;
      }


    this.hideLoader();
    this.paymentProcessed = true;
    const pymturl = 'https://www.pipayments.in/pipayupiresponsive.html?url=' + pgurl;
    if(Capacitor.isNativePlatform()) {
      this.openBrowser(pymturl)
    } else {
      window.open(pymturl);
    }

  }

  async openBrowser(pipayurl) {    
    await Browser.open({ url: pipayurl }); 
    Browser.addListener('browserFinished', () => {      
      this.onBrowserClosed();
  });
   
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

  async showSuccessToast(toastmsg){
    const toast = await this.toastCtrl.create({
      message: toastmsg,
      duration: 2500,
      icon: 'close',
      color: 'white',
    });
    toast.present();
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

          }
        });
      })
      .catch((e) => {
        this.isLoading = false;
        //console.log(e);
      });
  }


}
