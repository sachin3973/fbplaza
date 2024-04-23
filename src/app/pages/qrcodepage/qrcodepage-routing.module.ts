import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QrcodepagePage } from './qrcodepage.page';

const routes: Routes = [
  {
    path: '',
    component: QrcodepagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QrcodepagePageRoutingModule {}
