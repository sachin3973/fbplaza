import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UploadchequePage } from './uploadcheque.page';

const routes: Routes = [
  {
    path: '',
    component: UploadchequePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UploadchequePageRoutingModule {}
