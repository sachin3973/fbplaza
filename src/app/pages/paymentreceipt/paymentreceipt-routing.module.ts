import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentreceiptPage } from './paymentreceipt.page';

const routes: Routes = [
  {
    path: '',
    component: PaymentreceiptPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentreceiptPageRoutingModule {}
