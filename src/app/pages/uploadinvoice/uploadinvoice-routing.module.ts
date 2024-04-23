import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UploadinvoicePage } from './uploadinvoice.page';

const routes: Routes = [
  {
    path: '',
    component: UploadinvoicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UploadinvoicePageRoutingModule {}
