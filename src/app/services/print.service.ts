import { Injectable, OnDestroy } from '@angular/core';
import { BleClient, BleService, textToDataView } from '@capacitor-community/bluetooth-le';
import { AppdataService } from '../services/appdata.service';
import { formatDate } from '@angular/common';



@Injectable({
  providedIn: 'root'
})
export class PrintService implements OnDestroy {
  deviceId; serviceUuid; characteristicUuid;
  constructor(private dataService: AppdataService,) { }

 
  async Initialize() {
    await BleClient.initialize({ androidNeverForLocation: true });
  }

  async Connect(deviceId: string) {
    await BleClient.connect(deviceId);
  }

  async Disconnect(deviceId: string) {
    await BleClient.disconnect(deviceId);
  }

  async VerifyAndEnabled() {
    if (!await BleClient.isEnabled()) {
      await BleClient.enable();
    }
  }
  devices: any[] = [];
  selectedDevices: any;

  async initialiseDevice() {
    await this.VerifyAndEnabled();
    await this.Initialize();
  }
  async ScanAvailableDevice() { 
    await this.VerifyAndEnabled();
    await this.Initialize();
    try {
      let bleDevice = await BleClient.requestDevice({ allowDuplicates: false });     
      if (bleDevice) {
        this.devices.push(bleDevice);
        console.log('Available device' +  this.devices)
        await BleClient.connect(bleDevice.deviceId, this.Disconnect);
        this.dataService.displayToast('Connected', 'SUCCESS');
        this.dataService.globalvars.set('BLUETOOTH_DEVICE_ID', bleDevice.deviceId);
        // await this.storageClientService.set(LOCAL_STORAGE_KEY.BLUETOOTH_DEVICE_ID, bleDevice.deviceId);
        await this.AssignServices();      
      }
    }
    catch (error) {
      console.error('Error scanning for devices:', error);
    }   
    
  }

  async ConnectSelected(bleDevice) {
    this.deviceId = bleDevice.deviceId;
    console.log('Conected device' + bleDevice)
    // await BleClient.connect(bleDevice.deviceId, this.Disconnect);
    await this.Connect(this.deviceId);
    this.dataService.displayToast('Connected', 'SUCCESS');
    // this.dataService.globalvars.set('BLUETOOTH_DEVICE_ID', bleDevice.deviceId);   
    let bleService: BleService[] = await BleClient.getServices(this.deviceId);
    console.log('Conected device service' + bleService)
    if (bleService.length > 0 && bleService[0].characteristics.length > 0) {
      this.dataService.globalvars.set('BLUETOOTH_Service_UUID', bleService[0].uuid);
      this.dataService.globalvars.set('BLUETOOTH_CHARACTERISTIC_UUID', bleService[0].characteristics[0].uuid);
      this.serviceUuid = bleService[0].uuid;
      this.characteristicUuid = bleService[0].characteristics[0].uuid;
    }
    // setTimeout(() => {
    //   this.testPrint();
    // }, 200);
  }

  toggleSelection(device: any) {
    device.selected = !device.selected;
    if (device.selected) {
      this.selectedDevices.push(device);
      this.ConnectSelected(device);
    } else {
      const index = this.selectedDevices.indexOf(device);
      if (index !== -1) {
        this.selectedDevices.splice(index, 1);
      }
    }
  }


  async AssignServices() {
    const deviceId = this.dataService.globalvars.get('BLUETOOTH_DEVICE_ID');
    let bleService: BleService[] = await BleClient.getServices(deviceId);
    if (bleService.length > 0 && bleService[0].characteristics.length > 0) {
      this.dataService.globalvars.set('BLUETOOTH_Service_UUID', bleService[0].uuid);
      this.dataService.globalvars.set('BLUETOOTH_CHARACTERISTIC_UUID', bleService[0].characteristics[0].uuid);
      this.serviceUuid = bleService[0].uuid;
      this.characteristicUuid = bleService[0].characteristics[0].uuid;
      // this.storageClientService.set(LOCAL_STORAGE_KEY.BLUETOOTH_Service_UUID, bleService[0].uuid);
      // this.storageClientService.set(LOCAL_STORAGE_KEY.BLUETOOTH_CHARACTERISTIC_UUID, bleService[0].characteristics[0].uuid);
    }
  }

  async LineFeed(deviceId: string, serviceUuid: string, characteristicUuid: string) {
    await BleClient.write(deviceId, serviceUuid, characteristicUuid, new DataView((new Uint8Array([10])).buffer));
  }

  async TurnOnBold(deviceId: string, serviceUuid: string, characteristicUuid: string) {
    const boldOn = new Uint8Array([27, 69, 1]);
    await BleClient.write(deviceId, serviceUuid, characteristicUuid, new DataView(boldOn.buffer));
  }

  async TurnOffBold(deviceId: string, serviceUuid: string, characteristicUuid: string) {
    const boldOff = new Uint8Array([27, 69, 0]);
    await BleClient.write(deviceId, serviceUuid, characteristicUuid, new DataView(boldOff.buffer));
  }

  async FeedLeft(deviceId: string, serviceUuid: string, characteristicUuid: string) {
    const left = new Uint8Array([27, 97, 0]);
    await BleClient.write(deviceId, serviceUuid, characteristicUuid, new DataView(left.buffer));
  }

  async FeedCenter(deviceId: string, serviceUuid: string, characteristicUuid: string) {
    const center = new Uint8Array([27, 97, 1]);
    await BleClient.write(deviceId, serviceUuid, characteristicUuid, new DataView(center.buffer));
  }

  async FeedRight(deviceId: string, serviceUuid: string, characteristicUuid: string) {
    const right = new Uint8Array([27, 97, 2]);
    await BleClient.write(deviceId, serviceUuid, characteristicUuid, new DataView(right.buffer));
  }

  async WriteData(deviceId: string, serviceUuid: string, characteristicUuid: string, text: string) {
    await this.LineFeed(deviceId, serviceUuid, characteristicUuid);
    await BleClient.write(deviceId, serviceUuid, characteristicUuid, textToDataView(text));
  }

  async UnderLine(deviceId: string, serviceUuid: string, characteristicUuid: string) {
    await this.LineFeed(deviceId, serviceUuid, characteristicUuid);
    await BleClient.write(deviceId, serviceUuid, characteristicUuid, textToDataView('-'.repeat(30)));
  }

  async NewEmptyLine(deviceId: string, serviceUuid: string, characteristicUuid: string) {
    await this.LineFeed(deviceId, serviceUuid, characteristicUuid);
    await BleClient.write(deviceId, serviceUuid, characteristicUuid, textToDataView(`${' '.repeat(18)}\n`));
  }

  ngOnDestroy(): void {
  }

  async testPrint() {
    // await this.Connect(this.deviceId);
    await this.TurnOnBold(this.deviceId, this.serviceUuid, this.characteristicUuid);
    await this.FeedCenter(this.deviceId, this.serviceUuid, this.characteristicUuid);

    await this.WriteData(this.deviceId, this.serviceUuid, this.characteristicUuid, 'PiPay');
    await this.UnderLine(this.deviceId, this.serviceUuid, this.characteristicUuid);
    await this.TurnOffBold(this.deviceId, this.serviceUuid, this.characteristicUuid);
    await this.FeedRight(this.deviceId, this.serviceUuid, this.characteristicUuid);

    const currentDate = formatDate(new Date(), "dd/MM/yyyy hh:mm a", "en");
    await this.WriteData(this.deviceId, this.serviceUuid, this.characteristicUuid, currentDate);

    await this.FeedLeft(this.deviceId, this.serviceUuid, this.characteristicUuid);

    await this.WriteData(this.deviceId, this.serviceUuid, this.characteristicUuid, `Customer: ${'Ajit'}`);
    await this.WriteData(this.deviceId, this.serviceUuid, this.characteristicUuid, `Invoice#: ${'123'}`);
    await this.WriteData(this.deviceId, this.serviceUuid, this.characteristicUuid, `InvoiceAmt: ${'1200'}`);
    await this.WriteData(this.deviceId, this.serviceUuid, this.characteristicUuid, `InvoiceDate: Rs.${currentDate} `);

    await this.NewEmptyLine(this.deviceId, this.serviceUuid, this.characteristicUuid);

    await this.FeedCenter(this.deviceId, this.serviceUuid, this.characteristicUuid);
    await this.WriteData(this.deviceId, this.serviceUuid, this.characteristicUuid, "Please Shop With Us.");
    await this.WriteData(this.deviceId, this.serviceUuid, this.characteristicUuid, "---Thank you---");
    await this.FeedLeft(this.deviceId, this.serviceUuid, this.characteristicUuid);

    await this.NewEmptyLine(this.deviceId, this.serviceUuid, this.characteristicUuid);

    await this.Disconnect(this.deviceId);
  }
}
