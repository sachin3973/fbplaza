import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonModal, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { GoogleMap } from '@capacitor/google-maps';
import {LaunchNavigator} from '@ionic-native/launch-navigator/ngx';
import { AppdataService } from '../../services/appdata.service';
import { PipaylibService } from 'pipaylib';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import { Invoice } from 'pipaylib/domain/invoice';
import { Distyconfig } from 'pipaylib/domain/distyconfig';
import { environment } from '../../../environments/environment.prod';
import { Capacitor } from '@capacitor/core';


declare const google;

const handleLocationError = (arg0: boolean, infoWindow: any, arg2: any) => {
  throw new Error('Function not implemented.');
};

@Component({
  selector: 'app-invoicedetail',
  templateUrl: './invoicedetail.page.html',
  styleUrls: ['./invoicedetail.page.scss'],
})
export class InvoicedetailPage implements OnInit {
  [x: string]: any;
  @ViewChild('cancellationModal') paymentmodal: IonModal;
  @ViewChild('map')  mapRef!: ElementRef<HTMLElement>;
  sourceLocation = '';
  destinationLocation = '';
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  newMap: GoogleMap;
  center: {
    lat: number;
    lng: number;
  } = {
    lat: 0,
    lng: 0
  };
  markerId!: string;
  showmodal: boolean;
  canDismiss: boolean;
  initialgenerator;
  retailerName: string;
  amount: string;
  invoiceStatus: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  retailerid;
  address: string;
  reason: string;
  selectedInvoice: Invoice;
  distyconfig: Distyconfig;

  constructor(
    private pipaylib: PipaylibService,
    private dataService: AppdataService,
    private router: Router,
    private launchNavigator: LaunchNavigator,
    private platform: Platform
  ) { }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this.router.navigate(['/']);
    }
  }


  ionViewWillEnter() {
    this.distyconfig = this.dataService.globalvars.get('distyconfig');
    this.dataService.simpleLoader('Loading Invoice Details');
    this.retailerName = this.dataService.globalvars.get('retailerName');
    this.amount = this.dataService.globalvars.get('amount');
    this.invoiceStatus = this.dataService.globalvars.get('invoiceStatus');
    this.invoiceNumber = this.dataService.globalvars.get('invoiceNumber');
    this.invoiceDate = this.dataService.globalvars.get('invoiceDate');
    this.dueDate = this.dataService.globalvars.get('dueDate');
    this.retailerid = this.dataService.globalvars.get('retailerid');
    this.address = this.dataService.globalvars.get('retaileraddress');
    this.selectedInvoice = this.dataService.globalvars.get('selectedinvoice');
    this.extractInitail();
    // If you have retailer detail
    this.center.lng = parseFloat(this.dataService.globalvars.get('retailerlong'));
    this.center.lat = parseFloat(this.dataService.globalvars.get('retailerlat'));
    this.destinationLocation = `${this.center.lat}, ${this.center.lng}`;
    this.loadMapWithDirection();
    this.dataService.dismissLoader();
    if (this.address) {
      this.reverseGeocode();
    }
  }

  async reverseGeocode() {
    const apiKey = environment.apiKey;
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.center.lat},${this.center.lng}&key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.status === 'OK') {
        this.address = data.results[0].formatted_address;
        // console.log('Current Address:', this.retAddress);
        // Now you can use the address as needed in your application
      } else {
        console.error('Reverse geocoding failed:', data.status);
      }
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
    }
  }

  loadMapWithDirection() {
    const map = new google.maps.Map(this.mapRef.nativeElement,
      {
        zoom: 16,
        center: this.center,
      });
      this.directionsRenderer.setMap(map);
      const marker = new google.maps.Marker({
        position: this.center,
        map,
        title: this.retailerName,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <ion-label color='dark' 
          class="Mediumbold"
          style=" color: var(--ion-color-secondary); text-transform: capitalize;">${this.retailerName}</ion-label>
          <br>
          <ion-label color="dark">${this.address}</ion-label>
        `,
        ariaLabel: this.retailerName
      });

      const locationButton = document.getElementById('show-direction');

      marker.addListener('click', () => {
        infoWindow.open({
          anchor: marker,
          map,
        });
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            this.sourceLocation = `${pos.lat}, ${pos.lng}`;
          },
          () => {
            handleLocationError(true, infoWindow, map.getCenter()?.toJSON());
          }
        );
      }

      // locationButton.textContent = 'Show Directions';
      // locationButton.classList.add('custom-map-control-button');
      map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);
      locationButton.addEventListener('click', () => {
        console.log('clicked!');
        // this.calculateAndDisplayRoute();
         this.navigate(this.sourceLocation, this.destinationLocation);
      });
  }

  navigate(sourceLocation, destinationLocation) {
    const start = sourceLocation;
    const destination = destinationLocation;
    this.launchNavigator.navigate(destination, {
      start,
      app: this.launchNavigator.APP.GOOGLE_MAPS
    });
    const mapsUrl = `https://www.google.com/maps/dir/${start}/${destination}`;

    if (Capacitor.isNativePlatform()) {
      // Running on a native device
      this.launchNavigator.navigate(destination, {
        start,
        app: this.launchNavigator.APP.GOOGLE_MAPS
      });
    } else {
      // Running in a browser
      window.open(mapsUrl, '_blank');
    }
  }

  calculateAndDisplayRoute() {
    this.directionsService.route(
      {
        origin: {
        query: this.sourceLocation,
      },
        destination: {
        query: this.destinationLocation,
      },
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .then((response: any, status: string) => {
        this.directionsRenderer.setDirections(response);
      })
      .catch((e: any) => window.alert('Directions request failed due to ' + e.message));
  };

  openEditInvoice() {
    this.router.navigate(['/editinvoice']);
  }

  async selectPaymentMode() {
    const key = {
      distributorid: '' + this.pipaylib.loginService.loggedindistributor.id,
      id: '' + this.selectedInvoice.distyretailerid,
    };
    const tablename =
      this.pipaylib.solace.utilService.getTableName('distyretailer');
    const distyretailer = (await this.pipaylib.solace.dbLib.getItem(
      tablename,
      key
    )) as Distyretailer;
    this.dataService.globalvars.set('selectedretailer', distyretailer);
    if (
      (this.distyconfig.capturegeotag && !distyretailer.geotagdone) ||
      (this.distyconfig.capturefssai && !distyretailer.fssaiavailable)
    ) {
      this.router.navigate(['captureshopimage']);
    } // Add a semicolon here
    else {
      this.router.navigate(['/paymentmode']);
    }
  }

  extractInitail() {
    const fullName = this.retailerName;
    //console.log('RETAILER NAME', fullName);
    const name = fullName.split(' ');
    const firstName = name[0];
    const lastName = fullName.substring(name[0].length).trim();
    const firstnameChar = firstName.charAt(0);
    const lastnameChar = lastName.charAt(0);
    this.initialgenerator = firstnameChar.toUpperCase() + lastnameChar.toUpperCase();
    //console.log(firstName + lastName);
  };

  closemodal() {
    setTimeout(() => {
      this.showmodal = false;
    }, 100);
  }

  inputBlur(val) {
    this.reason = val;
    //console.log('Value', val);
    //console.log(this.partailamount);
  }

  openModal() {
    this.canDismiss = false;
    this.showmodal = true;
  }

  async onSendCancellationRequest() {
    const toast = await this.toastCtrl.create({
      message: 'Request Sent for Cancellation!',
      duration: 2500,
      icon: 'close',
      color: 'success',
    });
    toast.present();
    this.router.navigate(['/invoices']);
  }
}

