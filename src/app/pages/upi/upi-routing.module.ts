import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UpiPage } from './upi.page';

const routes: Routes = [
  {
    path: '',
    component: UpiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpiPageRoutingModule {}
