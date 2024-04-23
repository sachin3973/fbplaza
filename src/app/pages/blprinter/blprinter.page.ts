import { Component, OnInit } from '@angular/core';
import { PipaylibService } from 'pipaylib';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { AlertController } from '@ionic/angular';
import { AppdataService } from 'src/app/services/appdata.service';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blprinter',
  templateUrl: './blprinter.page.html',
  styleUrls: ['./blprinter.page.scss'],
})
export class BlprinterPage implements OnInit {
  unpairedDevices: any;
  pairedDevices: any;
  gettingDevices: boolean;
  haspermission: boolean = false;;
  constructor(   private bluetoothSerial: BluetoothSerial, 
    private androidPermissions: AndroidPermissions,
    private alertController: AlertController,
    public pipaylib: PipaylibService,  
    private _router: Router,
    private dataService: AppdataService) { }

    ngOnInit() {
      if (!this.pipaylib.loginService.loggedinstaff) {
        this._router.navigate(['/']);
        if (Capacitor.isNativePlatform()) {
          StatusBar.setBackgroundColor({ color: '#033584' });
        }
      }
     
    }

  
  ionViewWillEnter() {
    this.validateBluetoothPermissions();   
    // this.checkBluetoothPermission();
    this.bluetoothSerial.isEnabled().then(
      () => console.log('Bluetooth is enabled.'),
      () => {
        console.log('Bluetooth is not enabled. Requesting user permission...');
        this.bluetoothSerial.enable().then(
          () => console.log('Bluetooth is now enabled.'),
          error => console.error('Error enabling Bluetooth', error)
        );
      }
    );
  }

  
  checkBluetoothPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.BLUETOOTH_CONNECT)
        .then((status) => {
          if (status.hasPermission) {
            this.haspermission = true;
                console.log('Bluetooth permission already granted');
            } else {
                this.requestBluetoothPermission();
            }
        })
        .catch(err => console.error('Error checking Bluetooth permission:', err));
  }

  requestBluetoothPermission() {
    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.BLUETOOTH_CONNECT)
      .then(() => this.haspermission = true)
        .catch(err => console.error('Error requesting Bluetooth permission:', err));
  }

async validateBluetoothPermissions(){
  let bluetoothPermissions = this.getBluetoothPermissions();
  for (let i = 0; i < bluetoothPermissions.length; i++) {
    let bluetoothPermission = bluetoothPermissions[i];
    console.log(bluetoothPermission)
       var hasPermission = await this.hasSpecificPermission(bluetoothPermission);      
       console.log(hasPermission)
       if (!hasPermission) {
        await this.requestSpecificPermission(bluetoothPermission);
      }
      }
}
getBluetoothPermissions(){
    return ['android.permission.BLUETOOTH_SCAN', 'android.permission.BLUETOOTH_CONNECT'];
  }
  
  async hasSpecificPermission(permission) {
    try {
      const result = await this.androidPermissions.checkPermission(permission);
      return result.hasPermission;
    } catch (error) {
      console.error(`androidPermissionService - hasPermission - error: ${JSON.stringify(error)}`);
      return false;
    }
  }

// async hasSpecificPermission(permission){
//     return await new Promise((resolve, reject)=>{      
//       this.androidPermissions.checkPermission(permission).then(
//         result=>{
//           resolve(result.hasPermission)
//         },
//         error=>{
//           console.error(`androidPermissionService - hasPermission - error: ${JSON.stringify(error)}`);
//         }
//       )
//     });
//   }
// async requestSpecificPermission(permission) {
//   return await new Promise((resolve, reject) => {
//     this.androidPermissions.requestPermission(permission).then(
//       result => {
//         resolve(result.hasPermission);
//       },
//       error => {
//         console.error(`androidPermissionService - requestSpecificPermission - error: ${JSON.stringify(error)}`);
//       }
//     )
//   });
  // }
  async requestSpecificPermission(permission) {
    try {
      const result = await this.androidPermissions.requestPermission(permission);
      return result.hasPermission;
    } catch (error) {
      console.error(`androidPermissionService - requestSpecificPermission - error: ${JSON.stringify(error)}`);
      return false; // Return false on error
    }
  }
  
checkBluetoothenabled() {
  this.bluetoothSerial.isEnabled().then(
    () => console.log('Bluetooth is enabled.'),
    () => {
      console.log('Bluetooth is not enabled. Requesting user permission...');
      this.bluetoothSerial.enable().then(
        () => console.log('Bluetooth is now enabled.'),
        error => console.error('Error enabling Bluetooth', error)
      );
    }
  );
}
   
  startScanning() {
    this.pairedDevices = null;
    this.unpairedDevices = null;
    this.gettingDevices = true;
    const unPair = [];
    this.bluetoothSerial.discoverUnpaired().then((success) => {
      console.log(success)
      success.forEach((value, key) => {
        var exists = false;
        unPair.forEach((val2, i) => {
          if (value.id === val2.id) {
            exists = true;
          }
        });
        if (exists === false && value.id !== '') {
          unPair.push(value);
        }
      });
      this.unpairedDevices = unPair;
      this.gettingDevices = false;
    },
      (err) => {
        console.log(err);
      });
 
    // this.bluetoothSerial.list().then((success) => {
    //   this.pairedDevices = success;
    // },
    //   (err) => {
 
    //   });
  }
 
  success = (data) => {
    this.deviceConnected();
  }
  fail = (error) => {
    alert(error);
  }
  device;
  async selectDevice(dev: any) {
    localStorage.setItem('blprinter',dev.address);
    const alert = await this.alertController.create({
      header: 'Connect',
      message: `Do you want to connect with ${dev.name}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Connect',
          handler: () => {
            console.log(this.dataService.globalvars.get('blprinter'))
            this.bluetoothSerial.connect(dev.id).subscribe(this.success, this.fail);           
          }
        }
      ]
    });
    await alert.present();
  }
 
  deviceConnected() {
    this.bluetoothSerial.isConnected().then(success => {
      alert('Connected Successfullly');
    }, error => {
      alert('error' + JSON.stringify(error));
    });
  }
 
  async disconnect() {
    const alert = await this.alertController.create({
      header: 'Disconnect?',
      message: 'Do you want to Disconnect?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Disconnect',
          handler: () => {
            this.bluetoothSerial.disconnect();
          }
        }
      ]
    });
    await alert.present();
  }

}
