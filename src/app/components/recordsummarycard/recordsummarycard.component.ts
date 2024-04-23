import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PipaylibService } from 'pipaylib';
import { AppdataService } from '../../services/appdata.service';
import { Order } from 'pipaylib/domain/order';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { Distyconfig } from 'pipaylib/domain/distyconfig';
import html2PDF from 'jspdf-html2canvas';


@Component({
  selector: 'app-recordsummarycard',
  templateUrl: './recordsummarycard.component.html',
  styleUrls: ['./recordsummarycard.component.scss'],
})
export class RecordsummarycardComponent implements OnInit {
  @Input() records: any[];
  @Input() distyconfig: Distyconfig;
  showBill: boolean;
  selectedOrder: any;

  constructor(public pipaylib: PipaylibService,
    private router: Router,
    private dataService: AppdataService,
    private bluetoothSerial: BluetoothSerial) { }

  ngOnInit() {
  }

  // sendPDF(record: any) {
  //   this.selectedOrder = record;
  //   this.showBill = true;
  // }

  async sendPDF(record: any){
    // record = this.pipaylib.dataService.getRetailerForId(this.selectedOrder.distyretailerid);
    // this.receivableAmountInWords = toWords(this.selectedOrder.cart.payableamount);
    this.showBill = true;
    const retailer = this.pipaylib.dataService.getRetailerForId(record.distyretailerid);
    const page = document.getElementById('page');
    const pdf = await html2PDF(page, {
      jsPDF: {
        format: 'a4',
      },
      output: 'bill.pdf',
      success: (pdfFile) => {
        console.log('PDF created successfully');
      }
    });
    const blob = pdf.output('blob');
    const filename = 'Invoice_' + this.pipaylib.loginService.loggedindistributor.id + '_' + new Date().getTime() + '.pdf';
    const billpdffile = new File([blob], filename, { type: 'application/pdf' });
    console.log('File name ' + filename);
    const ret = await this.pipaylib.solace.utilService.uploadFiletoS3( billpdffile,filename,'foodkartiposimages');
    console.log(`https://s3.ap-south-1.amazonaws.com/foodkartiposimages/${filename}`);
    this.showBill = false;
    // if (ret) {
    //   const pdfurl = 'https://s3.ap-south-1.amazonaws.com/foodkartiposimages/' + filename;
    //   const ord = record;
    //   this.pipaylib.invoiceService.sendBillOnWhatsApp(ord.billseq, retailer.mobileno,
    //     pdfurl, filename, retailer.businessname, ord.cart.payableamount.toFixed(2));
    // }
  }

  getRetailernameForId(order) {
    const distyretailers = this.pipaylib.solace.dataService.getMasterFromMap('distyretailer');
    for (const ret of distyretailers) {
      if (ret.id === order.distyretailerid) {
        order.retailername = ret.businessname;
        return ret.businessname;
      }
    }
    return null;
  }

  getCartItems(order: any) {
    let str = '';
    for (const item of order.cart.items) {
      if (order.cart.items.length === 1) {
        str += `${item.billedquantity}${item.uom} x ${item.productname}`;
      } else {
        if (item.productid === order.cart.items[order.cart.items.length - 1].productid) {
          str += `${item.billedquantity}${item.uom} x ${item.productname}`;
        } else {
          str += `${item.billedquantity}${item.uom} x ${item.productname}, `;
        }
      }
    }
    order.items = str;
    return str;
  }

  editOrder(order) {
    this.dataService.globalvars.set('orderforedit', order);
    this.router.navigate(['/requisition']);
  }

  async printBill(ord: Order) {
    console.log(JSON.stringify(ord));
    const resultByte = await this.dataService.getBTPrintBuffer(ord);
    const deviceid = localStorage.getItem('blprinter');
    console.log(deviceid);
    this.bluetoothSerial.connect(deviceid).subscribe(
     () => {
       console.log('Connected to printer');

       // Send data to printer
       this.bluetoothSerial.write(resultByte).then(() => {
         this.bluetoothSerial.clear();
         this.bluetoothSerial.disconnect();
         console.log('Print success');
       })
       .catch((err) => {
         console.error(err);
         this.bluetoothSerial.disconnect();
       });

     },
     (error) => {
       console.error('Error connecting to printer', error);
     }
   );
  }
}
