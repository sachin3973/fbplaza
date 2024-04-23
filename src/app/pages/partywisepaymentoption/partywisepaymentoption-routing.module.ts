import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PartywisepaymentoptionPage } from './partywisepaymentoption.page';

const routes: Routes = [
  {
    path: '',
    component: PartywisepaymentoptionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartywisepaymentoptionPageRoutingModule {}
