import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppdataService} from '../../services/appdata.service';

@Component({
  selector: 'app-ionvoicecard',
  templateUrl: './ionvoicecard.component.html',
  styleUrls: ['./ionvoicecard.component.scss'],
})
export class IonvoicecardComponent implements OnInit {
  @Input() invoices = [];
  // invoices = [
  //   {
  //     invoiceNo: '00001',
  //     retailerName: 'Nirav Poojara',
  //     amount: '9,410',
  //     invoiceDate: '01/10/2022',
  //     dueDate: '31/10/2022',
  //     invoiceStatus: 'New',
  //     isDelivered: false
  //   },
  //   {
  //     invoiceNo: '05601',
  //     retailerName: 'Nirav Poojara',
  //     amount: '3,400',
  //     invoiceDate: '02/10/2022',
  //     dueDate: '12/10/2022',
  //     invoiceStatus: 'New',
  //     isDelivered: false
  //   },
  //   {
  //     invoiceNo: '16543',
  //     retailerName: 'Nirav Poojara',
  //     amount: '8,400',
  //     invoiceDate: '02/10/2022',
  //     dueDate: '12/10/2022',
  //     invoiceStatus: 'Invoice updated',
  //     isDelivered: false
  //   },
  //   {
  //     invoiceNo: '05601',
  //     retailerName: 'Nirav Poojara',
  //     amount: '6,400',
  //     invoiceDate: '02/10/2022',
  //     dueDate: '12/10/2022',
  //     invoiceStatus: 'Delivered',
  //     isDelivered: true
  //   },
  //   {
  //     invoiceNo: '05601',
  //     retailerName: 'Kiran Stores',
  //     amount: '6,400',
  //     invoiceDate: '02/10/2022',
  //     dueDate: '12/10/2022',
  //     invoiceStatus: 'Payment Failed',
  //     isDelivered: true
  //   },
  //   {
  //     invoiceNo: '05601',
  //     retailerName: 'Himalaya Retailers Poojara',
  //     amount: '6,400',
  //     invoiceDate: '02/10/2022',
  //     dueDate: '12/10/2022',
  //     invoiceStatus: 'Partially Paid',
  //     isDelivered: true
  //   },
  // ];

  constructor(private dataService: AppdataService,private _router: Router) { }

  ngOnInit() {}

  invoiceDetail(item) {
    this.dataService.globalvars.set('retailerName', item.distyretailername);
    this.dataService.globalvars.set('amount', item.invoiceamount);
    this.dataService.globalvars.set('invoiceDate', item.invoicedate);
    this.dataService.globalvars.set('dueDate', item.duedate);
    this.dataService.globalvars.set('invoiceNumber', item.invoicenumber);
    this.dataService.globalvars.set('invoiceStatus', item.invoicestatus);
    this.dataService.globalvars.set('isDelivered', item.isDelivered);
    this.dataService.globalvars.set('retailerid', item.distyretailerid);
    this.dataService.globalvars.set('selectedinvoice', item);
    this._router.navigate(['/invoicedetail']);
  }

  selectPaymentMode(item) {
    this.dataService.globalvars.set('selectedinvoice', item);
    this._router.navigate(['/paymentmode']);
  }


}
