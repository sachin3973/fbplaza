import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryonlyPage } from './deliveryonly.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryonlyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryonlyPageRoutingModule {}
