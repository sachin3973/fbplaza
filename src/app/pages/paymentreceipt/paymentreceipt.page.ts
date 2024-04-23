import { Component, Input, OnInit } from '@angular/core';
import { AppdataService } from '../../services/appdata.service';

@Component({
  selector: 'app-paymentreceipt',
  templateUrl: './paymentreceipt.page.html',
  styleUrls: ['./paymentreceipt.page.scss'],
})
export class PaymentreceiptPage implements OnInit {
  isDocket: boolean;
  constructor(public dataService: AppdataService) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.isDocket = this.dataService.globalvars.get('isDocket');
    //console.log('isDocket is ', this.isDocket)
  }

  ionViewWillLeave() {
    this.dataService.globalvars.set('isDocket', false);
  }
}
