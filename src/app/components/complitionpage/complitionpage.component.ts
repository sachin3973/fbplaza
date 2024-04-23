/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppdataService } from '../../services/appdata.service';
import { PipaylibService } from 'pipaylib';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-complitionpage',
  templateUrl: './complitionpage.component.html',
  styleUrls: ['./complitionpage.component.scss'],
})
export class ComplitionpageComponent implements OnInit {
  @ViewChild('content', { static: true }) el!: ElementRef;
  @Input() processedInvoice;
  strurl;
  isLoading = false;
  user;
  txndate = new Date();
  isPartyWiseRecipt: boolean;
  fromRequisition: boolean;
  cameFromPartywise: boolean;

  constructor(
    public loadingCtrl: LoadingController,
    private _router: Router,
    private dataService: AppdataService,
    private pipaylib: PipaylibService
  ) {}
  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this._router.navigate(['/']);
    }
    this.user = this.dataService.globalvars.get('username');
    this.isPartyWiseRecipt = this.dataService.globalvars.get('fromPartywise');
    this.cameFromPartywise = this.dataService.globalvars.get('cameFromPartywise');
    this.fromRequisition = this.dataService.globalvars.get('fromRequisition');

    //console.log('USER NAME IS', this.user);
    //console.log('PROCESS INVOICE', this.processedInvoice);
    this.processedInvoice.creditnotereason = this.truncateString(
      this.processedInvoice?.creditnotereason,
      15
    );
    this.processedInvoice.remark = this.truncateString(
      this.processedInvoice?.remark,
      15
    );
  }

  goToInvoices() {
    this._router.navigate(['/invoices']);
  }

  goToRetailerSearch() {
    this._router.navigate(['/partywisepaymentoption']);
  }

  goToRequisition() {
    this._router.navigate(['/requisition']);
  }

  truncateString(str, maxLength) {
    if (str?.length > maxLength) {
      return str.substring(0, maxLength) + '...';
    }
    return str;
  }

  async uploadFile(pdfFile: File, filename: string) {
    const ret = await this.pipaylib.solace.utilService.uploadFiletoS3(
      pdfFile,
      filename,
      'foodkartiposimages'
    );
    this.dataService.dismissLoader();
    if (ret) {
      this.strurl =
        'https://s3.ap-south-1.amazonaws.com/foodkartiposimages/' + filename;
      if (this.strurl) {
        window.open(this.strurl, '_blank');
      }
    }
    this.hideLoader();
  }

  convertAndUplodPDF() {
    const data = document.getElementById('content');
    html2canvas(data).then((canvas) => {
      const imgWidth = 200;
      const pageHeight = 400;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const heightLeft = imgHeight;
      const position = 0;
      const contentDataURL = canvas.toDataURL('image/png', 1.3);
      const pdf = new jsPDF('p', 'mm', 'a4', true);

      pdf.addImage(contentDataURL, 'PNG', 5, 0, 200, 300, undefined, 'FAST');
      const blob = pdf.output('blob');
      const filename = 'Invoice' + this.processedInvoice.invoiceno + '.pdf';
      const imageFile = new File([blob], filename, { type: 'application/pdf' });
      this.uploadFile(imageFile, filename);
    });
  }

  downloadAsPDF() {
    // this.dataService.simpleLoader();
    this.showLoader('Loading PDF');
    this.convertAndUplodPDF();
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
              //console.log('Inivoice Processed Successfully');
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
