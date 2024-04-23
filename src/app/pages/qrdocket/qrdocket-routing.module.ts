import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QrdocketPage } from './qrdocket.page';

const routes: Routes = [
  {
    path: '',
    component: QrdocketPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QrdocketPageRoutingModule {}
