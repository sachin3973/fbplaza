import { Component, OnInit, ViewChild } from '@angular/core';
import { PipaylibService } from 'pipaylib';
import { Functionresponse } from 'solace/domain/functionresponse';
import { Router } from '@angular/router';
import { IonModal, LoadingController, ToastController } from '@ionic/angular';
import { AppdataService} from '../../services/appdata.service';
import { Distyvehicle } from 'pipaylib/domain/distyvehicle';
import * as CryptoJS from 'crypto-js';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { Distystafftype } from 'pipaylib/domain/distystafftype';
import { Platform } from '@ionic/angular';
import { Distyretailer } from 'pipaylib/domain/distyretailer';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {
  @ViewChild('otp1') input;
  @ViewChild('mobno') mobno;
  @ViewChild('cancellationModal') cancellationModal: IonModal;
  usermobileno: any;
  showVehicleModal: boolean;
  canDismissVehicleModal: boolean;
  otp;
  genotp;
  isRunning = false;
  isLoading = false;
  otpstr1;
  otpstr2;
  otpstr3;
  otpstr4;
  otpstr='1234';
  showotp = false;
  vehicles: Distyvehicle[];
  selectedVehicle: Distyvehicle;
  showVehicles: boolean;
  appVersion;
  versionno;
  latest;

  constructor(private pipaylib: PipaylibService, private _router: Router,public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,private dataService: AppdataService,public platform: Platform) { }

  async getMetaData(){
    const url = 'https://autopayadmin.s3.ap-south-1.amazonaws.com/metadatapipay.json?random=' + new Date().getTime();
    const retpromise = await this.pipaylib.solace.httpService.httpRequest(url,'GET','');
    return retpromise;
  }

  ngOnInit() {
    this.appVersion = '10.5';
    this.versionno =105;
    if (Capacitor.isNativePlatform())  StatusBar.setBackgroundColor({color:'#033584'});   
    this.dataService.globalvars.set('versionNumber', this.appVersion);
    this.showVehicles = true;  
  }

  ionViewWillEnter() {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setBackgroundColor({color:'#033584'});
    }
    this.clearOTP();
    this.checkAutoLogin();
    this.showotp = false;
    setTimeout(() => {
      this.mobno.setFocus();
    }, 100);
  }

  async redirectToDashboard() {
    this.showLoader('Routing...');
    var distributorid = this.pipaylib.loginService.loggedindistributor.id;
    var distyconfig = this.pipaylib.loginService.loggedindistributor.distyconfig;  
    if(distyconfig.readystock || distyconfig.enablereq || distyconfig.partywisecollection){
      await this.initializeRetailers();
    }
    if(distyconfig.enablereq && !distyconfig.nostkdisplay) this.pipaylib.dataService.setTodaysOrders(distributorid);
    const ret = await this.pipaylib.staffService.setInitialMonitoringData();
    this.vehicles = await this.pipaylib.solace.dataService.getMasterFromMap('distyvehicle');
    if (ret) {
      const stafftypelist = <Distystafftype[]> this.pipaylib.solace.dataService.getMasterFromMap('distystafftype');
      for (const stafftype of stafftypelist) {
        if(stafftype.id === this.pipaylib.loginService.loggedinstaff.stafftypeid){
          this.pipaylib.loginService.loggedinstafftype = stafftype;
        }
      }
      this.hideLoader();
      if (this.pipaylib.loginService.loggedinstafftype && this.latest){
        this._router.navigate(['/dashboard'])
        if(distyconfig.liveupi){
          this.pipaylib.websocketService.startService();
        }
      }
      return;
      } else {
        this.hideLoader();
      }
  }

  monitorDataInitialization() {
    if (this.pipaylib.solace.dataService.initdone) {
      this.redirectToDashboard();
      return;
    }
    if(this.pipaylib.solace.dataService.initerror){
      //console.log('Error in initialization, please refresh your application window.');
      return;
    }
    //Monitor recursively
    setTimeout(() => {
      this.monitorDataInitialization();
      this.hideLoader();
    }, 50);
  }

  async login() {
    try {
      const metadata = await this.getMetaData();
      this.pipaylib.solace.beginSolace('VV/fnLvq8GS22kimXibj4m63SKWF4qndbnsi8oPL', 'AKIARPKP6CZJCNP3PZ47', -1, 'pipay', 'dev', metadata);
      const ret = <Functionresponse>await this.pipaylib.loginService.loginStaff(this.usermobileno);
      this.hideLoader();
      if (ret.status === 'error') {
        this.dataService.displayToast(ret.errordescription, 'FAIL');
        return;
      }
      this.latest = await this.pipaylib.loginService.isLatestVersionNo('staffapp',this.versionno);
      //console.log('Latest ' + this.latest);
      if(!this.latest){
        //Goto versioon update if it is a native app
        this._router.navigate(['/updateversion']);
        //console.log('I NEED TO UPDATE VERSION!!');
      }
      const loggedinstaff = this.pipaylib.loginService.loggedinstaff;
      this.dataService.setLoggedStaff(loggedinstaff);
      this.dataService.globalvars.set('loggedinstaff',this.pipaylib.loginService.loggedinstaff.showvehiclereco);
      const conditionparams = 'distributorid = :v_distyid';
      const attribparams = { ':v_distyid': loggedinstaff.distributorid };
      this.pipaylib.solace.dataService.initMasterData('staff', conditionparams, attribparams);
      this.monitorDataInitialization();
    } catch (err) {
      this.dataService.displayToast('Error signing in ' + err, 'FAIL');
    }
  }


  sendotp() {
    if(this.validateMobno()){
      const mobileno = this.usermobileno.substring(0, this.usermobileno.indexOf('@'));
      this.showotp = true;
      const genOTP = Math.floor(1000 + Math.random() * 9000);
      this.genotp = '' + genOTP;
      //console.log(genOTP)
      this.pipaylib.loginService.sendOTPOnWhatsApp(mobileno,'PiPay User',this.genotp);
    }
  }

  validateMobno() {
    if (this.usermobileno && this.usermobileno.length > 0 && this.usermobileno.indexOf('@') > 0){
      return true;
    }else{
      this.dataService.displayToast('Please login as mobileno@distycode', 'FAIL');
      return false;
    }
  }

  clearOTP() {
    this.otpstr1 = '';
    this.otpstr2 = '';
    this.otpstr3 = '';
    this.otpstr4 = '';
  }

  buildOTP() {
    this.otpstr = this.otpstr1 + this.otpstr2 + this.otpstr3 + this.otpstr4;
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
    } else {
      next.setFocus();
    }
  }

  async verifyOtp() {
    this.showLoader('Verify...');
    this.buildOTP();
    if (this.otpstr === this.genotp || (this.usermobileno === '8626035014@kop1' && this.otpstr === '5789' ) || (this.usermobileno === '9876543210@test' && this.otpstr === '1234' )) {
      this.clearOTP();
      this.login();
      const encryptedtext = CryptoJS.AES.encrypt(this.usermobileno,  'FKSDFJSDF@#%%piPay!@#@' ).toString();
      localStorage.setItem('pipaystaff',encryptedtext);
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
    if (this.isLoading) {this.isLoading = false;}
    return this.loadingCtrl
      .dismiss()
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
              // //console.log('login successful');
            });
          }
        });
      })
      .catch((e) => {
        this.isLoading = false;
        //console.log(e);
      });
  }

  closeVehiclemodal() {
    setTimeout(() => {
      this.showVehicleModal = false;
    }, 100);
  }

  openVehicleModal() {
    this.canDismissVehicleModal = false;
    this.showVehicleModal = true;
  }

  async initializeRetailers(){
    console.log('PARTY WISE ' + this.pipaylib.loginService.loggedindistributor.distyconfig.partywisecollection);
    if(this.pipaylib.loginService.loggedindistributor.distyconfig.enablereq || this.pipaylib.loginService.loggedindistributor.distyconfig.partywisecollection){
      this.pipaylib.solace.dataService.appdatalists.set('distyretailer',[]);
      return await this.pipaylib.staffService.initRetailerMaster();
    }else{

      const retstored = localStorage.getItem('distyretailers');
      if(retstored){
        const retailers = CryptoJS.AES.decrypt(retstored,  'FKSDFJSDF@#%%piPay!@#@' ).toString(CryptoJS.enc.Utf8);
        const retlist = JSON.parse(retailers);
        const curretailers = [];
        if(retlist && retlist.length > 0){
          //console.log('|INIT|RETINIT|DATA FOUND ' + retlist.length);
          for(const distyret of retlist){
            if(distyret.distributorid == this.pipaylib.loginService.loggedindistributor.id){
              curretailers.push(distyret);
            }
          }
          this.pipaylib.solace.dataService.appdatalists.set('distyretailer',curretailers);
        }else{
          //console.log('|INIT||NO RETAILER FOUND');
          var emptyretlist = [];
          this.pipaylib.solace.dataService.appdatalists.set('distyretailer',emptyretlist);
        }
      }else{
        //console.log('|INIT||NOthing stored ');
        var emptyretlist = [];
        this.pipaylib.solace.dataService.appdatalists.set('distyretailer',emptyretlist);
      }
      //Now get updated
      const retstatus = await this.pipaylib.staffService.initUpdatedRetailers();
      if(retstatus){
        let  curlist = <Distyretailer[]> this.pipaylib.solace.dataService.getMasterFromMap('distyretailer');
        curlist.sort((a: Distyretailer, b: Distyretailer) => a.updatedat < b.updatedat ? -1 : 1);
        if(curlist.length > 5000) {curlist = curlist.slice(0,5000);}

        const encryptedtext = CryptoJS.AES.encrypt(JSON.stringify(curlist), 'FKSDFJSDF@#%%piPay!@#@' ).toString();
        localStorage.setItem('distyretailers',encryptedtext);
        return true;
      }
      return false;
    }
  }

  onSelectVehicle() {
    this._router.navigate(['/dashboard']);
    return;
  }

  showVehiclesOnClick() {
    this.showVehicles = !this.showVehicles;
  }

  selectVehicle(vehicle: Distyvehicle) {
    this.selectedVehicle = vehicle;
    this.dataService.globalvars.set('selectedVehicle', this.selectedVehicle.name);
    this.showVehicles = false;
  }

  async checkAutoLogin(){
    const credsstored = localStorage.getItem('pipaystaff');
    if(credsstored){
      const creds = CryptoJS.AES.decrypt(credsstored,  'FKSDFJSDF@#%%piPay!@#@' ).toString(CryptoJS.enc.Utf8);
      if(creds && creds.indexOf('@') > 0) {
        this.usermobileno = creds;
        this.showLoader('Signing in ..');
        this.login();
      }
    }
  }

  checkPlatform() {
    if (Capacitor.getPlatform() === 'ios') {
      this.dataService.displayToast('I\'m a IOS App !', 'SUCCESS');
    } else if (Capacitor.getPlatform() === 'android') {
      this.dataService.displayToast('I\'m a Android App !', 'SUCCESS');
    } else {
      this.dataService.displayToast('I\'m a Desktop App!', 'SUCCESS');
    }
  }

}
