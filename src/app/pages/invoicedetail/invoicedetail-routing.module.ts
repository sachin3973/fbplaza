import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvoicedetailPage } from './invoicedetail.page';

const routes: Routes = [
  {
    path: '',
    component: InvoicedetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoicedetailPageRoutingModule {}
