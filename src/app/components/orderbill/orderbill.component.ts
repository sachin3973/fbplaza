import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PipaylibService } from 'pipaylib';
import { Distyconfig } from 'pipaylib/domain/distyconfig';
import { toWords } from 'number-to-words';
import { Distributor } from 'pipaylib/domain/distributor';
import { Distyretailer } from 'pipaylib/domain/distyretailer';
import html2PDF from 'jspdf-html2canvas';

@Component({
  selector: 'app-orderbill',
  templateUrl: './orderbill.component.html',
  styleUrls: ['./orderbill.component.scss'],
})
export class OrderbillComponent implements OnInit, OnChanges {
  @Input() selectedOrder: any;
  @Input() showBill: boolean;
  curconfig: Distyconfig;
  distributor: Distributor;
  retailer: Distyretailer;
  receivableAmountInWords: string;

  constructor(private pipaylib: PipaylibService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if ('showBill' in changes) {
      this.showBill = changes.showBill.currentValue;
      this.retailer = this.pipaylib.dataService.getRetailerForId(this.selectedOrder.distyretailerid);
      this.receivableAmountInWords = toWords(this.selectedOrder.cart.payableamount);
      // this.sendPDF(this.selectedOrder);
    }
  }

  ngOnInit() {
    this.curconfig = this.pipaylib.loginService.loggedindistributor.distyconfig;
    this.distributor = this.pipaylib.loginService.loggedindistributor;
  }

  // async sendPDF(record: any){
  //   const retailer = this.pipaylib.dataService.getRetailerForId(record.distyretailerid);
  //   const page = document.getElementById('page');
  //   const pdf = await html2PDF(page, {
  //     jsPDF: {
  //       format: 'a4',
  //     },
  //     output: 'bill.pdf',
  //     success: (pdfFile) => {
  //       console.log('PDF created successfully');
  //     }
  //   });
  //   const blob = pdf.output('blob');
  //   const filename = 'Invoice_' + this.pipaylib.loginService.loggedindistributor.id + '_' + new Date().getTime() + '.pdf';
  //   const billpdffile = new File([blob], filename, { type: 'application/pdf' });
  //   console.log('File name ' + filename);
  //   const ret = await this.pipaylib.solace.utilService.uploadFiletoS3( billpdffile,filename,'foodkartiposimages');
  //   console.log(`https://s3.ap-south-1.amazonaws.com/foodkartiposimages/${filename}`);
  //   this.showBill = false;
  //   // if (ret) {
  //   //   const pdfurl = 'https://s3.ap-south-1.amazonaws.com/foodkartiposimages/' + filename;
  //   //   const ord = record;
  //   //   this.pipaylib.invoiceService.sendBillOnWhatsApp(ord.billseq, retailer.mobileno,
  //   //     pdfurl, filename, retailer.businessname, ord.cart.payableamount.toFixed(2));
  //   // }
  // }
}
