import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImagepreviewPage } from './imagepreview.page';

const routes: Routes = [
  {
    path: '',
    component: ImagepreviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImagepreviewPageRoutingModule {}
