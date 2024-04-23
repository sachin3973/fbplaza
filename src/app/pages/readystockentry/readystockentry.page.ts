import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonInput, IonModal, LoadingController } from '@ionic/angular';
import { PipaylibService } from 'pipaylib';
import { Distyconfig } from 'pipaylib/domain/distyconfig';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { AppdataService } from 'src/app/services/appdata.service';
import {AlertController, ToastController} from '@ionic/angular';
import { Distystaff } from 'pipaylib/domain/distystaff';
import { Distyvehicle } from 'pipaylib/domain/distyvehicle';
import { Functionresponse } from 'solace/domain/functionresponse';


@Component({
  selector: 'app-readystockentry',
  templateUrl: './readystockentry.page.html',
  styleUrls: ['./readystockentry.page.scss'],
})
export class ReadystockentryPage implements OnInit {
  @ViewChild(IonModal) modal: any;
  @ViewChild('myInput') myInput: IonInput;
  showConfirmationModal: boolean;
  invoicenumber: string;
  retailername: string;
  paidamount: number;
  invamount: number;
  strsearch: string;
  curconfig: Distyconfig;
  retailers: Distyretailer[];
  showPaymentMode: boolean;
  paymentModes: {
    title: string;
    value: string;
  }[];
  selectedPaymentMode: string;
  showRetailerEntry: boolean;
  canDismissRetailerDetailModal: boolean;
  canDismissConfirmationModal: boolean;
  retailercode: string;
  mobileno: string;
  showRetailerModal: boolean;
  processedInvoice;
  user;
  isCashSelected: boolean;
  isChequeSelected: boolean;
  isUpiSelected: boolean;
  isDeliveredSelected: boolean;
  staff: Distystaff;
  creditdays = 0;
  isLoading: boolean;
  canDismissSelectModal: boolean;
  showSelectModal: boolean;
  assignedVehicles: any[];
  selectedVehicle;
  showVehicle;
  distributor;
  isMultibrand;
  allowedBrands;
  selectedBrand;
  showBrand;
  selectedRetailer: Distyretailer;
  creditallowed = true;
  selectedVehicleid;
  routeList;
  retailerTypeList;
  showRoute;
  selectedRoute;
  showRetailerType;
  selectedRetailerType;
  page = 0;
  perPage = 20;
  paymenttyp;
  paidAmoutModal: boolean;
  partailAmount: number;
  showAllPaymentModes: boolean;
  canDismiss: boolean;
  retailerlist;
  paginationRetailerList = [];
  remark;
  lat;
  long;
  showRouteForRetailerSearch: boolean;
  selectedRouteForRetailerSearch;

  constructor(private pipaylib: PipaylibService, private dataService: AppdataService, private router: Router,
     public alertController: AlertController, public toastController: ToastController, public loadingCtrl: LoadingController) { }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this.router.navigate(['/']);
    }
  }

  ionViewWillEnter() {
    this.retailerTypeList = this.pipaylib.solace.dataService.getMasterFromMap('distyretailertype');
    this.paidamount = 0;
    this.partailAmount = null;
    this.remark = '';
    this.retailername = '';
    this.showAllPaymentModes = false;
    this.invamount = null;
    this.selectedBrand = '';
    this.distributor = this.pipaylib.loginService.loggedindistributor;
    this.isMultibrand = this.distributor.multibrand;
    this.selectedPaymentMode = '';
    this.isUpiSelected = false;
    this.isChequeSelected = false;
    this.isCashSelected = false;
    this.isDeliveredSelected = false;
    this.staff = this.pipaylib.loginService.loggedinstaff;
    this.user = this.pipaylib.loginService.loggedinstaff.name;
    this.fetchSystemConfig();
    // if (this.curconfig.invnumreadystock === 'auto') {
    //   this.getInvno();
    // } else {
    //   this.invoicenumber = '';
    // }
    if (this.curconfig?.invnumreadystock === 'manual') {
      this.invoicenumber = '';
    }
    this.getMyLocation();
    this.getAssginedVehile();
    this.fetchAllowedBrands();
    // this.getRetailerData();
    const selectedveh =
    this.dataService.globalvars.get('readystockvehicle') == null ? '' : this.dataService.globalvars.get('readystockvehicle');
    this.selectedVehicleid = selectedveh.id;
    this.selectedVehicle = selectedveh.name;
  }

  async fetchSystemConfig() {
    this.curconfig = await this.pipaylib.loginService.loggedindistributor.distyconfig;
  }

  onSelectRouteForRetailerSearch(route: any) {
    this.selectedRouteForRetailerSearch = route;
    localStorage.setItem('selectedRoute', JSON.stringify(this.selectedRouteForRetailerSearch));
    this.showRouteForRetailerSearch = false;
    this.getPaginatedRetailerList();
  }

  showRouteFoRetailerSearchOnClick = () => {
    this.showRouteForRetailerSearch = !this.showRouteForRetailerSearch;
  };

  // FEAT - Select Paid Amount Modal
  selectPartialPayment() {
    this.paymenttyp = 'partialpay';
  }

  openPaidAmountModal() {
    this.paymenttyp = 'fullpay';
    setTimeout(() => {
      this.paidAmoutModal = true;
    }, 200);
    this.partailAmount = this.partailAmount ? this.partailAmount : null;
  }

  closePaidAmountModal() {
    this.paidAmoutModal = false;
  }

  invoiceAmountLossFocus(val) {
    if (val) {
      this.showAllPaymentModes = true;
    } else {
      this.showAllPaymentModes = false;
    }
  }

  async confirmPaidAmount() {
    if (this.selectedPaymentMode !== 'Delivered') {
      if (this.paymenttyp === 'fullpay') {
        this.paidamount = this.invamount;
      }
      else {
        if (this.partailAmount < 0 || this.partailAmount == null) {
          const toast = await this.toastController.create({
            message: 'Invalid Paid Amount',
            duration: 2500,
            icon: 'checkmark-circle-outline',
            color: 'danger',
            position: 'top'
          });
          toast.present();
          this.partailAmount = null;
          return;
        } else if (this.partailAmount > this.invamount) {
          const toast = await this.toastController.create({
            message: 'Paid Amount Cannot be greater than Invoice Amount',
            duration: 2500,
            icon: 'checkmark-circle-outline',
            color: 'danger',
            position: 'top'
          });
          toast.present();
          this.partailAmount = null;
          return;
        }
        this.paidamount = this.partailAmount;
      }
    }
    this.closePaidAmountModal();
    this.openConfirmation();
  }

  selectpartail(ev) {
    if (this.paymenttyp == 'partialpay') {
      setTimeout(() => {
        this.myInput.setFocus();
      },100);
    }
  }

  async getDefaultRoute() {
    this.routeList = await this.pipaylib.solace.dataService.getMasterFromMap('distyroute');
    if(this.curconfig.defaultrouteid) {
      for (let i=0; i < this.routeList.length; i++) {
        if(this.routeList[i].id === this.curconfig.defaultrouteid) {
          this.selectedRoute = this.routeList[i];
        }
      }
    }
  }

  async getDefualtRetailerType() {
    this.retailerTypeList = this.pipaylib.solace.dataService.getMasterFromMap('distyretailertype');
    if(this.curconfig.defaultretailertypeid) {
      for (let i=0; i < this.retailerTypeList.length; i++) {
        if(this.retailerTypeList[i].id === this.curconfig.defaultretailertypeid) {
          this.selectedRetailerType = this.retailerTypeList[i];
        }
      }
    }
  }

  onSelectRoute(route: any) {
    this.selectedRoute = route;
    this.showRoute = false;
  }

  showRouteOnClick = () => {
    this.showRetailerType = false;
    this.showRoute = !this.showRoute;
  };

  onSelectRetailerType(retailerType: any) {
    this.selectedRetailerType = retailerType;
    this.showRetailerType = false;
  }

  showRetailerTypeOnClick = () => {
    this.showRoute = false;
    this.showRetailerType = !this.showRetailerType;
  };

  async getInvno() {
    const invseq = await this.pipaylib.invoiceService.getSequence('inv');
    const paddedstring = String(invseq).padStart(5, '0');
    this.invoicenumber = this.curconfig.invnumprefix + paddedstring;
    return this.invoicenumber;
  }

  async getRetcode() {
    const retseq = await this.pipaylib.invoiceService.getSequence('ret');
    const paddedstring = String(retseq).padStart(4, '0');
    this.retailercode = this.curconfig.retcodeprefix + paddedstring;
    // console.log(this.retailercode)
  }

  getRetailerData() {
    if(this.selectedRetailer){
      if(this.selectedRetailer.creditallowed && this.selectedRetailer.creditallowed.toUpperCase().indexOf('Y') >= 0){
        this.creditallowed = true;
        this.creditdays = this.selectedRetailer.creditperiod;
      } else {
        this.creditallowed = false;
        this.creditdays = 0;
      }
    }
  }

  async fetchAllowedBrands() {
    const allowedBrands = this.pipaylib.loginService.loggedinstaff.brandsallowed;
    // console.log("Allowed Brands", allowedBrands)

    const brands = await this.pipaylib.solace.dataService.getMasterFromMap('distybrand');
    // console.log('ALL BRANDS ARE', brands)
    this.allowedBrands = [];

    for(let i = 0; i < brands.length; i++) {
      for(let j = 0; j < allowedBrands.length; j++) {
        if (brands[i].id === allowedBrands[j]) {
          this.allowedBrands.push(brands[i]);
        }
      }
    }
    // console.log(this.allowedBrands)
    // this.allowedBrands = result;
  }

  getAssginedVehile() {
    this.showLoader('Fetching...');
    const vehiclearr = [];
    const vehicles = this.pipaylib.solace.dataService.getMasterFromMap('distyvehicle');
    if(this.pipaylib.loginService.loggedinstaff.vehicleviewallowed && this.pipaylib.loginService.loggedinstaff.vehicleviewallowed.length > 0){
      for (let i = 0; i < this.pipaylib.loginService.loggedinstaff.vehicleviewallowed.length; i++) {
        for (let j = 0; j < vehicles.length; j++) {
          if (this.pipaylib.loginService.loggedinstaff.vehicleviewallowed[i] == vehicles[j].id) {
            vehiclearr.push(vehicles[j]);
          }
        }
      }
      this.assignedVehicles = vehiclearr;
    }
    if (vehiclearr.length === 0) {
      this.assignedVehicles = vehicles;
    }
    this.hideLoader();
  }

  async getRetailers() {
    this.showLoader('Fetching Retailers...');
    this.retailers = await <Distyretailer[]> this.pipaylib.solace.dataService.getMasterFromMap('distyretailer');
    //console.log(">>>>>>>>>>>", this.retailers);
  }

  getPaginatedRetailerList() {
    /* Get Retailer 20 Record on page load and on search clear*/
    this.page = 0;
    this.paginationRetailerList = [];
    const retailerlist = this.pipaylib.solace.dataService.getMasterFromMap('distyretailer');
    const assignedroutes = this.pipaylib.loginService.loggedinstaff.assignedroutes;
    if (assignedroutes && assignedroutes.length > 0) {
      this.retailerlist = retailerlist.filter(item => assignedroutes.includes(item.routeid));
      if (this.selectedRouteForRetailerSearch && this.selectedRouteForRetailerSearch.name !== 'All') {
        this.retailerlist = this.retailerlist.filter(item => this.selectedRouteForRetailerSearch.id === item.routeid);
      }
      // this.paginationRetailerList = this.retailerlist.slice(0, this.perPage);
    } else {
      if (this.selectedRouteForRetailerSearch && this.selectedRouteForRetailerSearch.name !== 'All') {
        this.retailerlist = retailerlist.filter(item => this.selectedRouteForRetailerSearch.id === item.routeid);
      } else {
        this.retailerlist = retailerlist;
      }
    }
    this.paginationRetailerList = this.retailerlist.slice(0, this.perPage);
  }

  paginateArray() {
    this.page++;
    const curloaded = this.page * this.perPage;
    let invforpagination: any;
    /* on search use suggestion list */
    if (!this.strsearch) {
      invforpagination  = this.retailerlist;
    } else {
      invforpagination  = this.paginationRetailerList;
    }
    if(invforpagination && invforpagination.length > curloaded){
        const remaining = invforpagination.length - curloaded;
        if(remaining > this.perPage){
          const endindex = curloaded + this.perPage;
          return invforpagination.slice(curloaded,endindex);
        } else{
          return invforpagination.slice(curloaded,invforpagination.length);
        }
    }
  }

  onIonInfinite(event) {
    setTimeout(() => {
      const arr = this.paginateArray();
      if (arr?.length > 0)
      {
        this.paginationRetailerList = this.paginationRetailerList.concat(arr);  }
        event.target.complete();
        if (arr?.length < this.perPage) {
          event.target.disabled = true;
        }

    }, 200);
  }

  searchRetailer() {
    if (this.strsearch && this.strsearch.length >= 3) {
      const paginationRetailerList = [];
      //filtered ret list is added in search instead of master ret list
      for (const ret of this.retailerlist) {
        if (ret.retailercode.includes(this.strsearch) || ret.businessname.toLowerCase().includes(this.strsearch.toLowerCase())) {
          paginationRetailerList.push(ret);
        }
      }
      this.paginationRetailerList = [...paginationRetailerList];
    } else {
      this.getPaginatedRetailerList();
    }
  }


  confirm(retailer: Distyretailer) {
    this.selectedRetailer = retailer;
    this.retailername = this.selectedRetailer.retailercode + '-' + this.selectedRetailer.businessname;
    this.getRetailerData();
    this.modal.dismiss('confirm');
    this.showRetailerModal = false;
  }

  cancel() {
    this.modal.dismiss('confirm');
    this.strsearch = '';
    this.showRetailerModal = false;
  }

  selectPaymentMode(paymentMode: string) {
    this.selectedPaymentMode = paymentMode;
    this.showPaymentMode = false;
    switch (this.selectedPaymentMode) {
      case 'Cash':
        this.isCashSelected = true;
        this.isChequeSelected = false;
        this.isUpiSelected = false;
        this.isDeliveredSelected = false;
        this.openPaidAmountModal();
        return;
      case 'Cheque':
        this.isCashSelected = false;
        this.isChequeSelected = true;
        this.isUpiSelected = false;
        this.isDeliveredSelected = false;
        this.openPaidAmountModal();
        return;
      case 'UPI':
        this.isCashSelected = false;
        this.isChequeSelected = false;
        this.isUpiSelected = true;
        this.isDeliveredSelected = false;
        this.openPaidAmountModal();
        return;
      case 'Delivered':
        this.isCashSelected = false;
        this.isChequeSelected = false;
        this.isUpiSelected = false;
        this.isDeliveredSelected = true;
        this.openSelectModal();
        return;
    }
  }

  openPaymentModes() {
    this.showPaymentMode = !this.showPaymentMode;
  }

  async openRetailerModal() {
    const assignedroutes = this.pipaylib.loginService.loggedinstaff.assignedroutes;
    if (assignedroutes && assignedroutes.length > 0) {
      this.routeList = assignedroutes.map(item => {
        const routeName = this.pipaylib.dataService.getRouteNameforId(item);
        return {
          id: item,
          name: routeName
        };
      });
    } else {
      this.routeList = await this.pipaylib.solace.dataService.getMasterFromMap('distyroute');
    }
    // this.routeList = this.routeList.map(item => {
    //   return {
    //     id: item.id,
    //     name: item.name
    //   }
    // });
    this.routeList = [{id: 'All', name: 'All'}, ...this.routeList];
    this.selectedRouteForRetailerSearch = JSON.parse(localStorage.getItem('selectedRoute'));
    if (!this.selectedRouteForRetailerSearch) {
      this.selectedRouteForRetailerSearch = this.routeList[0];
    }
    this.getPaginatedRetailerList();
    this.strsearch = '';
    setTimeout(() => {
      this.showRetailerModal = true;
      this.hideLoader();
    }, 100);
  }

  openRetailerDetails() {
    this.getDefaultRoute();
    this.getDefualtRetailerType();

    if (this.curconfig.retcodeprefix) {
      this.getRetcode();
    } else {
      this.retailercode = '';
    }
    this.showRetailerEntry = true;
    this.showRetailerModal = false;
    this.retailercode = '';
    this.retailername = '';
    this.mobileno='';
  }

  closeRetailerDetailModal() {
    this.showRetailerEntry = false;
    this.showRetailerModal = false;
  }

  cancelRetailerDetailModal() {
    this.showRetailerEntry = false;
    this.showRetailerModal = false;
    this.retailername = '';
  }

  async addRetailer() {
    if (this.validateAddretailers()) {
      const distyretailer = <Distyretailer>{};
        distyretailer.distributorid = this.pipaylib.loginService.loggedindistributor.id;
        distyretailer.active = true;
        distyretailer.creditallowed = 'Y';
        distyretailer.creditperiod = this.pipaylib.loginService.loggedindistributor.distyconfig.defaultcreditperiod;
        distyretailer.dwpallowed = 'Y';
        distyretailer.otpfordwp = 'N';
        distyretailer.creditlimit = 0;
        distyretailer.osinvlimit = 0;
        distyretailer.rating  = 7;
        distyretailer.routesequence = '0';
        distyretailer.businessname = this.retailername;
        distyretailer.retailercode = this.retailercode;
        distyretailer.routeid = this.selectedRoute.id;
        distyretailer.mobileno = this.mobileno;
        distyretailer.retailertypeid = this.selectedRetailerType.id;
        const ret = <Functionresponse> await this.pipaylib.solace.setupService.saveEntity('distyretailer','create',distyretailer);

        if (ret.status == 'success') {
          const toast = await this.toastController.create({
            message: 'Retailer Added Successfully!',
            duration: 2500,
            icon: 'checkmark-circle-outline',
            color: 'success',
            position: 'top'
          });
          toast.present();
          this.selectedRetailer = distyretailer;
          this.retailername = this.selectedRetailer.retailercode + '-' + this.selectedRetailer.businessname;
          this.closeRetailerDetailModal();
        } else {
          const toast = await this.toastController.create({
            message: ret.errordescription,
            duration: 2500,
            icon: 'checkmark-circle-outline',
            color: 'danger',
            position: 'top'
          });
          toast.present();
          this.closeRetailerDetailModal();
          return;
        }
    }
    // console.log(this.selectedRetailer)
  }

  validateAddretailers() {
    if (isNaN(parseInt(this.mobileno))) {
      this.dataService.displayToast('Mobile Number Should Be Numeric Value','WARNING');
      return false;
    }
    const mobno = '' + this.mobileno;
    if (mobno.trim().length != 10) {
      this.dataService.displayToast('Invalid Mobile Number, Please Enter 10 digit Mobile Number.',
        'WARNING'
      );
      return false;
    }
    return true;
  }

  openConfirmation() {
    this.closeSelectModal();
    this.showConfirmationModal = true;
  }

  closeConfrimationModal() {
    this.showConfirmationModal = false;
  }

  async openSelectModal() {
    if (this.selectedPaymentMode === 'Delivered') {
      this.showSelectModal = true;
      this.paidamount = 0;
    } else {
      if (!this.paidamount) {
        const toast = await this.toastController.create({
          message: 'Please Enter the Paid Amount',
          duration: 2500,
          icon: 'checkmark-circle-outline',
          color: 'danger',
          position: 'top'
        });
        toast.present();
        return;
      } else {
        this.showSelectModal = true;
      }
      this.openConfirmation();
    }
  }

  closeSelectModal() {
    this.showSelectModal = false;
    this.showVehicle = false;
    this.showBrand = false;
  }

  showVehicleOnClick = () => {
    // this.selectedVehicle = "";
    this.showVehicle = !this.showVehicle;
    this.showBrand = false;
  };

  showBrandOnClick = () => {
    this.selectedBrand = '';
    this.showBrand = !this.showBrand;
    this.showVehicle = false;
  };

  selectVehicleOnClick(vehicle) {
    this.selectedVehicle = vehicle.name;
    this.selectedVehicleid = vehicle.id;
    this.dataService.globalvars.set('readystockvehicle',vehicle);
    setTimeout(() => {
      this.showVehicle = false;
    }, 200);
  }

  selectBrandOnClick(brand) {
    this.selectedBrand = brand;
    setTimeout(() => {
      this.showBrand = false;
    }, 200);
  }

  confirmPayment() {
    if (this.selectedPaymentMode !== 'Cash' && this.selectedPaymentMode !== 'Delivered') {
      this.confirmSettlePayment();
    } else {
      this.confirmInProcessPayment();
    }
  }

  async confirmSettlePayment() {
    let invnumber;
    if (this.curconfig.invnumreadystock === 'auto') {
      invnumber = await this.getInvno();
    } else {
      invnumber = this.invoicenumber;
    }
    this.showSelectModal = false;
    this.processedInvoice = {
      txnid: new Date().valueOf().toString(6),
      invoicenumber: invnumber,
      retailername: this.retailername,
      paidamount: this.paidamount,
      remark: this.remark,
      invamount: this.invamount,
      paymentmode: this.selectedPaymentMode,
      paidon: this.pipaylib.solace.utilService.getCurrentBusinessDate(),
      colletedby: this.user,
      brand: this.selectedBrand ? this.selectedBrand : '0',
      vehicle: this.selectedVehicleid,
      distyretailer: this.selectedRetailer,
      staff: this.staff,
      creditDays: this.creditdays,
      upivpaid:this.selectedBrand?.upivpaid
    };
    setTimeout(() => {
      this.dataService.globalvars.set('readyStockProcessedInvoice', this.processedInvoice);
      this.router.navigate(['/processreadystock']);
    }, 300);
  }

  async confirmInProcessPayment() {
    this.showLoader('Processing...');
    let invnumber;
    if (this.curconfig?.invnumreadystock === 'auto') {
      invnumber = await this.getInvno();
    } else {
      invnumber = this.invoicenumber;
    }

    this.processedInvoice = {
      txnid: new Date().valueOf().toString(6),
      invoicenumber: invnumber,
      retailername: this.retailername,
      paidamount: this.paidamount,
      paymentmode: this.selectedPaymentMode,
      paidon: this.pipaylib.solace.utilService.getCurrentBusinessDate(),
      colletedby: this.user,
      remark: this.remark,
    };
    // console.log('THIS IS PROCESSEDINVOICE', this.processedInvoice);
    const ret = await this.pipaylib.invoiceService.processReadyStockCollection(this.processedInvoice.invoicenumber, this.invamount, this.staff, this.processedInvoice.paidamount, this.selectedRetailer, this.selectedPaymentMode, '', this.processedInvoice.paidon, '', this.processedInvoice.remark, this.processedInvoice.txnid, this.creditdays,'0',this.selectedVehicleid,this.lat, this.long);
    if (ret.status === 'success') {
      this.dataService.globalvars.set('readyStockProcessedInvoice', this.processedInvoice);
      if (this.selectedPaymentMode === 'Cash') {
        const toast = await this.toastController.create({
          message: 'Payment Successful!',
          duration: 2500,
          icon: 'checkmark-circle-outline',
          color: 'success',
          position: 'top'
        });
        toast.present();
      } else {
        const toast = await this.toastController.create({
          message: 'Delivery Successful!',
          duration: 2500,
          icon: 'checkmark-circle-outline',
          color: 'success',
          position: 'top'
        });
        toast.present();
      }
      this.hideLoader();
      this.router.navigate(['/completereadystock']);
    } else{
      const toast = await this.toastController.create({
        message: ret.errordescription,
        duration: 2500,
        icon: 'checkmark-circle-outline',
        color: 'danger',
        position: 'top'
      });
      toast.present();
      this.hideLoader();
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
            });
          }
        });
      })
      .catch((e) => {
        this.isLoading = false;
        //console.log(e);
      });
  }

  async confirmDialog(headerstr, messagestr, buttonstr) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-alert',
      header: headerstr,
      message: messagestr,
      mode: 'ios',
      buttons: [
        {
          cssClass: 'alertButtonN',
          text: 'Cancel',
          role: 'Cancel',
        },
        {
          cssClass: 'alertButtonY',
          text: buttonstr,
          role: 'Okay',
        },
      ],
    });
    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === 'Okay') {
      return true;
    } else {
      return false;
    }
  }

  async confirmAddretailer() {
    const headerstr = 'Add Retailer';
    const messagestr = 'Do you want to Add New Retailer?';

    const isconfirmed = await this.confirmDialog(
      headerstr,
      messagestr,
      'Add'
    );

    if (isconfirmed) {
     this.addRetailer();
    }
  }

  getMyLocation() {
    navigator.geolocation.getCurrentPosition(pos => {
      this.long = +pos.coords.longitude;
      this.lat = +pos.coords.latitude;
    });
  }

}
