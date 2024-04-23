import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppdataService } from '../../services/appdata.service';
import { PipaylibService } from 'pipaylib';
import { Invoice } from 'pipaylib/domain/invoice';

interface docketInvoice {
  id: any;
  docket: Invoice[];
  firstinvoiceno:any;
  lastinvoiceno :any;
  docketsize: any;  
  docketnum: any;
  totalamt: number;
}

@Component({
  selector: 'app-completiondocket',
  templateUrl: './completiondocket.component.html',
  styleUrls: ['./completiondocket.component.scss'],
})
export class CompletiondocketComponent implements OnInit {
  @ViewChild('content', { static: true }) el!: ElementRef;
  @Input() processedDocket;
  processedDocketInvoice;
  processedInvoice;
  strurl;
  isLoading = false;
  user;
  txndate = new Date();

  constructor(private pipaylib: PipaylibService, private _router: Router, private dataService: AppdataService) { }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this._router.navigate(['/']);
    }
    this.user = this.dataService.globalvars.get('username');
    //console.log('USER NAME IS', this.user);
    this.processedInvoice = this.dataService.globalvars.get('processedInvoice');
    this.processedDocket = this.dataService.globalvars.get('processedDocket');
    this.processedDocketInvoice = this.processedDocket.docket[0];
    //console.log('PROCESSED DOCKET INVOICES', this.processedDocketInvoice)
    this.processedInvoice = this.dataService.globalvars.get('processedInvoice')
    //console.log('PROCESS INVOICE', this.processedInvoice);
    this.processedInvoice.creditnotereason = this.truncateString(this.processedInvoice?.creditnotereason, 15);
    this.processedInvoice.remark = this.truncateString(this.processedInvoice?.remark, 15);
  }

  goToInvoices(){
    this._router.navigate(['/invoices']);
  }

 truncateString(str, maxLength) {
    if (str?.length > maxLength) {
      return str.substring(0, maxLength) + '...';
    }
    return str;
  }
}
