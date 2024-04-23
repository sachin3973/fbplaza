import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonModal,
  LoadingController,
  ModalController,
  PopoverController,
  ToastController,
} from '@ionic/angular';
import { PipaylibService } from 'pipaylib';
import { Distyconfig } from 'pipaylib/domain/distyconfig';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { Distyretailertype } from 'pipaylib/domain/distyretailertype';
import { Distywarehouse } from 'pipaylib/domain/distywarehouse';
import { Distyproduct } from 'pipaylib/domain/distyproduct';
import { Distyproductgroup } from 'pipaylib/domain/distyproductgroup';
import { AppdataService } from 'src/app/services/appdata.service';
import { Functionresponse } from 'solace/domain/functionresponse';
import { Geolocation } from '@capacitor/geolocation';
import { Invoice } from 'pipaylib/domain/invoice';
import { Distystaff } from 'pipaylib/domain/distystaff';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { environment } from '../../../environments/environment.prod';
import { PopoverComponent } from 'src/app/components/popover/popover.component';
import { Cart } from 'pipaylib/domain/cart';
import { Cartitem } from 'pipaylib/domain/cartitem';
import { Varientquantity } from 'pipaylib/domain/varientquantity';
import { cloneDeep } from 'lodash';
import { ImagepreviewPage } from 'src/app/pages/imagepreview/imagepreview.page';

@Component({
  selector: 'app-requisition',
  templateUrl: './requisition.page.html',
  styleUrls: ['./requisition.page.scss'],
})
export class RequisitionPage implements OnInit {
  @ViewChild('addressInput') addressInput: ElementRef;  
  static invoicePageInstance: RequisitionPage;
  @ViewChild(IonModal) modal: any;
  isImageUpload: boolean;
  enableimagebutton: boolean;
  imageurl: string;
  retailername: string;
  page = 0;
  perPage = 20;
  strsearch: string;
  showRetailerModal: boolean;
  isLoading: boolean;
  paginationRetailerList = [];
  retailerlist: Distyretailer[];
  curconfig: Distyconfig;
  selectedRetailer: Distyretailer;
  creditallowed = true;
  creditdays = 0;
  retailercode: string;
  routeList;
  selectedRoute;
  retailerTypeList;
  selectedRetailerType;
  showRetailerEntry: boolean;
  mobileno: string;
  showConfirmationModal: boolean;
  showLedgerModal: boolean;
  showRoute;
  showRetailerType;
  selectedProducts: any = [];
  productsList: Distyproduct[];
  prodgrpList: Distyproductgroup[] | any;
  showProductModal: boolean;
  paginationProductList: Distyproduct[];
  selectedPrice: number;
  totalAmount: number;
  selectedGroup: Distyproductgroup;
  selectedradio;
  lat;
  long;
  showProductGroup: boolean;
  //** WAREHOUSE CHANGES */
  showwh: boolean;
  whlist: Distywarehouse[];
  isCartEmpty = true;
  showConfirmationModalForBack: boolean;
  canDismissConfirmationModal: boolean;
  isConfirmed: boolean;
  showPreviousOrderModal: boolean;
  canDismissShowPreviousModal: boolean;
  canDismissLedgerModal: boolean;
  orderList: any[];
  fromDate: string;
  toDate: string;
  showEditPriceModal: boolean;
  showApplyDiscountModal: boolean;
  canDismissEditPriceModal: boolean;
  canDismissApplyDiscountModal: boolean;
  selectedProductForPriceEdit: any;
  pendinginvoices: Invoice[] = [];
  pendingInvAmount: number;
  showInvoiceModal: boolean;
  showRouteForRetailerSearch: boolean;
  selectedRouteForRetailerSearch;
  failureCharges;
  newrate;
  staff: Distystaff;
  ledgers: any = [];
  discount: any;
  gstinno: string;
  businessname: string;
  captureImage: boolean;
  retAddress;
  confirmationOrderModal: boolean;
  retailerAddress;
  selectedProductForDiscount: any;
  paymentModal: boolean;
  coords: any; 
  frequentOrderProduct: any = [];
  sortedProducts: any = [];
  showOffersModal: boolean;
  schemes: any[] = [];
  moreString: string;
  discountItems: any[];
  showVarientModal: boolean;
  selectedProductForVarient: Distyproduct;
  netQuantity: number;
  selectedProductVarientList: Varientquantity[];
  inCartVarientQty: Varientquantity[];
  outOfStockProducts: any[] = [];
  noselectretailer: boolean;
  discountType;
  showAddressModal: boolean;
  selectedGroupForCatalogues: string[];
  isGroupAdded: boolean;
  editNumber: boolean;
  sendCatalogueMobileNo: string;
  productAddedRate: number;
  eachProductRate: number;
  showMarkVisitModal: boolean;
  addressline: string;
  landmark: any;
  pincode: string;
  cityname: string;
  cityId: string;

  constructor(
    public pipaylib: PipaylibService,
    private dataService: AppdataService,
    private router: Router,
    public alertController: AlertController,
    public toastController: ToastController,
    public loadingCtrl: LoadingController,
    private popoverController: PopoverController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this.router.navigate(['/']);
    }
    this.dataService.globalvars.set('fromRequisition', false);
    this.totalAmount = 0;
  }

  ionViewWillEnter() {
    this.discountType = 'percent';
    this.selectedRetailer = {} as Distyretailer;
    this.selectedProducts = [];
    this.retailername = '';
    this.setprodgrplist() 
    this.staff = this.pipaylib.loginService.loggedinstaff as Distystaff;
    this.retailerTypeList = this.pipaylib.solace.dataService.getMasterFromMap('distyretailertype');
    this.failureCharges = this.dataService.globalvars.get('failurecharges');
    this.curconfig = this.dataService.globalvars.get('distyconfig');
    if (this.dataService.globalvars.get('orderforedit')) {
      this.showLoader('Loading Cart...');
      this.noselectretailer = true;
      const editorder = this.dataService.globalvars.get('orderforedit');
      this.pipaylib.orderService.openForEdit(editorder);
      this.selectedProducts = this.pipaylib.orderService.curOrder.cart.items;
      this.selectedRetailer = this.getRetailerForId(editorder.distyretailercode);
      this.retailername =  this.selectedRetailer.retailercode +  '-' +   this.selectedRetailer.businessname;
      this.getRetailerData();
      this.getretaileradd();
      this.getPendinginvoices(this.selectedRetailer);
      this.dataService.globalvars.set('selectedRetailer', this.selectedRetailer);
      this.dataService.globalvars.delete('orderforedit');
      this.hideLoader();
    } else {
      this.noselectretailer = false;
      if (this.pipaylib.orderService.curOrder) {
        this.pipaylib.orderService.curOrder.cart = {} as Cart;
      }
      this.pipaylib.orderService.initCart();
      this.pipaylib.orderService.curOrder.remarks = '';
      this.selectedRetailer = this.dataService.globalvars.get('selectedRetailer');
      if (this.selectedRetailer) {
        this.getPendinginvoices(this.selectedRetailer);
      }
      this.pendinginvoices = [];
    }
    if (this.curconfig.geotagfororder) {
      this.getMyLocation();
    }
  }

  openMarkvisitModal() {
    this.showMarkVisitModal = true;
  }

  calculateProductAmount(product: Distyproduct) {
    product.rateincart = product.primaryunitrate * product['billedquantity'];
  }

  async openPreview() {
    const img = 'https://s3.ap-south-1.amazonaws.com/foodkartiposimages/1708347861247.png'
    const modal = await this.modalCtrl.create({
      component: ImagepreviewPage,
      componentProps: {
        img,
      },
      cssClass: 'transaparent-modal',
    });
    modal.present();
  }

  async confirmMarkVist() {
    const resp = await this.pipaylib.orderService.createVisitOnlyEntry(this.lat, this.long);
    if (resp.status === 'success') {
      this.toastController.create({
        icon: 'check-circle-outline',
        color: 'success',
        position: 'top',
        message: 'Successfully marked visit',
        duration: 1500
      }).then(toast => toast.present());
      this.retailername = null;
    } else {
        this.toastController.create({
        icon: 'alert-circle-outline',
        color: 'danger',
        position: 'top',
        message: resp.errordescription,
        duration: 1500
      }).then(toast => toast.present());
    }
  }

  closeMarkVisitModal() {
    this.showMarkVisitModal = false;
  }

  // Varient Modal
  openVarientModal(product: Distyproduct) {
    // this.cancelProduct();
    this.showProductModal = false;
    // this.strsearch = '';
    this.selectedProductForVarient = product;
    if (product.qtyincart === 0) {
      this.inCartVarientQty = [];
      this.selectedProductForVarient.varientqty = [];
    }
    if (this.inCartVarientQty && this.inCartVarientQty.length > 0) {
      this.selectedProductForVarient.varientqty = cloneDeep(this.inCartVarientQty);
    }
    console.log(this.selectedProductForVarient.varientqty);
    if (this.selectedProductForVarient.varientqty && this.selectedProductForVarient.varientqty.length === 0) {
      this.selectedProductForVarient.varientqty = this.selectedProductForVarient.varientlist.split(',').map(item =>{
        item = item.trim();
        return {
          varient: item,
          quantity: 0,
        };
      });
    }
    console.log('array added' + JSON.stringify(this.selectedProductForVarient.varientqty));
    setTimeout(() => {
      this.showVarientModal = true;
    }, 200);
  }

  submitVarient() {
    this.hideVarientModal();
    this.pipaylib.orderService.setVarientQuantity(this.selectedProductForVarient.id, this.selectedProductForVarient.varientqty);
    // this.inCartVarientQty = cloneDeep(this.selectedProductForVarient.varientqty);
    this.inCartVarientQty = this.selectedProductForVarient.varientqty;
    this.netQuantity = this.calculateNetQty(this.selectedProductForVarient.varientqty);
    this.selectedProductForVarient.qtyincart = this.netQuantity;
  }

  calculateNetQty(arr: Varientquantity[]) {
    return arr.reduce((acc, item) => acc + item.quantity, 0);
  }

  incrementVarientQuantity(varient: Varientquantity) {
    if (varient.quantity >= 0) {
      varient.quantity += 1;
    }
  }

  decrementVarientQuantity(varient: Varientquantity) {
    if (varient.quantity > 0) {
      varient.quantity -= 1;
    } else {
      varient.quantity = 0;
    }
  }

  hideVarientModal() {
    this.selectedProductForVarient.qtyincart = this.netQuantity;
    this.showVarientModal = false;
    setTimeout(() => {
      this.showProductModal = true;
    }, 200);
  }

  // Offers Modal logic

  openOffersModal() {
    this.showOffersModal = true;
    this.getSchemes();
  }

  closeOffersModal() {
    this.showOffersModal = false;
  }

  // Addresss Modal Logic
  openAddressModal() {
    this.addressline = this.retailerAddress;
    this.landmark = '';
    this.showAddressModal = true;
  }

  closeAddressModal() {
    this.showAddressModal = false;
  }

  handleAddressChange(address: any) {     
    this.landmark = this.addressInput.nativeElement;
    this.extractAddressInfo(address);
  }

  saveAddress() {
    this.showLoader('Saving address');
    this.retailerAddress = this.addressline + ','+ this.landmark + ','+ this.cityname + ',' + this.pincode;
    setTimeout(() => {
      this.hideLoader();
      this.showAddressModal = false;
    }, 1000)
  }

  async extractAddressInfo(details: any) {
    for (var comp of details.address_components) {   
      if (comp.types) {
        switch(comp.types[0]) {
          case 'postal_code':
            this.pincode = comp.long_name;
            break;
          case 'sublocality_level_2':
            this.landmark = comp.short_name;
            break;
          case 'locality':
            this.cityname = comp.long_name;
            if(this.pipaylib.solace.dataService.getMasterFromMap('city').includes(this.cityname)){
              this.cityId = this.pipaylib.solace.dataService.getMasterFromMap('city').filter(item => item.name === this.cityname)[0];
            }
            break;
        }
      }
    }
    this.landmark = details.formatted_address;
    var strloc = JSON.stringify(details.geometry);
    var objLat = JSON.parse(strloc);
    this.lat = objLat.location.lat;
    this.long = objLat.location.lng;
  }

  checkAllSelected() {
    const prodgrpList = this.pipaylib.solace.dataService.getMasterFromMap('distyproductgroup');
    const allGroupsIndex = this.selectedGroupForCatalogues.indexOf('All groups');
    const allSelected = allGroupsIndex > -1;
    const nonAllGroupsCount = prodgrpList.length - (allSelected ? 1 : 0);
    if (allSelected) {
      this.selectedGroupForCatalogues.length = 0;
      for (const group of prodgrpList) {
        this.selectedGroupForCatalogues.push(group.name);
      }
    } else if (this.selectedGroupForCatalogues.length === nonAllGroupsCount) {
      this.selectedGroupForCatalogues.push('All groups');
    } else {
      if (allGroupsIndex > -1) {
        this.selectedGroupForCatalogues.splice(allGroupsIndex, 1);
      }
    }
  }


  async getSchemes() {
    // this.dataService.simpleLoader('Fetching Offers...');
    this.schemes = await this.pipaylib.orderService.getSchemesApplForRetailer(
      this.selectedRetailer
    );
    // this.dataService.dismissLoader();
  }

  async presentPopover(e: Event, items: any[]) {
    this.dataService.globalvars.set('discountOptions', items);
    this.discountItems = items;
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: e,
      cssClass: 'custom-popover',
    });

    await popover.present();

    const { role } = await popover.onDidDismiss();
  }

  formatAppliedArray(array: any[]): string {
    this.moreString = '';
    if (array && Array.isArray(array)) {
      const convertedArray = array.map((item) => item);
      if (convertedArray.length > 3) {
        const newArr = convertedArray.slice(0, 3).join(', ');
        this.moreString = `${convertedArray.length - 3} more`;
        return newArr;
      }
      return convertedArray.join(', ');
    } else {
      return '';
    }
  }

  showCaptureImage() {}

  // Capture Image Logic

  async takePicture() {
    if (this.curconfig.geotagfororder) {
      this.getMyLocation();
    }
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
    const ret = await this.pipaylib.solace.utilService.uploadFiletoS3(
      imageFile,
      strfile,
      'foodkartiposimages'
    );
    //console.log(ret )
    if (ret) {
      //console.log('IS UPLOADED!!')
      this.isImageUpload = true;
      const strurl =
        'https://s3.ap-south-1.amazonaws.com/foodkartiposimages/' + strfile;
      this.imageurl = strurl;
      //console.log(this.lat)
      if (this.lat && this.long) {
        this.enableimagebutton = true;
      }
      this.reverseGeocode(this.lat, this.long);
    }
  }

  async resizeAndPostImage(imageFile: any) {
    const img = new Image();
    img.src = imageFile.dataUrl;
    RequisitionPage.invoicePageInstance = this;

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
      RequisitionPage.invoicePageInstance.updloadImageToS3(newdataURI);
    };
  }

  async selectPaymentMode(item) {
    this.dataService.globalvars.set('selectedinvoice', item);
    const key = {
      distributorid: '' + this.pipaylib.loginService.loggedindistributor.id,
      id: '' + item.distyretailerid,
    };
    const tablename =
      this.pipaylib.solace.utilService.getTableName('distyretailer');
    const distyretailer = (await this.pipaylib.solace.dbLib.getItem(
      tablename,
      key
    )) as Distyretailer;
    this.dataService.globalvars.set('selectedretailer', distyretailer);
    this.dataService.globalvars.set('fromRequisition', true);
    if (
      (this.curconfig.capturegeotag && !distyretailer.geotagdone) ||
      (this.curconfig.capturefssai && !distyretailer.fssaiavailable)
    ) {
      this.showInvoiceModal = false;
      setTimeout(() => {
        this.router.navigate(['captureshopimage']);
      }, 300);
    } // Add a semicolon here
    else {
      this.showInvoiceModal = false;
      setTimeout(() => {
        this.router.navigate(['/paymentmode']);
      }, 300);
    }
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

  openOutstandingInvoices() {
    this.showInvoiceModal = true;
  }

  closeInvoiceModal() {
    this.showInvoiceModal = false;
  }

  getMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      this.long = +pos.coords.longitude;
      this.lat = +pos.coords.latitude;
      this.coords = pos.coords;
    });
  }

  setprodgrplist() {
    this.prodgrpList = [];
    this.prodgrpList =
      this.pipaylib.solace.dataService.getMasterFromMap('distyproductgroup') as Distyproduct[];
  }

  setWhlist() {
    this.prodgrpList = [];
    this.prodgrpList =
      this.pipaylib.solace.dataService.getMasterFromMap('distyproductgroup') as Distyproduct[];
  }



  onRadioChange(prod, ev) {
    if (prod.primaryunit === ev.detail.value) {
      prod.uomincart = prod.primaryunit;
      this.pipaylib.orderService.setRateForUOM(prod);
    } else if (prod.alternateunit1 === ev.detail.value) {
      prod.uomincart = prod.alternateunit1;
      this.pipaylib.orderService.setRateForUOM(prod);
    } else if (prod.alternateunit2 === ev.detail.value) {
      prod.uomincart = prod.alternateunit2;
      this.pipaylib.orderService.setRateForUOM(prod);
    }
  }

  async openProductModal() {
    this.strsearch = '';
    let assignedproductgroups = this.pipaylib.loginService.loggedinstaff.assignedprodgroups;
    if(!assignedproductgroups) {assignedproductgroups =[];}

    let rettypegroups = [];
    if(this.selectedRetailer){
        const rettype = this.getSelectedRetailerType();
        console.log('RETAILER TPYE ' + JSON.stringify(rettype));
        if(rettype && rettype.assignedprodgroups) {rettypegroups = rettype.assignedprodgroups;}
    }



    if ((assignedproductgroups && assignedproductgroups.length > 0) ||  (rettypegroups && rettypegroups.length > 0)) {

      if(assignedproductgroups && assignedproductgroups.length > 0){
        this.prodgrpList = this.prodgrpList.filter((eachProductGroup) =>
            assignedproductgroups.some((item) => item === eachProductGroup.id)
        );
      }

      if(rettypegroups && rettypegroups.length > 0){
        this.prodgrpList = this.prodgrpList.filter((eachProductGroup) =>
        rettypegroups.some((item) => item === eachProductGroup.id)
        );
      }

    } else {
      this.prodgrpList =
        await this.pipaylib.solace.dataService.getMasterFromMap(
          'distyproductgroup'
        );
    }
    this.prodgrpList = [{ id: '0', name: 'All groups' }, ...this.prodgrpList];
    this.selectedGroup = this.prodgrpList[0];
    this.getPaginatedProductList();
    setTimeout(() => {
      this.showProductModal = true;
      this.hideLoader();
    }, 100);
  }

  cancelProduct() {
    this.showProductModal = false;
    this.strsearch = '';
    this.pipaylib.orderService.handleBackOnCart();
  }


  incrementQuantity(product) {
    if (product.qtyincart >= 0) {
      product.qtyincart += 1;
    }
  }

  decrementQuantity(product) {
    if (product.qtyincart > 0) {
      product.qtyincart -= 1;
    } else {
      product.qtyincart = 0;
    }
  }

  searchProduct() {
    this.paginationProductList = [];
    const retlist = this.pipaylib.orderService.searchProduct(this.productsList, this.strsearch);
    if (retlist) {
      this.paginationProductList = retlist;
      this.paginationProductList = [...this.paginationProductList];
    } else {
      this.getPaginatedProductList();
    };
  }

  /*** Commented bcos getting all prdcts  ***/

  // async getPaginatedProductList() {
  //   /* Get Retailer 20 Record on page load and on search clear*/
  //   this.page = 0;
  //   this.paginationProductList = [];
  //   const productsList = await this.pipaylib.dataService.getDistyProducts();
  //   this.productsList = this.filterProducts(
  //     this.selectedGroup.id,
  //     productsList
  //   );
  //   this.paginationProductList = this.productsList.slice(0, this.perPage);
  //   for (const prod of this.paginationProductList) {
  //     this.pipaylib.orderService.setRateForUOM(prod);
  //   }
  // }

  async getPaginatedProductList() {
    /* Get Product 20 Record on page load and on search clear*/
    this.page = 0;
    this.paginationProductList = [];
    const productsList = await this.pipaylib.dataService.getDistyProducts(this.curconfig.prodsortby)
    .filter(item => !item.inactive);
    const assignedproductgroups =
      this.pipaylib.loginService.loggedinstaff.assignedprodgroups;
    if (assignedproductgroups && assignedproductgroups.length > 0) {
      this.productsList = productsList.filter((product) =>
        assignedproductgroups.includes(product.productgroupid)
      );
      if (this.selectedGroup && this.selectedGroup.name !== 'All groups') {
        this.productsList = this.productsList.filter(
          (product) => this.selectedGroup.id === product.productgroupid
        );
      }
    } else {
      if (this.selectedGroup && this.selectedGroup.name !== 'All groups') {
        this.productsList = productsList.filter(
          (product) => this.selectedGroup.id === product.productgroupid
        );
      } else {
        this.productsList = productsList;
      }
    }
    this.paginationProductList = this.productsList.slice(0, this.perPage);
    for (const prod of this.paginationProductList) {
      this.pipaylib.orderService.setRateForUOM(prod);
      console.log('|LIVESTOCK|IN REQ PAGE | PROD| ' +prod.name + '|LSTK' + prod.lstk);
    }
  }

  filterProducts(selectedGroup, prdlist) {
    if (selectedGroup === '0') {
      return prdlist;
    } else {
      return prdlist.filter(
        (product) => product.productgroupid === selectedGroup
      );
    }
  }

  paginateProductArray() {
    this.page++;
    const curloaded = this.page * this.perPage;
    let invforpagination: any;
    /* on search use suggestion list */
    if (!this.strsearch) {
      invforpagination = this.productsList;
    } else {
      invforpagination = this.paginationProductList;
    }
    if (invforpagination && invforpagination.length > curloaded) {
      const remaining = invforpagination.length - curloaded;
      if (remaining > this.perPage) {
        const endindex = curloaded + this.perPage;
        return invforpagination.slice(curloaded, endindex);
      } else {
        return invforpagination.slice(curloaded, invforpagination.length);
      }
    }
  }

  onIonInfiniteProduct(event) {
    setTimeout(() => {
      const arr = this.paginateProductArray();
      if (arr?.length > 0) {
        this.paginationProductList = this.paginationProductList.concat(arr);
      }
      event.target.complete();
      if (arr?.length < this.perPage) {
        event.target.disabled = true;
      }
    }, 200);
  }

  deleteSelectedProduct(product) {
    this.pipaylib.orderService.removeItemForCart(product.productid);
  }

  async showConfirmationOrder() {
    let orderList = [];
    const distyid = this.pipaylib.loginService.loggedindistributor.id;
    orderList = await this.pipaylib.orderService.getOrdersOnRetailerId(
      distyid,
      this.selectedRetailer.id
    );
    this.frequentOrderProduct = this.frequentlyOrderedProduct(orderList, 5);
    this.pipaylib.orderService.curOrder.vchtype = '';
    this.confirmationOrderModal = true;
    this.selectedProductForVarient = null;
    this.selectedProductVarientList = [];
    this.netQuantity = 0;
    this.getOutOfStockProducts();
  }

  async getOutOfStockProducts() {
    const productsList = await this.pipaylib.dataService.getDistyProducts(this.curconfig.prodsortby);
    this.outOfStockProducts = [];

    // Loop through cart array
    this.pipaylib.orderService.curOrder.cart.items.forEach(cartItem => {
    // Find the corresponding product in the product master array
    const product = productsList.find(p => p.id === cartItem.productid);

    // Check if product exists and if billed quantity is greater than current stock
    if (product && cartItem.billedquantity > product.currentstock) {
      this.outOfStockProducts.push({
        productId: cartItem.productid,
        productName: cartItem.productname,
        billedQuantity: cartItem.billedquantity,
        currentStock: product.currentstock
      });
    }
  });
    // Output out of stock products
    console.log('Out of stock products:', JSON.stringify(this.outOfStockProducts));
  }

  showPaymentModal() {
    this.paymentModal = true;
  }

  receiveConfirmation(data: {
    modalVisibilty: boolean;
    confirmed?: boolean;
    isPaid?: boolean;
  }) {
    if (data.confirmed) {
      // this.saveRequisition();
    } else if (data.isPaid) {
      this.selectedProducts = [];
      this.retailerAddress = '';
      this.selectedRetailer = {} as Distyretailer;
      this.retailername = '';
      this.confirmationOrderModal = false;
    } else {
      this.confirmationOrderModal = data.modalVisibilty;
    }
  }
  convertoFloat(lstr: string){
    return parseFloat(lstr);
  }
  checkNum(lnum){
    return !isNaN(lnum);
  }

  submitProducts() {
    if (this.curconfig.geotagfororder) {
      this.getMyLocation();
    }
    this.showProductModal = false;
    this.pipaylib.orderService.addProductsToCart();
    this.selectedProducts = this.pipaylib.orderService.curOrder.cart.items;
    this.dataService.globalvars.set('retailerForReqPayment',this.selectedRetailer);
    // this.isCartEmpty = this.selectedProducts.length === 0;
    // this.dataService.globalvars.set('isEmpty', this.selectedProducts.length === 0);
    // this.totalAmount = this.selectedProducts.reduce((acc, item) => acc + item.itemamount, 0);
  }

  /*async saveRequisition(paymentObject?: Payment) {
    this.showLoader('Processing...');
    if (this.curconfig.geotagfororder) {
      if (!this.lat && !this.long) {
        const toast = await this.toastController.create({
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

    if (true) {

    }

    const request = await this.pipaylib.orderService.placeOrder(
      this.lat,
      this.long
    );

    if (request.status === 'success') {
      const toast = await this.toastController.create({
        message: 'Requisition Successfully Added!',
        duration: 1500,
        icon: 'checkmark-circle-outline',
        color: 'success',
        position: 'top',
      });
      setTimeout(() => {
        this.hideLoader();
        toast.present();
        this.selectedProducts = [];
        this.retailername = '';
      }, 1000);
    } else {
      const toast = await this.toastController.create({
        message: request.errordescription,
        duration: 1500,
        icon: 'alert-circle-outline',
        color: 'danger',
        position: 'top',
      });
      setTimeout(() => {
        this.hideLoader();
        toast.present();
      }, 1000);
    }
  }*/

  async openRetailerModal() {
    const assignedroutes =
      this.pipaylib.loginService.loggedinstaff.assignedroutes;
    if (assignedroutes && assignedroutes.length > 0) {
      this.routeList = assignedroutes.map((item) => {
        const routeName = this.pipaylib.dataService.getRouteNameforId(item);
        return {
          id: item,
          name: routeName,
        };
      });
    } else {
      this.routeList = await this.pipaylib.solace.dataService.getMasterFromMap(
        'distyroute'
      );
    }
    // this.routeList = this.routeList.map(item => {
    //   return {
    //     id: item.id,
    //     name: item.name
    //   }
    // });
    this.routeList = [{ id: 'All', name: 'All' }, ...this.routeList];
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

  //allretailerlist : Distyretailer[];

  getPaginatedRetailerList() {
    /* Get Retailer 20 Record on page load and on search clear*/
    this.page = 0;
    this.paginationRetailerList = [];
    const retailerlist =
      this.pipaylib.solace.dataService.getMasterFromMap('distyretailer');
    //this.allretailerlist = retailerlist;

    const assignedroutes =
      this.pipaylib.loginService.loggedinstaff.assignedroutes;
    if (assignedroutes && assignedroutes.length > 0) {
      this.retailerlist = retailerlist.filter((item) =>
        assignedroutes.includes(item.routeid)
      );
      if (
        this.selectedRouteForRetailerSearch &&
        this.selectedRouteForRetailerSearch.name !== 'All'
      ) {
        this.retailerlist = this.retailerlist.filter(
          (item) => this.selectedRouteForRetailerSearch.id === item.routeid
        );
      }
      // this.paginationRetailerList = this.retailerlist.slice(0, this.perPage);
    } else {
      if (
        this.selectedRouteForRetailerSearch &&
        this.selectedRouteForRetailerSearch.name !== 'All'
      ) {
        this.retailerlist = retailerlist.filter(
          (item) => this.selectedRouteForRetailerSearch.id === item.routeid
        );
      } else {
        this.retailerlist = retailerlist;
      }
    }
    this.paginationRetailerList = this.retailerlist.slice(0, this.perPage);
  }

  paginateArrayForRetailer() {
    this.page++;
    const curloaded = this.page * this.perPage;
    let invforpagination: any;
    /* on search use suggestion list */
    if (!this.strsearch) {
      invforpagination = this.retailerlist;
    } else {
      invforpagination = this.paginationRetailerList;
    }
    if (invforpagination && invforpagination.length > curloaded) {
      const remaining = invforpagination.length - curloaded;
      if (remaining > this.perPage) {
        const endindex = curloaded + this.perPage;
        return invforpagination.slice(curloaded, endindex);
      } else {
        return invforpagination.slice(curloaded, invforpagination.length);
      }
    }
  }

  paginateArrayForProduct() {
    this.page++;
    const curloaded = this.page * this.perPage;
    let invforpagination: any;
    /* on search use suggestion list */
    if (!this.strsearch) {
      invforpagination = this.productsList;
    } else {
      invforpagination = this.page;
    }
    if (invforpagination && invforpagination.length > curloaded) {
      const remaining = invforpagination.length - curloaded;
      if (remaining > this.perPage) {
        const endindex = curloaded + this.perPage;
        return invforpagination.slice(curloaded, endindex);
      } else {
        return invforpagination.slice(curloaded, invforpagination.length);
      }
    }
  }

  onIonInfinite(event) {
    setTimeout(() => {
      const arr = this.paginateArrayForRetailer();
      if (arr?.length > 0) {
        this.paginationRetailerList = this.paginationRetailerList.concat(arr);
      }
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
        if (
          ret.retailercode.includes(this.strsearch) ||
          ret.businessname.toLowerCase().includes(this.strsearch.toLowerCase())
        ) {
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
    //this.pipaylib.orderService.setRetailer(retailer);
    //this.pipaylib.orderService.curOrder.distyretailerid =
    //this.selectedRetailer.id;
    this.retailername = this.selectedRetailer.retailercode + '-' + this.selectedRetailer.businessname;
    this.getRetailerData();
    this.getretaileradd();
    this.modal.dismiss('confirm');
    this.getPendinginvoices(this.selectedRetailer);
    this.dataService.globalvars.set('selectedRetailer', this.selectedRetailer);
    this.showRetailerModal = false;
    this.getMyLocation();
  }

  async getretaileradd() {
    const distyid = this.pipaylib.loginService.loggedindistributor.id;
    const ret: any = await this.pipaylib.dataService.getLiveRetailerForId(
      this.selectedRetailer.id,
      distyid
    );
    //console.log(JSON.stringify(ret))
    this.pipaylib.orderService.setRetailer(ret);
    this.selectedRetailer = ret;

    const addressLine1 = ret.addressline1 || '';
    const addressLine2 = ret.addressline2 || '';
    this.retailerAddress = `${addressLine1} ${addressLine2}`.trim();
  }

  getRetailerData() {
    if (this.selectedRetailer) {
      if (
        this.selectedRetailer.creditallowed &&
        this.selectedRetailer.creditallowed.toUpperCase().indexOf('Y') >= 0
      ) {
        this.creditallowed = true;
        this.creditdays = this.selectedRetailer.creditperiod;
      } else {
        this.creditallowed = false;
        this.creditdays = 0;
      }
    }
  }

  cancel() {
    this.modal.dismiss('confirm');
    this.strsearch = '';
    this.showRetailerModal = false;
  }

  async getDefaultRoute() {
    this.routeList = await this.pipaylib.solace.dataService.getMasterFromMap(
      'distyroute'
    );
    if (this.curconfig.defaultrouteid) {
      for (const route of this.routeList) {
        if (route.id === this.curconfig.defaultrouteid) {
          this.selectedRoute = route;
        }
      }
    }
  }

  async getDefualtRetailerType() {
    this.retailerTypeList =
      this.pipaylib.solace.dataService.getMasterFromMap('distyretailertype');
    if (this.curconfig.defaultretailertypeid) {
      for (const retailerType of this.retailerTypeList) {
        if (retailerType.id === this.curconfig.defaultretailertypeid) {
          this.selectedRetailerType = retailerType;
        }
      }
    }
  }

  getSelectedRetailerType(): Distyretailertype{

    const typelist = this.pipaylib.solace.dataService.getMasterFromMap('distyretailertype');
    for (const retailerType of typelist) {
      console.log('Retailer ' + JSON.stringify(this.selectedRetailer));
      if (retailerType.id === this.selectedRetailer.retailertypeid) {
        //this.selectedRetailerType = retailerType;
        return retailerType;
      }
    }
    return null;

  }


  openRetailerDetails() {
    this.getDefaultRoute();
    this.getDefualtRetailerType();
    this.captureImage = false;
    this.emptyRetailerForm();
    // if (this.curconfig.retcodeprefix) {
    //   this.getRetcode();
    // } else {
    //   this.retailercode = '';
    // }
    this.showRetailerEntry = true;
    this.showRetailerModal = false;
  }

  emptyRetailerForm() {
    this.retailercode = '';
    this.retailername = '';
    this.mobileno = '';
    this.gstinno = '';
    this.businessname = '';
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

  async getRetcode() {
    const retseq = await this.pipaylib.invoiceService.getSequence('ret');
    const paddedstring = String(retseq).padStart(4, '0');
    this.retailercode = 'S' + this.curconfig.retailercodeprefix + paddedstring;
  }

  async getLocation() {
    console.log('GETTING LOC');

    if (navigator.geolocation) {
      console.log('GETTING LOC 1');

      const position = await Geolocation.getCurrentPosition();
      console.log('GETTING LOC 2');

      this.lat = position.coords.latitude.toString();
      this.long = position.coords.longitude.toString();
      console.log('LAT ' + this.lat + ', LONG ' + this.long);
      //const accuracy = position.coords.accuracy;
      //const altaccuracy  = position.coords.altitudeAccuracy;
    }
  }

  async addRetailer() {
    if (this.validateAddretailers()) {
      await this.getRetcode();
      const distyretailer = {} as Distyretailer;
      distyretailer.distributorid =
        this.pipaylib.loginService.loggedindistributor.id;
      distyretailer.active = true;
      distyretailer.creditallowed = 'Y';
      distyretailer.creditperiod =
        this.pipaylib.loginService.loggedindistributor.distyconfig.defaultcreditperiod;
      distyretailer.dwpallowed = 'Y';
      distyretailer.latitude = this.lat;
      distyretailer.longitude = this.long;
      distyretailer.otpfordwp = 'N';
      distyretailer.creditlimit = 0;
      distyretailer.osinvlimit = 0;
      distyretailer.rating = 7;
      distyretailer.routesequence = '0';
      distyretailer.contactpersonname = this.retailername;
      distyretailer.retailercode = this.retailercode;
      distyretailer.routeid = this.selectedRoute.id;
      distyretailer.mobileno = this.mobileno;
      distyretailer.businessname = this.businessname;
      distyretailer.gstinno = this.gstinno;
      distyretailer.addressline1 = this.retAddress;
      distyretailer.retailertypeid = this.selectedRetailerType.id;
      const ret = (await this.pipaylib.solace.setupService.saveEntity(
        'distyretailer',
        'create',
        distyretailer
      )) as Functionresponse;

      if (ret.status === 'success') {
        this.confirm(this.getRetailerForId(distyretailer.retailercode));
        const toast = await this.toastController.create({
          message: 'Retailer Added Successfully!',
          duration: 2500,
          icon: 'checkmark-circle-outline',
          color: 'success',
          position: 'top',
        });
        toast.present();

        setTimeout(() => {
          this.closeRetailerDetailModal();
        }, 100);
      } else {
        const toast = await this.toastController.create({
          message: ret.errordescription,
          duration: 2500,
          icon: 'checkmark-circle-outline',
          color: 'danger',
          position: 'top',
        });
        toast.present();
        this.closeRetailerDetailModal();
        return;
      }
    }
  }

  getRetailerForId(retcode) {
    const distyretailers =
      this.pipaylib.solace.dataService.getMasterFromMap('distyretailer');
    for (const ret of distyretailers) {
      if (ret.retailercode === retcode) {
        return ret;
      }
    }
    return null;
  }

  validateAddretailers() {
    const mobno = '' + this.mobileno;
    if (mobno.trim().length !== 10) {
      this.dataService.displayToast(
        'Invalid Mobile Number, Please Enter 10 digit Mobile Number.',
        'WARNING'
      );
      return false;
    }
    if (isNaN(parseInt(mobno, 10))) {
      this.dataService.displayToast(
        'Mobile Number Should Be Numeric Value',
        'WARNING'
      );
      return false;
    }
    if (
      !(
        this.selectedRoute &&
        this.selectedRoute.id &&
        this.selectedRoute.id.length > 5
      )
    ) {
      this.dataService.displayToast('Please select Route', 'WARNING');
      return false;
    }
    if (
      !(
        this.selectedRetailerType &&
        this.selectedRetailerType.id &&
        this.selectedRetailerType.id.length > 5
      )
    ) {
      this.dataService.displayToast('Please select Retailer Type', 'WARNING');
      return false;
    }
    return true;
  }

  async openConfirmation() {
    this.showConfirmationModal = true;
  }

  closeConfrimationModal() {
    this.showConfirmationModal = false;
  }

  onSelectProductGroup(option: Distyproductgroup) {
    this.selectedGroup = option;
    // if (this.selectedGroup.id !== '0') {
    //   this.paginationProductList = this.productsList.filter(item => item.productgroupid === this.selectedGroup.id);
    // } else {
    this.getPaginatedProductList();
    // }
    this.showProductGroup = false;
  }

  showProductGroupOnClick() {
    this.showProductGroup = !this.showProductGroup;
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
    this.getLocation();
    const headerstr = 'Add Retailer';
    const messagestr = 'Do you want to Add New Retailer?';
    const isconfirmed = await this.confirmDialog(headerstr, messagestr, 'Add');
    if (isconfirmed) {
      this.addRetailer();
    }
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
            res.dismiss().then(() => {});
          }
        });
      })
      .catch((e) => {
        this.isLoading = false;
        //console.log(e);
      });
  }

  goToDashboard() {
    this.selectedProducts = this.pipaylib.orderService.curOrder.cart.items;
    this.isCartEmpty = this.selectedProducts.length === 0;
    if (!this.isCartEmpty) {
      this.showConfirmationModalForBack = true;
      this.canDismissConfirmationModal = false;
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  onConfirmOfGoBack() {
    this.isConfirmed = true;
    if (this.isConfirmed) {
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 500);
    }
  }

  closeConfrimationForBackModal() {
    this.canDismissConfirmationModal = true;
    this.showConfirmationModal = false;
    // this.isConfirmed = false;
    // this.dataService.globalvars.set('isEmpty', true)
  }

  onClickPerviousOrder() {
    this.showPreviousOrderModal = true;
    this.fetchOrders();
  }

  closePreviousOrderModal() {
    this.canDismissShowPreviousModal = true;
    this.showPreviousOrderModal = false;
  }

  onClickPartyLedger() {
    this.fromDate = this.pipaylib.solace.utilService.addDaystoDate(
      this.pipaylib.solace.utilService.getCurrentBusinessDate(),
      -30
    );
    this.toDate = this.pipaylib.solace.utilService.getCurrentBusinessDate();
    this.showLedgerModal = true;
    this.getLedger();
  }

  closeLedgerModal() {
    this.canDismissLedgerModal = true;
    this.showLedgerModal = false;
  }

  async fetchOrders() {
    this.showLoader('Fetching Summary...');
    this.fromDate = this.pipaylib.solace.utilService.getCurrentBusinessDate();
    this.toDate = this.pipaylib.solace.utilService.getCurrentBusinessDate();
    const distyid = this.pipaylib.loginService.loggedindistributor.id;
    this.orderList = await this.pipaylib.orderService.getOrdersOnRetailerId(
      distyid,
      this.selectedRetailer.id
    );
    this.orderList.sort((a: any, b: any) =>
      a.orderdate < b.orderdate ? -1 : 1
    );
    console.log(JSON.stringify(this.orderList));

    if (this.orderList && this.orderList.length >= 5) {
      this.orderList.splice(5);
    }
    this.hideLoader();
  }

  frequentlyOrderedProduct(orders: any[], topCount: number): string[] {
    const productCounts: {
      [productName: string]: { totalQuantity: number; details: Cartitem };
    } = {};
    // Count occurrences of each product excluding those in the added cart
    orders.forEach((order) => {
      order.cart.items.forEach((item) => {
        const productName = item.productname;
        if (
          !this.selectedProducts.some(
            (addedproduct) => addedproduct.productname === productName
          )
        ) {
          if (!productCounts[productName]) {
            productCounts[productName] = { totalQuantity: 0, details: item };
          }
          productCounts[productName].totalQuantity += item.actquantity;
        }
      });
    });
    // Sort products by order count in descending order
    this.sortedProducts = Object.entries(productCounts)
      .sort(
        ([, { totalQuantity: countA }], [, { totalQuantity: countB }]) =>
          countB - countA
      )
      .slice(0, topCount)
      .map(([productName, { details }]) => ({
        productname: productName,
        rate: details.rate,
        uom: details.uom,
        discper: details.discper,
      }));
    return this.sortedProducts;
  }

  openEditPriceModal(product: Cartitem) {
    this.showEditPriceModal = true;
    this.selectedProductForPriceEdit = product;
    this.newrate = this.selectedProductForPriceEdit.rate;
    if(product.inclrate && product.inclrate > 0){
      this.newrate = this.selectedProductForPriceEdit.inclrate;
    }
  }

  openApplyDiscountModal(product: any) {
    if (this.curconfig.enablediscount) {
      this.showApplyDiscountModal = true;
      this.selectedProductForDiscount = product;
      this.discount = null;
    }
  }

  closeApplyDiscountModal() {
    this.showApplyDiscountModal = false;
    console.log(this.pipaylib.orderService.curOrder.cart.items);
  }

  closeEditPriceModal() {
    this.showEditPriceModal = false;
  }

  editProductRate() {
    this.showLoader('Updating Rate...');
    this.pipaylib.orderService.editProductRate(
      this.selectedProductForPriceEdit.productid,
      this.newrate
    );
    this.pipaylib.orderService.curOrder.cart.items = [
      ...this.pipaylib.orderService.curOrder.cart.items,
    ];
    this.selectedProducts = this.pipaylib.orderService.curOrder.cart.items;
    this.hideLoader();
  }

  applyDiscount() {
    if (this.discountType === 'percent') {
      this.pipaylib.orderService.applyDiscount(
        this.selectedProductForDiscount.productid,
        this.discount
      );
    } else {
      this.pipaylib.orderService.applyAmountDiscount(
        this.selectedProductForDiscount.productid,
        this.discount
      );
    }

    // console.log(this.pipaylib.orderService.curOrder.cart);
  }

  async getPendinginvoices(ret) {
    if (
      !this.pipaylib.invoiceService.pendinginvoicesfordisty ||
      this.pipaylib.invoiceService.pendinginvoicesfordisty.length === 0
    ) {
      await this.pipaylib.invoiceService.setDistypendingInvoices(
        this.pipaylib.loginService.loggedindistributor.id
      );
    } else {
      await this.pipaylib.invoiceService.updatePendingInvoices(
        this.pipaylib.loginService.loggedindistributor.id
      );
    }
    const pendingList = this.pipaylib.invoiceService.pendinginvoicesfordisty;
    this.pendinginvoices = pendingList.filter(
      (item) =>
        item.distyretailerid === ret.id &&
        (item.invoicestatus === 'Delivered' ||
          item.invoicestatus === 'Payment failed' ||
          item.invoicestatus === 'Partially paid')
    );
    for (const inv of this.pendinginvoices) {
      if (!inv.failurecharges) {
        inv.failurecharges = 0;
      }
      if (!inv.paidamount) {
        inv.paidamount = 0;
      }
    }
    this.pendingInvAmount = this.pendinginvoices.reduce(
      (acc, item) =>
        acc + (item.invoiceamount + item.failurecharges - item.paidamount),
      0
    );
  }

  async getLedger() {
    this.ledgers = [];
    const ret = await this.pipaylib.reportService.getPartyLedger(
      this.selectedRetailer.id,
      this.fromDate,
      this.toDate
    );
    this.ledgers.push(ret);
    // console.log(this.ledgers);
  }

  async reverseGeocode(latitude, longitude) {
    const apiKey = environment.apiKey;
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.status === 'OK') {
        this.retAddress = data.results[0].formatted_address;
        // console.log('Current Address:', this.retAddress);
        // Now you can use the address as needed in your application
      } else {
        console.error('Reverse geocoding failed:', data.status);
      }
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
    }
  }

  isDuplicateMobile(mobile, data) {
    for (const entry of data) {
      if (entry.mobileno === mobile) {
        this.captureImage = false;
        return true;
      }
    }
    this.captureImage = true;
    return false;
  }

  verifyMobile() {
    if (!this.validateAddretailers()) {
      return false;
    }

    const retailerList =
      this.pipaylib.solace.dataService.getMasterFromMap('distyretailer');
    if (this.isDuplicateMobile(this.mobileno, retailerList)) {
      this.dataService.displayToast('Mobile Number Already Registered', 'FAIL');
    }
  }
}
