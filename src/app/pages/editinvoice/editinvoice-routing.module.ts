import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditinvoicePage } from './editinvoice.page';

const routes: Routes = [
  {
    path: '',
    component: EditinvoicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditinvoicePageRoutingModule {}
