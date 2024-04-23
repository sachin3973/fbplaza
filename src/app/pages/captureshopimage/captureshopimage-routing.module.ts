import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CaptureshopimagePage } from './captureshopimage.page';

const routes: Routes = [
  {
    path: '',
    component: CaptureshopimagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaptureshopimagePageRoutingModule {}
