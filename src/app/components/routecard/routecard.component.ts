import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PipaylibService } from 'pipaylib';
import { AppdataService } from '../../services/appdata.service';
import { Summaryrecord } from 'pipaylib/domain/summaryrecord';

@Component({
  selector: 'app-routecard',
  templateUrl: './routecard.component.html',
  styleUrls: ['./routecard.component.scss'],
})
export class RoutecardComponent implements OnInit {
  @Input() processedInvoice: Summaryrecord[];

  constructor(private pipaylib: PipaylibService, private _router: Router,private dataService: AppdataService) { }

  ngOnInit() {
    //console.log(this.processedInvoice);
  }

  invoicesBymode(item) {
    this.dataService.globalvars.set('routeNo', item);
    this._router.navigate(['/paymentsummary']);
  }

  reverseDate(date: string) {
    date = date.split('/').reverse().join('-');
    return date;
  }

}
